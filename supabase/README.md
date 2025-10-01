# =====================================================

# ByteBank Mobile - Configuração do Supabase

# =====================================================

## 📋 Visão Geral

Este diretório contém todos os scripts de migration necessários para configurar o banco de dados do ByteBank Mobile. As migrations foram criadas baseadas na estrutura atual do projeto e incluem todas as funcionalidades necessárias.

## 🗂️ Estrutura dos Arquivos

```
supabase/
├── migrations/
│   ├── 01_initial_setup.sql      # Tipos, extensões e funções base
│   ├── 02_user_profiles.sql      # Tabela de perfis de usuário
│   ├── 03_bank_accounts.sql      # Tabela de contas bancárias
│   ├── 04_transactions.sql       # Tabela de transações
│   ├── 05_transaction_triggers.sql # Triggers para saldos automáticos
│   ├── 06_dashboard_views.sql    # Views para dashboard e relatórios
│   ├── 07_audit_system.sql      # Sistema de auditoria
│   ├── 08_user_management.sql    # Gerenciamento automático de usuários
│   └── 09_storage_security.sql   # Configurações de storage e segurança
├── apply-migrations.sh           # Script para aplicar todas as migrations
└── README.md                     # Este arquivo
```

## 🚀 Como Aplicar as Migrations

### Método 1: Script Automático (Recomendado)

```bash
# Navegar para o diretório do projeto
cd ByteBank-Mobile

# Executar o script de migrations
./supabase/apply-migrations.sh
```

### Método 2: Manual via Supabase CLI

```bash
# Inicializar projeto Supabase (se ainda não foi feito)
supabase init

# Aplicar migrations uma por vez
supabase db reset
supabase migration up

# Gerar tipos TypeScript
supabase gen types typescript --local > src/lib/database.types.ts
```

### Método 3: Manual via Dashboard do Supabase

1. Acesse o dashboard do seu projeto no [Supabase](https://supabase.com)
2. Vá para **SQL Editor**
3. Execute cada arquivo `.sql` na ordem numérica (01, 02, 03...)

## 📊 O que Cada Migration Faz

### 01_initial_setup.sql

- **Extensões**: uuid-ossp, pgcrypto
- **Tipos Enum**: account_type, transaction_category, transaction_type, transaction_status
- **Funções Base**: Geração de números de conta e referência
- **Triggers Base**: Auto-geração e updated_at

### 02_user_profiles.sql

- **Tabela**: user_profiles
- **Campos**: Nome, CPF, telefone, endereço, avatar
- **RLS**: Políticas de segurança por usuário
- **Validações**: Trigger para validar dados

### 03_bank_accounts.sql

- **Tabela**: bank_accounts
- **Funcionalidades**: Saldos, tipos de conta, ativação
- **Funções**: Incrementar/decrementar saldo com validações
- **Segurança**: RLS completo

### 04_transactions.sql

- **Tabela**: transactions
- **Tipos**: Depósito, saque, transferência, pagamento, taxa
- **Funcionalidades**: Processamento automático, comprovantes
- **Funções**: Transferências entre contas

### 05_transaction_triggers.sql

- **Triggers**: Atualização automática de saldos
- **Validações**: Consistência de dados
- **Funções**: Recálculo de saldos

### 06_dashboard_views.sql

- **Views**: monthly_financial_summary, expenses_by_category
- **Analytics**: user_account_summary, recent_transactions
- **Performance**: Índices otimizados

### 07_audit_system.sql

- **Tabela**: audit_logs
- **Auditoria**: Rastreamento completo de operações
- **Relatórios**: Logs de segurança e atividade

### 08_user_management.sql

- **Automação**: Criação automática de contas para novos usuários
- **Validações**: CPF e telefone brasileiros
- **Estatísticas**: Métricas de usuários

### 09_storage_security.sql

- **Storage**: Configuração para comprovantes
- **Segurança**: Políticas de acesso e limites
- **Auditoria**: Logs de segurança

## 🔧 Configurações Necessárias

### 1. Variáveis de Ambiente

Crie um arquivo `.env` com:

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-anonima
EXPO_PUBLIC_APP_NAME=ByteBank
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### 2. Storage (Opcional)

Para habilitar upload de comprovantes:

```sql
-- No SQL Editor do Supabase
INSERT INTO storage.buckets (id, name, public)
VALUES ('transaction-receipts', 'transaction-receipts', false);
```

### 3. Políticas de Storage

```sql
-- Política para upload
CREATE POLICY "Users can upload receipts" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'transaction-receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política para visualização
CREATE POLICY "Users can view own receipts" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'transaction-receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

## 🧪 Dados de Teste

Após aplicar as migrations, você pode inserir dados de teste:

```sql
-- Criar usuário de teste (execute após criar conta via app)
-- O sistema automaticamente criará perfil e conta bancária

-- Inserir transação de teste
INSERT INTO transactions (
  user_id,
  from_account_id,
  transaction_type,
  amount,
  description,
  status
) VALUES (
  'uuid-do-usuario',
  'uuid-da-conta',
  'deposit',
  100000, -- R$ 1.000,00
  'Depósito inicial',
  'completed'
);
```

## 🔍 Verificação e Troubleshooting

### Verificar se tudo foi criado corretamente:

```sql
-- Listar tabelas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Verificar RLS
SELECT schemaname, tablename, policyname
FROM pg_policies WHERE schemaname = 'public';

-- Testar funções
SELECT get_user_statistics();
```

### Problemas Comuns:

1. **Erro de permissão**: Verifique se RLS está habilitado
2. **Função não encontrada**: Execute migrations na ordem correta
3. **Constraint violation**: Verifique dados de entrada

### Recriar tudo do zero:

```bash
# Resetar banco local
supabase db reset

# Aplicar migrations novamente
supabase migration up
```

## 📈 Performance

As migrations incluem índices otimizados para:

- Consultas por usuário
- Filtros de transações
- Relatórios de dashboard
- Auditoria e logs

## 🔒 Segurança

- **RLS habilitado** em todas as tabelas
- **Políticas específicas** por operação
- **Validações** de CPF e telefone
- **Limites de transação** configuráveis
- **Auditoria completa** de operações

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs do Supabase
2. Confirme que todas as migrations foram aplicadas
3. Teste as funções individualmente
4. Consulte a [documentação do Supabase](https://supabase.com/docs)

---

**✅ Com estas migrations, seu ByteBank Mobile terá uma base de dados robusta, segura e otimizada!**
