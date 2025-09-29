import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../../../hooks/useTheme";
import { getTheme, getColorScale } from "../../../../styles/theme";

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
  const { isDark } = useTheme();
  const dynamicStyles = createStyles(isDark);

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.paginationText}>
        Mostrando {Math.min(1 + (currentPage - 1) * itemCount, totalCount)} -{" "}
        {Math.min(currentPage * itemCount, totalCount)} de {totalCount}{" "}
        resultados
      </Text>

      <View style={dynamicStyles.buttonsContainer}>
        <TouchableOpacity
          style={[
            dynamicStyles.button,
            !hasPreviousPage && dynamicStyles.disabledButton,
          ]}
          onPress={() => hasPreviousPage && onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
        >
          <Text
            style={[
              dynamicStyles.buttonText,
              !hasPreviousPage && dynamicStyles.disabledText,
            ]}
          >
            Anterior
          </Text>
        </TouchableOpacity>

        <Text style={dynamicStyles.pageNumber}>Página {currentPage}</Text>

        <TouchableOpacity
          style={[
            dynamicStyles.button,
            !hasNextPage && dynamicStyles.disabledButton,
          ]}
          onPress={() => hasNextPage && onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
        >
          <Text
            style={[
              dynamicStyles.buttonText,
              !hasNextPage && dynamicStyles.disabledText,
            ]}
          >
            Próxima
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Função para criar estilos dinâmicos baseados no tema
const createStyles = (isDark: boolean) => {
  const theme = getTheme(isDark);
  const colorScale = getColorScale(isDark);

  const backgroundColor = theme.muted;
  const borderColor = theme.border;
  const buttonBackground = theme.card;
  const buttonBorderColor = colorScale.gray[7];
  const textPrimary = theme.foreground;
  const textSecondary = theme.mutedForeground;
  const textDisabled = colorScale.gray[10];

  return StyleSheet.create({
    container: {
      borderTopWidth: 1,
      borderTopColor: borderColor,
      backgroundColor,
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",
      borderRadius: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    paginationText: {
      fontSize: 14,
      color: textSecondary,
      padding: 8,
    },
    buttonsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
      paddingBottom: 8,
    },
    button: {
      paddingHorizontal: 8,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: buttonBorderColor,
      borderRadius: 4,
      backgroundColor: buttonBackground,
    },
    disabledButton: {
      opacity: 0.5,
    },
    buttonText: {
      fontSize: 14,
      color: textPrimary,
    },
    disabledText: {
      color: textDisabled,
    },
    pageNumber: {
      fontSize: 14,
      paddingHorizontal: 8,
      color: textPrimary,
    },
  });
};
