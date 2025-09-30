import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowDown,
  ArrowUp,
  ArrowLeftRight,
  CreditCard,
  DollarSign,
  ChevronDown,
  Upload,
  ShoppingBag,
  Car,
  Utensils,
  Heart,
  GraduationCap,
  Tv,
  Home,
  Briefcase,
  TrendingUp,
  Plane,
  MoreHorizontal,
  X,
  Check,
} from "lucide-react-native";
import { useTheme } from "../../../../hooks/useTheme";
import { useToast } from "../../../../hooks/useToast";
import {
  type CreateTransactionData,
  type Transaction,
  type TransactionCategory,
} from "../../../../lib/transactions";
import { MoneyUtils } from "../../../../utils/money.utils";
import type { BankAccount } from "../../../../hooks/useAuth";

interface TransactionFormData {
  transaction_type: "deposit" | "withdrawal" | "transfer" | "payment" | "fee";
  amount: string;
  description: string;
  to_account_number?: string;
  category: TransactionCategory;
  sender_name: string;
  receipt_file?: ImagePicker.ImagePickerAsset | null;
}

interface NewTransactionFormProps {
  primaryAccount: BankAccount | null | undefined;
  bankAccounts: BankAccount[] | undefined;
  isCreating: boolean;
  onCreateTransaction: (data: CreateTransactionData) => Promise<any>;
  // Props para modo de edição
  isEditing?: boolean;
  editingTransaction?: Transaction | null;
  isUpdating?: boolean;
  onUpdateTransaction?: (
    transactionId: string,
    data: Partial<CreateTransactionData>
  ) => Promise<any>;
  onCancelEdit?: () => void;
}

// Categorias de transação para o dropdown (sem a opção "todos")
const TRANSACTION_CATEGORIES: { label: string; value: TransactionCategory }[] =
  [
    { label: "Alimentação", value: "alimentacao" },
    { label: "Transporte", value: "transporte" },
    { label: "Saúde", value: "saude" },
    { label: "Educação", value: "educacao" },
    { label: "Entretenimento", value: "entretenimento" },
    { label: "Compras", value: "compras" },
    { label: "Casa", value: "casa" },
    { label: "Trabalho", value: "trabalho" },
    { label: "Investimentos", value: "investimentos" },
    { label: "Viagem", value: "viagem" },
    { label: "Outros", value: "outros" },
  ];

// Tipos de transação para o dropdown
const TRANSACTION_TYPES = [
  { label: "Depósito", value: "deposit" },
  { label: "Saque", value: "withdrawal" },
  { label: "Transferência", value: "transfer" },
  { label: "Pagamento", value: "payment" },
  { label: "Taxa", value: "fee" },
];

