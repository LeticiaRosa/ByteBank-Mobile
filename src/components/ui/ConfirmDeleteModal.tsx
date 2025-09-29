import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { AlertTriangle, X } from "lucide-react-native";
import { useTheme } from "../../hooks/useTheme";
import { getTheme } from "../../styles/theme";

interface ConfirmDeleteModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
  transactionId?: string;
}

export function ConfirmDeleteModal({
  visible,
  onConfirm,
  onCancel,
  isDeleting = false,
  transactionId = "",
}: ConfirmDeleteModalProps) {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  const styles = createStyles(isDark, theme);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <AlertTriangle size={24} color={theme.destructive} />
              <Text style={styles.title}>Confirmar Exclusão</Text>
            </View>
            <TouchableOpacity
              onPress={onCancel}
              style={styles.closeButton}
              disabled={isDeleting}
            >
              <X size={20} color={theme.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.message}>
              ⚠️ Tem certeza que deseja excluir esta transação?
            </Text>
            <Text style={styles.message}>Esta ação não pode ser desfeita.</Text>
            {/* {transactionId && (
              <Text style={styles.transactionInfo}>
                ID: {transactionId.slice(-8)}
              </Text>
            )} */}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={isDeleting}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={[styles.buttonText, styles.deleteButtonText]}>
                  Excluir
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (isDark: boolean, theme: any) => {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    modalContainer: {
      backgroundColor: theme.card,
      borderRadius: 12,
      width: "100%",
      maxWidth: 400,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.foreground,
    },
    closeButton: {
      padding: 4,
    },
    content: {
      padding: 20,
      paddingTop: 16,
      paddingBottom: 24,
    },
    message: {
      fontSize: 16,
      color: theme.foreground,
      marginBottom: 12,
      lineHeight: 24,
    },
    transactionInfo: {
      fontSize: 14,
      color: theme.mutedForeground,
      marginBottom: 16,
      fontFamily: "monospace",
    },
    warning: {
      fontSize: 14,
      color: theme.destructive,
      fontWeight: "500",
    },
    actions: {
      flexDirection: "row",
      gap: 12,
      padding: 20,
      paddingTop: 0,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 44,
    },
    cancelButton: {
      backgroundColor: isDark ? theme.muted : theme.secondary,
      borderWidth: 1,
      borderColor: theme.border,
    },
    deleteButton: {
      backgroundColor: theme.destructive,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
    },
    cancelButtonText: {
      color: theme.foreground,
    },
    deleteButtonText: {
      color: "#ffffff",
    },
  });
};
