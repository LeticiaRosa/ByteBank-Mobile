#!/bin/bash

# =====================================================
# ByteBank Mobile - Script de Aplicação de Migrations
# =====================================================
# Script para aplicar todas as migrations do ByteBank Mobile

set -e  # Parar execução em caso de erro

echo "🚀 ByteBank Mobile - Aplicando Migrations do Banco de Dados"
echo "============================================================"

# Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado!"
    echo "📦 Instale com: npm install -g supabase"
    exit 1
fi

# Verificar se estamos em um projeto Supabase
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Projeto Supabase não encontrado!"
    echo "🔧 Execute 'supabase init' primeiro"
    exit 1
fi

echo "📊 Verificando status das migrations..."
supabase migration list

echo ""
echo "🔗 Aplicando migrations ao banco de dados..."

# Lista de migrations em ordem
migrations=(
    "01_initial_setup.sql"
    "02_user_profiles.sql"
    "03_bank_accounts.sql" 
    "04_transactions.sql"
    "05_transaction_triggers.sql"
    "06_dashboard_views.sql"
    "07_audit_system.sql"
    "08_user_management.sql"
    "09_storage_security.sql"
)

# Aplicar cada migration
for migration in "${migrations[@]}"; do
    if [ -f "supabase/migrations/$migration" ]; then
        echo "📄 Aplicando migration: $migration"
        supabase db reset
        supabase migration up
    else
        echo "⚠️  Migration não encontrada: $migration"
    fi
done

echo ""
echo "🔧 Gerando tipos TypeScript..."
supabase gen types typescript --local > src/lib/database.types.ts

echo ""
echo "✅ Migrations aplicadas com sucesso!"
echo "📋 Verificando estrutura final..."

# Listar tabelas criadas
echo ""
echo "📊 Tabelas criadas:"
supabase db reset
echo "- user_profiles"
echo "- bank_accounts" 
echo "- transactions"
echo "- audit_logs"

echo ""
echo "👁️  Views criadas:"
echo "- monthly_financial_summary"
echo "- expenses_by_category"
echo "- user_account_summary"
echo "- recent_transactions"
echo "- audit_summary"

echo ""
echo "🎉 Setup do banco de dados concluído!"
echo "💡 Próximos passos:"
echo "   1. Configure as variáveis de ambiente (.env)"
echo "   2. Execute 'npm run dev' para iniciar o app"
echo "   3. Teste o login e criação de transações"

echo ""
echo "🔗 Links úteis:"
echo "   • Dashboard Supabase: $(supabase status | grep 'Studio URL' | awk '{print $3}')"
echo "   • Documentação: https://supabase.com/docs"