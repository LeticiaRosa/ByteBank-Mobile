import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { QUERY_KEYS, QUERY_CONFIG } from "./query-config";
import { MoneyUtils } from "../utils/money.utils";
import { uploadReceiptRN, validateReceiptAsset } from "./file-upload-rn";
import * as ImagePicker from "expo-image-picker";

export interface FilterOptions {
  dateFrom: string;
  dateTo: string;
  transactionType: string;
  status: string;
  minAmount: string;
  maxAmount: string;
  description: string;
  category: string;
  senderName: string;
}

// Tipos de dados
export type TransactionCategory =
  | "alimentacao"
  | "transporte"
  | "saude"
  | "educacao"
  | "entretenimento"
  | "compras"
  | "casa"
  | "trabalho"
  | "investimentos"
  | "viagem"
  | "outros";

export interface Transaction {
  id: string;
  from_account_id?: string;
  to_account_id?: string;
  user_id: string;
  transaction_type: "deposit" | "withdrawal" | "transfer" | "payment" | "fee";
  amount: number; // Valor em reais (convertido de centavos)
  currency: string;
  description?: string;
  reference_number?: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  processed_at?: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
  category: TransactionCategory;
  sender_name?: string;
  receipt_url?: string; // URL do comprovante de pagamento
}

export interface CreateTransactionData {
  transaction_type: "deposit" | "withdrawal" | "transfer" | "payment" | "fee";
  amount: number; // Valor em reais (será convertido para centavos internamente)
  description: string;
  from_account_id: string;
  to_account_id?: string; // Opcional, apenas para transferências
  category: TransactionCategory;
  sender_name?: string; // Opcional, nome de quem enviou (para deposit)
  receipt_file?: ImagePicker.ImagePickerAsset; // Arquivo de comprovante - React Native Asset
}

export interface PaginationOptions {
  page?: number; // Página atual (começa em 1)
  pageSize?: number; // Tamanho da página
  from?: number; // Índice inicial (usado com to)
  to?: number; // Índice final (usado com from)
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total?: number;
    from: number;
    to: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Serviço de transações - responsabilidade única para operações de transação
export class TransactionService {
  /**
   * Lista transações do usuário autenticado com limitação
   * @returns Transações com valores convertidos para reais
   */
  public async getTransactions(): Promise<Transaction[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50); // Limitar a 50 transações recentes para performance

    if (error) {
      throw new Error(`Erro ao buscar transações: ${error.message}`);
    }

    // Converter valores de centavos para reais e garantir tipos corretos
    return (transactions || []).map((transaction) => {
      const result: Transaction = {
        id: transaction.id,
        user_id: transaction.user_id,
        transaction_type: (transaction.transaction_type ||
          "payment") as Transaction["transaction_type"],
        amount: MoneyUtils.centsToReais(transaction.amount || 0),
        currency: transaction.currency || "BRL",
        status: (transaction.status || "completed") as Transaction["status"],
        category: (transaction.category || "outros") as TransactionCategory,
        created_at: transaction.created_at || "",
        updated_at: transaction.updated_at || "",
      };

      // Adicionar campos opcionais se existirem
      if (transaction.from_account_id)
        result.from_account_id = transaction.from_account_id;
      if (transaction.to_account_id)
        result.to_account_id = transaction.to_account_id;
      if (transaction.description) result.description = transaction.description;
      if (transaction.reference_number)
        result.reference_number = transaction.reference_number;
      if (transaction.processed_at)
        result.processed_at = transaction.processed_at;
      if (transaction.metadata) result.metadata = transaction.metadata;
      if (transaction.sender_name) result.sender_name = transaction.sender_name;
      if (transaction.receipt_url) result.receipt_url = transaction.receipt_url;

      return result;
    });
  }

  /**
   * Busca uma transação específica por ID do usuário autenticado
   * @returns Transação com valor convertido para reais
   */
  public async getTransaction(id: string): Promise<Transaction> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .limit(1);

    if (error) {
      throw new Error(`Erro ao buscar transação: ${error.message}`);
    }

    if (!transactions || transactions.length === 0) {
      throw new Error("Transação não encontrada");
    }

    const transaction = transactions[0];

    // Converter valor de centavos para reais e garantir tipos corretos
    const result: Transaction = {
      id: transaction.id,
      user_id: transaction.user_id,
      transaction_type: (transaction.transaction_type ||
        "payment") as Transaction["transaction_type"],
      amount: MoneyUtils.centsToReais(transaction.amount || 0),
      currency: transaction.currency || "BRL",
      status: (transaction.status || "completed") as Transaction["status"],
      category: (transaction.category || "outros") as TransactionCategory,
      created_at: transaction.created_at || "",
      updated_at: transaction.updated_at || "",
    };

