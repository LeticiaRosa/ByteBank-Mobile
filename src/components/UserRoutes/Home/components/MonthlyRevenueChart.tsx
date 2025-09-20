import { View, Dimensions, ScrollView } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { CustomText } from "../../../ui/Text";
import { useTheme } from "../../../../hooks/useTheme";
import { getTheme } from "../../../../styles/theme";
import { useMonthlyBalanceData } from "../../../../hooks/useDashboardsCharts";

const screenWidth = Dimensions.get("window").width;

export function MonthlyRevenueChart() {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  const { data: monthlyData, isLoading, error } = useMonthlyBalanceData();
  // Preparar dados para o gráfico de barras
  const chartData = monthlyData?.length
    ? {
        labels: monthlyData.map((item) => item.month_label.split(" ")[0]), // Apenas o mês (Jan, Fev, etc.)
        datasets: [
          {
            data: monthlyData.map((item) => Number(item.receitas)),
            color: (opacity = 1) => theme.primary,
          },
        ],
      }
    : {
        labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
        datasets: [],
      };

  const chartConfig = {
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.primary,
    labelColor: (opacity = 1) => theme.foreground,
    style: {
      borderRadius: 12,
    },
    propsForBackgroundLines: {
      strokeDasharray: "3,3",
      stroke: theme.border,
      strokeOpacity: 0.3,
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
        Receitas Mensais
      </CustomText>

      {isLoading ? (
        <CustomText className="text-muted-foreground text-center py-8">
          Carregando dados...
        </CustomText>
      ) : error ? (
        <CustomText className="text-red-500 text-center py-8">
          Erro ao carregar dados
        </CustomText>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={chartData}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            yAxisLabel="R$ "
            yAxisSuffix=""
            style={{
              borderRadius: 8,
            }}
            verticalLabelRotation={0}
            showValuesOnTopOfBars={true}
            fromZero={true}
          />
        </ScrollView>
      )}
    </View>
  );
}
