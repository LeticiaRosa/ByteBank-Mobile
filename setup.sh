#!/bin/bash

# =====================================================
# ByteBank Mobile - Script de Setup Rápido
# =====================================================
# Script para configuração completa do projeto

set -e

echo "🚀 ByteBank Mobile - Setup Rápido"
echo "=================================="

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script na raiz do projeto ByteBank-Mobile"
    exit 1
fi

echo "📦 Instalando dependências..."
npm install

echo "🔧 Configurando Supabase..."

# Verificar se existe arquivo .env
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "📝 Criando arquivo .env de exemplo..."
    cat > .env << EOF
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-anonima

# App Configuration
EXPO_PUBLIC_APP_NAME=ByteBank
EXPO_PUBLIC_APP_VERSION=1.0.0
EOF
    echo "✏️  Configure suas credenciais do Supabase no arquivo .env"
fi

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "📦 Instalando Supabase CLI..."
    npm install -g supabase
fi

# Verificar se projeto Supabase está inicializado
if [ ! -f "supabase/config.toml" ]; then
    echo "🔧 Inicializando projeto Supabase..."
    supabase init
fi

echo "💾 Aplicando migrations do banco de dados..."
./supabase/apply-migrations.sh

echo "📱 Gerando tipos TypeScript..."
supabase gen types typescript --local > src/lib/database.types.ts

echo ""
echo "✅ Setup concluído com sucesso!"
echo ""
echo "🎯 Próximos passos:"
echo "   1. Configure suas credenciais do Supabase no arquivo .env"
echo "   2. Execute 'npm run dev' para iniciar o aplicativo"
echo "   3. Teste o registro de usuário e criação de transações"
echo ""
echo "📚 Documentação completa: README.md"
echo "🐛 Problemas? Consulte a seção 'Troubleshooting' no README"