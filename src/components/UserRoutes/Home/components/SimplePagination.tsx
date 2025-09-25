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
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  paginationText: {
    fontSize: 14,
    color: "#6b7280",
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  button: {
    paddingHorizontal: 12,
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
