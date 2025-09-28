import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface SimplePaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  itemCount: number;
  totalCount: number;
}

export function SimplePagination({
  currentPage,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  itemCount,
  totalCount,
}: SimplePaginationProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.paginationText}>
        Mostrando {Math.min(1 + (currentPage - 1) * itemCount, totalCount)} -{" "}
        {Math.min(currentPage * itemCount, totalCount)} de {totalCount}{" "}
        resultados
      </Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, !hasPreviousPage && styles.disabledButton]}
          onPress={() => hasPreviousPage && onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
        >
          <Text
            style={[styles.buttonText, !hasPreviousPage && styles.disabledText]}
          >
            Anterior
          </Text>
        </TouchableOpacity>

        <Text style={styles.pageNumber}>Página {currentPage}</Text>

        <TouchableOpacity
          style={[styles.button, !hasNextPage && styles.disabledButton]}
          onPress={() => hasNextPage && onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
        >
          <Text
            style={[styles.buttonText, !hasNextPage && styles.disabledText]}
          >
            Próxima
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  paginationText: {
    fontSize: 14,
    color: "#6b7280",
    padding: 8,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // flex: 1,
    gap: 8,
    paddingBottom: 8,
  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
    backgroundColor: "white",
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    color: "#374151",
  },
  disabledText: {
    color: "#9ca3af",
  },
  pageNumber: {
    fontSize: 14,
    paddingHorizontal: 8,
    color: "#374151",
  },
});
