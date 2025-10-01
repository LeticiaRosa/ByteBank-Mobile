-- =====================================================
-- ByteBank Mobile - Migration 06: Dashboard Views
-- =====================================================
-- Cria views para dashboard e relatórios financeiros

-- =====================================================
-- VIEW: MONTHLY FINANCIAL SUMMARY
-- =====================================================

CREATE OR REPLACE VIEW monthly_financial_summary AS
SELECT 
  ba.user_id,
  TO_CHAR(t.created_at, 'Month') as month_label,
  EXTRACT(MONTH FROM t.created_at) as month_number,
  EXTRACT(YEAR FROM t.created_at) as year_number,
  
  -- Receitas (depósitos)
  COALESCE(SUM(
    CASE WHEN t.transaction_type = 'deposit' AND t.status = 'completed' 
         THEN t.amount ELSE 0 END
  ), 0) as receitas,
  
  -- Gastos (saques, pagamentos, taxas, transferências saindo)
  COALESCE(SUM(
    CASE WHEN t.transaction_type IN ('withdrawal', 'payment', 'fee') AND t.status = 'completed'
         THEN t.amount
         WHEN t.transaction_type = 'transfer' AND t.from_account_id = ba.id AND t.status = 'completed'
         THEN t.amount
         ELSE 0 END
  ), 0) as gastos,
  
  -- Saldo líquido do período
  COALESCE(SUM(
    CASE WHEN t.transaction_type = 'deposit' AND t.status = 'completed' 
         THEN t.amount
         WHEN t.transaction_type IN ('withdrawal', 'payment', 'fee') AND t.status = 'completed'
         THEN -t.amount
         WHEN t.transaction_type = 'transfer' AND t.from_account_id = ba.id AND t.status = 'completed'
         THEN -t.amount
         WHEN t.transaction_type = 'transfer' AND t.to_account_id = ba.id AND t.status = 'completed'
         THEN t.amount
         ELSE 0 END
  ), 0) as saldo

FROM bank_accounts ba
LEFT JOIN transactions t ON (t.from_account_id = ba.id OR t.to_account_id = ba.id)
WHERE ba.is_active = true
  AND t.created_at IS NOT NULL
GROUP BY 
  ba.user_id,
  EXTRACT(MONTH FROM t.created_at),
  EXTRACT(YEAR FROM t.created_at),
  TO_CHAR(t.created_at, 'Month')
ORDER BY ba.user_id, year_number, month_number;

-- =====================================================
-- VIEW: EXPENSES BY CATEGORY
-- =====================================================

CREATE OR REPLACE VIEW expenses_by_category AS
SELECT 
  ba.user_id,
  t.category,
  CASE 
    WHEN t.category = 'alimentacao' THEN 'Alimentação'
    WHEN t.category = 'transporte' THEN 'Transporte'
    WHEN t.category = 'saude' THEN 'Saúde'
    WHEN t.category = 'educacao' THEN 'Educação'
    WHEN t.category = 'entretenimento' THEN 'Entretenimento'
    WHEN t.category = 'compras' THEN 'Compras'
    WHEN t.category = 'casa' THEN 'Casa'
    WHEN t.category = 'trabalho' THEN 'Trabalho'
    WHEN t.category = 'investimentos' THEN 'Investimentos'
    WHEN t.category = 'viagem' THEN 'Viagem'
    ELSE 'Outros'
  END as label,
  
  -- Soma dos gastos por categoria
  COALESCE(SUM(
    CASE WHEN t.transaction_type IN ('withdrawal', 'payment', 'fee') AND t.status = 'completed'
         THEN t.amount ELSE 0 END
  ), 0) as value

FROM bank_accounts ba
JOIN transactions t ON t.from_account_id = ba.id
WHERE ba.is_active = true
  AND t.transaction_type IN ('withdrawal', 'payment', 'fee')
  AND t.status = 'completed'
GROUP BY ba.user_id, t.category
HAVING SUM(t.amount) > 0
ORDER BY ba.user_id, value DESC;

-- =====================================================
-- VIEW: USER ACCOUNT SUMMARY
-- =====================================================

CREATE OR REPLACE VIEW user_account_summary AS
SELECT 
  u.id,
  u.email,
  u.created_at as user_created_at,
  
  -- Informações do perfil
  up.full_name,
  up.cpf,
  up.phone,
  up.account_status,
  
  -- Estatísticas das contas
  COUNT(ba.id) as total_accounts,
  COUNT(CASE WHEN ba.is_active THEN 1 END) as active_accounts,
  COALESCE(SUM(CASE WHEN ba.is_active THEN ba.balance ELSE 0 END), 0) as total_balance,
  
  -- Estatísticas de transações (últimos 30 dias)
  COUNT(t.id) as recent_transactions,
  COALESCE(SUM(CASE WHEN t.transaction_type = 'deposit' AND t.status = 'completed' 
                    AND t.created_at >= NOW() - INTERVAL '30 days'
                    THEN t.amount ELSE 0 END), 0) as recent_deposits,
  COALESCE(SUM(CASE WHEN t.transaction_type IN ('withdrawal', 'payment', 'fee') AND t.status = 'completed'
                    AND t.created_at >= NOW() - INTERVAL '30 days'
                    THEN t.amount ELSE 0 END), 0) as recent_expenses

