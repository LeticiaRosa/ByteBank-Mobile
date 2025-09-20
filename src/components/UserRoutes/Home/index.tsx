import { View, ScrollView } from "react-native";
import { styles } from "./styles";
import { AccountInfos } from "./components/AccountInfos";
import { BalanceChart } from "./components/BalanceChart";
import { ExpensesPieChart } from "./components/ExpensesPieChart";
import { Wallet, TrendingDown, TrendingUp } from "lucide-react-native";
import { useTheme } from "../../../hooks/useTheme";
import { getTheme, colors } from "../../../styles/theme";
import { MonthlyRevenueChart } from "./components/MonthlyRevenueChart";

export function Home() {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  const iconColor = theme.primary;
  const successColor = colors.charts.main.green; // Verde do sistema de charts
  const destructiveColor = theme.destructive; // Vermelho do tema
  const backgroundColor = theme.background;
  return (
    <View
      style={[styles.container, { backgroundColor }]}
      className="flex-1 w-full h-full"
    >
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.cardsContainer}>
          <AccountInfos
            title="Saldo Disponível"
            amount={12345.67}
            isLoadingAccounts={false}
            formatType="currency"
            icon={<Wallet size={24} color={iconColor} />}
          />

          <AccountInfos
            title="Total de Despesas"
            amount={5678.9}
            isLoadingAccounts={false}
            colorType="destructive"
            formatType="currency"
            showeye={false}
            icon={<TrendingDown size={24} color={destructiveColor} />}
          />
          <AccountInfos
            title="Total de Receitas"
            amount={2345.67}
            isLoadingAccounts={false}
            colorType="success"
            formatType="currency"
            showeye={false}
            icon={<TrendingUp size={24} color={successColor} />}
          />

          {/* Gráfico de evolução do saldo */}
          <BalanceChart />

          {/* Gráfico de gastos por categoria */}
          <ExpensesPieChart />

          <MonthlyRevenueChart />
        </View>
      </ScrollView>
    </View>
  );
}
