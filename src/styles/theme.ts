/**
 * ByteBank Theme - ÚNICA FONTE DE VERDADE
 *
 * Sistema completo com cores OKLCH para máxima precisão e consistência
 */

// === DESIGN TOKENS ===

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  round: 9999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  heading: 28,
} as const;

export const fontWeight = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

// === PALETA OKLCH COMPLETA ===

export const colors = {
  light: {
    // Blue scale - Light mode
    blue: {
      1: "#f8feff",
      2: "#f0fbff",
      3: "#ddf7ff",
      4: "#caf1ff",
      5: "#b5e8fc",
      6: "#9cddf4",
      7: "#7acdea",
      8: "#4bb6d9",
      9: "#004d61", // Primary
      10: "#1c5e73",
      11: "#007798",
      12: "#004256",
      contrast: "#ffffff",
    },
    // Gray scale - Light mode
    gray: {
      1: "#fcfcfd",
      2: "#f8f9fb",
      3: "#f0f0f3",
      4: "#e7e8ec",
      5: "#e0e1e6",
      6: "#d8dae0",
      7: "#cdced7",
      8: "#b9bbc6",
      9: "#8b8d98",
      10: "#81828d",
      11: "#62636c",
      12: "#1e1f24",
      contrast: "#ffffff",
    },
  },
  dark: {
    // Blue scale - Dark mode (convertido de OKLCH para HEX)
    blue: {
      1: "#141922",
      2: "#182029",
      3: "#1f2d3e",
      4: "#253951",
      5: "#2c4663",
      6: "#355276",
      7: "#3f608b",
      8: "#4b72a5",
      9: "#48b4d6", // Primary
      10: "#3da7cd",
      11: "#5bc2e7",
      12: "#c5e8f7",
      contrast: "#ffffff",
    },
    // Gray scale - Dark mode (convertido de OKLCH para HEX)
    gray: {
      1: "#141419",
      2: "#18181f",
      3: "#1e1e26",
      4: "#22222c",
      5: "#272732",
      6: "#2d2d39",
      7: "#353542",
      8: "#454551",
      9: "#4c4c5a",
      10: "#535366",
      11: "#8a8a9a",
      12: "#e8e8ef",
      contrast: "#ffffff",
    },
  },
  // Estados com cores HEX (convertido de OKLCH)
  destructive: {
    light: "#dc2626", // oklch(62.8% 0.25768 29.2339)
    dark: "#ef4444", // oklch(67.5% 0.15 20)
    foreground: "#ffffff", // oklch(97.85% 0.007 106.47)
  },
  // Charts com cores HEX (convertido de OKLCH)
  charts: {
    main: {
      red: "#dc2626",
      green: "#16a34a",
      blue: "#2563eb",
      yellow: "#ca8a04",
      purple: "#9333ea",
      cyan: "#0891b2",
      orange: "#ea580c",
    },
    pie: {
      light: [
        "#dc2626", // Vermelho vibrante
        "#ea580c", // Laranja
        "#ca8a04", // Amarelo dourado
        "#16a34a", // Verde esmeralda
        "#0d9488", // Verde água
        "#0891b2", // Ciano
        "#3730a3", // Azul índigo
        "#7c3aed", // Roxo
        "#c026d3", // Magenta
        "#ec4899", // Rosa
        "#65a30d", // Verde lima
        "#0284c7", // Azul céu
        "#db2777", // Rosa quente
        "#a16207", // Amarelo mostarda
        "#6b21a8", // Violeta profundo
      ],
      dark: [
        "#ef4444", // Vermelho brilhante
        "#f97316", // Laranja vibrante
        "#eab308", // Amarelo ouro brilhante
        "#22c55e", // Verde esmeralda brilhante
        "#14b8a6", // Verde água vibrante
        "#06b6d4", // Ciano brilhante
        "#4f46e5", // Azul índigo vibrante
        "#8b5cf6", // Roxo brilhante
        "#d946ef", // Magenta vibrante
        "#f472b6", // Rosa brilhante
        "#84cc16", // Verde lima brilhante
        "#0ea5e9", // Azul céu vibrante
        "#e879f9", // Rosa quente brilhante
        "#facc15", // Amarelo mostarda brilhante
        "#a855f7", // Violeta brilhante
      ],
    },
  },
} as const;