FROM auth.users u
LEFT JOIN user_profiles up ON up.id = u.id
LEFT JOIN bank_accounts ba ON ba.user_id = u.id
LEFT JOIN transactions t ON (t.from_account_id = ba.id OR t.to_account_id = ba.id)
                         AND t.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.email, u.created_at, up.full_name, up.cpf, up.phone, up.account_status;

-- =====================================================
-- VIEW: RECENT TRANSACTIONS
-- =====================================================

CREATE OR REPLACE VIEW recent_transactions AS
SELECT 
  t.id,
  t.user_id,
  t.transaction_type,
  t.amount,
  t.category,
  t.description,
  t.status,
  t.created_at,
  t.sender_name,
  
  -- Informações da conta de origem
  ba_from.account_number as from_account_number,
  ba_from.account_type as from_account_type,
  
  -- Informações da conta de destino
  ba_to.account_number as to_account_number,
  ba_to.account_type as to_account_type,
  
  -- Formatação para exibição
  CASE 
    WHEN t.transaction_type = 'deposit' THEN '+ R$ ' || (t.amount::NUMERIC / 100)::TEXT
    WHEN t.transaction_type IN ('withdrawal', 'payment', 'fee') THEN '- R$ ' || (t.amount::NUMERIC / 100)::TEXT
    WHEN t.transaction_type = 'transfer' THEN 'R$ ' || (t.amount::NUMERIC / 100)::TEXT
  END as formatted_amount,
  
  -- Status em português
  CASE 
    WHEN t.status = 'pending' THEN 'Pendente'
    WHEN t.status = 'completed' THEN 'Concluída'
    WHEN t.status = 'failed' THEN 'Falhada'
    WHEN t.status = 'cancelled' THEN 'Cancelada'
  END as status_pt

FROM transactions t
LEFT JOIN bank_accounts ba_from ON ba_from.id = t.from_account_id
LEFT JOIN bank_accounts ba_to ON ba_to.id = t.to_account_id
ORDER BY t.created_at DESC;

-- =====================================================
-- FUNÇÕES PARA ANALYTICS
-- =====================================================

-- Função para obter resumo financeiro de um usuário
CREATE OR REPLACE FUNCTION get_user_financial_summary(user_uuid UUID)
RETURNS TABLE(
  total_balance BIGINT,
  monthly_revenue BIGINT,
  monthly_expenses BIGINT,
  transactions_count INTEGER,
  active_accounts INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(ba.balance), 0) as total_balance,
    COALESCE(SUM(
      CASE WHEN t.transaction_type = 'deposit' AND t.status = 'completed' 
           AND EXTRACT(MONTH FROM t.created_at) = EXTRACT(MONTH FROM NOW())
           AND EXTRACT(YEAR FROM t.created_at) = EXTRACT(YEAR FROM NOW())
           THEN t.amount ELSE 0 END
    ), 0) as monthly_revenue,
    COALESCE(SUM(
      CASE WHEN t.transaction_type IN ('withdrawal', 'payment', 'fee') AND t.status = 'completed'
           AND EXTRACT(MONTH FROM t.created_at) = EXTRACT(MONTH FROM NOW())
           AND EXTRACT(YEAR FROM t.created_at) = EXTRACT(YEAR FROM NOW())
           THEN t.amount ELSE 0 END
    ), 0) as monthly_expenses,
    COUNT(DISTINCT t.id)::INTEGER as transactions_count,
    COUNT(DISTINCT CASE WHEN ba.is_active THEN ba.id END)::INTEGER as active_accounts
  FROM bank_accounts ba
  LEFT JOIN transactions t ON (t.from_account_id = ba.id OR t.to_account_id = ba.id)
  WHERE ba.user_id = user_uuid AND ba.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ÍNDICES PARA PERFORMANCE DAS VIEWS
-- =====================================================

-- Índices para otimizar as views
CREATE INDEX IF NOT EXISTS idx_transactions_month_year ON transactions(
  EXTRACT(MONTH FROM created_at),
  EXTRACT(YEAR FROM created_at)
) WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_transactions_user_month ON transactions(
  user_id,
  EXTRACT(MONTH FROM created_at),
  status
) WHERE status = 'completed';

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON VIEW monthly_financial_summary IS 'Resumo financeiro mensal por usuário com receitas, gastos e saldo';
COMMENT ON VIEW expenses_by_category IS 'Gastos agrupados por categoria para gráficos do dashboard';
COMMENT ON VIEW user_account_summary IS 'Resumo completo de usuários com estatísticas de contas e transações';
COMMENT ON VIEW recent_transactions IS 'Transações recentes com informações formatadas para exibição';

COMMENT ON FUNCTION get_user_financial_summary(UUID) IS 'Retorna resumo financeiro completo de um usuário específico';