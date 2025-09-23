import { View, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { CustomText } from "../../../ui/Text";
import { useTheme } from "../../../../hooks/useTheme";
import { getTheme } from "../../../../styles/theme";
import { useMonthlyBalanceData } from "../../../../hooks/useDashboardsCharts";

const screenWidth = Dimensions.get("window").width;

export function BalanceChart() {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  const { data: monthlyData, isLoading, error } = useMonthlyBalanceData();
  // Preparar dados para o gráfico de linha

  if (isLoading) {
    return null;
  }

  const chartData = monthlyData?.length
    ? {
        labels: monthlyData.map((item) => item.month_label.split(" ")[0]), // Apenas o mês (Jan, Fev, etc.)
        datasets: [
          {
            data: monthlyData.map((item) => item.saldo),
            color: (opacity = 1) => theme.primary, // Cor da linha
            strokeWidth: 3, // Espessura da linha
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
    decimalPlaces: 2, // Casas decimais
    color: (opacity = 1) => theme.primary,
    labelColor: (opacity = 1) => theme.foreground,
    style: {
      borderRadius: 12,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: theme.primary,
      fill: theme.background,
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
        Evolução do Saldo Mensal
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
        <LineChart
          data={chartData}
          width={screenWidth - 64} // Largura da tela menos padding
          height={220}
          chartConfig={chartConfig}
          bezier // Linha suave/curva
          style={{
            borderRadius: 8,
          }}
          withDots={true}
          withShadow={false}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          formatYLabel={(value) => `R$ ${(Number(value) / 1000).toFixed(0)}k`}
        />
      )}
    </View>
  );
}
