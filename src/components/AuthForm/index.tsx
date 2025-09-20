import { useAuth } from "../../hooks/useAuth";
import { View, ActivityIndicator } from "react-native";
import { styles } from "./styles";
import { UserRoutes } from "../UserRoutes";
import { Login } from "../UserRoutes/Login";

export function AuthForm() {
  const { user, loading } = useAuth();

  // Mostrar loading durante a inicialização
  if (loading && user === undefined) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
        className="bg-gray-1 dark:bg-gray-12"
      >
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (user) {
    return <UserRoutes />;
  }

  return (
    <View style={styles.container} className="bg-gray-1 dark:bg-gray-12">
      <Login />
    </View>
  );
}
