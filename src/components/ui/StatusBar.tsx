import { StatusBar } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export function CustomStatusBar() {
  const { isDark } = useTheme();

  return (
    <StatusBar
      barStyle={isDark ? "light-content" : "dark-content"}
      backgroundColor={isDark ? "#000000" : "#ffffff"}
      translucent={false}
    />
  );
}
