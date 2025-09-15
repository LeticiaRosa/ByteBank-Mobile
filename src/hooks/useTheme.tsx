import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const [theme, setTheme] = useState<Theme>(systemColorScheme || "light");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Aplicar o tema no NativeWind quando mudar
  useEffect(() => {
    setColorScheme(theme);
  }, [theme, setColorScheme]);

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
