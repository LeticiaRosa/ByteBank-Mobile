import { NavigationContainer } from "@react-navigation/native";
import "./global.css";
import { MyDrawer } from "./src/components/Sidebar";

export default function App() {
  return (
    <NavigationContainer>
      <MyDrawer />
    </NavigationContainer>
  );
}
