import { View, Text, Switch, TouchableOpacity, StyleSheet } from "react-native";
import {
  User,
  Moon,
  Sun,
  ChevronRight,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
} from "lucide-react-native";
import { useTheme } from "../hooks/useTheme";
import { cardStyles, listStyles } from "../styles/components";
import { CustomText } from "./ui/Text";

export function Profile() {
  const { isDark, toggleTheme } = useTheme();

  // Usar as cores dos componentes importados
  const iconColor = listStyles.icon.color(isDark);
  const cardStyle = cardStyles.container(isDark);
  const titleStyle = cardStyles.title(isDark);

  const profileOptions = [
    {
      title: "Segurança",
      icon: <Shield size={20} color={iconColor} />,
    },
    {
      title: "Notificações",
      icon: <Bell size={20} color={iconColor} />,
    },
    {
      title: "Ajuda",
      icon: <HelpCircle size={20} color={iconColor} />,
    },
  ];

  return (
    <>
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? "#18181b" : "#f5f5f5" },
        ]}
        className="flex-1 bg-gray-1 dark:bg-dark-background"
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: cardStyle.backgroundColor },
          ]}
          className="p-5 items-center bg-card dark:bg-dark-card"
        >
          <View
            style={[
              styles.profileImage,
              {
                backgroundColor: isDark ? "#3f3f46" : "#f0f0f0",
                borderRadius: 40,
                width: 80,
                height: 80,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
            className="w-20 h-20 rounded-full bg-gray-3 dark:bg-dark-gray-5 justify-center items-center mb-2"
          >
            <User size={40} color={iconColor} />
          </View>
          <CustomText className="text-gray-12 text-lg font-bold text-card-foreground dark:text-dark-card-foreground">
            João da Silva
          </CustomText>
          <CustomText>joao.silva@example.com</CustomText>
        </View>

        {/* Configurações */}
        <View style={styles.settingsContainer}>
          <CustomText className="font-bold text-card-foreground dark:text-dark-card-foreground">
            Configurações
          </CustomText>

          {/* Modo Escuro */}
          <View
            style={[
              styles.settingItem,
              {
                borderBottomColor: isDark ? "#3f3f46" : "#e0e0e0",
                paddingVertical: 12,
                borderBottomWidth: 1,
              },
            ]}
          >
            <View style={styles.settingLeft}>
              {isDark ? (
                <Moon size={20} color={iconColor} />
              ) : (
                <Sun size={20} color={iconColor} />
              )}
              <Text style={[styles.settingText, { color: titleStyle.color }]}>
                Modo Escuro
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{
                false: isDark ? "#3f3f46" : "#767577",
                true: iconColor,
              }}
              thumbColor={isDark ? "#4089ee" : "#f4f3f4"}
            />
          </View>

          {/* Outras opções */}
          {profileOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.settingItem,
                {
                  borderBottomColor: isDark ? "#3f3f46" : "#e0e0e0",
                  paddingVertical: 12,
                  borderBottomWidth:
                    index === profileOptions.length - 1 ? 0 : 1,
                },
              ]}
              onPress={option.onPress}
            >
              <View style={styles.settingLeft}>
                {option.icon}
                <Text style={[styles.settingText, { color: titleStyle.color }]}>
                  {option.title}
                </Text>
              </View>
              <ChevronRight size={18} color={iconColor} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sair */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: isDark ? "#27272a" : "#e0e0e0",
              borderWidth: 1,
              borderColor: iconColor,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginHorizontal: 16,
              marginTop: 20,
              padding: 12,
              borderRadius: 8,
            },
          ]}
          onPress={() => console.log("Logout pressed")}
        >
          <LogOut size={18} color={iconColor} />
          <Text style={[styles.logoutText, { color: iconColor }]}>
            Sair da Conta
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  profileImage: {
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  profileEmail: {
    fontSize: 14,
  },
  settingsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    marginLeft: 12,
    fontSize: 16,
  },
  logoutButton: {
    // Estilos inline são aplicados no componente
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
});
