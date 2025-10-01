import { View, ScrollView, Animated } from "react-native";
import { useEffect } from "react";
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
import { useStaggeredAnimation } from "../../../hooks/useStaggeredAnimation";

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

  // Configurar animações para 6 seções
  const { startAnimations, getAnimatedStyle } = useStaggeredAnimation({
    itemCount: 6,
    duration: 600,
    staggerDelay: 150,
    initialDelay: 200,
  });

  // Iniciar animações quando dados carregarem
  useEffect(() => {
    if (!isLoading && !isLoadingFinancialSummary) {
      startAnimations();
    }
  }, [isLoading, isLoadingFinancialSummary, startAnimations]);

  // Componente wrapper animado
  const AnimatedSection = ({ index, children }: { index: number; children: React.ReactNode }) => (
    <Animated.View style={getAnimatedStyle(index)}>
      {children}
    </Animated.View>
  );

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
          <AnimatedSection index={0}>
            <AccountInfos
              title="Saldo Disponível"
              amount={accounts?.balance || 0}
              isLoadingAccounts={isLoading}
              formatType="currency"
              colorType="primary"
              icon={<Wallet size={24} color={iconColor} />}
            />
          </AnimatedSection>

          <AnimatedSection index={1}>
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
          </AnimatedSection>

          <AnimatedSection index={2}>
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
          </AnimatedSection>

          <AnimatedSection index={3}>
            <ExpensesPieChart />
          </AnimatedSection>

          <AnimatedSection index={4}>
            <BalanceChart />
          </AnimatedSection>

          <AnimatedSection index={5}>
            <MonthlyRevenueChart />
          </AnimatedSection>
        </View>
      </ScrollView>
    </View>
  );
}