export function NewTransactionForm({
  primaryAccount,
  bankAccounts,
  isCreating,
  onCreateTransaction,
  isEditing = false,
  editingTransaction = null,
  isUpdating = false,
  onUpdateTransaction,
  onCancelEdit,
}: NewTransactionFormProps) {
  // Função para encontrar conta por ID (para modo de edição)
  const findAccountById = (accountId?: string) => {
    if (!accountId) return null;
    return bankAccounts?.find((account) => account.id === accountId);
  };

  // Função para inicializar dados do formulário
  const getInitialFormData = (): TransactionFormData => {
    if (isEditing && editingTransaction) {
      // Encontrar conta de destino para obter o número
      const toAccount = findAccountById(editingTransaction.to_account_id);
      const amount = editingTransaction.amount;
      return {
        transaction_type: editingTransaction.transaction_type,
        amount: amount.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        description: editingTransaction.description || "",
        to_account_number: toAccount?.account_number || "",
        category: editingTransaction.category || "outros",
        sender_name: editingTransaction.sender_name || "",
        receipt_file: null, // No edit mode, no file is selected initially
      };
    }

    return {
      transaction_type: "deposit",
      amount: "",
      description: "",
      to_account_number: "",
      category: "outros",
      sender_name: "",
      receipt_file: null,
    };
  };

  // Estado do formulário
  const [formData, setFormData] = useState<TransactionFormData>(
    getInitialFormData()
  );

  const [errors, setErrors] = useState<
    Partial<Record<keyof TransactionFormData, string>>
  >({});

  // Estados para modais
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  // Efeito para atualizar formulário quando transação em edição mudar
  useEffect(() => {
    setFormData(getInitialFormData());
    setErrors({}); // Limpar erros ao trocar de transação
  }, [editingTransaction, isEditing]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TransactionFormData, string>> = {};

    // Validar valor usando MoneyUtils para parsing correto
    const amountInCents = MoneyUtils.parseCurrencyToCents(formData.amount);
    const amount = MoneyUtils.centsToReais(amountInCents);
    if (!formData.amount || amount <= 0) {
      newErrors.amount = "Valor deve ser um número positivo";
    }

    // Validar descrição
    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }

    // Validar conta de destino para transferências (opcional)
    // Conta de destino agora é opcional para transferências

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função para formatar valor em moeda (para entrada do usuário)
  const formatCurrency = (value: string): string => {
    // Remove tudo que não é dígito
    const cleanValue = value.replace(/\D/g, "");

    // Converte para número e formata
    const numberValue = parseInt(cleanValue || "0") / 100;

    return numberValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Função para lidar com mudanças no campo de valor
  const handleAmountChange = (value: string) => {
    const formatted = formatCurrency(value);
    setFormData((prev) => ({ ...prev, amount: formatted }));

    // Limpar erro se houver
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: undefined }));
    }
  };

  // Função para buscar conta por número
  const findAccountByNumber = (accountNumber: string) => {
    return bankAccounts?.find(
      (account) => account.account_number === accountNumber
    );
  };

  // Função para mostrar opções de imagem (câmera ou galeria)
  const handleImagePick = async () => {
    Alert.alert("Selecionar Comprovante", "Escolha uma opção:", [
      { text: "Cancelar", style: "cancel" },
      { text: "Câmera", onPress: () => handleCameraPick() },
      { text: "Galeria", onPress: () => handleLibraryPick() },
    ]);
  };

  // Função para tirar foto da câmera
  const handleCameraPick = async () => {
    try {
      console.log("📷 Iniciando função de câmera...");
      console.log("📱 ImagePicker disponível:", !!ImagePicker);
      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!cameraPermission.granted) {
        showInfo({
          title: "Permissão necessária",
          message: "Precisamos da permissão para acessar sua câmera.",
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Reduzir qualidade para menor tamanho
        exif: false, // Remover metadados EXIF para reduzir tamanho
        base64: false, // Não precisamos de base64 aqui
        // Configurações para otimizar o upload
        selectionLimit: 1,
        preferredAssetRepresentationMode:
          ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Verificar tamanho do arquivo
        const fileSizeKB = asset.fileSize ? asset.fileSize / 1024 : 0;
        console.log(`📊 Tamanho da imagem: ${fileSizeKB.toFixed(1)}KB`);

        if (fileSizeKB > 5000) {
          // 5MB
          showInfo({
            title: "Arquivo muito grande",
            message:
              "Por favor, tire uma foto com menor resolução ou use uma imagem menor que 5MB.",
          });
          return;
        }

        setFormData((prev) => ({
          ...prev,
          receipt_file: asset,
        }));

        showInfo({
          title: "Foto capturada",
          message: "Comprovante adicionado com sucesso!",
        });
      }
    } catch (error) {
      console.error("Erro ao tirar foto:", error);
      showError({
        title: "Erro na câmera",
        message:
          "Não foi possível tirar a foto. Verifique as permissões e tente novamente.",
      });
    }
  };

  // Função para selecionar da galeria
  const handleLibraryPick = async () => {
    try {
      console.log("🖼️ Iniciando função de galeria...");
      console.log("📱 ImagePicker disponível:", !!ImagePicker);
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showInfo({
          title: "Permissão necessária",
          message:
            "Precisamos da permissão para acessar sua biblioteca de imagens.",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Reduzir qualidade para menor tamanho
        exif: false, // Remover metadados EXIF
        base64: false, // Não precisamos de base64
        // Configurações para otimizar o upload
        selectionLimit: 1,
        preferredAssetRepresentationMode:
          ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Verificar tamanho do arquivo
        const fileSizeKB = asset.fileSize ? asset.fileSize / 1024 : 0;
        console.log(`📊 Tamanho da imagem: ${fileSizeKB.toFixed(1)}KB`);

        if (fileSizeKB > 5000) {
          // 5MB
          showInfo({
            title: "Arquivo muito grande",
            message:
              "Por favor, selecione uma imagem menor que 5MB ou edite-a para reduzir o tamanho.",
          });
          return;
        }

        setFormData((prev) => ({
          ...prev,
          receipt_file: asset,
        }));

        showInfo({
          title: "Imagem selecionada",
          message: "Comprovante adicionado com sucesso!",
        });
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error);
      showError({
        title: "Erro na galeria",
        message:
          "Não foi possível selecionar a imagem. Verifique as permissões e tente novamente.",
      });
    }
  };

  // Função para submeter o formulário
  const handleSubmit = () => {
    if (!validateForm()) {
      validationError("Verifique os campos obrigatórios");
      return;
    }

    if (!primaryAccount) {
      showError({
        title: "Conta Bancária",
        message: "Nenhuma conta bancária encontrada!",
      });
      return;
    }

    try {
      // Converter valor string para número usando MoneyUtils
      const amountInCents = MoneyUtils.parseCurrencyToCents(formData.amount);
      const amount = MoneyUtils.centsToReais(amountInCents);

      // Preparar dados da transação (amount já em reais, será convertido no service)
      const transactionData: CreateTransactionData = {
        transaction_type: formData.transaction_type,
        amount, // Valor em reais - será convertido para centavos no service
        description: formData.description,
        from_account_id: primaryAccount.id,
        category: formData.category,
        sender_name: formData.sender_name.trim() || undefined,
        receipt_file: formData.receipt_file || undefined,
      };

      // Para transferências, buscar conta de destino
      if (
        formData.transaction_type === "transfer" &&
        formData.to_account_number
      ) {
        const toAccount = findAccountByNumber(formData.to_account_number);
        if (!toAccount) {
          showError({
            title: "Conta não encontrada",
            message: "A conta de destino informada não foi encontrada",
          });
          return;
        }
        transactionData.to_account_id = toAccount.id;
      }

      if (isEditing && editingTransaction && onUpdateTransaction) {
        // Modo de edição - atualizar transação existente
        onUpdateTransaction(editingTransaction.id, transactionData)
          .then(() => {
            // Chamar callback de cancelar edição para voltar ao modo normal
            if (onCancelEdit) {
              onCancelEdit();
            }
          })
          .catch((error) => {
            console.error("Erro ao atualizar transação:", error);
            transactionError(
              "Não foi possível atualizar a transação. Tente novamente."
            );
          });
      } else {
        // Modo de criação - criar nova transação
        onCreateTransaction(transactionData)
          .then(() => {
            // Limpar formulário após sucesso
            setFormData({
              transaction_type: "deposit",
              amount: "",
              description: "",
              to_account_number: "",
              category: "outros",
              sender_name: "",
              receipt_file: null,
            });
            setErrors({});
          })
          .catch((error) => {
            console.error("Erro ao criar transação:", error);

            // Tratar erros específicos de upload
            if (
              error.message &&
              error.message.includes("Network request failed")
            ) {
              showError({
                title: "Problema de Conectividade",
                message:
                  "A transação foi criada, mas houve problema no upload do comprovante. Verifique sua conexão e tente anexar o comprovante editando a transação.",
                duration: 8000,
              });
            } else if (error.message && error.message.includes("upload")) {
              showError({
                title: "Erro no Upload",
                message:
                  "A transação foi criada com sucesso, mas não foi possível anexar o comprovante. Você pode tentar novamente editando a transação.",
                duration: 6000,
              });
            } else {
              transactionError(
                "Não foi possível criar a transação. Tente novamente."
              );
            }
          });
      }
    } catch (error) {
      console.error("Erro ao processar transação:", error);
      transactionError(
        "Ocorreu um erro ao processar a transação. Tente novamente."
      );
    }
  };

  // Função para lidar com mudanças nos campos
  const handleInputChange = (
    field: keyof TransactionFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpar erro específico
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Cores com base no tema
  const { isDark } = useTheme();
  const { showInfo, showError, validationError, transactionError } = useToast();

  // Cores dinâmicas com base no tema
  const colors = {
    background: isDark ? "#1f1f1f" : "#ffffff",
    cardBackground: isDark ? "#2d2d2d" : "#f8f8f8",
    border: isDark ? "#3d3d3d" : "#e5e5e5",
    text: isDark ? "#f0f0f0" : "#202020",
    textSecondary: isDark ? "#b0b0b0" : "#505050",
    primary: "#0284c7", // azul comum para ambos temas
    error: "#ef4444",
    placeholder: isDark ? "#6b6b6b" : "#a0a0a0",
    highlight: isDark ? "#3b82f6" : "#60a5fa",
    inputBackground: isDark ? "#3a3a3a" : "#ffffff",
  };

  // Ícone com base no tipo de transação
  const getTransactionIcon = () => {
    switch (formData.transaction_type) {
      case "deposit":
        return <ArrowDown color={colors.primary} size={20} />;
      case "withdrawal":
        return <ArrowUp color={colors.primary} size={20} />;
      case "transfer":
        return <ArrowLeftRight color={colors.primary} size={20} />;
      case "payment":
        return <CreditCard color={colors.primary} size={20} />;
      case "fee":
        return <DollarSign color={colors.primary} size={20} />;
      default:
        return <DollarSign color={colors.primary} size={20} />;
    }
  };

  // Ícone com base na categoria
  const getCategoryIcon = () => {
    switch (formData.category) {
      case "alimentacao":
        return <Utensils color={colors.primary} size={20} />;
      case "transporte":
        return <Car color={colors.primary} size={20} />;
      case "saude":
        return <Heart color={colors.primary} size={20} />;
      case "educacao":
        return <GraduationCap color={colors.primary} size={20} />;
      case "entretenimento":
        return <Tv color={colors.primary} size={20} />;
      case "compras":
        return <ShoppingBag color={colors.primary} size={20} />;
      case "casa":
        return <Home color={colors.primary} size={20} />;
      case "trabalho":
        return <Briefcase color={colors.primary} size={20} />;
      case "investimentos":
        return <TrendingUp color={colors.primary} size={20} />;
      case "viagem":
        return <Plane color={colors.primary} size={20} />;
      default:
        return <MoreHorizontal color={colors.primary} size={20} />;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.scrollContainer}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.cardBackground,
              borderColor: isEditing ? colors.highlight : colors.border,
            },
          ]}
        >
          {/* Cabeçalho */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {isEditing ? "Editar Transação" : "Nova Transação"}
            </Text>

            {/* Botão para cancelar edição */}
            {isEditing && onCancelEdit && (
              <TouchableOpacity
                onPress={onCancelEdit}
                style={styles.cancelButton}
              >
                <Text style={{ color: colors.textSecondary }}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Indicador de modo de edição */}
          {isEditing && editingTransaction && (
            <View
              style={[
                styles.editingIndicator,
                {
                  backgroundColor: isDark ? "#172554" : "#dbeafe",
                  borderColor: isDark ? "#2563eb" : "#93c5fd",
                },
              ]}
            >
              <Text
                style={[
                  styles.editingText,
                  { color: isDark ? "#bfdbfe" : "#1e40af" },
                ]}
              >
                <Text style={styles.boldText}>Editando transação: </Text>
                {editingTransaction.id.slice(-8)}
              </Text>
            </View>
          )}

          {/* Tipo de Transação */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Tipo de Transação *
            </Text>
            <TouchableOpacity
              style={[
                styles.selectButton,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setTypeModalVisible(true)}
            >
              <View style={styles.selectContent}>
                {getTransactionIcon()}
                <Text style={[styles.selectText, { color: colors.text }]}>
                  {TRANSACTION_TYPES.find(
                    (t) => t.value === formData.transaction_type
                  )?.label || "Selecione o tipo"}
                </Text>
              </View>
              <ChevronDown color={colors.text} size={20} />
            </TouchableOpacity>

            {/* Modal de seleção de tipo */}
            <Modal
              visible={typeModalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setTypeModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View
                  style={[
                    styles.modalContent,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>
                      Tipo de Transação
                    </Text>
                    <TouchableOpacity
                      onPress={() => setTypeModalVisible(false)}
                    >
                      <X color={colors.text} size={24} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalList}>
                    {TRANSACTION_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        style={[
                          styles.modalItem,
                          formData.transaction_type === type.value && {
                            backgroundColor: isDark ? "#374151" : "#e5e7eb",
                          },
                        ]}
                        onPress={() => {
                          handleInputChange("transaction_type", type.value);
                          setTypeModalVisible(false);
                        }}
                      >
                        <Text
                          style={[styles.modalItemText, { color: colors.text }]}
                        >
                          {type.label}
                        </Text>
                        {formData.transaction_type === type.value && (
                          <Check color={colors.primary} size={20} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>
          </View>

          {/* Valor */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Valor *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: errors.amount ? colors.error : colors.border,
                  color: colors.text,
                },
              ]}
              value={formData.amount}
              onChangeText={handleAmountChange}
              placeholder="R$ 0,00"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
              maxLength={13} // Limitar tamanho para evitar entradas muito longas
            />
            {errors.amount && (
              <Text style={styles.errorText}>{errors.amount}</Text>
            )}
          </View>

          {/* Conta de Destino (apenas para transferências) */}
          {formData.transaction_type === "transfer" && (
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Conta de Destino
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.to_account_number
                      ? colors.error
                      : colors.border,
                    color: colors.text,
                  },
                ]}
                value={formData.to_account_number || ""}
                onChangeText={(text) =>
                  handleInputChange("to_account_number", text)
                }
                placeholder="Digite o número da conta (opcional)"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
              />
              {errors.to_account_number && (
                <Text style={styles.errorText}>{errors.to_account_number}</Text>
              )}
            </View>
          )}

          {/* Categoria */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Categoria *
            </Text>
            <TouchableOpacity
              style={[
                styles.selectButton,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setCategoryModalVisible(true)}
            >
              <View style={styles.selectContent}>
                {getCategoryIcon()}
                <Text style={[styles.selectText, { color: colors.text }]}>
                  {TRANSACTION_CATEGORIES.find(
                    (c) => c.value === formData.category
                  )?.label || "Selecione a categoria"}
                </Text>
              </View>
              <ChevronDown color={colors.text} size={20} />
            </TouchableOpacity>

            {/* Modal de seleção de categoria */}
            <Modal
              visible={categoryModalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setCategoryModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View
                  style={[
                    styles.modalContent,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>
                      Categoria
                    </Text>
                    <TouchableOpacity
                      onPress={() => setCategoryModalVisible(false)}
                    >
                      <X color={colors.text} size={24} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalList}>
                    {TRANSACTION_CATEGORIES.map((category) => (
                      <TouchableOpacity
                        key={category.value}
                        style={[
                          styles.modalItem,
                          formData.category === category.value && {
                            backgroundColor: isDark ? "#374151" : "#e5e7eb",
                          },
                        ]}
                        onPress={() => {
                          handleInputChange("category", category.value);
                          setCategoryModalVisible(false);
                        }}
                      >
                        <Text
                          style={[styles.modalItemText, { color: colors.text }]}
                        >
                          {category.label}
                        </Text>
                        {formData.category === category.value && (
                          <Check color={colors.primary} size={20} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>
          </View>

          {/* Remetente/Pagador */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Remetente/Pagador
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={formData.sender_name}
              onChangeText={(text) => handleInputChange("sender_name", text)}
              placeholder="Nome do remetente ou pagador (opcional)"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          {/* Descrição */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Descrição *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: errors.description
                    ? colors.error
                    : colors.border,
                  color: colors.text,
                },
              ]}
              value={formData.description}
              onChangeText={(text) => handleInputChange("description", text)}
              placeholder="Motivo da transação"
              placeholderTextColor={colors.placeholder}
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
          </View>

          {/* Comprovante de Pagamento */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Comprovante de Pagamento
            </Text>
            <TouchableOpacity
              style={[
                styles.fileUploadContainer,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                },
              ]}
              onPress={handleImagePick}
              disabled={isCreating || isUpdating}
            >
              {!formData.receipt_file ? (
                <View style={styles.fileUploadContent}>
                  <Upload color={colors.primary} size={24} />
                  <Text
                    style={[
                      styles.fileUploadText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Selecione o comprovante de pagamento
                  </Text>
                </View>
              ) : (
                <View style={styles.fileUploadContent}>
                  <Image
                    source={{ uri: formData.receipt_file.uri }}
                    style={styles.receiptThumbnail}
                  />
                  <Text style={[styles.fileUploadText, { color: colors.text }]}>
                    Comprovante selecionado
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setFormData((prev) => ({ ...prev, receipt_file: null }))
                    }
                    style={styles.removeFileButton}
                  >
                    <X color={colors.text} size={16} />
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              Anexe uma foto do comprovante para facilitar o controle das suas
              transações
            </Text>
          </View>

          {/* Botão de Submissão */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (isCreating || isUpdating) && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditing ? "Atualizar Transação" : "Efetuar Transação"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    margin: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  cancelButton: {
    padding: 8,
  },
  editingIndicator: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 6,
  },
  editingText: {
    fontSize: 14,
  },
  boldText: {
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  selectButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectText: {
    marginLeft: 8,
  },
  fileUploadContainer: {
    borderWidth: 1,
    borderRadius: 6,
    borderStyle: "dashed",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  fileUploadContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fileUploadText: {
    marginLeft: 8,
  },
  receiptThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 8,
  },
  removeFileButton: {
    marginLeft: 8,
    padding: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#0284c7",
    height: 48,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalList: {
    marginBottom: 16,
  },
  modalItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalItemText: {
    fontSize: 16,
  },
});