    // Adicionar campos opcionais se existirem
    if (transaction.from_account_id)
      result.from_account_id = transaction.from_account_id;
    if (transaction.to_account_id)
      result.to_account_id = transaction.to_account_id;
    if (transaction.description) result.description = transaction.description;
    if (transaction.reference_number)
      result.reference_number = transaction.reference_number;
    if (transaction.processed_at)
      result.processed_at = transaction.processed_at;
    if (transaction.metadata) result.metadata = transaction.metadata;
    if (transaction.sender_name) result.sender_name = transaction.sender_name;
    if (transaction.receipt_url) result.receipt_url = transaction.receipt_url;

    return result;
  }

  /**
   * Cria uma nova transação
   * @param data Dados da transação (amount deve ser em reais, será convertido para centavos)
   */
  public async createTransaction(
    data: CreateTransactionData
  ): Promise<Transaction> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    // Extrair arquivo de comprovante dos dados
    const { receipt_file, ...transactionPayload } = data;

    // Converter valor de reais para centavos antes de salvar
    const transactionData = {
      ...transactionPayload,
      amount: MoneyUtils.reaisToCents(data.amount), // Converter para centavos
      user_id: user.id,
      currency: "BRL",
      status: "completed" as const, // Transações são criadas como completed automaticamente
    };

    // Criar a transação
    const { data: transaction, error } = await supabase
      .from("transactions")
      .insert(transactionData)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Erro ao criar transação: ${error.message}`);
    }

    if (!transaction) {
      throw new Error("Erro ao criar transação: resposta vazia");
    }

    // Se houver um arquivo de comprovante, fazer upload usando a lógica da web
    let finalTransaction = transaction;
    if (receipt_file) {
      try {
        console.log(
          "📤 Iniciando upload do comprovante usando lógica da web..."
        );

        // Validar o arquivo antes do upload
        const validation = validateReceiptAsset(receipt_file);
        if (!validation.isValid) {
          console.warn("⚠️ Arquivo inválido:", validation.error);
          // Não falhar a transação, apenas prosseguir sem comprovante
        } else {
          // Usar a função de upload que segue a lógica da web
          const uploadResult = await uploadReceiptRN(
            receipt_file,
            transaction.id,
            user.id
          );

          if (uploadResult.error) {
            console.error("❌ Erro no upload:", uploadResult.error);
            // Lançar erro específico para ser capturado pelo frontend
            throw new Error(
              `Erro no upload do comprovante: ${uploadResult.error}`
            );
          } else if (uploadResult.url) {
            // Atualizar a transação com a URL do comprovante
            const { data: updatedTransaction, error: updateError } =
              await supabase
                .from("transactions")
                .update({ receipt_url: uploadResult.url })
                .eq("id", transaction.id)
                .eq("user_id", user.id)
                .select("*")
                .single();

            if (!updateError && updatedTransaction) {
              finalTransaction = updatedTransaction;
              console.log("✅ Comprovante anexado com sucesso!");
            } else {
              console.warn(
                "⚠️ Erro ao atualizar transação com URL do comprovante:",
                updateError?.message
              );
            }
          }
        }
      } catch (uploadError: any) {
        console.error("💥 Erro no processo de upload:", uploadError);
        // Re-lançar o erro para que seja tratado adequadamente no frontend
        throw uploadError;
      }
    }

    // Converter valor de volta para reais na resposta e garantir tipos corretos
    const result: Transaction = {
      id: finalTransaction.id,
      user_id: finalTransaction.user_id,
      transaction_type: (finalTransaction.transaction_type ||
        "payment") as Transaction["transaction_type"],
      amount: MoneyUtils.centsToReais(finalTransaction.amount || 0),
      currency: finalTransaction.currency || "BRL",
      status: (finalTransaction.status || "completed") as Transaction["status"],
      category: (finalTransaction.category || "outros") as TransactionCategory,
      created_at: finalTransaction.created_at || "",
      updated_at: finalTransaction.updated_at || "",
    };

    // Adicionar campos opcionais se existirem
    if (finalTransaction.from_account_id)
      result.from_account_id = finalTransaction.from_account_id;
    if (finalTransaction.to_account_id)
      result.to_account_id = finalTransaction.to_account_id;
    if (finalTransaction.description)
      result.description = finalTransaction.description;
    if (finalTransaction.reference_number)
      result.reference_number = finalTransaction.reference_number;
    if (finalTransaction.processed_at)
      result.processed_at = finalTransaction.processed_at;
    if (finalTransaction.metadata) result.metadata = finalTransaction.metadata;
    if (finalTransaction.sender_name)
      result.sender_name = finalTransaction.sender_name;
    if (finalTransaction.receipt_url)
      result.receipt_url = finalTransaction.receipt_url;

    return result;
  }

  /**
   * Edita uma transação existente
   * @param transactionId ID da transação a ser editada
   * @param data Dados atualizados da transação (amount deve ser em reais, será convertido para centavos)
   */
  public async updateTransaction(
    transactionId: string,
    data: Partial<CreateTransactionData>
  ): Promise<Transaction> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    // Extrair arquivo de comprovante dos dados
    const { receipt_file, ...transactionPayload } = data;

    // Preparar dados para atualização
    const updateData: any = { ...transactionPayload };

    // Converter valor para centavos se fornecido
    if (data.amount !== undefined) {
      updateData.amount = MoneyUtils.reaisToCents(data.amount);
    }

    // Atualizar a transação
    const { data: transaction, error } = await supabase
      .from("transactions")
      .update(updateData)
      .eq("id", transactionId)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar transação: ${error.message}`);
    }

    if (!transaction) {
      throw new Error("Transação não encontrada ou não pertence ao usuário");
    }

    let finalTransaction = transaction;

    // Se há um arquivo de comprovante, fazer upload usando uploadReceiptRN
    if (receipt_file) {
      try {
        console.log("📤 Iniciando upload do comprovante (update)...");

        // Validar o arquivo antes do upload
        const validation = validateReceiptAsset(receipt_file);
        if (!validation.isValid) {
          console.warn("⚠️ Arquivo inválido:", validation.error);
          // Não falhar a atualização, apenas prosseguir sem comprovante
        } else {
          // Usar a função de upload que segue a lógica da web
          const uploadResult = await uploadReceiptRN(
            receipt_file,
            transactionId,
            user.id
          );

          if (uploadResult.error) {
            console.error("❌ Erro no upload:", uploadResult.error);
            console.warn(
              "⚠️ Transação atualizada sem comprovante devido a erro de upload"
            );
          } else if (uploadResult.url) {
            // Atualizar a transação com a URL do comprovante
            const { data: updatedTransaction, error: updateError } =
              await supabase
                .from("transactions")
                .update({ receipt_url: uploadResult.url })
                .eq("id", transactionId)
                .eq("user_id", user.id)
                .select("*")
                .single();

            if (!updateError && updatedTransaction) {
              finalTransaction = updatedTransaction;
              console.log("✅ Comprovante anexado com sucesso na atualização!");
            } else {
              console.warn(
                "⚠️ Erro ao atualizar transação com URL do comprovante:",
                updateError?.message
              );
            }
          }
        }
      } catch (uploadError: any) {
        console.error("💥 Erro no processo de upload:", uploadError);
        // Não falhar a atualização por erro no upload
        console.warn(
          "⚠️ Transação atualizada sem comprovante devido a erro de upload"
        );
      }
    }

    // Converter valor de volta para reais na resposta e garantir tipos corretos
    const result: Transaction = {
      id: finalTransaction.id,
      user_id: finalTransaction.user_id,
      transaction_type: (finalTransaction.transaction_type ||
        "payment") as Transaction["transaction_type"],
      amount: MoneyUtils.centsToReais(finalTransaction.amount || 0),
      currency: finalTransaction.currency || "BRL",
      status: (finalTransaction.status || "completed") as Transaction["status"],
      category: (finalTransaction.category || "outros") as TransactionCategory,
      created_at: finalTransaction.created_at || "",
      updated_at: finalTransaction.updated_at || "",
    };

    // Adicionar campos opcionais se existirem
    if (finalTransaction.from_account_id)
      result.from_account_id = finalTransaction.from_account_id;
    if (finalTransaction.to_account_id)
      result.to_account_id = finalTransaction.to_account_id;
    if (finalTransaction.description)
      result.description = finalTransaction.description;
    if (finalTransaction.reference_number)
      result.reference_number = finalTransaction.reference_number;
    if (finalTransaction.processed_at)
      result.processed_at = finalTransaction.processed_at;
    if (finalTransaction.metadata) result.metadata = finalTransaction.metadata;
    if (finalTransaction.sender_name)
      result.sender_name = finalTransaction.sender_name;
    if (finalTransaction.receipt_url)
      result.receipt_url = finalTransaction.receipt_url;

    return result;
  }

  /**
   * Exclui uma transação
   * @param transactionId ID da transação a ser excluída
   */
  public async deleteTransaction(transactionId: string): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Verificar se a transação pertence ao usuário antes de excluir
      const { data: transaction, error: findError } = await supabase
        .from("transactions")
        .select("id")
        .eq("id", transactionId)
        .eq("user_id", user.id)
        .single();

      if (findError || !transaction) {
        throw new Error("Transação não encontrada ou não pertence ao usuário");
      }

      // Fazer a exclusão
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionId)
        .eq("user_id", user.id);

      if (error) {
        throw new Error(`Erro ao excluir transação: ${error.message}`);
      }
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      throw error;
    }
  }

  /**
   * Busca transações filtradas com paginação
   * @param filters Opções de filtro
   * @param pagination Opções de paginação
   * @returns Lista paginada de transações
   */
  public async getFilteredTransactions(
    filters: FilterOptions,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Transaction>> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    // Configuração padrão de paginação
    const defaultPageSize = 20;
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? defaultPageSize;

    // Calcular range baseado na página ou usar from/to fornecidos
    let from: number, to: number;
    if (pagination?.from !== undefined && pagination?.to !== undefined) {
      from = pagination.from;
      to = pagination.to;
    } else {
      from = (page - 1) * pageSize;
      to = from + pageSize - 1;
    }

    // Iniciar a query
    let query = supabase
      .from("transactions")
      .select("*", { count: "exact" })
      .eq("user_id", user.id);

    // Filtro por período
    if (filters.dateFrom && filters.dateTo) {
      query = query
        .gte("created_at", `${filters.dateFrom}T00:00:00.000Z`)
        .lte("created_at", `${filters.dateTo}T23:59:59.999Z`);
    } else if (filters.dateFrom) {
      query = query.gte("created_at", `${filters.dateFrom}T00:00:00.000Z`);
    } else if (filters.dateTo) {
      query = query.lte("created_at", `${filters.dateTo}T23:59:59.999Z`);
    }

    // Filtro por tipo de transação
    if (
      filters.transactionType &&
      filters.transactionType !== "all" &&
      filters.transactionType.trim() !== ""
    ) {
      query = query.eq(
        "transaction_type",
        filters.transactionType as Transaction["transaction_type"]
      );
    }

    // Filtro por status
    if (
      filters.status &&
      filters.status !== "all" &&
      filters.status.trim() !== ""
    ) {
      query = query.eq("status", filters.status as Transaction["status"]);
    }

    // Filtro por categoria
    if (
      filters.category &&
      filters.category !== "all" &&
      filters.category.trim() !== ""
    ) {
      query = query.eq("category", filters.category as TransactionCategory);
    }

    // Filtro por valor
    if (filters.minAmount && filters.minAmount.trim() !== "") {
      const minAmountCents = Math.round(parseFloat(filters.minAmount) * 100);
      query = query.gte("amount", minAmountCents);
    }

    if (filters.maxAmount && filters.maxAmount.trim() !== "") {
      const maxAmountCents = Math.round(parseFloat(filters.maxAmount) * 100);
      query = query.lte("amount", maxAmountCents);
    }

    // Filtro por descrição (busca textual case-insensitive)
    if (filters.description && filters.description.trim() !== "") {
      query = query.ilike("description", `%${filters.description}%`);
    }

    // Filtro por nome do remetente (busca textual case-insensitive)
    if (filters.senderName && filters.senderName.trim() !== "") {
      query = query.ilike("sender_name", `%${filters.senderName}%`);
    }

    // Aplicar paginação e ordenação
    query = query.order("created_at", { ascending: false }).range(from, to);

    // Executar a query
    const { data: transactions, error, count } = await query;

    if (error) {
      throw new Error(`Erro ao buscar transações filtradas: ${error.message}`);
    }

    // Converter valores e garantir tipos corretos
    const mappedTransactions: Transaction[] = (transactions || []).map(
      (transaction) => {
        const result: Transaction = {
          id: transaction.id,
          user_id: transaction.user_id,
          transaction_type: (transaction.transaction_type ||
            "payment") as Transaction["transaction_type"],
          amount: MoneyUtils.centsToReais(transaction.amount || 0),
          currency: transaction.currency || "BRL",
          status: (transaction.status || "completed") as Transaction["status"],
          category: (transaction.category || "outros") as TransactionCategory,
          created_at: transaction.created_at || "",
          updated_at: transaction.updated_at || "",
        };

        // Adicionar campos opcionais se existirem
        if (transaction.from_account_id)
          result.from_account_id = transaction.from_account_id;
        if (transaction.to_account_id)
          result.to_account_id = transaction.to_account_id;
        if (transaction.description)
          result.description = transaction.description;
        if (transaction.reference_number)
          result.reference_number = transaction.reference_number;
        if (transaction.processed_at)
          result.processed_at = transaction.processed_at;
        if (transaction.metadata) result.metadata = transaction.metadata;
        if (transaction.sender_name)
          result.sender_name = transaction.sender_name;
        if (transaction.receipt_url)
          result.receipt_url = transaction.receipt_url;

        return result;
      }
    );

    // Preparar resultado paginado
    const result: PaginatedResult<Transaction> = {
      data: mappedTransactions,
      pagination: {
        page,
        pageSize,
        total: count as number | undefined,
        from,
        to: Math.min(to, from + (transactions?.length ?? 0) - 1),
        hasNextPage: count
          ? to < count - 1
          : (transactions?.length ?? 0) === pageSize,
        hasPreviousPage: from > 0,
      },
    };

    return result;
  }
}

