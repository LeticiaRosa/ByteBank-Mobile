import { useState, useMemo } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from "react-native";
import { useTransactions } from "../../../hooks/useTransactions";
import { useFilteredTransactions } from "../../../hooks/useFilteredTransactions";
import { useAuth } from "../../../hooks/useAuth";
import { useTheme } from "../../../hooks/useTheme";
import { getTheme } from "../../../styles/theme";
// Importação de tipos
import type { Transaction, PaginationOptions } from "../../../lib/transactions";
import {
  TransactionItem,
  ExtractFilters,
  type FilterOptions,
} from "./components";
import { SimplePagination } from "./components/SimplePagination";

const PAGE_SIZE = 10;

export function ExtractPage() {
  const { deleteTransaction } = useTransactions();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState<FilterOptions>({
    dateFrom: "",
    dateTo: "",
    transactionType: "all",
    status: "all",
    minAmount: "",
    maxAmount: "",
    description: "",
    category: "all",
    senderName: "",
  });

  // Configurar paginação
  const paginationOptions: PaginationOptions = {
    page: currentPage,
    pageSize: PAGE_SIZE,
  };

  // Verificar se há filtros ativos (não são valores padrão)
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === "transactionType" || key === "status" || key === "category") {
        return value !== "all";
      }
      return value !== "" && value.trim() !== "";
    });
  }, [filters]);

  // Usar transações filtradas quando há filtros ativos, senão usar todas as transações
  const {
    data: filteredResult,
    isLoading: isLoadingFiltered,
    error: errorFiltered,
  } = useFilteredTransactions(
    filters,
    user?.id || "",
    paginationOptions,
    hasActiveFilters && !!user?.id
  );

  // Fallback para todas as transações quando não há filtros
  const { transactions: allTransactions, isLoadingTransactions } =
    useTransactions();

  // Determinar qual resultado usar
  const result = useMemo(() => {
    if (hasActiveFilters && filteredResult) {
      return filteredResult;
    }

    // Para transações sem filtro, aplicar paginação manual
    if (allTransactions) {
      const startIndex = (currentPage - 1) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      const paginatedData = allTransactions.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        pagination: {
          page: currentPage,
          pageSize: PAGE_SIZE,
          total: allTransactions.length,
          from: startIndex,
          to: Math.min(endIndex - 1, allTransactions.length - 1),
          hasNextPage: endIndex < allTransactions.length,
          hasPreviousPage: currentPage > 1,
        },
      };
    }

    return null;
  }, [hasActiveFilters, filteredResult, allTransactions, currentPage]);

  // Determinar estado de loading
  const isLoading = hasActiveFilters
    ? isLoadingFiltered
    : isLoadingTransactions;

  /*Os valores já estão em reais vindos do serviço*/
  const filteredTransactions = result?.data || [];

  // Funções de callback para o menu de ações
  const handleEditTransaction = async (transaction: Transaction) => {
    // Implementar notificação toast no React Native
    console.log("Editar transação", transaction.id.slice(-8));
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await deleteTransaction(transactionId);
      // Implementar notificação toast no React Native
      console.log("Transação excluída com sucesso");
    } catch (error) {
      // Implementar notificação toast no React Native
      console.error("Não foi possível excluir a transação", error);
    }
  };

  const handleProcessTransaction = async (
    transactionId: string,
    action: "complete" | "fail"
  ) => {
    try {
      // Função processTransaction removida pois não existe no hook
      // Exibimos apenas log para simular a ação
      console.log(
        `Transação ${transactionId} ${
          action === "complete" ? "concluída" : "marcada como falha"
        } com sucesso`
      );
    } catch (error) {
      // Implementar notificação toast no React Native
      console.error("Não foi possível processar a transação", error);
    }
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset para primeira página quando filtros mudam
  };

  const handleResetFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      transactionType: "all",
      status: "all",
      minAmount: "",
      maxAmount: "",
      description: "",
      category: "all",
      senderName: "",
    });
    setCurrentPage(1); // Reset para primeira página
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // A função exportToCSV foi removida pois não é compatível com React Native
  // Para implementar exportação no React Native, seria necessário usar bibliotecas específicas

  const renderHeader = () => (
    <View>
      <Text style={dynamicStyles.headerTitle}>Extrato</Text>
      <Text style={dynamicStyles.headerSubtitle}>
        Acompanhe todas as suas transações financeiras
      </Text>
    </View>
  );

  const renderCardHeader = () => (
    <View style={dynamicStyles.cardHeader}>
      <View style={dynamicStyles.cardTitleContainer}>
        <Text style={dynamicStyles.cardTitle}>Transações</Text>
        {!isLoading && result?.pagination && (
          <Text style={dynamicStyles.cardSubtitle}>
            ({result.pagination.total || filteredTransactions.length}{" "}
            {(result.pagination.total || filteredTransactions.length) === 1
              ? "item"
              : "itens"}
            {result.pagination.total && result.pagination.total > PAGE_SIZE && (
              <>
                {" • Página " +
                  currentPage +
                  " de " +
                  Math.ceil(result.pagination.total / PAGE_SIZE)}
              </>
            )}
            )
          </Text>
        )}
      </View>
    </View>
  );

  const renderLoading = () => {
    const theme = getTheme(isDark);
    return (
      <View style={dynamicStyles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={dynamicStyles.loadingText}>Carregando transações...</Text>
      </View>
    );
  };

  const renderError = () => (
    <View style={dynamicStyles.emptyContainer}>
      <Text style={dynamicStyles.emptyTitle}>Erro ao carregar transações</Text>
      <Text style={dynamicStyles.emptyText}>
        Ocorreu um erro ao buscar as transações. Tente novamente.
      </Text>
    </View>
  );

  const renderEmptyList = () => (
    <View style={dynamicStyles.emptyContainer}>
      {/* Ícone não disponível no React Native padrão, pode ser substituído */}
      <Text style={dynamicStyles.emptyTitle}>Nenhuma transação encontrada</Text>
      <Text style={dynamicStyles.emptyText}>
        {Object.values(filters).some((filter) => filter !== "")
          ? "Tente ajustar os filtros para encontrar mais transações."
          : "Suas transações aparecerão aqui quando você começar a usar sua conta."}
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={dynamicStyles.transactionItemContainer}>
      <TransactionItem
        transaction={item}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
        onProcess={handleProcessTransaction}
      />
    </View>
  );

  // Criar estilos dinâmicos baseados no tema
  const dynamicStyles = createStyles(isDark);

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      {renderHeader()}
      {/* Filtros */}
      <ExtractFilters
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Lista de transações */}
      <View style={dynamicStyles.card}>
        {renderCardHeader()}

        <View style={dynamicStyles.cardContent}>
          {isLoading ? (
            renderLoading()
          ) : errorFiltered && hasActiveFilters ? (
            renderError()
          ) : filteredTransactions.length === 0 ? (
            renderEmptyList()
          ) : (
            <FlatList
              data={filteredTransactions}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={dynamicStyles.listContent}
              showsVerticalScrollIndicator={true}
              ItemSeparatorComponent={() => (
                <View style={dynamicStyles.separator} />
              )}
            />
          )}

          {/* Paginação */}
          {!isLoading &&
            filteredTransactions.length > 0 &&
            result?.pagination && (
              <SimplePagination
                currentPage={currentPage}
                hasNextPage={result.pagination.hasNextPage}
                hasPreviousPage={result.pagination.hasPreviousPage}
                onPageChange={handlePageChange}
                itemCount={filteredTransactions.length}
                totalCount={result.pagination.total || 0}
              />
            )}
        </View>
      </View>
    </View>
  );
}

