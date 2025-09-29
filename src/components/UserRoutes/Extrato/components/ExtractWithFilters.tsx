import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from "react-native";
import { ExtractFilters, type FilterOptions } from "./ExtractFilters";
import { TransactionItem } from "./TransactionItem";
import { SimplePagination } from "./SimplePagination";
import type { Transaction } from "../../../../lib/transactions";
import { useTransactions } from "../../../../hooks/useTransactions";

interface ExtractWithFiltersProps {
  userId: string;
  pageSize?: number; // Tamanho da página (padrão: 20)
}

export function ExtractWithFilters({
  userId,
  pageSize = 20,
}: ExtractWithFiltersProps) {
  const [filters, setFilters] = React.useState<FilterOptions>({
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

  const [currentPage, setCurrentPage] = React.useState(1);

  // Definição da paginação usada no useEffect

  // Usando o hook de transações padrão - substitua pelo hook correto para filtrar transações quando disponível
  const {
    transactions: allTransactions,
    isLoadingTransactions: isLoading,
    transactionsError: error,
  } = useTransactions();

  // Simula o resultado filtrado até implementar o hook correto
  const result = React.useMemo(() => {
    // Aqui podemos aplicar os filtros localmente
    const filteredTransactions =
      allTransactions?.filter((transaction) => {
        // Filtro por data
        if (
          filters.dateFrom &&
          new Date(transaction.created_at) < new Date(filters.dateFrom)
        ) {
          return false;
        }
        if (
          filters.dateTo &&
          new Date(transaction.created_at) > new Date(filters.dateTo)
        ) {
          return false;
        }

        // Filtro por tipo de transação
        if (
          filters.transactionType !== "all" &&
          transaction.transaction_type !== filters.transactionType
        ) {
          return false;
        }

        // Filtro por status
        if (filters.status !== "all" && transaction.status !== filters.status) {
          return false;
        }

        // Filtro por valor mínimo
        if (
          filters.minAmount &&
          transaction.amount < parseFloat(filters.minAmount)
        ) {
          return false;
        }

        // Filtro por valor máximo
        if (
          filters.maxAmount &&
          transaction.amount > parseFloat(filters.maxAmount)
        ) {
          return false;
        }

        // Filtro por descrição
        if (
          filters.description &&
          !transaction.description
            ?.toLowerCase()
            .includes(filters.description.toLowerCase())
        ) {
          return false;
        }

        // Filtro por categoria
        if (
          filters.category !== "all" &&
          transaction.category !== filters.category
        ) {
          return false;
        }

        // Filtro por remetente
        if (
          filters.senderName &&
          !transaction.sender_name
            ?.toLowerCase()
            .includes(filters.senderName.toLowerCase())
        ) {
          return false;
        }

        return true;
      }) || [];

    // Paginação
    const paginationResult = {
      page: currentPage,
      pageSize,
      total: filteredTransactions.length,
      from: (currentPage - 1) * pageSize,
      to: Math.min(currentPage * pageSize, filteredTransactions.length) - 1,
      hasNextPage: currentPage * pageSize < filteredTransactions.length,
      hasPreviousPage: currentPage > 1,
    };

    // Aplicar paginação
    const paginatedTransactions = filteredTransactions.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );

    return {
      data: paginatedTransactions,
      pagination: paginationResult,
    };
  }, [allTransactions, currentPage, pageSize, filters]);

  const transactions = result?.data || [];
  const paginationInfo = result?.pagination;

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset para primeira página quando filtros mudam
  };

  const handleReset = () => {
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

  // Essa função é usada pelo componente TransactionItem

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Erro ao carregar transações</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
        </View>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Transaction }) => (
    <TransactionItem
      transaction={item}
      onEdit={(transaction) => {
        // Implementar função de edição
        console.log("Editar transação", transaction.id);
      }}
      onDelete={(transactionId) => {
        // Implementar função de exclusão
        console.log("Excluir transação", transactionId);
      }}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Transações</Text>
          {isLoading ? (
            <Text style={styles.subtitle}>Carregando...</Text>
          ) : (
            <Text style={styles.subtitle}>
              ({transactions.length} de {paginationInfo?.total || "muitas"}{" "}
              encontradas)
            </Text>
          )}
        </View>
        {paginationInfo && (
          <Text style={styles.pageInfo}>
            Página {paginationInfo.page} • {transactions.length} itens
          </Text>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        Nenhuma transação encontrada com os filtros aplicados.
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (
      !paginationInfo ||
      (!paginationInfo.hasNextPage && !paginationInfo.hasPreviousPage)
    ) {
      return null;
    }

    return (
      <SimplePagination
        currentPage={paginationInfo.page}
        hasNextPage={paginationInfo.hasNextPage}
        hasPreviousPage={paginationInfo.hasPreviousPage}
        onPageChange={setCurrentPage}
        itemCount={pageSize}
        totalCount={paginationInfo.total}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Filtros */}
      <ExtractFilters
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* Resultados */}
      <View style={styles.resultsContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Carregando transações...</Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#b91c1c",
    marginBottom: 4,
  },
  errorMessage: {
    color: "#dc2626",
  },
  resultsContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  headerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  pageInfo: {
    fontSize: 14,
    color: "#6b7280",
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#6b7280",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e7eb",
  },
});
