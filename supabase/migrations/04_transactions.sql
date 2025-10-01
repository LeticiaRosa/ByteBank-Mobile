-- =====================================================
-- ByteBank Mobile - Migration 04: Transactions Table
-- =====================================================
-- Cria a tabela de transações financeiras

-- =====================================================
-- TABELA TRANSACTIONS
-- =====================================================

CREATE TABLE public.transactions (
  -- Chave primária
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Relacionamentos
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  from_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  to_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  
  -- Informações da transação
  transaction_type transaction_type NOT NULL,
  amount BIGINT NOT NULL CHECK (amount > 0),
  category transaction_category DEFAULT 'outros',
  description TEXT,
  reference_number VARCHAR(12) UNIQUE,
  
  -- Status e processamento
  status transaction_status DEFAULT 'pending' NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Informações adicionais
  sender_name TEXT,
  receipt_url TEXT,
  metadata JSONB,
  filters JSONB,
  
  -- Moeda
  currency VARCHAR(3) DEFAULT 'BRL' NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- ÍNDICES
-- =====================================================

-- Índice para busca por usuário
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Índice para busca por conta de origem
CREATE INDEX idx_transactions_from_account ON transactions(from_account_id);

-- Índice para busca por conta de destino
CREATE INDEX idx_transactions_to_account ON transactions(to_account_id);

-- Índice para busca por tipo de transação
CREATE INDEX idx_transactions_type ON transactions(transaction_type);

-- Índice para busca por status
CREATE INDEX idx_transactions_status ON transactions(status);

-- Índice para busca por categoria
CREATE INDEX idx_transactions_category ON transactions(category);

-- Índice para busca por data de criação
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Índice para busca por número de referência
CREATE INDEX idx_transactions_reference ON transactions(reference_number);

-- Índice composto para relatórios
CREATE INDEX idx_transactions_user_status_created ON transactions(user_id, status, created_at DESC);

-- Índice para busca por valor
CREATE INDEX idx_transactions_amount ON transactions(amount);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para gerar número de referência automaticamente
CREATE TRIGGER trigger_auto_reference_number
  BEFORE INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_reference_number();

-- Trigger para atualizar updated_at
CREATE TRIGGER handle_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- =====================================================
-- RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS na tabela
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Política para visualizar próprias transações
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Política para inserir próprias transações
CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para atualizar próprias transações
CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Política para deletar próprias transações
CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- FUNÇÕES DE NEGÓCIO
-- =====================================================

-- Função para processar transação simples
CREATE OR REPLACE FUNCTION process_transaction_simple(transaction_id UUID)
RETURNS TEXT AS $$
DECLARE
  txn RECORD;
  result_message TEXT;
BEGIN
  -- Buscar a transação
  SELECT * INTO txn FROM transactions WHERE id = transaction_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transação não encontrada: %', transaction_id;
  END IF;
  
  IF txn.status != 'pending' THEN
    RAISE EXCEPTION 'Transação já processada com status: %', txn.status;
  END IF;
  
  -- Processar baseado no tipo
  CASE txn.transaction_type
    WHEN 'deposit' THEN
      -- Crédito na conta
      IF txn.from_account_id IS NULL THEN
        RAISE EXCEPTION 'Conta de destino obrigatória para depósito';
      END IF;
      
      PERFORM increment_balance(txn.from_account_id, txn.amount);
      result_message := format('Depósito de %s processado na conta %s', txn.amount, txn.from_account_id);
      
    WHEN 'withdrawal' THEN
      -- Débito da conta
      IF txn.from_account_id IS NULL THEN
        RAISE EXCEPTION 'Conta de origem obrigatória para saque';
      END IF;
      
      PERFORM decrement_balance(txn.from_account_id, txn.amount);
      result_message := format('Saque de %s processado da conta %s', txn.amount, txn.from_account_id);
      
    WHEN 'transfer' THEN
      -- Transferência entre contas
      IF txn.from_account_id IS NULL OR txn.to_account_id IS NULL THEN
        RAISE EXCEPTION 'Contas de origem e destino obrigatórias para transferência';
      END IF;
      
      PERFORM decrement_balance(txn.from_account_id, txn.amount);
      PERFORM increment_balance(txn.to_account_id, txn.amount);
      result_message := format('Transferência de %s processada de %s para %s', 
                               txn.amount, txn.from_account_id, txn.to_account_id);
      
    WHEN 'payment' THEN
      -- Pagamento (débito da conta)
      IF txn.from_account_id IS NULL THEN
        RAISE EXCEPTION 'Conta de origem obrigatória para pagamento';
      END IF;
      
      PERFORM decrement_balance(txn.from_account_id, txn.amount);
      result_message := format('Pagamento de %s processado da conta %s', txn.amount, txn.from_account_id);
      
    WHEN 'fee' THEN
      -- Taxa (débito da conta)
      IF txn.from_account_id IS NULL THEN
        RAISE EXCEPTION 'Conta de origem obrigatória para taxa';
      END IF;
      
      PERFORM decrement_balance(txn.from_account_id, txn.amount);
      result_message := format('Taxa de %s processada da conta %s', txn.amount, txn.from_account_id);
      
    ELSE
      RAISE EXCEPTION 'Tipo de transação não suportado: %', txn.transaction_type;
  END CASE;
  
  -- Atualizar status da transação
  UPDATE transactions 
  SET status = 'completed',
      processed_at = NOW(),
      updated_at = NOW()
  WHERE id = transaction_id;
  
  RETURN result_message;
  
EXCEPTION WHEN OTHERS THEN
  -- Marcar transação como falhada
  UPDATE transactions 
  SET status = 'failed',
      updated_at = NOW()
  WHERE id = transaction_id;
  
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para transferir dinheiro entre contas
CREATE OR REPLACE FUNCTION transfer_money(
  from_account_uuid UUID,
  to_account_uuid UUID,
  transfer_amount BIGINT,
  transfer_description TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  from_user_id UUID;
  to_user_id UUID;
  transaction_id UUID;
BEGIN
  -- Validar parâmetros
  IF transfer_amount <= 0 THEN
    RAISE EXCEPTION 'Valor de transferência deve ser positivo: %', transfer_amount;
  END IF;
  
  IF from_account_uuid = to_account_uuid THEN
    RAISE EXCEPTION 'Conta de origem não pode ser igual à conta de destino';
  END IF;
  
  -- Obter usuários das contas
  SELECT user_id INTO from_user_id FROM bank_accounts WHERE id = from_account_uuid AND is_active = true;
  SELECT user_id INTO to_user_id FROM bank_accounts WHERE id = to_account_uuid AND is_active = true;
  
  IF from_user_id IS NULL THEN
    RAISE EXCEPTION 'Conta de origem não encontrada ou inativa: %', from_account_uuid;
  END IF;
  
  IF to_user_id IS NULL THEN
    RAISE EXCEPTION 'Conta de destino não encontrada ou inativa: %', to_account_uuid;
  END IF;
  
  -- Criar transação
  INSERT INTO transactions (
    user_id,
    from_account_id,
    to_account_id,
    transaction_type,
    amount,
    description,
    status
  ) VALUES (
    from_user_id,
    from_account_uuid,
    to_account_uuid,
    'transfer',
    transfer_amount,
    COALESCE(transfer_description, 'Transferência entre contas'),
    'pending'
  ) RETURNING id INTO transaction_id;
  
  -- Processar a transação
  PERFORM process_transaction_simple(transaction_id);
  
  RETURN format('Transferência de %s centavos realizada com sucesso. ID: %s', 
                transfer_amount, transaction_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE transactions IS 'Transações financeiras do ByteBank Mobile';
COMMENT ON COLUMN transactions.amount IS 'Valor da transação em centavos (ex: 2500 = R$ 25,00)';
COMMENT ON COLUMN transactions.category IS 'Categoria da transação para organização e relatórios';
COMMENT ON COLUMN transactions.sender_name IS 'Nome do remetente/pagador da transação (para identificação)';
COMMENT ON COLUMN transactions.receipt_url IS 'URL do comprovante de pagamento armazenado no Storage';
COMMENT ON COLUMN transactions.metadata IS 'Dados adicionais da transação em formato JSON';
COMMENT ON COLUMN transactions.filters IS 'Filtros aplicados à transação para relatórios';
COMMENT ON COLUMN transactions.reference_number IS 'Número único de referência da transação';

COMMENT ON FUNCTION process_transaction_simple(UUID) IS 'Processa uma transação pendente e atualiza os saldos das contas';
COMMENT ON FUNCTION transfer_money(UUID, UUID, BIGINT, TEXT) IS 'Realiza transferência de dinheiro entre duas contas';