# ByteBank Mobile - Aplicativo de Banking Digital

Este projeto é uma aplicação móvel React Native para gerenciamento financeiro pessoal, desenvolvida com Expo e Supabase como backend. O ByteBank Mobile oferece uma experiência completa de banking digital com funcionalidades avançadas de gestão financeira.

## 🏆 Visão Geral

O ByteBank Mobile é uma plataforma de banking digital que utiliza tecnologias modernas para fornecer:

- **Dashboard Inteligente**: Visualizações financeiras em tempo real com gráficos interativos
- **Gestão de Transações**: Sistema completo de receitas, despesas e transferências
- **Análise Financeira**: Relatórios detalhados com categorização automática
- **Extrato Detalhado**: Histórico completo com filtros avançados
- **Segurança Avançada**: Autenticação robusta com Supabase Auth
- **Upload de Comprovantes**: Sistema de anexos para transações
- **Modo Escuro/Claro**: Interface adaptável com temas personalizáveis

## 🚀 Demo e Funcionalidades

### 📱 Telas Principais

- **Login/Registro**: Autenticação segura com Supabase
- **Dashboard Home**: Visão geral financeira com cartões de resumo e gráficos
- **Nova Transação**: Formulário completo para criação de transações
- **Extrato**: Listagem detalhada com filtros e paginação
- **Perfil**: Configurações do usuário e preferências

## 🛠️ Tecnologias Utilizadas

### Frontend Mobile

- **React Native**: Framework para desenvolvimento mobile
- **Expo**: Plataforma de desenvolvimento e build
- **TypeScript**: Tipagem estática para maior segurança
- **NativeWind**: TailwindCSS para React Native
- **Lucide React Native**: Ícones consistentes
- **React Navigation**: Navegação com Drawer Navigator

### Gerenciamento de Estado

- **TanStack Query**: Cache inteligente e sincronização de dados
- **React Hook Form**: Gerenciamento de formulários
- **Context API**: Estado global para tema e autenticação

### Backend e Dados

- **Supabase**: Backend-as-a-Service completo
- **PostgreSQL**: Banco de dados relacional
- **Supabase Auth**: Autenticação e autorização
- **Supabase Storage**: Armazenamento de arquivos
- **Row Level Security (RLS)**: Segurança a nível de linha

### Visualização de Dados

- **React Native Chart Kit**: Gráficos e visualizações
- **Charts Personalizados**: Line Chart, Bar Chart, Pie Chart

## 📊 Funcionalidades Principais

### 🏠 Dashboard Home - Visão Financeira Inteligente

- **Cartões de Resumo Animados**:
  - Saldo disponível em tempo real
  - Receitas do mês com crescimento percentual
  - Gastos mensais com comparativo
- **Gráficos Interativos**:
  - Evolução do saldo ao longo do tempo (Line Chart)
  - Distribuição de gastos por categoria (Pie Chart)
  - Receitas mensais comparativas (Bar Chart)
- **Animações Suaves**: Transições escalonadas para melhor UX

### 💳 Gestão de Transações

- **Criação Completa**:
  - Formulário com validação em tempo real
  - Suporte a vários tipos: depósito, saque, transferência, pagamento
  - Cálculo automático de saldo
- **Upload de Comprovantes**:
  - Suporte a imagens (JPG, PNG)
  - Integração com câmera e galeria
  - Armazenamento seguro no Supabase Storage

### 📈 Extrato Avançado

- **Filtros Inteligentes**:
  - Período personalizado (data de/até)
  - Tipo de transação (todas, depósito, saque, transferência, pagamento)
  - Status (concluída, pendente, falhada, cancelada)
  - Faixa de valores (mín/máx)
  - Categoria específica
  - Busca por descrição
- **Funcionalidades**:
  - Paginação eficiente (10 itens por página)
  - Estatísticas do período filtrado
  - Ações rápidas (editar, excluir, processar)
  - Confirmação para operações críticas

### 👤 Perfil e Configurações

- **Configurações de Tema**: Alternância entre modo claro/escuro
- **Informações do Usuário**: Dados do perfil e configurações
- **Logout Seguro**: Encerramento de sessão com limpeza de cache

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g @expo/cli`)
- Conta no Supabase
- Android Studio (para Android) ou Xcode (para iOS)

### 1. Clone o Repositório

```bash
git clone https://github.com/LeticiaRosa/ByteBank-Mobile.git
cd ByteBank-Mobile
```

### 2. Instale as Dependências

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 3. Configuração do Supabase

#### 3.1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em "New Project"
3. Escolha sua organização e defina:
   - **Project Name**: `ByteBank-Mobile`
   - **Database Password**: (senha segura)
   - **Region**: (região mais próxima)
4. Aguarde a criação do projeto (2-3 minutos)

#### 3.2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-anonima

# App Configuration
EXPO_PUBLIC_APP_NAME=ByteBank
EXPO_PUBLIC_APP_VERSION=1.0.0
```

