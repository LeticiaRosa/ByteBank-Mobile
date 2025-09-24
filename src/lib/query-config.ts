// Configuração centralizada das chaves e configurações do React Query
export const QUERY_KEYS = {
  // Transações
  transactions: {
    all: ["transactions"] as const,
    lists: () => [...QUERY_KEYS.transactions.all, "list"] as const,
    list: (filters?: any) =>
      [...QUERY_KEYS.transactions.lists(), { filters }] as const,
    details: () => [...QUERY_KEYS.transactions.all, "detail"] as const,
    detail: (id: string) => [...QUERY_KEYS.transactions.details(), id] as const,
    filtered: () => [...QUERY_KEYS.transactions.all, "filtered"] as const,
  },

  // Contas bancárias
  bankAccounts: {
    all: ["bank_accounts"] as const,
    lists: () => [...QUERY_KEYS.bankAccounts.all, "list"] as const,
    primary: () => [...QUERY_KEYS.bankAccounts.all, "primary"] as const,
    byNumber: (accountNumber: string) =>
      [...QUERY_KEYS.bankAccounts.all, "by-number", accountNumber] as const,
  },

  // Usuário/Auth
  auth: {
    all: ["auth"] as const,
    user: () => [...QUERY_KEYS.auth.all, "user"] as const,
    session: () => [...QUERY_KEYS.auth.all, "session"] as const,
  },
} as const;

// Configurações padrão para queries
// Nota: Essas configurações têm prioridade sobre as configurações globais definidas em App.tsx
// quando são passadas explicitamente para os hooks useQuery com o operador spread {...QUERY_CONFIG.categoria}
export const QUERY_CONFIG = {
  // Configurações para transações
  transactions: {
    staleTime: 1000 * 30, // 30 segundos - dados mais atualizados
    gcTime: 1000 * 60 * 10, // 10 minutos
    retry: (failureCount: number, error: any) => {
      if (error.message.includes("Token de autenticação")) {
        return false;
      }
      return failureCount < 3;
    },
    refetchOnWindowFocus: true, // Atualizar no foco da janela
  },

  // Configurações para contas bancárias
  bankAccounts: {
    staleTime: 1000 * 15, // 15 segundos - saldos precisam ser atuais
    gcTime: 1000 * 60 * 5, // 5 minutos
    retry: (failureCount: number, error: any) => {
      if (error.message.includes("Token de autenticação")) {
        return false;
      }
      return failureCount < 3;
    },
    refetchOnWindowFocus: true, // Saldos devem atualizar no foco
  },

  // Configurações para auth
  auth: {
    staleTime: 1000 * 60 * 15, // 15 minutos - auth é mais estável
    gcTime: 1000 * 60 * 30, // 30 minutos
    retry: false,
    refetchOnWindowFocus: false,
  },
} as const;
