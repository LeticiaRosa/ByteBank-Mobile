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
  balance?: number;
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
    accountData: CreateBankAccountData
  ): Promise<BankAccount> {
    // Verificar se o usuário está autenticado e obter sessão
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session || !session.user) {
      throw new Error("Usuário não autenticado ou sessão inválida");
    }

    if (session.user.id !== userId) {
      throw new Error("ID do usuário não confere com usuário autenticado");
    }

    // Verificar se o usuário já tem uma conta ativa
    const { data: existingAccounts, error: checkError } = await supabase
      .from("bank_accounts")
      .select("id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .limit(1);

    if (checkError) {
      console.warn("Erro ao verificar contas existentes:", checkError.message);
    }

    if (existingAccounts && existingAccounts.length > 0) {
      throw new Error("Usuário já possui uma conta bancária ativa");
    }

    // Gerar número de conta único usando a função do banco
    const { data: accountNumber, error: accountNumberError } =
      await supabase.rpc("generate_account_number");

    if (accountNumberError || !accountNumber) {
      throw new Error("Erro ao gerar número da conta");
    }

    // Converter balance de reais para centavos (valores decimais para bigint)
    const balanceInCents = Math.round((accountData.balance || 0) * 100);

    const bankAccountData = {
      user_id: userId,
      account_number: accountNumber,
      account_type: accountData.account_type || "checking",
      balance: balanceInCents, // Em centavos como bigint
      currency: accountData.currency || "BRL",
      is_active: true,
    };

    // Tentar inserir com retry para lidar com problemas de sessão
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;

      try {
        const { data, error } = await supabase
          .from("bank_accounts")
          .insert(bankAccountData)
          .select()
          .single();

        if (error) {
          // Se for erro de RLS e ainda temos tentativas, aguardar um pouco
          if (
            error.message.includes("row-level security") &&
            attempts < maxAttempts
          ) {
            console.warn(`Tentativa ${attempts}: Erro de RLS, aguardando...`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
          }
          throw new Error(`Erro ao criar conta bancária: ${error.message}`);
        }

        if (!data) {
          throw new Error("Erro ao criar conta bancária: resposta vazia");
        }

        // Converter balance de volta para reais para retorno da interface
        const result = {
          ...data,
          balance: (data.balance || 0) / 100, // Converter centavos para reais
        };

        return result as BankAccount;
      } catch (error) {
        if (attempts === maxAttempts) {
          throw error;
        }
        console.warn(`Tentativa ${attempts} falhou:`, error);
        await new Promise((resolve) => setTimeout(resolve, 1000));
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
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        queryClient.setQueryData(AUTH_KEYS.user, session.user as User);
      } else if (event === "SIGNED_OUT") {
        queryClient.setQueryData(AUTH_KEYS.user, null);
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  // Helper functions
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

      // Se o usuário foi criado com sucesso, criar uma conta bancária padrão
      if (result.data.user) {
        try {
          // Aguardar um momento para garantir que a sessão seja estabelecida
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Verificar se a sessão foi estabelecida corretamente
          const { data: sessionData, error: sessionError } =
            await supabase.auth.getSession();

          if (sessionError || !sessionData.session) {
            console.warn(
              "Sessão não estabelecida ainda, usuário pode criar conta manualmente depois"
            );
            return { success: true, user: result.data.user };
          }

          console.log(
            "Criando conta bancária automática para o usuário:",
            result.data.user.id
          );

          const bankAccountResult = await createBankAccountMutation.mutateAsync(
            {
              userId: result.data.user.id,
              accountData: {
                account_type: "checking", // Conta corrente como padrão
                balance: 0.0,
                currency: "BRL",
              },
            }
          );

          console.log("Conta bancária criada com sucesso:", bankAccountResult);
        } catch (bankAccountError: any) {
          // Se falhar ao criar a conta bancária, ainda retorna sucesso no signup
          // mas loga o erro para investigação
          console.error(
            "Erro ao criar conta bancária automática:",
            bankAccountError
          );

          // NOTA: Se a criação automática falhar, o usuário pode usar o BankAccountCreationHelper
          // para tentar criar a conta manualmente depois do login
          // Exemplo: BankAccountCreationHelper.createBankAccountManual()
          // Não falha o signup por causa disso, mas pode ser tratado posteriormente
        }
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
  };
}
