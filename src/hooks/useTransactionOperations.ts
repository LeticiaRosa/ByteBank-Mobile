import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  transactionService,
  type Transaction,
  type CreateTransactionData,
} from "../lib/transactions";
import { QUERY_KEYS, QUERY_CONFIG } from "../lib/query-config";
import { useToast } from "./useToast";

/**
 * Hook para listar transações do usuário
 */
export function useTransactionsList() {
  return useQuery({
    queryKey: QUERY_KEYS.transactions.list(),
    queryFn: () => transactionService.getTransactions(),
    ...QUERY_CONFIG.transactions,
    refetchInterval: 60000, // 1 minuto
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

/**
 * Hook para buscar uma transação específica
 */
export function useTransaction(id?: string) {
  const { authError } = useToast();

  return useQuery({
    queryKey: QUERY_KEYS.transactions.detail(id || ""),
    queryFn: () => transactionService.getTransaction(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos para transações específicas
    retry: (failureCount, error) => {
      if (error.message.includes("Token de autenticação")) {
        authError("Sessão expirada. Faça login novamente para continuar.");
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook para criar transações
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { showSuccess, showError, authError } = useToast();

  return useMutation({
    mutationFn: (data: CreateTransactionData) =>
      transactionService.createTransaction(data),

    onSuccess: async (newTransaction) => {
      // Atualiza a lista de transações no cache
      queryClient.setQueryData<Transaction[]>(
        QUERY_KEYS.transactions.list(),
        (oldData) => {
          if (!oldData) return [newTransaction];
          return [newTransaction, ...oldData];
        }
      );

      showSuccess({
        title: "Transação criada com sucesso!",
        message: `Transação de ${
          newTransaction.transaction_type
        } no valor de ${newTransaction.amount.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}`,
        duration: 2500,
      });
    },

    onError: (error: Error) => {
      // Toast de erro mais específico
      if (error.message.includes("Token de autenticação")) {
        authError("Sessão expirada. Faça login novamente para continuar.");
      } else {
        showError({
          title: "Erro ao criar transação",
          message: error.message || "Tente novamente em alguns instantes.",
          duration: 4000,
        });
      }
    },
  });
}

/**
 * Hook para atualizar transações
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const { showSuccess, showError, authError } = useToast();

  return useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: Partial<CreateTransactionData>;
    }) => transactionService.updateTransaction(transactionId, data),

    onSuccess: (updatedTransaction: Transaction) => {
      showSuccess({
        title: "Transação atualizada",
        message: "A transação foi atualizada com sucesso.",
        duration: 3000,
      });
      // Atualizar cache específico da transação
      queryClient.setQueryData(
        QUERY_KEYS.transactions.detail(updatedTransaction.id),
        updatedTransaction
      );

      // Atualizar lista de transações no cache
      queryClient.setQueryData(
        QUERY_KEYS.transactions.list(),
        (oldTransactions: Transaction[] | undefined) => {
          if (!oldTransactions) return [updatedTransaction];
          return oldTransactions.map((transaction) =>
            transaction.id === updatedTransaction.id
              ? updatedTransaction
              : transaction
          );
        }
      );

      // Refetch queries relacionadas para garantir dados atualizados
      Promise.all([
        queryClient.refetchQueries({
          queryKey: QUERY_KEYS.transactions.all,
          type: "active",
        }),
        queryClient.refetchQueries({
          queryKey: QUERY_KEYS.bankAccounts.lists(),
          type: "active",
        }),
        queryClient.refetchQueries({
          queryKey: QUERY_KEYS.bankAccounts.primary(),
          type: "active",
        }),
      ]);

      // Invalida queries relacionadas para garantir sincronização futura
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bankAccounts.all });
    },

    onError: (error: Error) => {
      // Toast de erro mais específico
      if (error.message.includes("Token de autenticação")) {
        authError("Sessão expirada. Faça login novamente para continuar.");
      } else {
        showError({
          title: "Erro ao atualizar transação",
          message: error.message || "Tente novamente em alguns instantes.",
          duration: 4000,
        });
      }
    },
  });
}

/**
 * Hook para excluir transações
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { showSuccess, showError, authError } = useToast();

  return useMutation({
    mutationFn: (transactionId: string) =>
      transactionService.deleteTransaction(transactionId),

    onSuccess: (_, transactionId) => {
      showSuccess({
        title: "Transação excluída",
        message: "A transação foi excluída com sucesso.",
        duration: 3000,
      });

      // Remover transação específica do cache
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.transactions.detail(transactionId),
      });

      // Atualizar lista de transações no cache removendo a transação
      queryClient.setQueryData(
        QUERY_KEYS.transactions.list(),
        (oldTransactions: Transaction[] | undefined) => {
          if (!oldTransactions) return [];
          return oldTransactions.filter(
            (transaction) => transaction.id !== transactionId
          );
        }
      );

      // Refetch queries relacionadas para garantir dados atualizados
      Promise.all([
        queryClient.refetchQueries({
          queryKey: QUERY_KEYS.transactions.all,
          type: "active",
        }),
        queryClient.refetchQueries({
          queryKey: QUERY_KEYS.bankAccounts.lists(),
          type: "active",
        }),
        queryClient.refetchQueries({
          queryKey: QUERY_KEYS.bankAccounts.primary(),
          type: "active",
        }),
      ]);

      // Invalida queries relacionadas para garantir sincronização futura
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bankAccounts.all });
    },

    onError: (error: Error) => {
      // Toast de erro mais específico
      if (error.message.includes("Token de autenticação")) {
        authError("Sessão expirada. Faça login novamente para continuar.");
      } else {
        showError({
          title: "Erro ao excluir transação",
          message: error.message || "Tente novamente em alguns instantes.",
          duration: 4000,
        });
      }
    },
  });
}

export type { Transaction, CreateTransactionData };
