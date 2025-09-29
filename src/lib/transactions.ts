import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { QUERY_KEYS, QUERY_CONFIG } from "./query-config";
import { MoneyUtils } from "../utils/money.utils";

// Utilitário para verificar conectividade
const checkConnectivity = async (): Promise<boolean> => {
  try {
    const response = await fetch(
      "https://hsaxnladdipftthqhing.supabase.co/rest/v1/",
      {
        method: "HEAD",
      }
    );
    return response.ok;
  } catch {
    return false;
  }
};

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
  receipt_file?: File | { uri: string; type: string; name: string }; // Arquivo de comprovante (opcional) - suporte React Native
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

    // Se houver um arquivo de comprovante, fazer upload (versão simplificada)
    let finalTransaction = transaction;
    if (receipt_file) {
      try {
        // Criar um Blob/File adequado para React Native
        let fileToUpload: File | Blob;
        let fileName: string;

        if ("uri" in receipt_file) {
          // React Native: converter URI para Blob
          const response = await fetch(receipt_file.uri);
          const blob = await response.blob();

          // Garantir que temos um tipo MIME válido
          let mimeType = receipt_file.type;
          if (!mimeType || mimeType === "application/octet-stream") {
            // Inferir tipo MIME pela extensão do arquivo
            const ext = receipt_file.name.split(".").pop()?.toLowerCase();
            switch (ext) {
              case "jpg":
              case "jpeg":
                mimeType = "image/jpeg";
                break;
              case "png":
                mimeType = "image/png";
                break;
              case "webp":
                mimeType = "image/webp";
                break;
              case "pdf":
                mimeType = "application/pdf";
                break;
              default:
                mimeType = "image/jpeg"; // fallback seguro
            }
          }

          fileToUpload = new File([blob], receipt_file.name, {
            type: mimeType,
          });
          fileName = `${user.id}/${transaction.id}-${receipt_file.name}`;

          console.log("📤 Upload Info:", {
            originalType: receipt_file.type,
            finalType: mimeType,
            fileName: fileName,
            blobSize: blob.size,
            blobType: blob.type,
          });
        } else {
          // Web: usar File diretamente
          fileToUpload = receipt_file;
          const fileExt = receipt_file.name.split(".").pop();
          fileName = `${user.id}/${transaction.id}.${fileExt}`;
        }

        // Testar conectividade básica primeiro
        console.log("🌐 Testando conectividade com Supabase...");
        const isConnected = await checkConnectivity();
        if (isConnected) {
          console.log("✅ Conectividade OK");
        } else {
          console.warn(
            "⚠️ Problema de conectividade detectado - upload pode falhar"
          );
        }

        // Tentar upload com retry em caso de falha de rede
        let uploadData, uploadError;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
          attempts++;
          console.log(`📤 Tentativa ${attempts}/${maxAttempts} de upload...`);
          console.log(
            `📊 Tamanho do arquivo: ${(fileToUpload.size / 1024).toFixed(1)}KB`
          );

          const startTime = Date.now();
          const result = await supabase.storage
            .from("byte-bank")
            .upload(fileName, fileToUpload);
          const endTime = Date.now();

          console.log(`⏱️ Tempo de tentativa: ${endTime - startTime}ms`);

          uploadData = result.data;
          uploadError = result.error;

          if (!uploadError) {
            break; // Sucesso!
          }

          console.log(`❌ Tentativa ${attempts} falhou:`, uploadError.message);

          // Se não é erro de rede, não tentar novamente
          if (
            !uploadError.message.includes("Network request failed") &&
            !uploadError.message.includes("fetch")
          ) {
            break;
          }

          // Aguardar antes da próxima tentativa
          if (attempts < maxAttempts) {
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * attempts)
            );
          }
        }

        if (uploadError) {
          console.error(
            "Erro no upload do comprovante após",
            attempts,
            "tentativas:",
            uploadError
          );
          console.warn(
            "⚠️ Transação criada sem comprovante devido a erro de upload"
          );

          // Orientações para o usuário
          console.log("💡 Dicas para resolver problemas de upload:");
          console.log("   • Verifique sua conexão com a internet");
          console.log("   • Tente novamente em alguns minutos");
          console.log("   • Use uma conexão Wi-Fi mais estável se possível");
          console.log(
            "   • A transação foi salva com sucesso, apenas o comprovante não foi anexado"
          );
        } else if (uploadData) {
          // Gerar URL pública para o comprovante
          const { data: publicUrl } = supabase.storage
            .from("byte-bank")
            .getPublicUrl(fileName);

          if (publicUrl) {
            // Atualizar a transação com a URL do comprovante
            const { data: updatedTransaction, error: updateError } =
              await supabase
                .from("transactions")
                .update({ receipt_url: publicUrl.publicUrl })
                .eq("id", transaction.id)
                .eq("user_id", user.id)
                .select("*")
                .single();

            if (!updateError && updatedTransaction) {
              finalTransaction = updatedTransaction;
            }
          }
        }
      } catch (uploadError) {
        console.error("Erro no processo de upload:", uploadError);
        // Não falhar a transação por erro no upload
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

    // Se há um arquivo de comprovante, fazer upload
    if (receipt_file) {
      try {
        // Criar um Blob/File adequado para React Native
        let fileToUpload: File | Blob;
        let fileName: string;

        if ("uri" in receipt_file) {
          // React Native: converter URI para Blob
          const response = await fetch(receipt_file.uri);
          const blob = await response.blob();

          // Garantir que temos um tipo MIME válido
          let mimeType = receipt_file.type;
          if (!mimeType || mimeType === "application/octet-stream") {
            // Inferir tipo MIME pela extensão do arquivo
            const ext = receipt_file.name.split(".").pop()?.toLowerCase();
            switch (ext) {
              case "jpg":
              case "jpeg":
                mimeType = "image/jpeg";
                break;
              case "png":
                mimeType = "image/png";
                break;
              case "webp":
                mimeType = "image/webp";
                break;
              case "pdf":
                mimeType = "application/pdf";
                break;
              default:
                mimeType = "image/jpeg"; // fallback seguro
            }
          }

          fileToUpload = new File([blob], receipt_file.name, {
            type: mimeType,
          });
          fileName = `${user.id}/${transactionId}-${receipt_file.name}`;

          console.log("📤 Upload Info (Update):", {
            originalType: receipt_file.type,
            finalType: mimeType,
            fileName: fileName,
            blobSize: blob.size,
            blobType: blob.type,
          });
        } else {
          // Web: usar File diretamente
          fileToUpload = receipt_file;
          const fileExt = receipt_file.name.split(".").pop();
          fileName = `${user.id}/${transactionId}.${fileExt}`;
        }

        // Tentar upload com retry em caso de falha de rede
        let uploadData, uploadError;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
          attempts++;
          console.log(
            `📤 Tentativa ${attempts}/${maxAttempts} de upload (update)...`
          );

          const result = await supabase.storage
            .from("byte-bank")
            .upload(fileName, fileToUpload, { upsert: true });

          uploadData = result.data;
          uploadError = result.error;

          if (!uploadError) {
            break; // Sucesso!
          }

          console.log(`❌ Tentativa ${attempts} falhou:`, uploadError.message);

          // Se não é erro de rede, não tentar novamente
          if (
            !uploadError.message.includes("Network request failed") &&
            !uploadError.message.includes("fetch")
          ) {
            break;
          }

          // Aguardar antes da próxima tentativa
          if (attempts < maxAttempts) {
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * attempts)
            );
          }
        }

        if (uploadError) {
          console.error(
            "Erro no upload do comprovante após",
            attempts,
            "tentativas:",
            uploadError
          );
          console.warn(
            "⚠️ Transação atualizada sem comprovante devido a erro de upload"
          );
        } else if (uploadData) {
          // Gerar URL pública para o comprovante
          const { data: publicUrl } = supabase.storage
            .from("byte-bank")
            .getPublicUrl(fileName);

          if (publicUrl) {
            // Atualizar a transação com a URL do comprovante
            const { data: updatedTransaction, error: updateError } =
              await supabase
                .from("transactions")
                .update({ receipt_url: publicUrl.publicUrl })
                .eq("id", transactionId)
                .eq("user_id", user.id)
                .select("*")
                .single();

            if (!updateError && updatedTransaction) {
              finalTransaction = updatedTransaction;
            }
          }
        }
      } catch (uploadError) {
        console.error("Erro no processo de upload:", uploadError);
        // Não falhar a atualização por erro no upload
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
