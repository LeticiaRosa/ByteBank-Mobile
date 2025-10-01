-- =====================================================
-- ByteBank Mobile - Migration 03: Bank Accounts Table
-- =====================================================
-- Cria a tabela de contas bancárias dos usuários

-- =====================================================
-- TABELA BANK_ACCOUNTS
-- =====================================================

CREATE TABLE public.bank_accounts (
  -- Chave primária
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Relacionamento com usuários
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Informações da conta
  account_number VARCHAR(8) UNIQUE NOT NULL,
  account_type account_type DEFAULT 'checking' NOT NULL,
  
  -- Saldo em centavos (ex: 1000 = R$ 10,00)
  balance BIGINT DEFAULT 0 NOT NULL CHECK (balance >= 0),
  
  -- Moeda
  currency VARCHAR(3) DEFAULT 'BRL' NOT NULL,
  
  -- Status da conta
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- ÍNDICES
-- =====================================================

-- Índice para busca por usuário
CREATE INDEX idx_bank_accounts_user_id ON bank_accounts(user_id);

-- Índice para contas ativas
CREATE INDEX idx_bank_accounts_active ON bank_accounts(is_active) WHERE is_active = true;

-- Índice para busca por número da conta
CREATE INDEX idx_bank_accounts_number ON bank_accounts(account_number);

-- Índice composto para usuário + conta ativa
CREATE INDEX idx_bank_accounts_user_active ON bank_accounts(user_id, is_active);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para gerar número de conta automaticamente
CREATE TRIGGER trigger_auto_account_number
  BEFORE INSERT ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_account_number();

-- Trigger para atualizar updated_at
CREATE TRIGGER handle_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- =====================================================
-- RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS na tabela
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Política para visualizar próprias contas
CREATE POLICY "Users can view own bank accounts" ON public.bank_accounts
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Política para inserir próprias contas
CREATE POLICY "Users can insert own bank accounts" ON public.bank_accounts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Política para atualizar próprias contas
CREATE POLICY "Users can update own bank accounts" ON public.bank_accounts
  FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Política para deletar próprias contas
CREATE POLICY "Users can delete own bank accounts" ON public.bank_accounts
  FOR DELETE USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- =====================================================
-- FUNÇÕES DE NEGÓCIO
-- =====================================================

-- Função para obter saldo de uma conta
CREATE OR REPLACE FUNCTION get_account_balance(account_uuid UUID)
RETURNS BIGINT AS $$
DECLARE
  account_balance BIGINT;
BEGIN
  SELECT balance INTO account_balance
  FROM bank_accounts
  WHERE id = account_uuid AND is_active = true;
  
  IF account_balance IS NULL THEN
    RAISE EXCEPTION 'Conta não encontrada ou inativa: %', account_uuid;
  END IF;
  
  RETURN account_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para incrementar saldo
CREATE OR REPLACE FUNCTION increment_balance(account_id UUID, amount_cents BIGINT)
RETURNS TEXT AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  -- Validar parâmetros
  IF amount_cents <= 0 THEN
    RAISE EXCEPTION 'Valor deve ser positivo: %', amount_cents;
  END IF;
  
  -- Atualizar saldo
  UPDATE bank_accounts 
  SET balance = balance + amount_cents,
      updated_at = NOW()
  WHERE id = account_id AND is_active = true;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  IF affected_rows = 0 THEN
    RAISE EXCEPTION 'Conta não encontrada ou inativa: %', account_id;
  END IF;
  
  RETURN format('Saldo incrementado em %s centavos para conta %s', amount_cents, account_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para decrementar saldo
CREATE OR REPLACE FUNCTION decrement_balance(account_id UUID, amount_cents BIGINT)
RETURNS TEXT AS $$
DECLARE
  current_balance BIGINT;
  affected_rows INTEGER;
BEGIN
  -- Validar parâmetros
  IF amount_cents <= 0 THEN
    RAISE EXCEPTION 'Valor deve ser positivo: %', amount_cents;
  END IF;
  
  -- Verificar saldo atual
  SELECT balance INTO current_balance
  FROM bank_accounts
  WHERE id = account_id AND is_active = true;
  
  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'Conta não encontrada ou inativa: %', account_id;
  END IF;
  
  IF current_balance < amount_cents THEN
    RAISE EXCEPTION 'Saldo insuficiente. Saldo atual: %, Tentativa de débito: %', current_balance, amount_cents;
  END IF;
  
  -- Atualizar saldo
  UPDATE bank_accounts 
  SET balance = balance - amount_cents,
      updated_at = NOW()
  WHERE id = account_id AND is_active = true;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  IF affected_rows = 0 THEN
    RAISE EXCEPTION 'Erro ao atualizar saldo da conta: %', account_id;
  END IF;
  
  RETURN format('Saldo decrementado em %s centavos da conta %s', amount_cents, account_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE bank_accounts IS 'Contas bancárias dos usuários do ByteBank';
COMMENT ON COLUMN bank_accounts.balance IS 'Saldo da conta em centavos (ex: 1000 = R$ 10,00)';
COMMENT ON COLUMN bank_accounts.account_number IS 'Número único da conta bancária (8 dígitos)';
COMMENT ON COLUMN bank_accounts.account_type IS 'Tipo da conta: checking (corrente), savings (poupança), business (empresarial)';
COMMENT ON COLUMN bank_accounts.currency IS 'Código da moeda da conta (ISO 4217)';
COMMENT ON COLUMN bank_accounts.is_active IS 'Indica se a conta está ativa';

COMMENT ON FUNCTION get_account_balance(UUID) IS 'Retorna o saldo de uma conta bancária';
COMMENT ON FUNCTION increment_balance(UUID, BIGINT) IS 'Incrementa o saldo de uma conta bancária';
COMMENT ON FUNCTION decrement_balance(UUID, BIGINT) IS 'Decrementa o saldo de uma conta bancária (com validação de saldo)';