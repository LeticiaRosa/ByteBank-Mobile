-- =====================================================
-- ByteBank Mobile - Migration 08: User Management
-- =====================================================
-- Cria funções para gerenciamento automático de usuários

-- =====================================================
-- FUNÇÃO PARA CRIAR CONTA BANCÁRIA AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION create_user_bank_account()
RETURNS TRIGGER AS $$
DECLARE
  new_account_id UUID;
  account_number_generated TEXT;
BEGIN
  -- Gerar número da conta
  account_number_generated := generate_account_number();
  
  -- Criar conta bancária padrão para o novo usuário
  INSERT INTO public.bank_accounts (
    user_id,
    account_number,
    account_type,
    balance,
    currency,
    is_active
  ) VALUES (
    NEW.id,
    account_number_generated,
    'checking',
    0,
    'BRL',
    true
  ) RETURNING id INTO new_account_id;
  
  -- Log da criação
  RAISE NOTICE 'Conta bancária criada automaticamente para usuário %: % (ID: %)', 
    NEW.id, account_number_generated, new_account_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO PARA INICIALIZAR PERFIL DE USUÁRIO
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar perfil de usuário
  INSERT INTO public.user_profiles (id, full_name, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    NOW()
  );
  
  -- Criar conta bancária padrão
  PERFORM create_user_bank_account();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER PARA NOVOS USUÁRIOS
-- =====================================================

-- Trigger para criar perfil e conta automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- FUNÇÃO PARA CRIAR CONTA BANCÁRIA MANUAL
-- =====================================================

CREATE OR REPLACE FUNCTION create_bank_account_manual(
  target_user_id UUID,
  account_type_param account_type DEFAULT 'checking',
  initial_balance BIGINT DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  new_account_id UUID;
  account_number_generated TEXT;
BEGIN
  -- Verificar se o usuário existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado: %', target_user_id;
  END IF;
  
  -- Validar saldo inicial
  IF initial_balance < 0 THEN
    RAISE EXCEPTION 'Saldo inicial não pode ser negativo: %', initial_balance;
  END IF;
  
  -- Gerar número da conta
  account_number_generated := generate_account_number();
  
  -- Criar nova conta bancária
  INSERT INTO public.bank_accounts (
    user_id,
    account_number,
    account_type,
    balance,
    currency,
    is_active
  ) VALUES (
    target_user_id,
    account_number_generated,
    account_type_param,
    initial_balance,
    'BRL',
    true
  ) RETURNING id INTO new_account_id;
  
  -- Se há saldo inicial, criar transação de depósito
  IF initial_balance > 0 THEN
    INSERT INTO public.transactions (
      user_id,
      from_account_id,
      transaction_type,
      amount,
      description,
      status,
      processed_at
    ) VALUES (
      target_user_id,
      new_account_id,
      'deposit',
      initial_balance,
      'Depósito inicial da conta',
      'completed',
      NOW()
    );
  END IF;
  
  RETURN new_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÕES DE VALIDAÇÃO
-- =====================================================

-- Função para validar CPF (simplificada)
CREATE OR REPLACE FUNCTION validate_cpf(cpf_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Remove caracteres não numéricos
  cpf_input := REGEXP_REPLACE(cpf_input, '[^0-9]', '', 'g');
  
  -- Verifica se tem 11 dígitos
  IF LENGTH(cpf_input) != 11 THEN
    RETURN FALSE;
  END IF;
  
  -- Verifica se não são todos os dígitos iguais
  IF cpf_input ~ '^(.)\1{10}$' THEN
    RETURN FALSE;
  END IF;
  
  -- Para uma validação mais robusta, implementar o algoritmo completo do CPF
  -- Por simplicidade, retornamos TRUE se passou pelas validações básicas
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Função para validar telefone brasileiro
CREATE OR REPLACE FUNCTION validate_brazilian_phone(phone_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Remove caracteres não numéricos
  phone_input := REGEXP_REPLACE(phone_input, '[^0-9]', '', 'g');
  
  -- Verifica formatos válidos: 10 ou 11 dígitos (com 9º dígito no celular)
  IF LENGTH(phone_input) NOT IN (10, 11) THEN
    RETURN FALSE;
  END IF;
  
  -- Verifica se começa com código de área válido (11-99)
  IF SUBSTRING(phone_input, 1, 2)::INTEGER NOT BETWEEN 11 AND 99 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER PARA VALIDAÇÕES NO PERFIL
-- =====================================================

CREATE OR REPLACE FUNCTION validate_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar CPF se fornecido
  IF NEW.cpf IS NOT NULL AND NEW.cpf != '' THEN
    IF NOT validate_cpf(NEW.cpf) THEN
      RAISE EXCEPTION 'CPF inválido: %', NEW.cpf;
    END IF;
    
    -- Normalizar CPF (apenas números)
    NEW.cpf := REGEXP_REPLACE(NEW.cpf, '[^0-9]', '', 'g');
  END IF;
  
  -- Validar telefone se fornecido
  IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
    IF NOT validate_brazilian_phone(NEW.phone) THEN
      RAISE EXCEPTION 'Telefone inválido: %', NEW.phone;
    END IF;
    
    -- Normalizar telefone (apenas números)
    NEW.phone := REGEXP_REPLACE(NEW.phone, '[^0-9]', '', 'g');
  END IF;
  
  -- Validar data de nascimento
  IF NEW.date_of_birth IS NOT NULL THEN
    IF NEW.date_of_birth > CURRENT_DATE THEN
      RAISE EXCEPTION 'Data de nascimento não pode ser no futuro';
    END IF;
    
    IF NEW.date_of_birth < CURRENT_DATE - INTERVAL '120 years' THEN
      RAISE EXCEPTION 'Data de nascimento muito antiga';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar validações no perfil
CREATE TRIGGER validate_user_profile_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION validate_user_profile();

-- =====================================================
-- FUNÇÃO PARA ESTATÍSTICAS DE USUÁRIO
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_statistics()
RETURNS TABLE(
  total_users BIGINT,
  active_users BIGINT,
  users_with_profiles BIGINT,
  users_with_transactions BIGINT,
  total_accounts BIGINT,
  active_accounts BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM user_profiles WHERE account_status = 'active') as active_users,
    (SELECT COUNT(*) FROM user_profiles) as users_with_profiles,
    (SELECT COUNT(DISTINCT user_id) FROM transactions) as users_with_transactions,
    (SELECT COUNT(*) FROM bank_accounts) as total_accounts,
    (SELECT COUNT(*) FROM bank_accounts WHERE is_active = true) as active_accounts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON FUNCTION create_user_bank_account() IS 'Cria conta bancária padrão para novos usuários';
COMMENT ON FUNCTION handle_new_user() IS 'Inicializa perfil e conta bancária para novos usuários registrados';
COMMENT ON FUNCTION create_bank_account_manual(UUID, account_type, BIGINT) IS 'Cria conta bancária adicional para usuário existente';
COMMENT ON FUNCTION validate_cpf(TEXT) IS 'Valida formato de CPF brasileiro';
COMMENT ON FUNCTION validate_brazilian_phone(TEXT) IS 'Valida formato de telefone brasileiro';
COMMENT ON FUNCTION validate_user_profile() IS 'Trigger function para validar dados do perfil do usuário';
COMMENT ON FUNCTION get_user_statistics() IS 'Retorna estatísticas gerais dos usuários do sistema';