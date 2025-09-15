import { createDrawerNavigator } from "@react-navigation/drawer";
import { Home } from "./Home";
import { Transactions } from "./Transactions";
import { Profile } from "./Profile";
import {
  House,
  ArrowRightLeft,
  ScrollText,
  UserCircle,
} from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../hooks/useTheme";

const Drawer = createDrawerNavigator();

export function MyDrawer() {
  const { isDark } = useTheme();
  const navigation = useNavigation();

  // Cores para tema claro e escuro
  const mainColor = isDark ? "#c6cbef" : "#003CB3";
  const backgroundColor = isDark ? "#18181b" : "#f5f5f5";
  const accentColor = isDark ? "#0a1933" : "#c6cbef";
  console.log("Tema atual:", isDark ? "Escuro" : "Claro");
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: mainColor,
        },
        drawerStyle: {
          backgroundColor: accentColor,
          width: 240,
        },
        drawerActiveTintColor: mainColor,
        drawerActiveBackgroundColor: isDark ? backgroundColor : mainColor,
        drawerLabelStyle: {
          color: isDark ? mainColor : mainColor,
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate("Perfil")}
            style={{ marginRight: 15 }}
          >
            <UserCircle color={isDark ? mainColor : mainColor} size={24} />
          </TouchableOpacity>
        ),
      }}
      className="bg-gray-1 dark:bg-gray-12 text-gray-12 dark:text-gray-1"
    >
      <Drawer.Screen
        name="Inicio"
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
