import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  ScrollView,
} from "react-native";
// Importar DateTimePicker para substituir o DatePicker
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../../../../hooks/useTheme";
import { getTheme, getColorScale } from "../../../../styles/theme";

export interface FilterOptions {
  dateFrom: string;
  dateTo: string;
  transactionType: string;
  status: string;
  minAmount: string;
  maxAmount: string;
  description: string;
  category: string;
  senderName: string;
}

interface ExtractFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  onReset: () => void;
}

// Categorias de transação - normalmente viria da biblioteca UI
const TRANSACTION_CATEGORIES = [
  { value: "all", label: "Todas as categorias" },
  { value: "alimentacao", label: "Alimentação" },
  { value: "transporte", label: "Transporte" },
  { value: "saude", label: "Saúde" },
  { value: "educacao", label: "Educação" },
  { value: "entretenimento", label: "Entretenimento" },
  { value: "compras", label: "Compras" },
  { value: "casa", label: "Casa" },
  { value: "trabalho", label: "Trabalho" },
  { value: "investimentos", label: "Investimentos" },
  { value: "viagem", label: "Viagem" },
  { value: "outros", label: "Outros" },
];

// Função para criar estilos dinâmicos baseados no tema
const createStyles = (isDark: boolean) => {
  const theme = getTheme(isDark);
  const colorScale = getColorScale(isDark);

  const backgroundColor = theme.card;
  const borderColor = theme.border;
  const textPrimary = theme.foreground;
  const textSecondary = colorScale.gray[11];
  const textMuted = theme.mutedForeground;
  const placeholderColor = colorScale.gray[10];
  const inputBackground = colorScale.gray[2];
  const buttonBackground = "transparent";
  const modalBackground = theme.card;
  const modalOverlayColor = isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)";
  const separatorColor = theme.border;
  const closeBtnBackground = theme.muted;

  return StyleSheet.create({
    card: {
      backgroundColor,
      borderRadius: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.2,
      shadowRadius: 3,
      elevation: 3,
      marginBottom: 16,
    },
    cardContent: {
      padding: 16,
    },
    filtersContainer: {
      gap: 16,
    },
    searchRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 8,
    },
    searchInputContainer: {
      flex: 1,
    },
    buttonRow: {
      flexDirection: "row",
      gap: 8,
      justifyContent: "flex-end",
    },
    quickFiltersRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 8,
    },
    outlineButton: {
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor,
      borderRadius: 4,
      backgroundColor: buttonBackground,
    },
    buttonText: {
      color: textPrimary,
      fontSize: 12,
    },
    input: {
      height: 44,
      borderWidth: 1,
      borderColor,
      borderRadius: 4,
      paddingHorizontal: 12,
      fontSize: 16,
      backgroundColor: inputBackground,
      color: textPrimary,
    },
    expandedFilters: {
      maxHeight: 300,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: borderColor,
    },
    expandedFiltersContent: {
      gap: 16,
      paddingBottom: 16,
    },
    formGroup: {
      marginBottom: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 4,
      color: textSecondary,
    },
    datePicker: {
      height: 44,
      borderWidth: 1,
      borderColor,
      borderRadius: 4,
      paddingHorizontal: 12,
      justifyContent: "center",
      backgroundColor: inputBackground,
    },
    dateText: {
      fontSize: 16,
      color: textPrimary,
    },
    placeholderText: {
      color: placeholderColor,
    },
    selectTrigger: {
      height: 44,
      borderWidth: 1,
      borderColor,
      borderRadius: 4,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: inputBackground,
    },
    selectValue: {
      fontSize: 16,
      color: textPrimary,
    },
    selectIcon: {
      fontSize: 12,
      color: textMuted,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: modalOverlayColor,
    },
    modalContent: {
      backgroundColor: modalBackground,
      borderRadius: 8,
      padding: 16,
      width: "80%",
      maxHeight: "70%",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 16,
      textAlign: "center",
      color: textPrimary,
    },
    modalOption: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: separatorColor,
    },
    modalOptionText: {
      fontSize: 16,
      color: textPrimary,
    },
    modalCloseButton: {
      marginTop: 16,
      paddingVertical: 12,
      backgroundColor: closeBtnBackground,
      borderRadius: 4,
      alignItems: "center",
    },
    modalCloseButtonText: {
      fontSize: 16,
      fontWeight: "500",
      color: textSecondary,
    },
    rowFlex: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
  });
};

