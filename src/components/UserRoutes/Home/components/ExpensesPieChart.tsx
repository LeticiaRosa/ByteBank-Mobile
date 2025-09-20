import { View, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { CustomText } from "../../../ui/Text";
import { useTheme } from "../../../../hooks/useTheme";
import { getTheme, getChartPieColors } from "../../../../styles/theme";
import { useExpensesByCategory } from "../../../../hooks/useDashboardsCharts";

const screenWidth = Dimensions.get("window").width;

export function ExpensesPieChart() {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  const chartColors = getChartPieColors(isDark);
  const { data: expensesData, isLoading, error } = useExpensesByCategory();

  // Preparar dados para o gráfico de pizza
  const chartData = expensesData?.length
    ? expensesData.map((expense, index) => {
        const valueInReais = expense.value / 100; // Converter centavos para reais
        return {
          name: `${expense.label}\nR$ ${valueInReais.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          population: valueInReais,
          color: chartColors[index % chartColors.length],
          legendFontColor: theme.foreground,
          legendFontSize: 12,
        };
      })
    : [];

  const chartConfig = {
    color: (opacity = 1) => theme.foreground,
    labelColor: (opacity = 1) => theme.foreground,
    style: {
      borderRadius: 12,
    },
  };

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      <CustomText className="text-lg font-semibold text-card-foreground mb-4">
        Gastos por Categoria
      </CustomText>

      {isLoading ? (
        <CustomText className="text-muted-foreground text-center py-8">
          Carregando dados...
        </CustomText>
      ) : error ? (
        <CustomText className="text-red-500 text-center py-8">
          Erro ao carregar dados
        </CustomText>
      ) : chartData.length === 0 ? (
        <CustomText className="text-muted-foreground text-center py-8">
          Nenhum gasto encontrado
        </CustomText>
      ) : (
        <PieChart
          data={chartData}
          width={screenWidth - 64}
          height={180}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="0"
          absolute={false} // Mostra valores absolutos ao invés de percentuais
        />
      )}
    </View>
  );
}
