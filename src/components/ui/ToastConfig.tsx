import { ToastConfig, BaseToast, ErrorToast } from "react-native-toast-message";

/**
 * Configuração customizada para os toasts
 * Deve ser usada no App.tsx ou componente raiz
 */
export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#22c55e",
        borderLeftWidth: 5,
        backgroundColor: "#ffffff",
        marginHorizontal: 16,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "600",
        color: "#1f2937",
      }}
      text2Style={{
        fontSize: 14,
        fontWeight: "400",
        color: "#6b7280",
        lineHeight: 18,
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#ef4444",
        borderLeftWidth: 5,
        backgroundColor: "#ffffff",
        marginHorizontal: 16,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "600",
        color: "#1f2937",
      }}
      text2Style={{
        fontSize: 14,
        fontWeight: "400",
        color: "#6b7280",
        lineHeight: 18,
      }}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#3b82f6",
        borderLeftWidth: 5,
        backgroundColor: "#ffffff",
        marginHorizontal: 16,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "600",
        color: "#1f2937",
      }}
      text2Style={{
        fontSize: 14,
        fontWeight: "400",
        color: "#6b7280",
        lineHeight: 18,
      }}
    />
  ),
};
