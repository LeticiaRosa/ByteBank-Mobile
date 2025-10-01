import { View, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { CustomText } from "../../../ui/Text";
import { useTheme } from "../../../../hooks/useTheme";
import { getTheme, getChartPieColors } from "../../../../styles/theme";
import { useExpensesByCategory } from "../../../../hooks/useDashboardsCharts";
import { FadeInView } from "../../../ui/FadeInView";

const screenWidth = Dimensions.get("window").width;

export function ExpensesPieChart() {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  const chartColors = getChartPieColors(isDark);
  const {
    data: expensesData,
    isLoading,
    error,
  } = useExpensesByCategory() || {
    data: undefined,
    isLoading: true,
    error: null,
  };

  if (isLoading || !expensesData) {
    return null;
  }

  // Preparar dados para o gráfico de pizza (5 maiores categorias + outras)
  const chartData =
    expensesData && expensesData.length
      ? (() => {
          // Ordenar por valor (maior para menor)
          const sortedExpenses = [...expensesData].sort(
            (a, b) => b.value - a.value
          );

          // Pegar as 5 maiores categorias
          const top5Categories = sortedExpenses.slice(0, 5);

          // Calcular o valor das categorias restantes
          const otherCategoriesValue = sortedExpenses
            .slice(5)
            .reduce((sum, expense) => sum + expense.value, 0);

          // Criar dados do gráfico
          const chartItems = top5Categories.map((expense, index) => {
            const valueInReais = expense.value / 100;
            return {
              name: `${expense.label}`,
              population: valueInReais,
              color: chartColors[index % chartColors.length],
              legendFontColor: theme.foreground,
              legendFontSize: 12,
            };
          });

          // Adicionar categoria "Outras" se houver categorias restantes
          if (otherCategoriesValue > 0) {
            chartItems.push({
              name: "Outras",
              population: otherCategoriesValue / 100,
              color: chartColors[5 % chartColors.length],
              legendFontColor: theme.foreground,
              legendFontSize: 12,
            });
          }

          return chartItems;
        })()
      : [];

  const chartConfig = {
    color: (opacity = 1) => theme.foreground,
    labelColor: (opacity = 1) => theme.foreground,
    style: {
      borderRadius: 12,
    },
  };

  return (
    <FadeInView delay={300} direction="up" duration={800}>
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
          <FadeInView delay={600} direction="up" duration={600}>
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
          </FadeInView>
        )}
      </View>
    </FadeInView>
  );
}
