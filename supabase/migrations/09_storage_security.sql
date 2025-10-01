-- =====================================================
-- ByteBank Mobile - Migration 09: Storage and Security
-- =====================================================
-- Configura storage para comprovantes e políticas de segurança

-- =====================================================
-- CONFIGURAÇÃO DE STORAGE
-- =====================================================

-- Criar bucket para comprovantes de transação (se não existir)
-- Este comando deve ser executado através da interface ou API do Supabase
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('transaction-receipts', 'transaction-receipts', false);

-- =====================================================
-- POLÍTICAS DE STORAGE
-- =====================================================

-- Política para upload de comprovantes
-- CREATE POLICY "Users can upload receipts" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'transaction-receipts' 
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Política para visualizar próprios comprovantes
-- CREATE POLICY "Users can view own receipts" ON storage.objects
--   FOR SELECT USING (
--     bucket_id = 'transaction-receipts' 
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Política para deletar próprios comprovantes
-- CREATE POLICY "Users can delete own receipts" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'transaction-receipts' 
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );

-- =====================================================
-- FUNÇÃO PARA UPLOAD DE COMPROVANTE
-- =====================================================

CREATE OR REPLACE FUNCTION upload_transaction_receipt(
  transaction_uuid UUID,
  file_path TEXT
)
RETURNS TEXT AS $$
DECLARE
  current_user_id UUID;
  transaction_exists BOOLEAN;
  receipt_url TEXT;
BEGIN
  -- Obter usuário atual
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Verificar se a transação existe e pertence ao usuário
  SELECT EXISTS(
    SELECT 1 FROM transactions 
    WHERE id = transaction_uuid AND user_id = current_user_id
  ) INTO transaction_exists;
  
  IF NOT transaction_exists THEN
    RAISE EXCEPTION 'Transação não encontrada ou não pertence ao usuário';
  END IF;
  
  -- Construir URL do comprovante
  receipt_url := format('transaction-receipts/%s/%s', current_user_id, file_path);
  
  -- Atualizar transação com URL do comprovante
  UPDATE transactions 
  SET receipt_url = receipt_url,
      updated_at = NOW()
  WHERE id = transaction_uuid AND user_id = current_user_id;
  
  RETURN receipt_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO PARA REMOVER COMPROVANTE
-- =====================================================

