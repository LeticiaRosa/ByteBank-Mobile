import { useState } from "react";
import { Eye, EyeOff } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { CustomText } from "../../../ui/Text";
import { useTheme } from "../../../../hooks/useTheme";
import { getTheme } from "../../../../styles/theme";
import { ReactNode } from "react";

interface AccountProps {
  title: string;
  amount: number;
  text?: string;
  isLoadingAccounts: boolean;
  showeye?: boolean;
  colorType?: "primary" | "success" | "destructive";
  formatType?: "currency" | "number";
  icon?: ReactNode;
}

export function AccountInfos({
  title,
  amount,
  text,
  isLoadingAccounts,
  showeye = true,
  colorType = "primary",
  formatType = "currency",
  icon,
}: AccountProps) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  const cardForegroundColor = theme.cardForeground;
  const cardBackgroundColor = theme.card;
  const iconColor = theme.secondaryForeground;

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  const formatValue = (value: number) => {
    if (formatType === "number") {
      return value.toLocaleString("pt-BR");
    }

    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getAmountColorClass = () => {
    switch (colorType) {
      case "success":
        return "text-green-600 dark:text-green-400";
      case "destructive":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-primary";
    }
  };

  if (isLoadingAccounts) {
    return (
      <View className="flex items-center gap-2">
        <View className="h-4 w-20 bg-muted animate-pulse rounded"></View>
        <TouchableOpacity>
          <Eye className="h-4 w-4" />
        </TouchableOpacity>
      </View>
    );
  }
  if (amount < 0) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: cardBackgroundColor,
        borderColor: cardForegroundColor,
      }}
      className="rounded-lg shadow-sm border p-4 w-full border-gray-12 "
    >
      <View className="flex flex-row justify-between items-start">
        <View className="flex flex-row items-center gap-2 py-2">
          {icon && (
            <View
              style={{
                backgroundColor: cardForegroundColor,
              }}
              className="mx-2 w-12 h-12 items-center justify-center rounded-full"
            >
              {icon}
            </View>
          )}
          <View className="flex flex-col">
            <CustomText className="font-semibold text-card-foreground bg-red mb-2">
              {title}
            </CustomText>
            <CustomText
              className={` text-xl font-bold ${getAmountColorClass()}`}
            >
              {isBalanceVisible ? formatValue(amount) : "••••••"}
            </CustomText>
          </View>{" "}
        </View>
        {showeye && (
          <View className="flex justify-end">
            <TouchableOpacity
              onPress={toggleBalanceVisibility}
              className="h-8 w-8"
            >
              {isBalanceVisible ? (
                <EyeOff size={22} color={iconColor} />
              ) : (
                <Eye size={22} color={iconColor} />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {text && (
        <CustomText className="text-md text-muted-foreground">
          {text}
        </CustomText>
      )}
    </View>
  );
}
