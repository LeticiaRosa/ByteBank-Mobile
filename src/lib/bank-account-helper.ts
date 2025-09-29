import { supabase } from "./supabase";

/**
 * Utilitário para criação de contas bancárias com tratamento robusto de erros
 * Usado como fallback quando a criação automática falha
 */
export class BankAccountCreationHelper {
  /**
   * Cria uma conta bancária usando a função manual do banco
   * Esta função é mais robusta e pode ser chamada quando a criação automática falha
   */
  static async createBankAccountManual(): Promise<{
    success: boolean;
    account?: any;
    error?: string;
  }> {
    try {
      // Verificar se o usuário está autenticado
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        return {
          success: false,
          error: "Usuário não autenticado",
        };
      }

      // Chamar a função manual do banco
      const { data: result, error } = await supabase.rpc(
        "create_bank_account_manual"
      );

      if (error) {
        return {
          success: false,
          error: `Erro ao criar conta bancária: ${error.message}`,
        };
      }

      // Type assertion para o resultado da função
      const typedResult = result as {
        success: boolean;
        account?: any;
        error?: string;
      } | null;

      if (!typedResult || !typedResult.success) {
        return {
          success: false,
          error:
            typedResult?.error || "Erro desconhecido ao criar conta bancária",
        };
      }

      // Converter balance de centavos para reais
      const account = typedResult.account;
      if (account) {
        account.balance = (account.balance || 0) / 100;
      }

      return {
        success: true,
        account: account,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Erro inesperado",
      };
    }
  }

  /**
   * Verifica se o usuário já possui uma conta bancária
   */
  static async userHasBankAccount(): Promise<{
    hasAccount: boolean;
    account?: any;
    error?: string;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { hasAccount: false, error: "Usuário não autenticado" };
      }

      const { data: accounts, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1);

      if (error) {
        return { hasAccount: false, error: error.message };
      }

      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        // Converter balance de centavos para reais
        account.balance = (account.balance || 0) / 100;
        return { hasAccount: true, account };
      }

      return { hasAccount: false };
    } catch (error: any) {
      return { hasAccount: false, error: error.message };
    }
  }
}
