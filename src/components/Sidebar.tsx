import { createDrawerNavigator } from "@react-navigation/drawer";
import { Home } from "./Home";
import { Profile } from "./Profile";
import { House, ArrowRightLeft, ScrollText } from "lucide-react-native";

const Drawer = createDrawerNavigator();

export function MyDrawer() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen
        name="Inicio"
        component={Home}
        options={{
          drawerIcon: () => <House size={18} />,
        }}
      ></Drawer.Screen>
      <Drawer.Screen
        name="Transações"
        component={Profile}
        options={{
          drawerIcon: () => <ArrowRightLeft size={18} />,
        }}
      />
      <Drawer.Screen
        name="Extrato"
        component={Profile}
        options={{
          drawerIcon: () => <ScrollText size={18} />,
        }}
      />
    </Drawer.Navigator>
  );
}
