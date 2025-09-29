import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthResponse, Session } from "@supabase/supabase-js";
import { AuthError, supabase, User } from "../lib/supabase";

// Chaves centralizadas para o React Query
const AUTH_KEYS = {
  user: ["auth", "user"] as const,
  session: ["auth", "session"] as const,
} as const;

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
}

export interface BankAccount {
  id: string;
  user_id: string;
  account_number: string;
  account_type: "checking" | "savings" | "business";
  balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBankAccountData {
  account_type?: "checking" | "savings" | "business";
  currency?: string;
}

// Classe de serviço para operações de autenticação
class AuthenticationService {
  public async signIn(email: string, password: string): Promise<AuthResponse> {
    return await supabase.auth.signInWithPassword({ email, password });
  }

  public async signUp(
    email: string,
    password: string,
    fullName?: string
  ): Promise<AuthResponse> {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
  }

  public async signOut() {
    return await supabase.auth.signOut();
  }

  public async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  public async getUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    return data.user as User | null;
  }
}

// Classe de serviço para operações de conta bancária
class BankAccountService {
  public async createBankAccount(
    userId: string,
    accountData: CreateBankAccountData,
    retryAttempts: number = 3
  ): Promise<BankAccount> {
    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        // Verificar se o usuário está autenticado e obter sessão
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.warn(`Tentativa ${attempt}: Erro na sessão:`, sessionError);
          if (attempt < retryAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          throw new Error(`Erro na sessão: ${sessionError.message}`);
        }

        if (!session || !session.user) {
          console.warn(
            `Tentativa ${attempt}: Sessão não encontrada ou usuário não autenticado`
          );
          if (attempt < retryAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          throw new Error("Usuário não autenticado ou sessão inválida");
        }

        if (session.user.id !== userId) {
          throw new Error("ID do usuário não confere com usuário autenticado");
        }

        console.log(
          `Tentativa ${attempt}: Sessão válida encontrada, criando conta bancária...`
        );

        // Usar a função create_user_bank_account do banco de dados
        const { data, error } = await supabase.rpc("create_user_bank_account", {
          p_user_id: userId,
          p_account_type: accountData.account_type || "checking",
          p_currency: accountData.currency || "BRL",
        });

        if (error) {
          throw new Error(`Erro ao criar conta bancária: ${error.message}`);
        }

        if (!data) {
          throw new Error("Erro ao criar conta bancária: resposta vazia");
        }

        // A função do banco retorna dados estruturados
        const response = data as any;

        // Verificar se a resposta indica sucesso
        if (!response.success) {
          throw new Error(
            `Erro ao criar conta bancária: ${
              response.error || "Resposta indica falha"
            }`
          );
        }

        const bankAccount = response.account;

        // Verificar se a resposta tem a estrutura esperada
        if (!bankAccount.id || !bankAccount.account_number) {
          throw new Error("Resposta inválida ao criar conta bancária");
        }

        // Converter balance de centavos para reais se necessário
        const result = {
          ...bankAccount,
          balance: bankAccount.balance ? bankAccount.balance / 100 : 0,
        };

        return result as BankAccount;
      } catch (error) {
        console.error(`Tentativa ${attempt} falhou:`, error);
        if (attempt === retryAttempts) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw new Error("Erro ao criar conta bancária após múltiplas tentativas");
  }
}

// Instâncias dos serviços
const authService = new AuthenticationService();
const bankAccountService = new BankAccountService();

export function useAuth() {
  const queryClient = useQueryClient();
  const [initializing, setInitializing] = useState(true);
  const [pendingBankAccountCreation, setPendingBankAccountCreation] = useState<
    string | null
  >(null);

  // Query para obter o usuário atual
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: AUTH_KEYS.user,
    queryFn: () => authService.getUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    enabled: !initializing, // Só executa após inicialização
  });

  // Inicializar sessão ao carregar o hook
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Verificar se existe uma sessão ativa
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Erro ao verificar sessão:", error);
        } else if (session?.user) {
          // Se há uma sessão válida, definir o usuário no cache
          queryClient.setQueryData(AUTH_KEYS.user, session.user as User);
        }
      } catch (error) {
        console.error("Erro na inicialização da auth:", error);
      } finally {
        setInitializing(false);
      }
    };

    initializeAuth();
  }, [queryClient]);

  // Mutations para autenticação
  const signInMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.signIn(email, password),
    onSuccess: (data: AuthResponse) => {
      if (data.data.user) {
        queryClient.setQueryData(AUTH_KEYS.user, data.data.user);
        queryClient.invalidateQueries({ queryKey: AUTH_KEYS.session });

        // Invalidar todas as queries quando o usuário faz login
        // Isso garante que todos os dados sejam recarregados com as informações mais atuais
        queryClient.invalidateQueries();
      }
    },
    onError: (error) => {
      console.error("Sign in error:", error);
    },
  });

  const signUpMutation = useMutation({
    mutationFn: ({
      email,
      password,
      fullName,
    }: {
      email: string;
      password: string;
      fullName?: string;
    }) => authService.signUp(email, password, fullName),
    onSuccess: (data: AuthResponse) => {
      if (data.data.user) {
        queryClient.setQueryData(AUTH_KEYS.user, data.data.user);
        queryClient.invalidateQueries({ queryKey: AUTH_KEYS.session });

        // Invalidar todas as queries quando um novo usuário é criado e logado
        // Isso garante que todos os dados sejam carregados para o novo usuário
        queryClient.invalidateQueries();
      }
    },
    onError: (error) => {
      console.error("Sign up error:", error);
    },
  });

  const signOutMutation = useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(AUTH_KEYS.user, null);
      queryClient.removeQueries({ queryKey: AUTH_KEYS.session });
    },
    onError: (error) => {
      console.error("Sign out error:", error);
    },
  });

  const createBankAccountMutation = useMutation({
    mutationFn: ({
      userId,
      accountData,
    }: {
      userId: string;
      accountData: CreateBankAccountData;
    }) => bankAccountService.createBankAccount(userId, accountData),
    onSuccess: () => {
      // Invalida queries relacionadas a contas bancárias se houver
      queryClient.invalidateQueries({ queryKey: ["bank_accounts"] });
    },
    onError: (error) => {
      console.error("Erro ao criar conta bancária:", error);
    },
  });

  // Listen para mudanças de estado de autenticação
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        queryClient.setQueryData(AUTH_KEYS.user, session.user as User);

        // Invalidar todas as queries quando o usuário faz login (incluindo login automático)
        // Isso garante que todos os dados sejam recarregados com as informações mais atuais
        queryClient.invalidateQueries();

        // Se há um usuário pendente para criação de conta bancária, criar agora
        if (pendingBankAccountCreation === session.user.id) {
          console.log(
            "Sessão estabelecida, criando conta bancária para usuário:",
            session.user.id
          );

          try {
            // Verificar se o usuário já tem uma conta bancária
            const { data: existingAccounts } = await supabase
              .from("bank_accounts")
              .select("id")
              .eq("user_id", session.user.id)
              .eq("is_active", true)
              .limit(1);

            if (!existingAccounts || existingAccounts.length === 0) {
              // Aguardar um pouco mais para garantir que a sessão está completamente estabelecida
              await new Promise((resolve) => setTimeout(resolve, 1000));

              const bankAccountResult =
                await createBankAccountMutation.mutateAsync({
                  userId: session.user.id,
                  accountData: {
                    account_type: "checking",
                    currency: "BRL",
                  },
                });

              console.log(
                "Conta bancária criada com sucesso:",
                bankAccountResult
              );
            } else {
              console.log("Usuário já possui conta bancária ativa");
            }
          } catch (error) {
            console.error(
              "Erro ao criar conta bancária após sessão estabelecida:",
              error
            );
          }

          // Limpar o estado pendente
          setPendingBankAccountCreation(null);
        }
      } else if (event === "SIGNED_OUT") {
        queryClient.setQueryData(AUTH_KEYS.user, null);

        // Limpar todas as queries quando o usuário faz logout
        queryClient.clear();

        // Limpar estado pendente
        setPendingBankAccountCreation(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient, pendingBankAccountCreation, createBankAccountMutation]); // Helper functions
  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInMutation.mutateAsync({ email, password });

      if (result.error) {
        return {
          success: false,
          error: {
            message: result.error.message,
            status: result.error.status,
          },
        };
      }

      return { success: true, user: result.data.user };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error?.message || "Erro inesperado ao fazer login",
        },
      };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const result = await signUpMutation.mutateAsync({
        email,
        password,
        fullName,
      });

      if (result.error) {
        return {
          success: false,
          error: {
            message: result.error.message,
            status: result.error.status,
          },
        };
      }

      // Se o usuário foi criado com sucesso, marcar para criação de conta bancária
      if (result.data.user) {
        console.log(
          "Usuário criado com sucesso, marcando para criação de conta bancária:",
          result.data.user.id
        );

        // Marcar que este usuário precisa de uma conta bancária quando a sessão for estabelecida
        setPendingBankAccountCreation(result.data.user.id);

        // Não tentar criar a conta bancária aqui, deixar para o listener de auth state
      }

      return { success: true, user: result.data.user };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error?.message || "Erro inesperado ao criar conta",
        },
      };
    }
  };

  const signOut = async () => {
    try {
      await signOutMutation.mutateAsync();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error?.message || "Erro inesperado ao fazer logout",
        },
      };
    }
  };

  const createBankAccount = async (accountData: CreateBankAccountData) => {
    if (!user) {
      return {
        success: false,
        error: {
          message: "Usuário não autenticado",
        },
      };
    }

    try {
      const bankAccount = await createBankAccountMutation.mutateAsync({
        userId: user.id,
        accountData,
      });
      return { success: true, bankAccount };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error?.message || "Erro inesperado ao criar conta bancária",
        },
      };
    }
  };

  // Função utilitária para invalidar queries específicas (caso necessário)
  const invalidateUserData = () => {
    queryClient.invalidateQueries({ queryKey: ["bank_accounts"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["monthly-financial-summary"] });
    queryClient.invalidateQueries({ queryKey: ["expenses-by-category"] });
    queryClient.invalidateQueries({ queryKey: ["user-accounts-summary"] });
  };

  return {
    user,
    loading:
      initializing ||
      userLoading ||
      signInMutation.isPending ||
      signUpMutation.isPending ||
      signOutMutation.isPending ||
      createBankAccountMutation.isPending,
    error: userError ? { message: userError.message } : null,
    signIn,
    signUp,
    signOut,
    createBankAccount,
    invalidateUserData, // Função para invalidar queries específicas quando necessário
  };
}
