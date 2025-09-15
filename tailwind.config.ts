// @ts-expect-error This file does not have type definitions.
import nativewindPreset from "nativewind/dist/tailwind/index.js";
import type { Config } from "tailwindcss";

export default {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [nativewindPreset],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Cores principais do ByteBank
        primary: "#003CB3",
        "primary-foreground": "#ffffff",

        // Sistema de cores gray (escala 1-12)
        gray: {
          1: "#fcfcfc",
          2: "#f8f8f8",
          3: "#f3f3f3",
          4: "#ededed",
          5: "#e8e8e8",
          6: "#e2e2e2",
          7: "#dbdbdb",
          8: "#c7c7c7",
          9: "#8f8f8f",
          10: "#858585",
          11: "#6f6f6f",
          12: "#171717",
        },

        // Cores de sistema
        background: "#fcfcfc",
        foreground: "#171717",
        muted: "#f0f0f0",
        "muted-foreground": "#6e6e6e",
        border: "#d8d8d8",

        // Estados
        destructive: "#dc2626",
        "destructive-foreground": "#ffffff",

        // Modo escuro
        "dark-background": "#18181b",
        "dark-foreground": "#ffffff",
        "dark-primary": "#c6cbef",
        "dark-muted": "#3f3f46",
        "dark-border": "#a1a1aa",
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
      },
    },
  },
  plugins: [],
} satisfies Config;