CREATE OR REPLACE FUNCTION remove_transaction_receipt(transaction_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID;
  old_receipt_url TEXT;
BEGIN
  -- Obter usuário atual
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Obter URL atual do comprovante
  SELECT receipt_url INTO old_receipt_url
  FROM transactions 
  WHERE id = transaction_uuid AND user_id = current_user_id;
  
  IF old_receipt_url IS NULL THEN
    RETURN FALSE; -- Nenhum comprovante para remover
  END IF;
  
  -- Remover URL do comprovante
  UPDATE transactions 
  SET receipt_url = NULL,
      updated_at = NOW()
  WHERE id = transaction_uuid AND user_id = current_user_id;
  
  -- Nota: O arquivo físico deve ser removido através da API do Storage
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- POLÍTICAS DE SEGURANÇA AVANÇADAS
-- =====================================================

-- Função para verificar se usuário pode acessar conta
CREATE OR REPLACE FUNCTION user_can_access_account(account_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID;
  account_owner UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  SELECT user_id INTO account_owner
  FROM bank_accounts
  WHERE id = account_uuid AND is_active = true;
  
  RETURN (account_owner = current_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário pode acessar transação
CREATE OR REPLACE FUNCTION user_can_access_transaction(transaction_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID;
  transaction_owner UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  SELECT user_id INTO transaction_owner
  FROM transactions
  WHERE id = transaction_uuid;
  
  RETURN (transaction_owner = current_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO PARA LOGS DE SEGURANÇA
-- =====================================================

CREATE OR REPLACE FUNCTION log_security_event(
  event_type TEXT,
  event_description TEXT,
  metadata_json JSONB DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  current_user_id UUID;
  user_ip INET;
  user_agent_info TEXT;
BEGIN
  current_user_id := auth.uid();
  
  -- Tentar obter informações da sessão (podem não estar disponíveis em todas as situações)
  -- user_ip := inet_client_addr();
  -- user_agent_info := current_setting('request.headers.user-agent', true);
  
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    old_values,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    current_user_id,
    event_type,
    'security_events',
    NULL,
    jsonb_build_object(
      'event_description', event_description,
      'metadata', metadata_json,
      'timestamp', NOW()
    ),
    user_ip,
    user_agent_info
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO PARA VALIDAR LIMITES DE TRANSAÇÃO
-- =====================================================

CREATE OR REPLACE FUNCTION validate_transaction_limits(
  user_uuid UUID,
  transaction_amount BIGINT,
  transaction_type_param transaction_type
)
RETURNS BOOLEAN AS $$
DECLARE
  daily_limit BIGINT := 500000; -- R$ 5.000,00 em centavos
  monthly_limit BIGINT := 5000000; -- R$ 50.000,00 em centavos
  daily_total BIGINT;
  monthly_total BIGINT;
BEGIN
  -- Calcular total de transações do dia
  SELECT COALESCE(SUM(amount), 0) INTO daily_total
  FROM transactions
  WHERE user_id = user_uuid
    AND transaction_type IN ('withdrawal', 'transfer', 'payment')
    AND status = 'completed'
    AND DATE(created_at) = CURRENT_DATE;
  
  -- Calcular total de transações do mês
  SELECT COALESCE(SUM(amount), 0) INTO monthly_total
  FROM transactions
  WHERE user_id = user_uuid
    AND transaction_type IN ('withdrawal', 'transfer', 'payment')
    AND status = 'completed'
    AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Verificar limites apenas para transações de débito
  IF transaction_type_param IN ('withdrawal', 'transfer', 'payment') THEN
    IF (daily_total + transaction_amount) > daily_limit THEN
      PERFORM log_security_event(
        'DAILY_LIMIT_EXCEEDED',
        format('Tentativa de exceder limite diário. Valor: %s, Total do dia: %s', 
               transaction_amount, daily_total),
        jsonb_build_object('daily_limit', daily_limit)
      );
      RETURN FALSE;
    END IF;
    
    IF (monthly_total + transaction_amount) > monthly_limit THEN
      PERFORM log_security_event(
        'MONTHLY_LIMIT_EXCEEDED',
        format('Tentativa de exceder limite mensal. Valor: %s, Total do mês: %s', 
               transaction_amount, monthly_total),
        jsonb_build_object('monthly_limit', monthly_limit)
      );
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER PARA VALIDAR LIMITES
-- =====================================================

CREATE OR REPLACE FUNCTION check_transaction_limits()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar limites apenas para novas transações
  IF TG_OP = 'INSERT' THEN
    IF NOT validate_transaction_limits(NEW.user_id, NEW.amount, NEW.transaction_type) THEN
      RAISE EXCEPTION 'Transação excede os limites permitidos';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de validação
CREATE TRIGGER check_transaction_limits_trigger
  BEFORE INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION check_transaction_limits();

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON FUNCTION upload_transaction_receipt(UUID, TEXT) IS 'Associa um comprovante de transação ao registro';
COMMENT ON FUNCTION remove_transaction_receipt(UUID) IS 'Remove a associação de um comprovante de transação';
COMMENT ON FUNCTION user_can_access_account(UUID) IS 'Verifica se o usuário atual pode acessar uma conta específica';
COMMENT ON FUNCTION user_can_access_transaction(UUID) IS 'Verifica se o usuário atual pode acessar uma transação específica';
COMMENT ON FUNCTION log_security_event(TEXT, TEXT, JSONB) IS 'Registra eventos de segurança no log de auditoria';
COMMENT ON FUNCTION validate_transaction_limits(UUID, BIGINT, transaction_type) IS 'Valida se uma transação está dentro dos limites permitidos';
COMMENT ON FUNCTION check_transaction_limits() IS 'Trigger function para validar limites de transação antes da inserção';

-- =====================================================
-- INSTRUÇÕES PARA CONFIGURAÇÃO DE STORAGE
-- =====================================================

/*
Para configurar o Storage no Supabase, execute os seguintes comandos 
na interface do Supabase ou via API:

1. Criar bucket:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('transaction-receipts', 'transaction-receipts', false);

2. Políticas de Storage:
As políticas comentadas acima devem ser aplicadas através da interface
do Supabase Storage ou via SQL após a criação do bucket.

3. Configurações recomendadas:
- Tamanho máximo: 5MB por arquivo
- Tipos permitidos: image/jpeg, image/png, application/pdf
- Estrutura de pastas: transaction-receipts/{user_id}/{filename}
*/