// === TEMAS SEMÂNTICOS ===

export const lightTheme = {
  // Primárias
  background: colors.light.gray[1],
  foreground: colors.light.gray[12],
  primary: colors.light.blue[9],
  primaryForeground: colors.light.blue.contrast,

  // Superfícies
  card: colors.light.gray[3],
  cardForeground: colors.light.gray[5],
  muted: colors.light.gray[3],
  mutedForeground: colors.light.gray[11],

  // Interações
  border: colors.light.gray[6],
  input: colors.light.gray[6],
  ring: colors.light.blue[7],

  // Extras
  secondary: colors.light.gray[5],
  secondaryForeground: colors.light.gray[12],
  accent: colors.light.blue[4],
  accentForeground: colors.light.blue[12],

  // Estados
  destructive: colors.destructive.light,
  destructiveForeground: colors.destructive.foreground,

  // Sidebar
  sidebar: colors.light.gray[2],
  sidebarForeground: colors.light.gray[12],
  sidebarPrimary: colors.light.blue[9],
  sidebarPrimaryForeground: colors.light.blue.contrast,
  sidebarAccent: colors.light.gray[3],
  sidebarAccentForeground: colors.light.gray[12],
  sidebarBorder: colors.light.gray[6],
  sidebarRing: colors.light.blue[7],
} as const;

export const darkTheme = {
  // Primárias
  background: colors.dark.gray[1],
  foreground: colors.dark.gray[12],
  primary: colors.dark.blue[9],
  primaryForeground: colors.dark.blue[1],

  // Superfícies
  card: colors.dark.gray[6],
  cardForeground: colors.dark.gray[8],
  muted: colors.dark.gray[3],
  mutedForeground: colors.dark.gray[11],

  // Interações
  border: colors.dark.gray[6],
  input: colors.dark.gray[6],
  ring: colors.dark.blue[8],

  // Extras
  secondary: colors.dark.blue[5],
  secondaryForeground: colors.dark.gray[11],
  accent: colors.dark.blue[4],
  accentForeground: colors.dark.blue[11],

  // Estados
  destructive: colors.destructive.dark,
  destructiveForeground: colors.destructive.foreground,

  // Sidebar
  sidebar: colors.dark.gray[2],
  sidebarForeground: colors.dark.gray[12],
  sidebarPrimary: colors.dark.blue[9],
  sidebarPrimaryForeground: colors.dark.blue[1],
  sidebarAccent: colors.dark.gray[3],
  sidebarAccentForeground: colors.dark.gray[11],
  sidebarBorder: colors.dark.gray[6],
  sidebarRing: colors.dark.blue[8],
} as const;

// === FUNÇÕES UTILITÁRIAS ===

export const getTheme = (isDark: boolean) => {
  return isDark ? darkTheme : lightTheme;
};

export const getThemeColors = (isDark: boolean) => {
  const theme = getTheme(isDark);
  return {
    background: theme.background,
    foreground: theme.foreground,
    primary: theme.primary,
    secondary: theme.secondary,
    muted: theme.muted,
    border: theme.border,
    card: theme.card,
    sidebar: theme.sidebar,
    sidebarForeground: theme.sidebarForeground,
  };
};

// Acesso às escalas completas
export const getColorScale = (isDark: boolean) => {
  return isDark ? colors.dark : colors.light;
};

// Charts - cores principais simplificadas
export const chartColors = [
  colors.charts.main.blue,
  colors.charts.main.red,
  colors.charts.main.green,
  colors.charts.main.yellow,
  colors.charts.main.purple,
  colors.charts.main.cyan,
  colors.charts.main.orange,
] as const;

// Charts - cores de pizza completas
export const getChartPieColors = (isDark: boolean) => {
  return isDark ? colors.charts.pie.dark : colors.charts.pie.light;
};
