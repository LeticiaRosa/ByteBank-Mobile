import { View, ScrollView } from "react-native";
import { styles } from "./styles";
import { AccountInfos } from "./components/AccountInfos";
import { BalanceChart } from "./components/BalanceChart";
import { ExpensesPieChart } from "./components/ExpensesPieChart";
import { Wallet, TrendingDown, TrendingUp } from "lucide-react-native";
import { useTheme } from "../../../hooks/useTheme";
import { getTheme, colors } from "../../../styles/theme";
import { MonthlyRevenueChart } from "./components/MonthlyRevenueChart";
import { usePrimaryBankAccount } from "../../../hooks/useBankAccounts";
import { useMonthlyFinancialSummary } from "../../../hooks/useMonthlyFinancialSummary";

export function Home() {
  const { isDark } = useTheme();
  const { data: accounts, isLoading } = usePrimaryBankAccount();
  const {
    monthlyRevenue,
    monthlyExpenses,
    revenueGrowth,
    expensesGrowth,
    isLoading: isLoadingFinancialSummary,
  } = useMonthlyFinancialSummary();
  const theme = getTheme(isDark);
  const iconColor = theme.primary;
  const successColor = colors.charts.main.green; // Verde do sistema de charts
  const destructiveColor = theme.destructive; // Vermelho do tema
  const backgroundColor = theme.background;

  if (isLoading || isLoadingFinancialSummary) {
    return null;
  }

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
            amount={accounts?.balance || 0}
            isLoadingAccounts={!accounts?.id}
            formatType="currency"
            icon={<Wallet size={24} color={iconColor} />}
          />

          <AccountInfos
            title="Receitas do Mês"
            text={`${revenueGrowth} vs mês anterior`}
            isLoadingAccounts={isLoadingFinancialSummary}
            amount={monthlyRevenue}
            showeye={false}
            colorType="destructive"
            formatType="currency"
            icon={<TrendingDown size={24} color={destructiveColor} />}
          />
          <AccountInfos
            title="Gastos do Mês"
            text={`${expensesGrowth} vs mês anterior`}
            isLoadingAccounts={isLoadingFinancialSummary}
            amount={monthlyExpenses}
            colorType="success"
            formatType="currency"
            showeye={false}
            icon={<TrendingUp size={24} color={successColor} />}
          />
          <ExpensesPieChart />
          <BalanceChart />
          <MonthlyRevenueChart />
        </View>
      </ScrollView>
    </View>
  );
}
