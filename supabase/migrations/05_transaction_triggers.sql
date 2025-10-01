-- =====================================================
-- ByteBank Mobile - Migration 05: Transaction Triggers
-- =====================================================
-- Cria triggers para atualização automática de saldos

-- =====================================================
-- FUNÇÕES PARA TRIGGERS
-- =====================================================

-- Função para atualizar saldo ao inserir transação
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Só processa transações com status 'completed'
  IF NEW.status = 'completed' THEN
    CASE NEW.transaction_type
      WHEN 'deposit' THEN
        -- Crédito na conta (from_account_id para depósitos)
        IF NEW.from_account_id IS NOT NULL THEN
          UPDATE bank_accounts 
          SET balance = balance + NEW.amount,
              updated_at = NOW()
          WHERE id = NEW.from_account_id;
        END IF;
        
      WHEN 'withdrawal', 'payment', 'fee' THEN
        -- Débito da conta
        IF NEW.from_account_id IS NOT NULL THEN
          UPDATE bank_accounts 
          SET balance = balance - NEW.amount,
              updated_at = NOW()
          WHERE id = NEW.from_account_id;
        END IF;
        
      WHEN 'transfer' THEN
        -- Débito da conta origem e crédito na conta destino
        IF NEW.from_account_id IS NOT NULL THEN
          UPDATE bank_accounts 
          SET balance = balance - NEW.amount,
              updated_at = NOW()
          WHERE id = NEW.from_account_id;
        END IF;
        
        IF NEW.to_account_id IS NOT NULL THEN
          UPDATE bank_accounts 
          SET balance = balance + NEW.amount,
              updated_at = NOW()
          WHERE id = NEW.to_account_id;
        END IF;
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para reverter saldo ao deletar transação
CREATE OR REPLACE FUNCTION update_account_balance_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Só reverte transações que estavam 'completed'
  IF OLD.status = 'completed' THEN
    CASE OLD.transaction_type
      WHEN 'deposit' THEN
        -- Reverter crédito (debitar)
        IF OLD.from_account_id IS NOT NULL THEN
          UPDATE bank_accounts 
          SET balance = balance - OLD.amount,
              updated_at = NOW()
          WHERE id = OLD.from_account_id;
        END IF;
        
      WHEN 'withdrawal', 'payment', 'fee' THEN
        -- Reverter débito (creditar)
        IF OLD.from_account_id IS NOT NULL THEN
          UPDATE bank_accounts 
          SET balance = balance + OLD.amount,
              updated_at = NOW()
          WHERE id = OLD.from_account_id;
        END IF;
        
      WHEN 'transfer' THEN
        -- Reverter transferência
        IF OLD.from_account_id IS NOT NULL THEN
          UPDATE bank_accounts 
          SET balance = balance + OLD.amount,
              updated_at = NOW()
          WHERE id = OLD.from_account_id;
        END IF;
        
        IF OLD.to_account_id IS NOT NULL THEN
          UPDATE bank_accounts 
          SET balance = balance - OLD.amount,
              updated_at = NOW()
          WHERE id = OLD.to_account_id;
        END IF;
    END CASE;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS PARA TRANSAÇÕES
-- =====================================================

-- Trigger para inserção de transações
CREATE TRIGGER trigger_update_balance_on_insert
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_account_balance();

-- Trigger para atualização de transações
CREATE TRIGGER trigger_update_balance_on_update
  AFTER UPDATE ON transactions
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.amount IS DISTINCT FROM NEW.amount)
  EXECUTE FUNCTION update_account_balance();

-- Trigger para deleção de transações
CREATE TRIGGER trigger_update_balance_on_delete
  AFTER DELETE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_account_balance_on_delete();

-- =====================================================
-- FUNÇÃO PARA RECALCULAR SALDOS
-- =====================================================

-- Função para recalcular saldo de uma conta específica
CREATE OR REPLACE FUNCTION recalculate_account_balance(account_id UUID)
RETURNS VOID AS $$
DECLARE
  total_balance BIGINT := 0;
  txn RECORD;
BEGIN
  -- Somar todas as transações completadas para esta conta
  FOR txn IN 
    SELECT transaction_type, amount, from_account_id, to_account_id
    FROM transactions 
    WHERE status = 'completed' 
    AND (from_account_id = account_id OR to_account_id = account_id)
    ORDER BY created_at
  LOOP
    CASE txn.transaction_type
      WHEN 'deposit' THEN
        -- Depósito sempre credita na from_account_id
        IF txn.from_account_id = account_id THEN
          total_balance := total_balance + txn.amount;
        END IF;
        
      WHEN 'withdrawal', 'payment', 'fee' THEN
        -- Débitos sempre debitam da from_account_id
        IF txn.from_account_id = account_id THEN
          total_balance := total_balance - txn.amount;
        END IF;
        
      WHEN 'transfer' THEN
        -- Transferência: débito da origem, crédito no destino
        IF txn.from_account_id = account_id THEN
          total_balance := total_balance - txn.amount;
        ELSIF txn.to_account_id = account_id THEN
          total_balance := total_balance + txn.amount;
        END IF;
    END CASE;
  END LOOP;
  
  -- Atualizar o saldo da conta
  UPDATE bank_accounts 
  SET balance = GREATEST(total_balance, 0),  -- Garantir que não fique negativo
      updated_at = NOW()
  WHERE id = account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para recalcular todos os saldos
CREATE OR REPLACE FUNCTION recalculate_all_account_balances()
RETURNS VOID AS $$
DECLARE
  account_record RECORD;
BEGIN
  FOR account_record IN SELECT id FROM bank_accounts WHERE is_active = true
  LOOP
    PERFORM recalculate_account_balance(account_record.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON FUNCTION update_account_balance() IS 'Trigger function para atualizar saldos ao inserir/atualizar transações';
COMMENT ON FUNCTION update_account_balance_on_delete() IS 'Trigger function para reverter saldos ao deletar transações';
COMMENT ON FUNCTION recalculate_account_balance(UUID) IS 'Recalcula o saldo de uma conta baseado em todas as transações';
COMMENT ON FUNCTION recalculate_all_account_balances() IS 'Recalcula os saldos de todas as contas ativas';