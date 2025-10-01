-- =====================================================
-- ByteBank Mobile - Migration 01: Initial Setup
-- =====================================================
-- Cria a estrutura básica do banco de dados para o ByteBank Mobile
-- Inclui: tipos, funções auxiliares e extensões necessárias

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TIPOS ENUMERADOS (ENUMS)
-- =====================================================

-- Tipo de conta bancária
CREATE TYPE account_type AS ENUM ('checking', 'savings', 'business');

-- Categoria de transação
CREATE TYPE transaction_category AS ENUM (
  'alimentacao',
  'transporte', 
  'saude',
  'educacao',
  'entretenimento',
  'compras',
  'casa',
  'trabalho',
  'investimentos',
  'viagem',
  'outros'
);

-- Tipo de transação
CREATE TYPE transaction_type AS ENUM (
  'deposit',
  'withdrawal', 
  'transfer',
  'payment',
  'fee'
);

-- Status da transação
CREATE TYPE transaction_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'cancelled'
);

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para gerar números de conta bancária únicos
CREATE OR REPLACE FUNCTION generate_account_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  is_unique BOOLEAN := FALSE;
BEGIN
  WHILE NOT is_unique LOOP
    -- Gera um número de 8 dígitos
    new_number := LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
    
    -- Verifica se já existe
    SELECT NOT EXISTS(
      SELECT 1 FROM bank_accounts WHERE account_number = new_number
    ) INTO is_unique;
  END LOOP;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar números de referência de transação únicos
CREATE OR REPLACE FUNCTION generate_reference_number()
RETURNS TEXT AS $$
DECLARE
  new_reference TEXT;
  is_unique BOOLEAN := FALSE;
BEGIN
  WHILE NOT is_unique LOOP
    -- Gera um número de referência com prefixo REF
    new_reference := 'REF' || LPAD(FLOOR(RANDOM() * 1000000000)::TEXT, 9, '0');
    
    -- Verifica se já existe
    SELECT NOT EXISTS(
      SELECT 1 FROM transactions WHERE reference_number = new_reference
    ) INTO is_unique;
  END LOOP;
  
  RETURN new_reference;
END;
$$ LANGUAGE plpgsql;

-- Função para auto-gerar número de conta
CREATE OR REPLACE FUNCTION auto_generate_account_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.account_number IS NULL OR NEW.account_number = '' THEN
    NEW.account_number := generate_account_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para auto-gerar número de referência
CREATE OR REPLACE FUNCTION auto_generate_reference_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
    NEW.reference_number := generate_reference_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar timestamp updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON FUNCTION generate_account_number() IS 'Gera números únicos de conta bancária com 8 dígitos';
COMMENT ON FUNCTION generate_reference_number() IS 'Gera números únicos de referência para transações';
COMMENT ON FUNCTION auto_generate_account_number() IS 'Trigger function para auto-gerar números de conta';
COMMENT ON FUNCTION auto_generate_reference_number() IS 'Trigger function para auto-gerar números de referência';
COMMENT ON FUNCTION handle_updated_at() IS 'Trigger function para atualizar timestamp updated_at automaticamente';