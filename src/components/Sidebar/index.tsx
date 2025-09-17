import { createDrawerNavigator } from "@react-navigation/drawer";
import { Home } from "../Home";
import { Transactions } from "../Transactions";
import { Profile } from "../Profile";
import {
  House,
  ArrowRightLeft,
  ScrollText,
  UserCircle,
} from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../hooks/useTheme";
import { getThemeColors } from "../../styles/theme";
import { styles } from "./styles";

const Drawer = createDrawerNavigator();

export function MyDrawer() {
  const { isDark } = useTheme();
  const navigation = useNavigation();

  // Cores baseadas no theme.ts simplificado
  const theme = getThemeColors(isDark);
  const mainColor = theme.primary;
  const accentColor = theme.sidebar;

  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: mainColor,
          color: mainColor,
        },
        headerTintColor: accentColor,
        drawerStyle: {
          backgroundColor: accentColor,
          width: styles.drawerContainer.width,
        },
        drawerInactiveTintColor: theme.sidebarForeground,
        drawerActiveTintColor: theme.sidebarForeground,
        // drawerActiveBackgroundColor: mainColor,
        drawerLabelStyle: {
          color: theme.sidebarForeground,
          marginLeft: 12, // Padding entre ícone e texto
        },

        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate("Perfil")}
            style={styles.headerButton}
          >
            <UserCircle color={accentColor} size={24} />
          </TouchableOpacity>
        ),
      }}
    >
      <Drawer.Screen
        name="Home"
        options={{
          drawerIcon: ({ color, size }: { color?: string; size?: number }) => (
            <House color={color} size={size ?? 18} />
          ),
        }}
      >
        {(props: any) => <Home {...props} />}
      </Drawer.Screen>
      <Drawer.Screen
        name="Transações"
        options={{
          drawerIcon: ({ color, size }: { color?: string; size?: number }) => (
            <ArrowRightLeft color={color} size={size ?? 18} />
          ),
        }}
      >
        {(props: any) => <Transactions {...props} />}
      </Drawer.Screen>
      <Drawer.Screen
        name="Extrato"
        options={{
          drawerIcon: ({ color, size }: { color?: string; size?: number }) => (
            <ScrollText color={color} size={size ?? 18} />
          ),
        }}
      >
        {(props: any) => <Transactions {...props} />}
      </Drawer.Screen>
      <Drawer.Screen
        name="Perfil"
        options={{
          drawerIcon: ({ color, size }: { color?: string; size?: number }) => (
            <UserCircle color={color} size={size ?? 18} />
          ),
        }}
      >
        {(props: any) => <Profile {...props} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}