export function ExtractFilters({
  onFilterChange,
  onReset,
}: ExtractFiltersProps) {
  const { isDark } = useTheme();
  const dynamicStyles = createStyles(isDark);
  const colorScale = getColorScale(isDark);
  const placeholderColor = colorScale.gray[10];

  const [filters, setFilters] = useState<FilterOptions>({
    dateFrom: "",
    dateTo: "",
    transactionType: "all",
    status: "all",
    minAmount: "",
    maxAmount: "",
    description: "",
    category: "all",
    senderName: "",
  });

  // Estados para controlar os modais e seleções
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);
  const [showTransactionTypeModal, setShowTransactionTypeModal] =
    useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Lista de opções para os selects
  const transactionTypeOptions = [
    { value: "all", label: "Todos os tipos" },
    { value: "deposit", label: "Depósito" },
    { value: "withdrawal", label: "Saque" },
    { value: "transfer", label: "Transferência" },
    { value: "payment", label: "Pagamento" },
    { value: "fee", label: "Taxa" },
  ];

  const statusOptions = [
    { value: "all", label: "Todos os status" },
    { value: "completed", label: "Concluída" },
    { value: "pending", label: "Pendente" },
    { value: "failed", label: "Falhou" },
    { value: "cancelled", label: "Cancelada" },
  ];

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      dateFrom: "",
      dateTo: "",
      transactionType: "all",
      status: "all",
      minAmount: "",
      maxAmount: "",
      description: "",
      category: "all",
      senderName: "",
    };
    setFilters(resetFilters);
    onReset();
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const applyQuickFilter = (days: number) => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - days);

    const newFilters = {
      ...filters,
      dateFrom: pastDate.toISOString().split("T")[0],
      dateTo: today.toISOString().split("T")[0],
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Handlers para DatePicker
  const handleDateChange = (
    event: any,
    selectedDate: Date | undefined,
    fieldName: "dateFrom" | "dateTo"
  ) => {
    const currentDate = selectedDate || new Date();

    if (fieldName === "dateFrom") {
      setShowDateFromPicker(Platform.OS === "ios");
    } else {
      setShowDateToPicker(Platform.OS === "ios");
    }

    if (selectedDate) {
      const formattedDate = currentDate.toISOString().split("T")[0];
      handleFilterChange(fieldName, formattedDate);
    }
  };

  // Componente para renderizar um selector customizado
  const CustomSelect = ({
    label,
    value,
    placeholder,
    options,
    onOpen,
  }: {
    label: string;
    value: string;
    placeholder: string;
    options: Array<{ value: string; label: string }>;
    onOpen: () => void;
  }) => {
    const selectedOption = options.find((opt) => opt.value === value);
    const displayValue = selectedOption ? selectedOption.label : placeholder;

    return (
      <View style={dynamicStyles.formGroup}>
        <Text style={dynamicStyles.label}>{label}</Text>
        <TouchableOpacity style={dynamicStyles.selectTrigger} onPress={onOpen}>
          <Text
            style={[
              dynamicStyles.selectValue,
              value === "all" || !value ? dynamicStyles.placeholderText : {},
            ]}
          >
            {displayValue}
          </Text>
          <Text style={dynamicStyles.selectIcon}>▼</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Modal para seleção de opções
  const SelectModal = ({
    visible,
    title,
    options,
    onSelect,
    onClose,
  }: {
    visible: boolean;
    title: string;
    options: Array<{ value: string; label: string }>;
    onSelect: (value: string) => void;
    onClose: () => void;
  }) => (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={dynamicStyles.modalOverlay}>
        <View style={dynamicStyles.modalContent}>
          <Text style={dynamicStyles.modalTitle}>{title}</Text>
          <ScrollView>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={dynamicStyles.modalOption}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                <Text style={dynamicStyles.modalOptionText}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={dynamicStyles.modalCloseButton}
            onPress={onClose}
          >
            <Text style={dynamicStyles.modalCloseButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={dynamicStyles.card}>
      <View style={dynamicStyles.cardContent}>
        <View style={dynamicStyles.filtersContainer}>
          {/* Campo de busca e botões de expansão/limpeza */}
          <View style={dynamicStyles.searchRow}>
            <View style={dynamicStyles.searchInputContainer}>
              <TextInput
                style={dynamicStyles.input}
                placeholder="Buscar por descrição..."
                placeholderTextColor={placeholderColor}
                value={filters.description}
                onChangeText={(text) => handleFilterChange("description", text)}
              />
            </View>
          </View>

          {/* Filtros rápidos */}
          <View style={dynamicStyles.quickFiltersRow}>
            <TouchableOpacity
              style={dynamicStyles.outlineButton}
              onPress={() => applyQuickFilter(7)}
            >
              <Text style={dynamicStyles.buttonText}>Últimos 7 dias</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.outlineButton}
              onPress={() => applyQuickFilter(30)}
            >
              <Text style={dynamicStyles.buttonText}>Últimos 30 dias</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.outlineButton}
              onPress={() => applyQuickFilter(90)}
            >
              <Text style={dynamicStyles.buttonText}>Últimos 90 dias</Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.buttonRow}>
            <TouchableOpacity
              style={dynamicStyles.outlineButton}
              onPress={() => setIsExpanded(!isExpanded)}
            >
              <Text style={dynamicStyles.buttonText}>
                {isExpanded ? "Menos Filtros" : "Mais Filtros"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.outlineButton}
              onPress={handleReset}
            >
              <Text style={dynamicStyles.buttonText}>Limpar</Text>
            </TouchableOpacity>
          </View>

          {/* Filtros expandidos */}
          {isExpanded && (
            <ScrollView
              style={dynamicStyles.expandedFilters}
              contentContainerStyle={dynamicStyles.expandedFiltersContent}
            >
              {/* Date pickers */}
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.label}>Data inicial</Text>
                <TouchableOpacity
                  style={dynamicStyles.datePicker}
                  onPress={() => setShowDateFromPicker(true)}
                >
                  <Text
                    style={
                      filters.dateFrom
                        ? dynamicStyles.dateText
                        : dynamicStyles.placeholderText
                    }
                  >
                    {filters.dateFrom
                      ? formatDisplayDate(filters.dateFrom)
                      : "Selecionar data inicial"}
                  </Text>
                </TouchableOpacity>
                {showDateFromPicker && (
                  <DateTimePicker
                    value={
                      filters.dateFrom ? new Date(filters.dateFrom) : new Date()
                    }
                    mode="date"
                    display="default"
                    onChange={(event, date) =>
                      handleDateChange(event, date, "dateFrom")
                    }
                    maximumDate={new Date()}
                  />
                )}
              </View>

              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.label}>Data final</Text>
                <TouchableOpacity
                  style={dynamicStyles.datePicker}
                  onPress={() => setShowDateToPicker(true)}
                >
                  <Text
                    style={
                      filters.dateTo
                        ? dynamicStyles.dateText
                        : dynamicStyles.placeholderText
                    }
                  >
                    {filters.dateTo
                      ? formatDisplayDate(filters.dateTo)
                      : "Selecionar data final"}
                  </Text>
                </TouchableOpacity>
                {showDateToPicker && (
                  <DateTimePicker
                    value={
                      filters.dateTo ? new Date(filters.dateTo) : new Date()
                    }
                    mode="date"
                    display="default"
                    onChange={(event, date) =>
                      handleDateChange(event, date, "dateTo")
                    }
                    maximumDate={new Date()}
                  />
                )}
              </View>

              {/* Tipo de transação */}
              <CustomSelect
                label="Tipo"
                value={filters.transactionType}
                placeholder="Todos os tipos"
                options={transactionTypeOptions}
                onOpen={() => setShowTransactionTypeModal(true)}
              />

              {/* Status */}
              <CustomSelect
                label="Status"
                value={filters.status}
                placeholder="Todos os status"
                options={statusOptions}
                onOpen={() => setShowStatusModal(true)}
              />

              {/* Categoria */}
              <CustomSelect
                label="Categoria"
                value={filters.category}
                placeholder="Todas as categorias"
                options={TRANSACTION_CATEGORIES}
                onOpen={() => setShowCategoryModal(true)}
              />

              {/* Remetente */}
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.label}>Remetente</Text>
                <TextInput
                  style={dynamicStyles.input}
                  placeholder="Nome do remetente..."
                  placeholderTextColor={placeholderColor}
                  value={filters.senderName}
                  onChangeText={(text) =>
                    handleFilterChange("senderName", text)
                  }
                />
              </View>

              {/* Valor mínimo */}
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.label}>Valor mínimo</Text>
                <TextInput
                  style={dynamicStyles.input}
                  placeholder="R$ 0,00"
                  placeholderTextColor={placeholderColor}
                  value={filters.minAmount}
                  keyboardType="numeric"
                  onChangeText={(text) => handleFilterChange("minAmount", text)}
                />
              </View>

              {/* Valor máximo */}
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.label}>Valor máximo</Text>
                <TextInput
                  style={dynamicStyles.input}
                  placeholder="R$ 0,00"
                  placeholderTextColor={placeholderColor}
                  value={filters.maxAmount}
                  keyboardType="numeric"
                  onChangeText={(text) => handleFilterChange("maxAmount", text)}
                />
              </View>
            </ScrollView>
          )}
        </View>
      </View>

      {/* Modais de seleção */}
      <SelectModal
        visible={showTransactionTypeModal}
        title="Selecione o tipo de transação"
        options={transactionTypeOptions}
        onSelect={(value) => handleFilterChange("transactionType", value)}
        onClose={() => setShowTransactionTypeModal(false)}
      />

      <SelectModal
        visible={showStatusModal}
        title="Selecione o status"
        options={statusOptions}
        onSelect={(value) => handleFilterChange("status", value)}
        onClose={() => setShowStatusModal(false)}
      />

      <SelectModal
        visible={showCategoryModal}
        title="Selecione a categoria"
        options={TRANSACTION_CATEGORIES}
        onSelect={(value) => handleFilterChange("category", value)}
        onClose={() => setShowCategoryModal(false)}
      />
    </View>
  );
}
