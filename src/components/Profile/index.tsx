import { View, Switch, TouchableOpacity } from "react-native";
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
import { useTheme } from "../../hooks/useTheme";
import { getTheme } from "../../styles/theme";
import { CustomText } from "../ui/Text";
import { styles } from "./styles";

export function Profile() {
  const { isDark, toggleTheme } = useTheme();

  // Cores baseadas no theme.ts simplificado
  const theme = getTheme(isDark);
  const iconColor = theme.primary;
  const backgroundColor = theme.background;
  const cardBackgroundColor = theme.card;
  const profileImageBg = theme.muted;
  const borderColor = theme.border;
  const switchTrackColor = isDark ? theme.muted : theme.border;
  const logoutButtonBg = theme.muted;

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
        style={[styles.container, { backgroundColor }]}
        className="flex-1 bg-gray-1 dark:bg-dark-background"
      >
        {/* Header */}
        <View
          style={[styles.header, { backgroundColor: cardBackgroundColor }]}
          className="p-5 items-center bg-card dark:bg-dark-card"
        >
          <View
            style={[
              styles.profileImage,
              styles.profileImageContainer,
              { backgroundColor: profileImageBg },
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
              styles.settingItemWithBorder,
              {
                borderBottomColor: borderColor,
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
              <CustomText>Modo Escuro</CustomText>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{
                false: switchTrackColor,
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
                styles.settingItemWithBorder,
                {
                  borderBottomColor: borderColor,
                  borderBottomWidth:
                    index === profileOptions.length - 1 ? 0 : 1,
                },
              ]}
            >
              <View style={styles.settingLeft}>
                {option.icon}
                <CustomText>{option.title}</CustomText>
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
              backgroundColor: logoutButtonBg,
              borderColor: iconColor,
            },
          ]}
          onPress={() => console.log("Logout pressed")}
        >
          <LogOut size={18} color={iconColor} />
          <CustomText>Sair da Conta</CustomText>
        </TouchableOpacity>
      </View>
    </>
  );
}
