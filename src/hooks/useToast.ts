import { useCallback } from "react";
import Toast from "react-native-toast-message";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  title?: string;
  message: string;
  duration?: number;
  position?: "top" | "bottom";
  onPress?: () => void;
  onHide?: () => void;
}

/**
 * Hook customizado para exibir mensagens toast padronizadas no app
 * Centraliza a configuração e comportamento dos toasts
 */
export function useToast() {
  /**
   * Exibe toast de sucesso
   * Usado para confirmar ações bem-sucedidas
   */
  const showSuccess = useCallback((options: ToastOptions) => {
    const {
      title = "Sucesso",
      message,
      duration = 3000,
      position = "top",
      onPress,
      onHide,
    } = options;

    Toast.show({
      type: "success",
      text1: title,
      text2: message,
      position,
      visibilityTime: duration,
      autoHide: true,
      topOffset: 60,
      bottomOffset: 40,
      onPress,
      onHide,
    });
  }, []);

  /**
   * Exibe toast de erro
   * Usado para mostrar falhas e problemas
   */
  const showError = useCallback((options: ToastOptions) => {
    const {
      title = "Erro",
      message,
      duration = 4000,
      position = "top",
      onPress,
      onHide,
    } = options;

    Toast.show({
      type: "error",
      text1: title,
      text2: message,
      position,
      visibilityTime: duration,
      autoHide: true,
      topOffset: 60,
      bottomOffset: 40,
      onPress,
      onHide,
    });
  }, []);

  /**
   * Exibe toast de informação
   * Usado para notificações gerais e dicas
   */
  const showInfo = useCallback((options: ToastOptions) => {
    const {
      title = "Informação",
      message,
      duration = 3000,
      position = "top",
      onPress,
      onHide,
    } = options;

    Toast.show({
      type: "info",
      text1: title,
      text2: message,
      position,
      visibilityTime: duration,
      autoHide: true,
      topOffset: 60,
      bottomOffset: 40,
      onPress,
      onHide,
    });
  }, []);

  /**
   * Exibe toast de aviso
   * Usado para alertas e situações que requerem atenção
   */
  const showWarning = useCallback((options: ToastOptions) => {
    const {
      title = "Atenção",
      message,
      duration = 3500,
      position = "top",
      onPress,
      onHide,
    } = options;

    Toast.show({
      type: "info", // Toast message não tem tipo 'warning' nativo, usa 'info' com título customizado
      text1: title,
      text2: message,
      position,
      visibilityTime: duration,
      autoHide: true,
      topOffset: 60,
      bottomOffset: 40,
      onPress,
      onHide,
    });
  }, []);

  /**
   * Exibe toast customizado com tipo específico
   */
  const showToast = useCallback(
    (type: ToastType, options: ToastOptions) => {
      switch (type) {
        case "success":
          showSuccess(options);
          break;
        case "error":
          showError(options);
          break;
        case "info":
          showInfo(options);
          break;
        case "warning":
          showWarning(options);
          break;
        default:
          showInfo(options);
      }
    },
    [showSuccess, showError, showInfo, showWarning]
  );

  /**
   * Oculta todos os toasts ativos
   */
  const hideToast = useCallback(() => {
    Toast.hide();
  }, []);

  /**
   * Métodos de conveniência para casos específicos do app bancário
   */
  const bankingToasts = {
    /**
     * Sucesso em operações financeiras
     */
    transactionSuccess: (message: string) => {
      showSuccess({
        title: "Transação Realizada",
        message,
        duration: 4000,
      });
    },

    /**
     * Erro em operações financeiras
     */
    transactionError: (message: string) => {
      showError({
        title: "Falha na Transação",
        message,
        duration: 5000,
      });
    },

    /**
     * Sucesso em autenticação
     */
    authSuccess: (message: string) => {
      showSuccess({
        title: "Login Realizado",
        message,
        duration: 2500,
      });
    },

    /**
     * Erro em autenticação
     */
    authError: (message: string) => {
      showError({
        title: "Erro de Autenticação",
        message,
        duration: 4000,
      });
    },

    /**
     * Informações sobre conta bancária
     */
    accountInfo: (message: string) => {
      showInfo({
        title: "Conta Bancária",
        message,
        duration: 3500,
      });
    },

    /**
     * Avisos sobre segurança
     */
    securityWarning: (message: string) => {
      showWarning({
        title: "Segurança",
        message,
        duration: 5000,
      });
    },

    /**
     * Conectividade e sincronização
     */
    networkInfo: (message: string) => {
      showInfo({
        title: "Conectividade",
        message,
        duration: 3000,
      });
    },

    /**
     * Validação de campos
     */
    validationError: (message: string) => {
      showError({
        title: "Dados Inválidos",
        message,
        duration: 3000,
      });
    },
  };

  return {
    // Métodos básicos
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showToast,
    hideToast,

    // Métodos específicos para operações bancárias
    ...bankingToasts,
  };
}
