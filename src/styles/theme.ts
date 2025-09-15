/**
 * ByteBank Theme
 *
 * Arquivo com as constantes de estilo para uso no aplicativo.
 * Baseado nas variáveis do example.css com tipos TypeScript.
 */

// Espaçamento consistente
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Raios de borda
export const borderRadius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  round: 9999,
} as const;

// Tamanhos de texto
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  heading: 28,
} as const;

// Espessuras de fonte
export const fontWeight = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

// Sombras
export const shadows = {
  light: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
  },
  dark: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.2)",
    md: "0 4px 6px rgba(0, 0, 0, 0.25)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.3)",
  },
} as const;

// Paleta de cores baseada no example.css
export const colors = {
  light: {
    // Blue scale
    blue: {
      1: "oklch(99.3% 0.0067 222.8)",
      2: "oklch(98% 0.0126 222.8)",
      3: "oklch(96.1% 0.0302 222.8)",
      4: "oklch(93.6% 0.0451 222.8)",
      5: "oklch(90.3% 0.0589 222.8)",
      6: "oklch(86.1% 0.073 222.8)",
      7: "oklch(80.6% 0.0908 222.8)",
      8: "oklch(72.9% 0.1087 222.8)",
      9: "oklch(39% 0.0725 222.8)",
      10: "oklch(45.1% 0.0725 222.8)",
      11: "oklch(52.6% 0.1087 222.8)",
      12: "oklch(35.1% 0.0725 222.8)",
      contrast: "#ffffff",
    },
    // Gray scale
    gray: {
      1: "oklch(99.1% 0.0015 277.7)",
      2: "oklch(98.2% 0.003 277.7)",
      3: "oklch(95.6% 0.0045 277.7)",
      4: "oklch(93.1% 0.0061 277.7)",
      5: "oklch(91% 0.0077 277.7)",
      6: "oklch(88.8% 0.0093 277.7)",
      7: "oklch(85.3% 0.0117 277.7)",
      8: "oklch(79.4% 0.016 277.7)",
      9: "oklch(64.6% 0.0165 277.7)",
      10: "oklch(61% 0.0161 277.7)",
      11: "oklch(50.3% 0.0139 277.7)",
      12: "oklch(24.1% 0.0099 277.7)",
      contrast: "#ffffff",
    },
    // Equivalentes RGB para uso direto no React Native
    blueRGB: {
      1: "#f7faff",
      2: "#eef5ff",
      3: "#e6f0ff",
      4: "#d9e8ff",
      5: "#c7defc",
      6: "#abd0f9",
      7: "#88bcf5",
      8: "#5b9eee",
      9: "#003CB3", // Valor principal
      10: "#1456bd",
      11: "#2a70c8",
      12: "#0030a0",
    },
    grayRGB: {
      1: "#fcfcfc",
      2: "#f9f9f9",
      3: "#f0f0f0",
      4: "#e6e6e6",
      5: "#dfdfdf",
      6: "#d8d8d8",
      7: "#c9c9c9",
      8: "#b8b8b8",
      9: "#a0a0a0",
      10: "#8f8f8f",
      11: "#6e6e6e",
      12: "#171717",
    },
  },
  dark: {
    // Blue scale
    blue: {
      1: "oklch(17.8% 0.0184 222.8)",
      2: "oklch(21.2% 0.0207 222.8)",
      3: "oklch(27.1% 0.0461 222.8)",
      4: "oklch(31.7% 0.0644 222.8)",
      5: "oklch(36.5% 0.0725 222.8)",
      6: "oklch(41.7% 0.0783 222.8)",
      7: "oklch(48.1% 0.0873 222.8)",
      8: "oklch(55.8% 0.1035 222.8)",
      9: "oklch(72.1% 0.1087 222.8)",
      10: "oklch(68.4% 0.1087 222.8)",
      11: "oklch(78.8% 0.1087 222.8)",
      12: "oklch(91.7% 0.0564 222.8)",
      contrast: "#ffffff",
    },
    // Gray scale
    gray: {
      1: "oklch(17.8% 0.0042 277.7)",
      2: "oklch(21.5% 0.004 277.7)",
      3: "oklch(25.5% 0.0055 277.7)",
      4: "oklch(28.4% 0.0075 277.7)",
      5: "oklch(31.4% 0.0089 277.7)",
      6: "oklch(35% 0.01 277.7)",
      7: "oklch(40.2% 0.0121 277.7)",
      8: "oklch(49.2% 0.0157 277.7)",
      9: "oklch(54% 0.0167 277.7)",
      10: "oklch(58.6% 0.0165 277.7)",
      11: "oklch(77% 0.0138 277.7)",
      12: "oklch(94.9% 0.0026 277.7)",
      contrast: "#ffffff",
    },
    // Equivalentes RGB para uso direto no React Native
    blueRGB: {
      1: "#0a1933",
      2: "#0e2042",
      3: "#153460",
      4: "#1a4180",
      5: "#1f4d99",
      6: "#2559b3",
      7: "#316fd2",
      8: "#4089ee",
      9: "#c6cbef", // Valor principal para dark mode
      10: "#aed0f9",
      11: "#d5e3fa",
      12: "#f0f5ff",
    },
    grayRGB: {
      1: "#18181b",
      2: "#27272a",
      3: "#3f3f46",
      4: "#52525b",
      5: "#71717a",
      6: "#a1a1aa",
      7: "#d4d4d8",
      8: "#e4e4e7",
      9: "#f4f4f5",
      10: "#fafafa",
      11: "#f9fafb",
      12: "#ffffff",
    },
  },
};

