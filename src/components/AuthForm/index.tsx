import { useAuth } from "../../hooks/useAuth";
import { UserRoutes } from "..";
import { Login } from "../Login";
import { View } from "react-native";

export function AuthForm() {
  const { user } = useAuth();

  if (user) {
    return <UserRoutes />;
  }

  return (
    <View className="flex flex-col items-center justify-center w-full h-full bg-black">
      <Login />
    </View>
  );
}
