import { useAuth } from "../../hooks/useAuth";
import { UserRoutes } from "..";
import { View } from "react-native";
import { styles } from "./styles";
import { Login } from "../Login";

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
