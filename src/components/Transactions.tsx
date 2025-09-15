import { View } from "react-native";
import { CustomText } from "./ui/Text";

export function Transactions() {
  return (
    <>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
        className="bg-gray-1 dark:bg-dark-background"
      >
        <CustomText>Transactions</CustomText>
      </View>
    </>
  );
}
