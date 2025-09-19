import { View } from "react-native";
import { styles } from "./styles";
import { AccountInfos } from "./components/AccountInfos";
import { Wallet, TrendingDown, TrendingUp } from "lucide-react-native";
import { useTheme } from "../../../hooks/useTheme";
import { getTheme, colors } from "../../../styles/theme";

export function Home() {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  const iconColor = theme.primary;
  const successColor = colors.charts.main.green; // Verde do sistema de charts
  const destructiveColor = theme.destructive; // Vermelho do tema

  return (
    <>
      <View style={styles.container} className="bg-gray-1 dark:bg-gray-12">
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
        </View>
      </View>
    </>
  );
}
