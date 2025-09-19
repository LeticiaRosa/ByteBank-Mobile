import { useAuth } from "../../hooks/useAuth";
import { View } from "react-native";
import { styles } from "./styles";
import { UserRoutes } from "../UserRoutes";
import { Login } from "../UserRoutes/Login";

export function AuthForm() {
  const { user } = useAuth();

  if (user) {
    return <UserRoutes />;
  }

  return (
    <View style={styles.container} className="bg-gray-1 dark:bg-gray-12">
      <Login />
    </View>
  );
}
