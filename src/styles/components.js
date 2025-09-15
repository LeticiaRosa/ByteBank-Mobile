import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
  getThemeColors,
} from "./theme";

// Componentes do Drawer
export const drawerStyles = {
  // Estilos do Navigator
  navigator: (isDark) => ({
    backgroundColor: isDark
      ? colors.dark.gray.background
      : colors.light.gray.background,
    contentContainerStyle: {
      flex: 1,
    },
  }),

  // Estilos do Drawer
  drawer: (isDark) => ({
    drawerStyle: {
      backgroundColor: isDark ? colors.dark.blue.dark : colors.light.blue.light,
      width: 240,
    },
    drawerActiveTintColor: isDark
      ? colors.dark.blue.main
      : colors.light.blue.contrast,
    drawerActiveBackgroundColor: isDark
      ? colors.dark.gray.card
      : colors.light.blue.main,
    drawerInactiveTintColor: isDark
      ? colors.dark.blue.light
      : colors.light.blue.main,
    drawerLabelStyle: {
      marginLeft: -spacing.xs,
      fontWeight: fontWeight.medium,
    },
    headerStyle: {
      backgroundColor: isDark ? colors.dark.blue.dark : colors.light.blue.main,
    },
    headerTintColor: isDark
      ? colors.dark.blue.light
      : colors.light.blue.contrast,
  }),

  // Estilos para os ícones
  icon: (isDark) => ({
    color: isDark ? colors.dark.blue.main : colors.light.blue.main,
    activeColor: isDark ? colors.dark.blue.light : colors.light.blue.contrast,
    size: 24,
  }),
};

// Componentes de formulário
export const formStyles = {
  input: (isDark) => ({
    backgroundColor: isDark ? colors.dark.gray.card : colors.light.gray.card,
    color: isDark ? colors.dark.gray.text : colors.light.gray.text,
    borderColor: isDark ? colors.dark.gray.border : colors.light.gray.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
  }),
  label: (isDark) => ({
    color: isDark ? colors.dark.gray.text : colors.light.gray.text,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
    fontWeight: fontWeight.medium,
  }),
  button: {
    primary: (isDark) => ({
      backgroundColor: isDark ? colors.dark.blue.main : colors.light.blue.main,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: "center",
      justifyContent: "center",
    }),
    secondary: (isDark) => ({
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: isDark ? colors.dark.blue.main : colors.light.blue.main,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: "center",
      justifyContent: "center",
    }),
    text: (isDark) => ({
      color: isDark ? colors.dark.blue.main : colors.light.blue.main,
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
    }),
  },
};

// Componentes de cartão
export const cardStyles = {
  container: (isDark) => ({
    backgroundColor: isDark ? colors.dark.gray.card : colors.light.gray.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
    ...shadows[isDark ? "dark" : "light"].md,
  }),
  title: (isDark) => ({
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: isDark ? colors.dark.gray.text : colors.light.gray.text,
    marginBottom: spacing.sm,
  }),
  subtitle: (isDark) => ({
    fontSize: fontSize.md,
    color: isDark ? colors.dark.gray.muted : colors.light.gray.muted,
    marginBottom: spacing.sm,
  }),
};

// Componentes de lista
export const listStyles = {
  item: (isDark) => ({
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: isDark
      ? colors.dark.gray.border
      : colors.light.gray.border,
    flexDirection: "row",
    alignItems: "center",
  }),
  title: (isDark) => ({
    fontSize: fontSize.md,
    color: isDark ? colors.dark.gray.text : colors.light.gray.text,
    fontWeight: fontWeight.medium,
  }),
  description: (isDark) => ({
    fontSize: fontSize.sm,
    color: isDark ? colors.dark.gray.muted : colors.light.gray.muted,
  }),
  icon: {
    container: (isDark) => ({
      marginRight: spacing.sm,
      width: 40,
      height: 40,
      borderRadius: borderRadius.round,
      backgroundColor: isDark ? colors.dark.blue.dark : colors.light.blue.light,
      alignItems: "center",
      justifyContent: "center",
    }),
    color: (isDark) =>
      isDark ? colors.dark.blue.main : colors.light.blue.main,
  },
};
