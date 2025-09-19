import { useEffect } from "react";
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
    // Função para gerar número de conta único
    const generateAccountNumber = () => {
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      const userIdShort = userId.slice(-4); // Últimos 4 caracteres do user ID
      return `${timestamp.slice(-8)}${random}${userIdShort}`;
    };

    let accountNumber = generateAccountNumber();
    let attempts = 0;
    const maxAttempts = 5;

    // Verificar se o número da conta já existe e gerar um novo se necessário
    while (attempts < maxAttempts) {
      const { data: existingAccount } = await supabase
        .from("bank_accounts")
        .select("account_number")
        .eq("account_number", accountNumber)
        .single();

      if (!existingAccount) {
        break; // Número único encontrado
      }

      accountNumber = generateAccountNumber();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error("Não foi possível gerar um número de conta único");
    }

    const bankAccountData = {
      user_id: userId,
      account_number: accountNumber,
      account_type: accountData.account_type || "checking",
      balance: accountData.balance || 0.0,
      currency: accountData.currency || "BRL",
      is_active: true,
    };

    const { data, error } = await supabase
      .from("bank_accounts")
      .insert(bankAccountData)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar conta bancária: ${error.message}`);
    }

    return data as BankAccount;
  }
}

// Instâncias dos serviços
const authService = new AuthenticationService();
const bankAccountService = new BankAccountService();

export function useAuth() {
  const queryClient = useQueryClient();

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
  });

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
          await createBankAccountMutation.mutateAsync({
            userId: result.data.user.id,
            accountData: {
              account_type: "checking", // Conta corrente como padrão
              balance: 0.0,
              currency: "BRL",
            },
          });
        } catch (bankAccountError: any) {
          // Se falhar ao criar a conta bancária, ainda retorna sucesso no signup
          // mas loga o erro para investigação
          console.error(
            "Erro ao criar conta bancária automática:",
            bankAccountError
          );
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