// Função para criar estilos dinâmicos baseados no tema
const createStyles = (isDark: boolean) => {
  const theme = getTheme(isDark);

  const backgroundColor = theme.background;
  const cardBackground = theme.card;
  const textPrimary = theme.foreground;
  const textSecondary = theme.mutedForeground;
  const borderColor = theme.border;

  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor,
      gap: 16,
    },
    header: {
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: textPrimary,
    },
    headerSubtitle: {
      fontSize: 14,
      color: textSecondary,
    },
    statisticsScrollview: {
      flexGrow: 0,
      marginBottom: 16,
    },
    statisticsContainer: {
      flexDirection: "row",
      gap: 12,
      paddingRight: 16,
    },
    card: {
      backgroundColor: cardBackground,
      borderRadius: 8,
      shadowColor: isDark ? "#000" : "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 3,
      elevation: 3,
      marginBottom: 16,
      flex: 1,
    },
    cardHeader: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
    },
    cardTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: textPrimary,
    },
    cardSubtitle: {
      marginLeft: 8,
      fontSize: 14,
      color: textSecondary,
      fontWeight: "normal",
    },
    cardContent: {
      flex: 1,
    },
    loadingContainer: {
      padding: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      marginTop: 16,
      color: textSecondary,
    },
    emptyContainer: {
      padding: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: textPrimary,
      marginBottom: 8,
    },
    emptyText: {
      color: textSecondary,
      textAlign: "center",
    },
    listContent: {
      paddingVertical: 8,
    },
    transactionItemContainer: {
      padding: 8,
    },
    separator: {
      height: 1,
      backgroundColor: borderColor,
    },
  });
};
