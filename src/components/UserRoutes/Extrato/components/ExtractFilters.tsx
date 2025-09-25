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

// Estilos para o componente
const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
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
    borderColor: "#d1d5db",
    borderRadius: 4,
    backgroundColor: "transparent",
  },
  buttonText: {
    color: "#1f2937",
    fontSize: 12,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  expandedFilters: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 16,
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    color: "#374151",
  },
  datePicker: {
    height: 44,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#1f2937",
  },
  placeholderText: {
    color: "#9ca3af",
  },
  selectTrigger: {
    height: 44,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectValue: {
    fontSize: 16,
    color: "#1f2937",
  },
  selectIcon: {
    fontSize: 12,
    color: "#6b7280",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
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
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalOptionText: {
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    alignItems: "center",
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  rowFlex: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});

export function ExtractFilters({
  onFilterChange,
  onReset,
}: ExtractFiltersProps) {
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

  const getToday = () => {
    return new Date().toISOString().split("T")[0];
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

  // Funções auxiliares para selects
  const getLabelForValue = (
    value: string,
    options: Array<{ value: string; label: string }>
  ) => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value;
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
      <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity style={styles.selectTrigger} onPress={onOpen}>
          <Text
            style={[
              styles.selectValue,
              value === "all" || !value ? styles.placeholderText : {},
            ]}
          >
            {displayValue}
          </Text>
          <Text style={styles.selectIcon}>▼</Text>
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.modalOption}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                <Text style={styles.modalOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.filtersContainer}>
          {/* Campo de busca e botões de expansão/limpeza */}
          <View style={styles.searchRow}>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Buscar por descrição..."
                value={filters.description}
                onChangeText={(text) => handleFilterChange("description", text)}
              />
            </View>
          </View>

          {/* Filtros rápidos */}
          <View style={styles.quickFiltersRow}>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => applyQuickFilter(7)}
            >
              <Text style={styles.buttonText}>Últimos 7 dias</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => applyQuickFilter(30)}
            >
              <Text style={styles.buttonText}>Últimos 30 dias</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => applyQuickFilter(90)}
            >
              <Text style={styles.buttonText}>Últimos 90 dias</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => setIsExpanded(!isExpanded)}
            >
              <Text style={styles.buttonText}>
                {isExpanded ? "Menos Filtros" : "Mais Filtros"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={handleReset}
            >
              <Text style={styles.buttonText}>Limpar</Text>
            </TouchableOpacity>
          </View>

          {/* Filtros expandidos */}
          {isExpanded && (
            <View style={styles.expandedFilters}>
              {/* Date pickers */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Data inicial</Text>
                <TouchableOpacity
                  style={styles.datePicker}
                  onPress={() => setShowDateFromPicker(true)}
                >
                  <Text
                    style={
                      filters.dateFrom
                        ? styles.dateText
                        : styles.placeholderText
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

              <View style={styles.formGroup}>
                <Text style={styles.label}>Data final</Text>
                <TouchableOpacity
                  style={styles.datePicker}
                  onPress={() => setShowDateToPicker(true)}
                >
                  <Text
                    style={
                      filters.dateTo ? styles.dateText : styles.placeholderText
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
              <View style={styles.formGroup}>
                <Text style={styles.label}>Remetente</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome do remetente..."
                  value={filters.senderName}
                  onChangeText={(text) =>
                    handleFilterChange("senderName", text)
                  }
                />
              </View>

              {/* Valor mínimo */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Valor mínimo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="R$ 0,00"
                  value={filters.minAmount}
                  keyboardType="numeric"
                  onChangeText={(text) => handleFilterChange("minAmount", text)}
                />
              </View>

              {/* Valor máximo */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Valor máximo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="R$ 0,00"
                  value={filters.maxAmount}
                  keyboardType="numeric"
                  onChangeText={(text) => handleFilterChange("maxAmount", text)}
                />
              </View>
            </View>
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
