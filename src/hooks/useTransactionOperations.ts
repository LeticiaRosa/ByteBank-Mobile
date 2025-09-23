import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  transactionService,
  type Transaction,
  type CreateTransactionData,
} from "../lib/transactions";
import { QUERY_KEYS, QUERY_CONFIG } from "../lib/query-config";

/**
 * Hook para listar transações do usuário
 */
export function useTransactionsList() {
  return useQuery({
    queryKey: QUERY_KEYS.transactions.list(),
    queryFn: () => transactionService.getTransactions(),
    ...QUERY_CONFIG.transactions,
  });
}

/**
 * Hook para buscar uma transação específica
 */
export function useTransaction(id?: string) {
  // const toast = useToast()

  return useQuery({
    queryKey: QUERY_KEYS.transactions.detail(id || ""),
    queryFn: () => transactionService.getTransaction(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos para transações específicas
    retry: (failureCount, error) => {
      if (error.message.includes("Token de autenticação")) {
        // toast.error('Sessão expirada', {
        //   description: 'Faça login novamente para continuar.',
        // })
        console.error("Sessão expirada: Faça login novamente para continuar.");
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
  // const toast = useToast()

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

      // Mostra toast de sucesso
      // toast.success('Transação criada com sucesso!', {
      //   description: `Transação de ${newTransaction.transaction_type} no valor de ${newTransaction.amount.toLocaleString(
      //     'pt-BR',
      //     {
      //       style: 'currency',
      //       currency: 'BRL',
      //     },
      //   )}`,
      //   duration: 3000,
      // })
      console.log(
        "Transação criada com sucesso!",
        `Transação de ${
          newTransaction.transaction_type
        } no valor de ${newTransaction.amount.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}`
      );
      // Força o refetch IMEDIATO e FORÇADO das contas bancárias para atualizar saldos
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: QUERY_KEYS.bankAccounts.all,
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
      console.error("Erro ao criar transação:", error);

      // Toast de erro mais específico
      if (error.message.includes("Token de autenticação")) {
        // toast.error('Sessão expirada', {
        //   description: 'Faça login novamente para continuar.',
        //   duration: 5000,
        // })
        console.error("Sessão expirada: Faça login novamente para continuar.");
      } else {
        // toast.error('Erro ao criar transação', {
        //   description: error.message || 'Tente novamente em alguns instantes.',
        //   duration: 5000,
        // })
        console.error(
          "Erro ao criar transação:",
          error.message || "Tente novamente em alguns instantes."
        );
      }
    },
  });
}

/**
 * Hook para atualizar transações
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  // const toast = useToast()

  return useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: Partial<CreateTransactionData>;
    }) => transactionService.updateTransaction(transactionId, data),

    onSuccess: (updatedTransaction: Transaction) => {
      // toast.success('Transação atualizada', {
      //   description: 'A transação foi atualizada com sucesso.',
      //   duration: 3000,
      // })
      console.log("Transação atualizada");
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
      console.error("Erro ao atualizar transação:", error);

      // Toast de erro mais específico
      if (error.message.includes("Token de autenticação")) {
        // toast.error('Sessão expirada', {
        //   description: 'Faça login novamente para continuar.',
        //   duration: 5000,
        // })
        console.error("Sessão expirada: Faça login novamente para continuar.");
      } else {
        // toast.error('Erro ao atualizar transação', {
        //   description: error.message || 'Tente novamente em alguns instantes.',
        //   duration: 5000,
        // })
        console.error(
          "Erro ao atualizar transação:",
          error.message || "Tente novamente em alguns instantes."
        );
      }
    },
  });
}

/**
 * Hook para excluir transações
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  // const toast = useToast()

  return useMutation({
    mutationFn: (transactionId: string) =>
      transactionService.deleteTransaction(transactionId),

    onSuccess: (_, transactionId) => {
      // toast.success('Transação excluída', {
      //   description: 'A transação foi excluída com sucesso.',
      //   duration: 3000,
      // })
      console.log("Transação excluída com sucesso");

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
      console.error("Erro ao excluir transação:", error);

      // Toast de erro mais específico
      if (error.message.includes("Token de autenticação")) {
        // toast.error('Sessão expirada', {
        //   description: 'Faça login novamente para continuar.',
        //   duration: 5000,
        // })
        console.error("Sessão expirada: Faça login novamente para continuar.");
      } else {
        // toast.error('Erro ao excluir transação', {
        //   description: error.message || 'Tente novamente em alguns instantes.',
        //   duration: 5000,
        // })
        console.log(
          "Erro ao excluir transação:",
          error.message || "Tente novamente em alguns instantes."
        );
      }
    },
  });
}

export type { Transaction, CreateTransactionData };
