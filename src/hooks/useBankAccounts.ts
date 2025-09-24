import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { QUERY_KEYS, QUERY_CONFIG } from "../lib/query-config";
import { MoneyUtils } from "../utils";

export interface BankAccount {
  id: string;
  user_id: string;
  account_number: string;
  account_type: "checking" | "savings" | "business";
  balance: number; // Saldo em reais (convertido de centavos)
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Serviço de contas bancárias - responsabilidade única para operações de conta
export class BankAccountService {
  /**
   * Lista todas as contas bancárias ativas do usuário autenticado
   * @returns Contas com saldos convertidos para reais
   */
  public async getBankAccounts(): Promise<BankAccount[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    const { data: accounts, error } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar contas bancárias: ${error.message}`);
    }

    // Converter saldos de centavos para reais e garantir tipos corretos
    return (accounts || []).map((account) => ({
      ...account,
      balance: MoneyUtils.centsToReais(account.balance || 0),
      account_type: (account.account_type || "checking") as
        | "checking"
        | "savings"
        | "business",
      currency: account.currency || "BRL",
      is_active: account.is_active ?? true,
      created_at: account.created_at || "",
      updated_at: account.updated_at || "",
    }));
  }

  /**
   * Obtém a conta bancária principal do usuário (primeira conta ativa)
   * @returns Conta com saldo convertido para reais
   */
  public async getPrimaryAccount(): Promise<BankAccount | null> {
    const accounts = await this.getBankAccounts();
    return accounts && accounts.length > 0 ? accounts[0] : null;
  }

  /**
   * Busca uma conta pelo número do usuário autenticado
   * @returns Conta com saldo convertido para reais
   */
  public async getAccountByNumber(
    accountNumber: string
  ): Promise<BankAccount | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    const { data: accounts, error } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("account_number", accountNumber)
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (error) {
      throw new Error(`Erro ao buscar conta por número: ${error.message}`);
    }

    if (!accounts || accounts.length === 0) {
      return null;
    }

    const account = accounts[0];

    // Converter saldo de centavos para reais e garantir tipos corretos
    return {
      ...account,
      balance: MoneyUtils.centsToReais(account.balance || 0),
      account_type: (account.account_type || "checking") as
        | "checking"
        | "savings"
        | "business",
      currency: account.currency || "BRL",
      is_active: account.is_active ?? true,
      created_at: account.created_at || "",
      updated_at: account.updated_at || "",
    };
  }
}

// Instância do serviço
const bankAccountService = new BankAccountService();

/**
 * Hook para listar todas as contas bancárias do usuário
 */
export function useBankAccounts() {
  return useQuery({
    queryKey: QUERY_KEYS.bankAccounts.lists(),
    queryFn: () => bankAccountService.getBankAccounts(),
    ...QUERY_CONFIG.bankAccounts,
    // Atualização automática mais frequente para saldos sempre atuais
    refetchInterval: 30000, // 30 segundos
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

/**
 * Hook para obter a conta bancária principal do usuário
 */
export function usePrimaryBankAccount() {
  const { data: bankAccounts } = useBankAccounts();

  return useQuery({
    queryKey: QUERY_KEYS.bankAccounts.primary(),
    queryFn: () => bankAccountService.getPrimaryAccount(),
    enabled: !!bankAccounts && bankAccounts.length > 0,
    ...QUERY_CONFIG.bankAccounts,
    // Atualização automática mais frequente para saldo sempre atual
    refetchInterval: 30000, // 30 segundos
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

/**
 * Hook para buscar uma conta por número
 */
export function useBankAccountByNumber(accountNumber?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.bankAccounts.byNumber(accountNumber || ""),
    queryFn: () => bankAccountService.getAccountByNumber(accountNumber!),
    enabled: !!accountNumber,
    ...QUERY_CONFIG.bankAccounts,
  });
}
