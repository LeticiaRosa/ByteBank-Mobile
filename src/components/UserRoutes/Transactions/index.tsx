import { View } from "react-native";
import { CustomText } from "../../ui/Text";
import { styles } from "./styles";

export function Transactions() {
  return (
    <>
      <View style={styles.container} className="bg-gray-1 dark:bg-gray-12">
        <CustomText>Transactions</CustomText>
      </View>
    </>
  );
}
