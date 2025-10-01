-- =====================================================
-- ByteBank Mobile - Migration 07: Audit Log System
-- =====================================================
-- Cria sistema de auditoria para rastreamento de operações

-- =====================================================
-- TABELA DE AUDITORIA
-- =====================================================

CREATE TABLE public.audit_logs (
  -- Chave primária
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Informações do usuário
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Informações da operação
  action VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE
  table_name VARCHAR(50),
  record_id UUID,
  
  -- Dados da alteração
  old_values JSONB,
  new_values JSONB,
  
  -- Informações da sessão
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- ÍNDICES PARA AUDITORIA
-- =====================================================

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_action ON audit_logs(table_name, action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);

-- =====================================================
-- RLS PARA AUDITORIA
-- =====================================================

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Política para visualizar próprios logs
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- FUNÇÃO GENÉRICA DE AUDITORIA
-- =====================================================

CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  user_uuid UUID;
  old_data JSONB;
  new_data JSONB;
BEGIN
  -- Obter usuário autenticado
  user_uuid := auth.uid();
  
  -- Preparar dados conforme operação
  CASE TG_OP
    WHEN 'INSERT' THEN
      new_data := to_jsonb(NEW);
      old_data := NULL;
    WHEN 'UPDATE' THEN
      new_data := to_jsonb(NEW);
      old_data := to_jsonb(OLD);
    WHEN 'DELETE' THEN
      new_data := NULL;
      old_data := to_jsonb(OLD);
  END CASE;
  
  -- Inserir log de auditoria
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    user_uuid,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    old_data,
    new_data
  );
  
  -- Retornar o registro apropriado
  CASE TG_OP
    WHEN 'DELETE' THEN RETURN OLD;
    ELSE RETURN NEW;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS DE AUDITORIA
-- =====================================================

-- Auditoria para user_profiles
CREATE TRIGGER audit_user_profiles
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Auditoria para bank_accounts
CREATE TRIGGER audit_bank_accounts
  AFTER INSERT OR UPDATE OR DELETE ON bank_accounts
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Auditoria para transactions
CREATE TRIGGER audit_transactions
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- =====================================================
-- FUNÇÕES DE LIMPEZA DE AUDITORIA
-- =====================================================

-- Função para limpar logs antigos
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs 
  WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO PARA RELATÓRIO DE AUDITORIA
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_audit_report(
  user_uuid UUID,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE(
  log_id UUID,
  action VARCHAR(50),
  table_name VARCHAR(50),
  record_id UUID,
  changes_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id as log_id,
    al.action,
    al.table_name,
    al.record_id,
    CASE 
      WHEN al.action = 'INSERT' THEN 'Registro criado'
      WHEN al.action = 'UPDATE' THEN 
        CASE 
          WHEN al.table_name = 'transactions' AND al.old_values->>'status' != al.new_values->>'status' 
          THEN 'Status alterado de ' || (al.old_values->>'status') || ' para ' || (al.new_values->>'status')
          WHEN al.table_name = 'bank_accounts' AND al.old_values->>'balance' != al.new_values->>'balance'
          THEN 'Saldo alterado'
          ELSE 'Registro atualizado'
        END
      WHEN al.action = 'DELETE' THEN 'Registro removido'
      ELSE al.action
    END as changes_summary,
    al.created_at
  FROM audit_logs al
  WHERE al.user_id = user_uuid
    AND al.created_at >= start_date
    AND al.created_at <= end_date
  ORDER BY al.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VIEW PARA RESUMO DE AUDITORIA
-- =====================================================

CREATE OR REPLACE VIEW audit_summary AS
SELECT 
  user_id,
  table_name,
  action,
  COUNT(*) as operation_count,
  MAX(created_at) as last_operation,
  MIN(created_at) as first_operation
FROM audit_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id, table_name, action
ORDER BY user_id, table_name, action;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE audit_logs IS 'Log de auditoria para rastreamento de todas as operações no sistema';
COMMENT ON COLUMN audit_logs.action IS 'Tipo de operação: INSERT, UPDATE, DELETE';
COMMENT ON COLUMN audit_logs.table_name IS 'Nome da tabela afetada';
COMMENT ON COLUMN audit_logs.record_id IS 'ID do registro afetado';
COMMENT ON COLUMN audit_logs.old_values IS 'Valores anteriores do registro (UPDATE/DELETE)';
COMMENT ON COLUMN audit_logs.new_values IS 'Novos valores do registro (INSERT/UPDATE)';

COMMENT ON FUNCTION create_audit_log() IS 'Trigger function para criar logs de auditoria automaticamente';
COMMENT ON FUNCTION cleanup_old_audit_logs(INTEGER) IS 'Remove logs de auditoria mais antigos que o número especificado de dias';
COMMENT ON FUNCTION get_user_audit_report(UUID, TIMESTAMPTZ, TIMESTAMPTZ) IS 'Gera relatório de auditoria para um usuário específico';

COMMENT ON VIEW audit_summary IS 'Resumo das operações de auditoria dos últimos 30 dias';