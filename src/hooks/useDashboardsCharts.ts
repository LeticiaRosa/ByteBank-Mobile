import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

// Tipos para os dados do dashboard
export interface MonthlyBalanceData {
  month_label: string;
  month_number: number;
  receitas: number;
  gastos: number;
  saldo: number;
}

export interface ExpensesCategoryData {
  category: string;
  label: string;
  value: number;
}

export interface UserAccountData {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
  is_active: boolean;
  user_id: string;
}

// Hook para buscar dados da evolução financeira mensal
export function useMonthlyBalanceData() {
  return useQuery({
    queryKey: ["monthly-financial-summary"],
    queryFn: async (): Promise<MonthlyBalanceData[]> => {
      // Como não há uma view específica, vamos buscar dados das transações agrupadas por mês
      // Retornando dados simulados por enquanto até que as views sejam criadas no banco
      const mockData: MonthlyBalanceData[] = [
        {
          month_label: "Jan 2025",
          month_number: 1,
          receitas: 5000,
          gastos: 3000,
          saldo: 2000,
        },
        {
          month_label: "Fev 2025",
          month_number: 2,
          receitas: 5500,
          gastos: 3200,
          saldo: 2300,
        },
        {
          month_label: "Mar 2025",
          month_number: 3,
          receitas: 6000,
          gastos: 3500,
          saldo: 2500,
        },
      ];
      return mockData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
  });
}

// Hook para buscar dados de gastos por categoria
export function useExpensesByCategory() {
  return useQuery({
    queryKey: ["expenses-by-category"],
    queryFn: async (): Promise<ExpensesCategoryData[]> => {
      // Buscar transações do tipo 'withdrawal', 'payment' e 'fee' para calcular gastos por categoria
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("amount, category, transaction_type")
        .in("transaction_type", ["withdrawal", "payment", "fee"])
        .eq("status", "completed");

      if (error) {
        throw new Error(
          `Erro ao buscar gastos por categoria: ${error.message}`
        );
      }

      // Agregar dados por categoria
      const categoryTotals: Record<string, number> = {};
      transactions?.forEach((transaction) => {
        const category = transaction.category || "outros";
        const amount = Math.abs(transaction.amount || 0);
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      });

      // Converter para o formato esperado e ordenar por valor (maior para menor)
      return Object.entries(categoryTotals)
        .map(([category, value]) => ({
          category,
          label: category.charAt(0).toUpperCase() + category.slice(1),
          value,
        }))
        .sort((a, b) => b.value - a.value) // Ordenar por valor decrescente
        .slice(0, 5); // Pegar apenas as 5 primeiras (maiores gastos)
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
  });
}

// Hook para buscar dados das contas do usuário
export function useUserAccounts() {
  return useQuery({
    queryKey: ["user-accounts-summary"],
    queryFn: async (): Promise<UserAccountData[]> => {
      // Buscar contas bancárias do usuário logado
      const { data: accounts, error } = await supabase
        .from("bank_accounts")
        .select(
          "id, account_number, account_type, balance, is_active, user_id"
        );

      if (error) {
        throw new Error(`Erro ao buscar contas do usuário: ${error.message}`);
      }

      // Converter para o formato esperado, tratando valores null
      return (accounts || []).map((account) => ({
        id: account.id,
        account_number: account.account_number,
        account_type: account.account_type || "corrente",
        balance: account.balance || 0,
        is_active: account.is_active ?? true,
        user_id: account.user_id,
      }));
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 2 * 60 * 1000, // Refetch a cada 2 minutos
  });
}

// Hook combinado para o dashboard com todos os dados
export function useDashboardData() {
  const monthlyBalance = useMonthlyBalanceData();
  const expensesByCategory = useExpensesByCategory();
  const userAccounts = useUserAccounts();

  return {
    // Dados da evolução financeira
    monthlyBalanceData: monthlyBalance.data ?? [],
    isLoadingMonthlyBalance: monthlyBalance.isLoading,
    monthlyBalanceError: monthlyBalance.error,

    // Dados de gastos por categoria
    expensesCategoryData: expensesByCategory.data ?? [],
    isLoadingExpenses: expensesByCategory.isLoading,
    expensesError: expensesByCategory.error,

    // Dados das contas do usuário
    userAccountsData: userAccounts.data ?? [],
    isLoadingAccounts: userAccounts.isLoading,
    accountsError: userAccounts.error,

    // Estados gerais
    isLoading:
      monthlyBalance.isLoading ||
      expensesByCategory.isLoading ||
      userAccounts.isLoading,
    hasError:
      monthlyBalance.error || expensesByCategory.error || userAccounts.error,

    // Funções de refetch
    refetchAll: () => {
      monthlyBalance.refetch();
      expensesByCategory.refetch();
      userAccounts.refetch();
    },
  };
}