**Para obter as credenciais:**

1. No dashboard do Supabase, vá em **Settings** > **API**
2. Copie a **Project URL** para `EXPO_PUBLIC_SUPABASE_URL`
3. Copie a **anon public** key para `EXPO_PUBLIC_SUPABASE_ANON_KEY`

#### 3.3. Aplicar Migrations do Banco de Dados

**🚀 Método Automático (Recomendado):**

```bash
# Aplicar todas as migrations automaticamente
./supabase/apply-migrations.sh
```

**📋 Método Manual:**

1. Instale o Supabase CLI:

```bash
npm install -g supabase
```

2. Inicie o projeto Supabase:

```bash
supabase init
supabase login
```

3. Aplique as migrations:

```bash
supabase db reset
supabase migration up
```

4. Gere os tipos TypeScript:

```bash
supabase gen types typescript --local > src/lib/database.types.ts
```

**💾 O que as Migrations Incluem:**

- ✅ Tabelas: `user_profiles`, `bank_accounts`, `transactions`, `audit_logs`
- ✅ Views: `monthly_financial_summary`, `expenses_by_category`
- ✅ Funções: Processamento de transações, validações, auditoria
- ✅ Triggers: Atualização automática de saldos
- ✅ RLS: Políticas de segurança completas
- ✅ Índices: Otimizações de performance

**📁 Estrutura das Migrations:**

```
supabase/migrations/
├── 01_initial_setup.sql      # Tipos, extensões e funções base
├── 02_user_profiles.sql      # Tabela de perfis de usuário
├── 03_bank_accounts.sql      # Contas bancárias e saldos
├── 04_transactions.sql       # Sistema de transações
├── 05_transaction_triggers.sql # Triggers automáticos
├── 06_dashboard_views.sql    # Views para relatórios
├── 07_audit_system.sql      # Sistema de auditoria
├── 08_user_management.sql    # Gerenciamento de usuários
└── 09_storage_security.sql   # Storage e segurança
```

> 💡 **Dica**: As migrations criam automaticamente contas bancárias para novos usuários, aplicam validações de CPF/telefone e configuram limites de transação.

#### 3.4. Configurar Storage (Opcional - para comprovantes)

1. No dashboard do Supabase, vá em **Storage**
2. Clique em **Create Bucket**
3. Nome do bucket: `transaction-receipts`
4. Defina como **Public** se quiser acesso direto às imagens
5. Configure políticas de acesso conforme necessário

### 4. Executar o Projeto

```bash
# Iniciar o servidor de desenvolvimento
npx expo start

# Para Android
npx expo run:android

# Para iOS
npx expo run:ios

# Para Web (desenvolvimento)
npx expo start --web
```

### 5. Build para Produção

```bash
# Build para Android (APK)
npx expo build:android

# Build para iOS
npx expo build:ios

# Build usando EAS (recomendado)
npx eas build --platform android
npx eas build --platform ios
```

## 🎨 Estrutura do Projeto

```
ByteBank-Mobile/
├── src/
│   ├── components/
│   │   ├── AuthForm/           # Componente de autenticação
│   │   ├── ui/                 # Componentes UI reutilizáveis
│   │   └── UserRoutes/         # Telas principais do app
│   │       ├── Home/           # Dashboard com gráficos
│   │       ├── Transactions/   # Nova transação
│   │       ├── Extrato/        # Listagem e filtros
│   │       ├── Profile/        # Perfil do usuário
│   │       └── Sidebar/        # Navegação drawer
│   ├── hooks/                  # Custom hooks
│   │   ├── useAuth.ts          # Autenticação
│   │   ├── useTransactions.ts  # Gestão de transações
│   │   ├── useBankAccounts.ts  # Contas bancárias
│   │   ├── useTheme.tsx        # Tema claro/escuro
│   │   └── useDashboardsCharts.ts # Dados para gráficos
│   ├── lib/                    # Bibliotecas e configurações
│   │   ├── supabase.ts         # Cliente Supabase
│   │   ├── database.types.ts   # Tipos do banco
│   │   └── transactions.ts     # Serviços de transação
│   ├── styles/                 # Estilos e temas
│   │   ├── theme.ts            # Sistema de cores
│   │   └── globals.css         # Estilos globais
│   ├── utils/                  # Utilitários
│   │   └── money.utils.ts      # Formatação monetária
│   └── env/                    # Configuração de ambiente
│       ├── client.ts           # Variáveis do cliente
│       └── index.ts            # Exports centralizados
├── android/                    # Arquivos específicos Android
├── ios/                        # Arquivos específicos iOS
├── app.json                    # Configuração Expo
├── tailwind.config.ts          # Configuração TailwindCSS
└── package.json               # Dependências e scripts
```

