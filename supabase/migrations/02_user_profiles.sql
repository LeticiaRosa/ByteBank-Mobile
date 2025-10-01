-- =====================================================
-- ByteBank Mobile - Migration 02: User Profiles Table
-- =====================================================
-- Cria a tabela de perfis de usuário com informações adicionais

-- =====================================================
-- TABELA USER_PROFILES
-- =====================================================

CREATE TABLE public.user_profiles (
  -- Chave primária que referencia auth.users
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Informações pessoais
  full_name TEXT,
  cpf VARCHAR(11) UNIQUE,
  phone VARCHAR(15),
  date_of_birth DATE,
  
  -- Endereço como JSON flexível
  address JSONB,
  
  -- Avatar do usuário
  avatar_url TEXT,
  
  -- Status da conta
  account_status VARCHAR(20) DEFAULT 'active' CHECK (
    account_status IN ('active', 'inactive', 'suspended')
  ),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- ÍNDICES
-- =====================================================

-- Índice para busca por CPF
CREATE INDEX idx_user_profiles_cpf ON user_profiles(cpf);

-- Índice para busca por telefone
CREATE INDEX idx_user_profiles_phone ON user_profiles(phone);

-- Índice para busca por status
CREATE INDEX idx_user_profiles_account_status ON user_profiles(account_status);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER handle_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- =====================================================
-- RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS na tabela
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para visualizar próprio perfil
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para atualizar próprio perfil
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para inserir próprio perfil
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE user_profiles IS 'Perfis dos usuários com informações pessoais e de contato';
COMMENT ON COLUMN user_profiles.id IS 'ID do usuário, referencia auth.users.id';
COMMENT ON COLUMN user_profiles.full_name IS 'Nome completo do usuário';
COMMENT ON COLUMN user_profiles.cpf IS 'CPF do usuário (apenas números)';
COMMENT ON COLUMN user_profiles.phone IS 'Telefone do usuário';
COMMENT ON COLUMN user_profiles.date_of_birth IS 'Data de nascimento';
COMMENT ON COLUMN user_profiles.address IS 'Endereço completo em formato JSON';
COMMENT ON COLUMN user_profiles.avatar_url IS 'URL do avatar/foto do usuário';
COMMENT ON COLUMN user_profiles.account_status IS 'Status da conta: active, inactive, suspended';