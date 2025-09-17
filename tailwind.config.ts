import type { Config } from "tailwindcss";
import { colors, lightTheme, darkTheme, chartColors } from "./src/styles/theme";
// @ts-expect-error This file does not have type definitions.
import nativewindPreset from "nativewind/dist/tailwind/index.js";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./App.{js,ts,jsx,tsx}"],
  darkMode: "class",
  presets: [nativewindPreset],
  theme: {
    extend: {
      colors: {
        // Escalas completas OKLCH
        blue: colors.light.blue,
        gray: colors.light.gray,

        // Temas semânticos
        background: lightTheme.background,
        foreground: lightTheme.foreground,
        primary: {
          DEFAULT: lightTheme.primary,
          foreground: lightTheme.primaryForeground,
        },
        card: {
          DEFAULT: lightTheme.card,
          foreground: lightTheme.cardForeground,
        },
        muted: {
          DEFAULT: lightTheme.muted,
          foreground: lightTheme.mutedForeground,
        },
        border: lightTheme.border,
        input: lightTheme.input,
        ring: lightTheme.ring,
        destructive: {
          DEFAULT: lightTheme.destructive,
          foreground: lightTheme.destructiveForeground,
        },
        sidebar: {
          DEFAULT: lightTheme.sidebar,
          foreground: lightTheme.sidebarForeground,
          border: lightTheme.sidebarBorder,
        },

        // Charts OKLCH
        chart: {
          1: chartColors[0],
          2: chartColors[1],
          3: chartColors[2],
          4: chartColors[3],
          5: chartColors[4],
          6: chartColors[5],
          7: chartColors[6],
        },
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;

// Função utilitária
export const getThemeColors = (isDark: boolean) => ({
  background: isDark ? darkTheme.background : lightTheme.background,
  foreground: isDark ? darkTheme.foreground : lightTheme.foreground,
  primary: isDark ? darkTheme.primary : lightTheme.primary,
  muted: isDark ? darkTheme.muted : lightTheme.muted,
  border: isDark ? darkTheme.border : lightTheme.border,
});