// Variáveis semânticas baseadas no example.css
export const theme = {
  light: {
    background: colors.light.grayRGB[1],
    foreground: colors.light.grayRGB[12],
    card: colors.light.grayRGB[1],
    cardForeground: colors.light.grayRGB[12],
    popover: colors.light.grayRGB[1],
    popoverForeground: colors.light.grayRGB[12],
    primary: colors.light.blueRGB[9],
    // primaryForeground: colors.light.blueRGB.contrast,
    secondary: colors.light.grayRGB[3],
    secondaryForeground: colors.light.grayRGB[12],
    muted: colors.light.grayRGB[3],
    mutedForeground: colors.light.grayRGB[11],
    accent: colors.light.blueRGB[4],
    accentForeground: colors.light.blueRGB[12],
    destructive: "#dc2626",
    destructiveForeground: "#ffffff",
    border: colors.light.grayRGB[6],
    input: colors.light.grayRGB[6],
    ring: colors.light.blueRGB[7],

    // Sidebar
    sidebar: colors.light.grayRGB[2],
    sidebarForeground: colors.light.grayRGB[12],
    sidebarPrimary: colors.light.blueRGB[9],
    // sidebarPrimaryForeground: colors.light.blueRGB.contrast,
    sidebarAccent: colors.light.grayRGB[3],
    sidebarAccentForeground: colors.light.grayRGB[12],
    sidebarBorder: colors.light.grayRGB[6],
    sidebarRing: colors.light.blueRGB[7],

    // Radius
    radius: {
      sm: 4,
      md: 6,
      lg: 8,
      xl: 12,
    },
  },
  dark: {
    background: colors.dark.grayRGB[1],
    foreground: colors.dark.grayRGB[12],
    card: colors.dark.grayRGB[2],
    cardForeground: colors.dark.grayRGB[12],
    popover: colors.dark.grayRGB[2],
    popoverForeground: colors.dark.grayRGB[12],
    primary: colors.dark.blueRGB[9],
    primaryForeground: colors.dark.blueRGB[1],
    secondary: colors.dark.grayRGB[3],
    secondaryForeground: colors.dark.grayRGB[11],
    muted: colors.dark.grayRGB[3],
    mutedForeground: colors.dark.grayRGB[11],
    accent: colors.dark.blueRGB[4],
    accentForeground: colors.dark.blueRGB[11],
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: colors.dark.grayRGB[6],
    input: colors.dark.grayRGB[6],
    ring: colors.dark.blueRGB[8],

    // Sidebar
    sidebar: colors.dark.grayRGB[2],
    sidebarForeground: colors.dark.grayRGB[12],
    sidebarPrimary: colors.dark.blueRGB[9],
    sidebarPrimaryForeground: colors.dark.blueRGB[1],
    sidebarAccent: colors.dark.grayRGB[3],
    sidebarAccentForeground: colors.dark.grayRGB[11],
    sidebarBorder: colors.dark.grayRGB[6],
    sidebarRing: colors.dark.blueRGB[8],

    // Radius
    radius: {
      sm: 4,
      md: 6,
      lg: 8,
      xl: 12,
    },
  },
};

// Função para obter as cores baseadas no tema atual
export const getThemeColors = (isDark: boolean) => {
  return isDark ? theme.dark : theme.light;
};

// Função simplificada para cores principais (compatível com theme.js)
export const getSimpleThemeColors = (isDark: boolean) => {
  return isDark
    ? {
        blue: {
          main: colors.dark.blueRGB[9],
          light: colors.dark.blueRGB[8],
          dark: colors.dark.blueRGB[1],
          contrast: colors.dark.blueRGB[1],
        },
        gray: {
          background: colors.dark.grayRGB[1],
          card: colors.dark.grayRGB[2],
          text: colors.dark.grayRGB[12],
          border: colors.dark.grayRGB[6],
          muted: colors.dark.grayRGB[11],
        },
      }
    : {
        blue: {
          main: colors.light.blueRGB[9],
          light: colors.light.blueRGB[9],
          dark: colors.light.blueRGB[12],
          contrast: "#FFFFFF",
        },
        gray: {
          background: "#f5f5f5",
          card: "#FFFFFF",
          text: colors.light.grayRGB[12],
          border: colors.light.grayRGB[6],
          muted: colors.light.grayRGB[11],
        },
      };
};
