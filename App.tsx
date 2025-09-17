import { NavigationContainer } from "@react-navigation/native";
import "./global.css";
import { MyDrawer } from "./src/components/Sidebar";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "./src/hooks/useTheme";
import { StatusBar } from "react-native";

// Componente interno que usa o hook
function AppContent() {
  const { isDark } = useTheme();
  console.log(isDark);
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDark ? "#000000" : "#ffffff" }}
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

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
