import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaView, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { MyDrawer } from "./Sidebar";

// Componente interno que usa o hook
export function UserRoutes() {
  const { isDark } = useTheme();
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: isDark ? "#000000" : "#ffffff",
        }}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={isDark ? "#000000" : "#ffffff"}
          translucent={false}
        />
        <NavigationContainer>
          <MyDrawer />
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
