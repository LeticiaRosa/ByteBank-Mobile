import { useState, useRef } from "react";
import { Eye, EyeOff } from "lucide-react-native";
import { TouchableOpacity, View, Animated } from "react-native";
import { CustomText } from "../../../ui/Text";
import { useTheme } from "../../../../hooks/useTheme";
import { getTheme } from "../../../../styles/theme";
import { ReactNode } from "react";
import { useSkeletonAnimation } from "../../../ui/FadeInView";

interface AccountProps {
  title?: string;
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

  // Animações para transições suaves
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  const cardForegroundColor = theme.cardForeground;
  const cardBackgroundColor = theme.card;
  const iconColor = theme.secondaryForeground;

  const toggleBalanceVisibility = () => {
    // Animação de "piscar" ao alternar visibilidade
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 0.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setIsBalanceVisible(!isBalanceVisible);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
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

  // Hook para animação de skeleton
  const skeletonStyle = useSkeletonAnimation();

  if (isLoadingAccounts) {
    return (
      <Animated.View
        style={[
          {
            backgroundColor: cardBackgroundColor,
            borderColor: theme.border,
          },
          skeletonStyle,
        ]}
        className="rounded-lg shadow-sm border p-4 w-full border-gray-1"
      >
        <View className="flex flex-row justify-between items-start">
          <View className="flex flex-row items-center pl-2 gap-2">
            <Animated.View
              style={[
                {
                  backgroundColor: theme.muted,
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                },
                skeletonStyle,
              ]}
            />
            <View className="flex flex-col px-2">
              <Animated.View
                style={[
                  {
                    backgroundColor: theme.muted,
                    height: 16,
                    width: 80,
                    borderRadius: 4,
                    marginBottom: 8,
                  },
                  skeletonStyle,
                ]}
              />
              <Animated.View
                style={[
                  {
                    backgroundColor: theme.muted,
                    height: 20,
                    width: 120,
                    borderRadius: 4,
                  },
                  skeletonStyle,
                ]}
              />
            </View>
          </View>
          <Animated.View
            style={[
              {
                backgroundColor: theme.muted,
                width: 32,
                height: 32,
                borderRadius: 16,
              },
              skeletonStyle,
            ]}
          />
        </View>
      </Animated.View>
    );
  }
  if (amount < 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        {
          backgroundColor: cardBackgroundColor,
          borderColor: theme.border,
          transform: [{ scale: scaleAnim }],
        },
      ]}
      className="rounded-lg shadow-sm border p-4 w-full border-gray-1 "
    >
      <View className="flex flex-row justify-between items-start">
        <View className="flex flex-row items-center pl-2 gap-2">
          {icon && (
            <Animated.View
              style={[
                {
                  backgroundColor: cardForegroundColor,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
              className=" w-12 h-12 items-center justify-center rounded-full"
            >
              {icon}
            </Animated.View>
          )}
          <View className="flex flex-col px-2">
            <CustomText className="font-semibold text-card-foreground bg-red mb-2 text-md">
              {title}
            </CustomText>
            <Animated.View style={{ opacity: opacityAnim }}>
              <CustomText
                className={`text-2xl font-bold ${getAmountColorClass()}`}
              >
                {isBalanceVisible ? formatValue(amount) : "••••••"}
              </CustomText>
            </Animated.View>
          </View>
        </View>
        {showeye && (
          <View className="flex justify-end">
            <TouchableOpacity
              onPress={toggleBalanceVisibility}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
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
    </Animated.View>
  );
}
