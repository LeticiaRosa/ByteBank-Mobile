import {
  useBankAccounts,
  usePrimaryBankAccount,
  type BankAccount,
} from "./useBankAccounts";
import {
  CreateTransactionData,
  Transaction,
  useCreateTransaction,
  useDeleteTransaction,
  useTransactionsList,
  useUpdateTransaction,
  useTransaction as useTransactionDetail,
} from "./useTransactionOperations";

// Re-export tipos
export type { TransactionCategory } from "../lib/transactions";

// Interface do hook principal - combinando responsabilidades relacionadas
export interface UseTransactionsReturn {
  // Dados de transações
  transactions: Transaction[] | undefined;
  isLoadingTransactions: boolean;
  transactionsError: Error | null;

  // Dados de contas bancárias
  bankAccounts: BankAccount[] | undefined;
  primaryAccount: BankAccount | null | undefined;
  isLoadingAccounts: boolean;
  accountsError: Error | null;

  // Estados de criação
  isCreating: boolean;
  createTransactionError: Error | null;

  // Estados de edição
  isUpdating: boolean;
  updateTransactionError: Error | null;

  // Estados de exclusão
  isDeleting: boolean;
  deleteTransactionError: Error | null;

  // Ações
  createTransaction: (data: CreateTransactionData) => Promise<Transaction>;
  updateTransaction: (
    transactionId: string,
    data: Partial<CreateTransactionData>
  ) => Promise<Transaction>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  refreshTransactions: () => void;
  refreshBankAccounts: () => void;

  // Função helper para transação específica
  getTransaction: (id: string) => {
    transaction: Transaction | undefined;
    isLoading: boolean;
    error: Error | null;
  };
}

/**
 * Hook principal que combina todas as funcionalidades relacionadas a transações
 * Mantém compatibilidade com a API anterior enquanto usa os hooks especializados
 */
export function useTransactions(): UseTransactionsReturn {
  // Hooks especializados para transações
  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    error: transactionsError,
    refetch: refreshTransactions,
  } = useTransactionsList();

  // Hooks especializados para contas bancárias
  const {
    data: bankAccounts,
    isLoading: isLoadingAccounts,
    error: accountsError,
    refetch: refreshBankAccounts,
  } = useBankAccounts();

  const { data: primaryAccount } = usePrimaryBankAccount();

  // Hook de criação de transação
  const {
    mutateAsync: createTransactionMutation,
    isPending: isCreating,
    error: createTransactionError,
  } = useCreateTransaction();

  // Hook de atualização de transação
  const {
    mutateAsync: updateTransactionMutation,
    isPending: isUpdating,
    error: updateTransactionError,
  } = useUpdateTransaction();

  // Hook de exclusão de transação
  const {
    mutateAsync: deleteTransactionMutation,
    isPending: isDeleting,
    error: deleteTransactionError,
  } = useDeleteTransaction();

  // Função para atualizar uma transação específica
  const updateTransaction = async (
    transactionId: string,
    data: Partial<CreateTransactionData>
  ) => {
    return await updateTransactionMutation({ transactionId, data });
  };

  // Função para excluir uma transação específica
  const deleteTransaction = async (transactionId: string) => {
    return await deleteTransactionMutation(transactionId);
  };

  // Função helper para obter transação específica usando cache inteligente
  const getTransaction = (id: string) => {
    // Primeiro verifica se a transação já está na lista em cache
    const cachedTransaction = transactions?.find(
      (t: Transaction) => t.id === id
    );

    if (cachedTransaction) {
      return {
        transaction: cachedTransaction,
        isLoading: false,
        error: null,
      };
    }

    // Se não estiver no cache, usa o hook específico
    const { data: transaction, isLoading, error } = useTransactionDetail(id);

    return {
      transaction,
      isLoading,
      error: error as Error | null,
    };
  };

  return {
    // Dados de transações
    transactions,
    isLoadingTransactions,
    transactionsError: transactionsError as Error | null,

    // Dados de contas bancárias
    bankAccounts,
    primaryAccount,
    isLoadingAccounts,
    accountsError: accountsError as Error | null,

    // Estados de criação
    isCreating,
    createTransactionError: createTransactionError as Error | null,

    // Estados de edição
    isUpdating,
    updateTransactionError: updateTransactionError as Error | null,

    // Estados de exclusão
    isDeleting,
    deleteTransactionError: deleteTransactionError as Error | null,

    // Ações
    createTransaction: createTransactionMutation,
    updateTransaction,
    deleteTransaction,
    refreshTransactions,
    refreshBankAccounts,

    // Helper
    getTransaction,
  };
}

// Hook específico para uma transação - agora usa o hook especializado
export function useTransaction(id: string) {
  return useTransactionDetail(id);
}

// Hook específico para uma transação - agora usa o hook especializado
export function useAllTransactions() {
  return useTransactions();
}

// Exports de tipos para compatibilidade
export type { Transaction, CreateTransactionData, BankAccount };
