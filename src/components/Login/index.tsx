import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  PiggyBankIcon,
} from "lucide-react-native";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";
import { getTheme } from "../../styles/theme";
import { CustomText } from "../ui/Text";
import { styles } from "./styles";

export function Login() {
  const { isDark } = useTheme();
  const { signIn, signUp, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  // Cores baseadas no theme.ts simplificado
  const theme = getTheme(isDark);
  const backgroundColor = theme.background;
  const iconColor = theme.primary;
  const inputBackgroundColor = theme.muted;
  const borderColor = theme.border;
  const primaryButtonBg = theme.primary;
  const textColor = theme.foreground;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    const result = await signIn(email, password);

    if (result.success) {
      Alert.alert("Sucesso", "Login realizado com sucesso!");
    } else {
      Alert.alert("Erro", result.error?.message || "Erro ao fazer login");
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres");
      return;
    }

    const result = await signUp(email, password, fullName);

    if (result.success) {
      Alert.alert(
        "Sucesso",
        "Conta criada com sucesso! Verifique seu email para confirmar a conta."
      );
      setIsSignUpMode(false); // Voltar para o modo login
    } else {
      Alert.alert("Erro", result.error?.message || "Erro ao criar conta");
    }
  };

  const handleForgotPassword = () => {
    Alert.alert("Recuperar Senha", "Funcionalidade em desenvolvimento");
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    // Limpar campos ao trocar de modo
    setEmail("");
    setPassword("");
    setFullName("");
  };

  return (
    <View
      style={[styles.container, { backgroundColor }]}
      className="flex-1 bg-gray-1 dark:bg-dark-background w-full h-full"
    >
      {/* Header */}
      <View
        style={[styles.header, { backgroundColor: backgroundColor }]}
        className="p-5 items-center bg-card dark:bg-dark-card"
      >
        <View
          style={[
            styles.logoContainer,
            { backgroundColor: inputBackgroundColor },
          ]}
          className="w-24 h-24 rounded-full bg-gray-3 dark:bg-dark-gray-5 justify-center items-center mb-4"
        >
          <PiggyBankIcon size={48} color={iconColor} />
        </View>
        <CustomText className="text-2xl font-bold text-card-foreground dark:text-dark-card-foreground">
          ByteBank
        </CustomText>
        <CustomText className="text-gray-11 dark:text-gray-4 text-center mt-2">
          {isSignUpMode
            ? "Crie sua conta para começar"
            : "Faça login para acessar sua conta"}
        </CustomText>
      </View>

      {/* Formulário de Login */}
      <View className="w-full px-6">
        {/* Campo Nome Completo - apenas no modo cadastro */}
        {isSignUpMode && (
          <View style={styles.inputGroup}>
            <CustomText className="font-medium text-card-foreground dark:text-dark-card-foreground mb-2">
              Nome Completo
            </CustomText>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: inputBackgroundColor,
                  borderColor: borderColor,
                },
              ]}
            >
              <User size={20} color={iconColor} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Digite seu nome completo"
                placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
          </View>
        )}

        {/* Campo Email */}
        <View style={styles.inputGroup}>
          <CustomText className="font-medium text-card-foreground dark:text-dark-card-foreground mb-2">
            Email
          </CustomText>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: inputBackgroundColor,
                borderColor: borderColor,
              },
            ]}
          >
            <User size={20} color={iconColor} />
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Digite seu email"
              placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>
        </View>

        {/* Campo Senha */}
        <View style={styles.inputGroup}>
          <CustomText className="font-medium text-card-foreground dark:text-dark-card-foreground mb-2">
            Senha
          </CustomText>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: inputBackgroundColor,
                borderColor: borderColor,
              },
            ]}
          >
            <Lock size={20} color={iconColor} />
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Digite sua senha"
              placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff size={20} color={iconColor} />
              ) : (
                <Eye size={20} color={iconColor} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Esqueceu a senha - apenas no modo login */}
        {!isSignUpMode && (
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPasswordContainer}
            disabled={loading}
          >
            <CustomText className="text-primary text-sm">
              Esqueceu sua senha?
            </CustomText>
          </TouchableOpacity>
        )}

        {/* Botão Principal */}
        <TouchableOpacity
          style={[
            styles.loginButton,
            {
              backgroundColor: primaryButtonBg,
              opacity: loading ? 0.7 : 1,
            },
          ]}
          onPress={isSignUpMode ? handleSignUp : handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <LogIn size={20} color="#ffffff" />
          )}
          <CustomText className="text-white font-semibold ml-2">
            {loading
              ? isSignUpMode
                ? "Criando conta..."
                : "Entrando..."
              : isSignUpMode
              ? "Criar Conta"
              : "Entrar"}
          </CustomText>
        </TouchableOpacity>

        {/* Alternância entre Login e Cadastro */}
        <View style={styles.signupContainer}>
          <CustomText className="text-gray-11 dark:text-gray-4">
            {isSignUpMode ? "Já tem uma conta? " : "Não tem uma conta? "}
          </CustomText>
          <TouchableOpacity onPress={toggleMode} disabled={loading}>
            <CustomText className="text-primary font-medium">
              {isSignUpMode ? "Fazer Login" : "Cadastre-se"}
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