## 🤝 Contribuição

### Como Contribuir

1. Fork o projeto
2. Crie uma feature branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Padrões de Código

- **TypeScript**: Tipagem estrita obrigatória
- **ESLint + Prettier**: Formatação automática
- **Conventional Commits**: Padrão de mensagens
- **Component Patterns**: Componentes funcionais com hooks

### Estrutura de Commits

```
feat: adiciona nova funcionalidade de gráficos
fix: corrige bug na validação de formulário
docs: atualiza documentação de instalação
style: ajusta espaçamento nos componentes
refactor: reestrutura serviços de transação
test: adiciona testes para hooks customizados
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido com ❤️ para revolucionar a experiência de banking digital mobile**

## 🆘 Suporte e Troubleshooting

### Problemas Comuns

**1. Erro de conexão com Supabase**

```bash
# Verifique as variáveis de ambiente
npx expo config --type env

# Teste a conexão
curl https://seu-projeto.supabase.co/rest/v1/
```

**2. Problema com dependências nativas**

```bash
# Limpe o cache
npx expo r -c

# Reinstale as dependências
rm -rf node_modules package-lock.json
npm install
```

**3. Erro de build Android**

```bash
# Limpe o projeto Android
cd android && ./gradlew clean && cd ..
npx expo run:android --clear
```

**4. Problemas com as migrations do Supabase**

```bash
# Verificar status das migrations
supabase migration list

# Reaplicar migrations
supabase db reset
./supabase/apply-migrations.sh

# Verificar estrutura do banco
supabase db diff
```

**5. Erro de RLS (Row Level Security)**

Verifique se as políticas foram aplicadas corretamente:

```sql
-- No SQL Editor do Supabase
SELECT schemaname, tablename, policyname
FROM pg_policies WHERE schemaname = 'public';
```

## 📂 Sistema de Migrations

O projeto inclui um sistema completo de migrations para configuração automática do banco de dados:

### 🏗️ Estrutura das Migrations

```
supabase/migrations/
├── 01_initial_setup.sql      # Tipos, extensões e funções base
├── 02_user_profiles.sql      # Perfis de usuário com validações
├── 03_bank_accounts.sql      # Contas bancárias e saldos
├── 04_transactions.sql       # Sistema completo de transações
├── 05_transaction_triggers.sql # Triggers para saldos automáticos
├── 06_dashboard_views.sql    # Views para relatórios e gráficos
├── 07_audit_system.sql      # Sistema de auditoria completo
├── 08_user_management.sql    # Gerenciamento automático de usuários
└── 09_storage_security.sql   # Configurações de storage e segurança
```

### 🎯 Funcionalidades Incluídas

- **✅ Criação automática de contas** para novos usuários
- **✅ Validações de CPF e telefone** brasileiros
- **✅ Triggers para atualização de saldos** em tempo real
- **✅ Sistema de auditoria completo** para todas as operações
- **✅ Views otimizadas** para dashboard e relatórios
- **✅ Políticas RLS** para segurança total
- **✅ Índices de performance** para consultas rápidas
- **✅ Limites de transação** configuráveis
- **✅ Funções de transferência** entre contas

### 🚀 Comandos Úteis

```bash
# Aplicar todas as migrations
./supabase/apply-migrations.sh

# Verificar status
supabase migration list

# Resetar e reaplicar
supabase db reset

# Gerar tipos TypeScript
supabase gen types typescript --local > src/lib/database.types.ts

# Ver diferenças
supabase db diff
```

### Links Úteis

- [Documentação Expo](https://docs.expo.dev/)
- [Documentação Supabase](https://supabase.com/docs)
- [React Navigation](https://reactnavigation.org/)
- [TanStack Query](https://tanstack.com/query)
- [NativeWind](https://www.nativewind.dev/)

Para mais ajuda, abra uma [issue](https://github.com/LeticiaRosa/ByteBank-Mobile/issues) no repositório.
