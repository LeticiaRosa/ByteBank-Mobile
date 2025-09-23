import { useMemo } from "react";
import { useTransactions } from "./useTransactions";

export interface MonthlyFinancialSummary {
  monthlyRevenue: number;
  monthlyExpenses: number;
  revenueGrowth: string;
  expensesGrowth: string;
  isLoading: boolean;
}

/**
 * Hook para calcular receitas e gastos do mês atual
 * baseado nas transações do usuário
 */
export function useMonthlyFinancialSummary(): MonthlyFinancialSummary {
  const { transactions, isLoadingTransactions } = useTransactions();

  const summary = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        monthlyRevenue: 0,
        monthlyExpenses: 0,
        revenueGrowth: "+0%",
        expensesGrowth: "+0%",
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Filtrar transações do mês atual
    const currentMonthTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.created_at);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear &&
        transaction.status === "completed"
      );
    });

    // Filtrar transações do mês anterior para calcular crescimento
    const previousMonthTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.created_at);
      return (
        transactionDate.getMonth() === previousMonth &&
        transactionDate.getFullYear() === previousYear &&
        transaction.status === "completed"
      );
    });

    // Calcular receitas do mês atual (depósitos e transferências recebidas)
    const currentMonthRevenue = currentMonthTransactions.reduce(
      (total, transaction) => {
        // Considera como receita: depósitos
        if (transaction.transaction_type === "deposit") {
          return total + transaction.amount;
        }
        return total;
      },
      0
    );

    // Calcular gastos do mês atual (saques, pagamentos, taxas e transferências enviadas)
    const currentMonthExpenses = currentMonthTransactions.reduce(
      (total, transaction) => {
        // Considera como gasto: saques, pagamentos, taxas, transferências
        if (
          transaction.transaction_type === "withdrawal" ||
          transaction.transaction_type === "payment" ||
          transaction.transaction_type === "fee" ||
          transaction.transaction_type === "transfer"
        ) {
          return total + transaction.amount;
        }
        return total;
      },
      0
    );

    // Calcular receitas do mês anterior
    const previousMonthRevenue = previousMonthTransactions.reduce(
      (total, transaction) => {
        if (transaction.transaction_type === "deposit") {
          return total + transaction.amount;
        }
        return total;
      },
      0
    );

    // Calcular gastos do mês anterior
    const previousMonthExpenses = previousMonthTransactions.reduce(
      (total, transaction) => {
        if (
          transaction.transaction_type === "withdrawal" ||
          transaction.transaction_type === "payment" ||
          transaction.transaction_type === "fee" ||
          transaction.transaction_type === "transfer"
        ) {
          return total + transaction.amount;
        }
        return total;
      },
      0
    );

    // Calcular crescimento das receitas
    const revenueGrowthPercent =
      previousMonthRevenue > 0
        ? ((currentMonthRevenue - previousMonthRevenue) /
            previousMonthRevenue) *
          100
        : currentMonthRevenue > 0
        ? 100
        : 0;

    // Calcular crescimento dos gastos (para gastos, crescimento negativo é bom)
    const expensesGrowthPercent =
      previousMonthExpenses > 0
        ? ((currentMonthExpenses - previousMonthExpenses) /
            previousMonthExpenses) *
          100
        : currentMonthExpenses > 0
        ? 100
        : 0;

    const formatGrowth = (percent: number): string => {
      const sign = percent >= 0 ? "+" : "";
      return `${sign}${percent.toFixed(1)}%`;
    };

    return {
      monthlyRevenue: currentMonthRevenue,
      monthlyExpenses: currentMonthExpenses,
      revenueGrowth: formatGrowth(revenueGrowthPercent),
      expensesGrowth: formatGrowth(expensesGrowthPercent),
    };
  }, [transactions]);

  return {
    ...summary,
    isLoading: isLoadingTransactions,
  };
}
