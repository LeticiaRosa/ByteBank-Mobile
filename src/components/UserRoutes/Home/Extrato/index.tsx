import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from "react-native";
import { useTransactions } from "../../../../hooks/useTransactions";
// Importação de tipos
import type { Transaction } from "../../../../lib/transactions";
import { AccountInfos } from "../components/AccountInfos";
import { SimplePagination } from "../components/SimplePagination";
import {
  ExtractFilters,
  FilterOptions,
  TransactionItem,
} from "../../Extrato/components";

const PAGE_SIZE = 10;

export function ExtractPage() {
  const { deleteTransaction } = useTransactions();

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

  // Usar transações diretamente do hook useTransactions
  const { transactions: allTransactions, isLoadingTransactions } =
    useTransactions();

  // Mock do resultado com paginação - pode ser implementado com um hook personalizado posteriormente
  const result = useMemo(() => {
    return {
      data: allTransactions || [],
      pagination: {
        page: currentPage,
        pageSize: PAGE_SIZE,
        total: allTransactions?.length || 0,
        hasNextPage: allTransactions
          ? currentPage * PAGE_SIZE < allTransactions.length
          : false,
        hasPreviousPage: currentPage > 1,
      },
    };
  }, [allTransactions, currentPage]);

  /*Corrigindo o valor de amount de centavos para reais*/
  const filteredTransactions = result?.data
    ? result.data.map((transaction: Transaction) => ({
        ...transaction,
        amount: transaction.amount / 100, // Convertendo de centavos para reais
      }))
    : [];

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

  // Calcular estatísticas do período filtrado
  const periodStats = useMemo(() => {
    const totalTransactions = filteredTransactions.length;
    const totalIncome = filteredTransactions
      .filter((t: Transaction) => t.transaction_type === "deposit")
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const totalExpenses = filteredTransactions
      .filter((t: Transaction) =>
        ["withdrawal", "payment", "fee", "transfer"].includes(
          t.transaction_type
        )
      )
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    return {
      totalTransactions,
      totalIncome,
      totalExpenses,
      balance,
    };
  }, [filteredTransactions]);

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
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Extrato</Text>
      <Text style={styles.headerSubtitle}>
        Acompanhe todas as suas transações financeiras
      </Text>
    </View>
  );

  const renderStatistics = () => (
    <View style={styles.statisticsContainer}>
      <AccountInfos
        title="Total de Transações"
        text="No período selecionado"
        isLoadingAccounts={isLoadingTransactions || !periodStats}
        amount={periodStats?.totalTransactions || 0}
        showeye={false}
        formatType="number"
      />

      <AccountInfos
        title="Receitas"
        text="No período selecionado"
        isLoadingAccounts={isLoadingTransactions || !periodStats}
        amount={periodStats?.totalIncome || 0}
        showeye={false}
        colorType="success"
      />

      <AccountInfos
        title="Gastos"
        text="No período selecionado"
        isLoadingAccounts={isLoadingTransactions || !periodStats}
        amount={periodStats?.totalExpenses || 0}
        showeye={false}
        colorType="destructive"
      />

      <AccountInfos
        title="Saldo do Período"
        text="Receitas - Gastos"
        isLoadingAccounts={isLoadingTransactions || !periodStats}
        amount={periodStats?.balance || 0}
        showeye={false}
        colorType={
          periodStats?.balance && periodStats.balance >= 0
            ? "success"
            : "destructive"
        }
      />
    </View>
  );

  const renderCardHeader = () => (
    <View style={styles.cardHeader}>
      <View style={styles.cardTitleContainer}>
        <Text style={styles.cardTitle}>Transações</Text>
        {!isLoadingTransactions && result?.pagination && (
          <Text style={styles.cardSubtitle}>
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

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={styles.loadingText}>Carregando transações...</Text>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {/* Ícone não disponível no React Native padrão, pode ser substituído */}
      <Text style={styles.emptyTitle}>Nenhuma transação encontrada</Text>
      <Text style={styles.emptyText}>
        {Object.values(filters).some((filter) => filter !== "")
          ? "Tente ajustar os filtros para encontrar mais transações."
          : "Suas transações aparecerão aqui quando você começar a usar sua conta."}
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItemContainer}>
      <TransactionItem
        transaction={item}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
        onProcess={handleProcessTransaction}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      {renderHeader()}

      {/* Estatísticas do período */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statisticsScrollview}
      >
        {renderStatistics()}
      </ScrollView>

      {/* Filtros */}
      <ExtractFilters
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Lista de transações */}
      <View style={styles.card}>
        {renderCardHeader()}

        <View style={styles.cardContent}>
          {isLoadingTransactions ? (
            renderLoading()
          ) : filteredTransactions.length === 0 ? (
            renderEmptyList()
          ) : (
            <FlatList
              data={filteredTransactions}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={true}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}

          {/* Paginação */}
          {!isLoadingTransactions &&
            filteredTransactions.length > 0 &&
            result?.pagination && (
              <SimplePagination
                currentPage={currentPage}
                hasNextPage={result.pagination.hasNextPage}
                hasPreviousPage={result.pagination.hasPreviousPage}
                onPageChange={handlePageChange}
                itemCount={filteredTransactions.length}
                totalCount={result.pagination.total}
              />
            )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
    gap: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
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
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 16,
    flex: 1,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  cardSubtitle: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6b7280",
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
    color: "#6b7280",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  emptyText: {
    color: "#6b7280",
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
    backgroundColor: "#e5e7eb",
  },
});