/**
 * Hook para listar todas as transações do usuário
 */
export function useTransactions() {
  return useQuery({
    queryKey: QUERY_KEYS.transactions.lists(),
    queryFn: () => transactionService.getTransactions(),
    ...QUERY_CONFIG.transactions,
  });
}

/**
 * Hook para obter uma transação específica por ID
 */
export function useTransaction(id?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.transactions.detail(id || ""),
    queryFn: () => transactionService.getTransaction(id!),
    enabled: !!id,
    ...QUERY_CONFIG.transactions,
  });
}

/**
 * Hook para buscar transações filtradas com paginação
 */
export function useFilteredTransactions(
  filters: FilterOptions,
  userId: string,
  pagination?: PaginationOptions,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: [
      ...QUERY_KEYS.transactions.filtered(),
      filters,
      userId,
      pagination,
    ],
    queryFn: () => getFilteredTransactions(filters, userId, pagination),
    enabled: enabled && !!userId,
    ...QUERY_CONFIG.transactions,
  });
}

/**
 * Hook para criar uma nova transação
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionData) =>
      transactionService.createTransaction(data),
    onSuccess: () => {
      // Invalidar queries para forçar a atualização da lista de transações
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.transactions.lists(),
      });
      // Invalidar também as listas filtradas
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.transactions.filtered(),
      });
    },
  });
}

/**
 * Hook para atualizar uma transação existente
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateTransactionData>;
    }) => transactionService.updateTransaction(id, data),
    onSuccess: (_, variables) => {
      // Invalidar queries para forçar a atualização da lista de transações
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.transactions.lists(),
      });
      // Invalidar a query da transação específica
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.transactions.detail(variables.id),
      });
      // Invalidar também as listas filtradas
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.transactions.filtered(),
      });
    },
  });
}

/**
 * Hook para excluir uma transação
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionService.deleteTransaction(id),
    onSuccess: () => {
      // Invalidar queries para forçar a atualização da lista de transações
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.transactions.lists(),
      });
      // Invalidar também as listas filtradas
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.transactions.filtered(),
      });
    },
  });
}

// queryTransactions removida - usar transactionService.getFilteredTransactions

export async function getFilteredTransactions(
  filters: FilterOptions,
  userId: string,
  pagination?: PaginationOptions
): Promise<PaginatedResult<Transaction>> {
  // Usar o transactionService diretamente
  return await transactionService.getFilteredTransactions(filters, pagination);
}

// Exports das instâncias dos serviços
export const transactionService = new TransactionService();

// APIs mantidas para compatibilidade (deprecated - usar os serviços diretamente)
export const transactionsApi = {
  getTransactions: () => transactionService.getTransactions(),
  createTransaction: (data: CreateTransactionData) =>
    transactionService.createTransaction(data),
  getTransaction: (id: string) => transactionService.getTransaction(id),
  updateTransaction: (id: string, data: Partial<CreateTransactionData>) =>
    transactionService.updateTransaction(id, data),
  deleteTransaction: (id: string) => transactionService.deleteTransaction(id),
};
