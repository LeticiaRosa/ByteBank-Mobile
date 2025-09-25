import { View, Text, TouchableOpacity } from "react-native";
import { Transaction } from "../../../../lib/transactions";

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transactionId: string) => void;
  onProcess?: (transactionId: string, action: "complete" | "fail") => void;
}

export function TransactionItem({
  transaction,
  onEdit,
  onDelete,
  onProcess,
}: TransactionItemProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getTransactionTypeLabel = (type: string) => {
    const types = {
      deposit: "Depósito",
      withdrawal: "Saque",
      transfer: "Transferência",
      payment: "Pagamento",
      fee: "Taxa",
    };
    return types[type as keyof typeof types] || type;
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      alimentacao: "Alimentação",
      transporte: "Transporte",
      saude: "Saúde",
      educacao: "Educação",
      entretenimento: "Entretenimento",
      compras: "Compras",
      casa: "Casa",
      trabalho: "Trabalho",
      investimentos: "Investimentos",
      viagem: "Viagem",
      outros: "Outros",
    };
    return categories[category as keyof typeof categories] || category;
  };

  // Removemos os métodos de cores de estilo baseados em classes CSS
  // já que agora estamos usando estilos inline do React Native

  const getAmountPrefix = (type: string) => {
    return type === "deposit" ? "+" : "-";
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={{
        backgroundColor: "white",
        borderRadius: 12,
        marginVertical: 8,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={() => onEdit && onEdit(transaction)}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", flex: 1, gap: 16 }}>
          {/* Ícone do tipo de transação */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#f4f4f5",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {transaction.transaction_type === "deposit" && (
              <Text style={{ fontSize: 20, color: "#16a34a" }}>↑</Text>
            )}
            {transaction.transaction_type === "withdrawal" && (
              <Text style={{ fontSize: 20, color: "#dc2626" }}>↓</Text>
            )}
            {transaction.transaction_type === "transfer" && (
              <Text style={{ fontSize: 20, color: "#2563eb" }}>→</Text>
            )}
            {transaction.transaction_type === "payment" && (
              <Text style={{ fontSize: 20, color: "#ea580c" }}>$</Text>
            )}
            {transaction.transaction_type === "fee" && (
              <Text style={{ fontSize: 20, color: "#71717a" }}>!</Text>
            )}
          </View>

          {/* Informações da transação */}
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 12,
                  backgroundColor:
                    transaction.transaction_type === "deposit"
                      ? "#dcfce7"
                      : transaction.transaction_type === "withdrawal" ||
                        transaction.transaction_type === "fee"
                      ? "#fee2e2"
                      : transaction.transaction_type === "transfer"
                      ? "#dbeafe"
                      : "#ffedd5",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color:
                      transaction.transaction_type === "deposit"
                        ? "#16a34a"
                        : transaction.transaction_type === "withdrawal" ||
                          transaction.transaction_type === "fee"
                        ? "#dc2626"
                        : transaction.transaction_type === "transfer"
                        ? "#2563eb"
                        : "#ea580c",
                  }}
                >
                  {getTransactionTypeLabel(transaction.transaction_type)}
                </Text>
              </View>

              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 12,
                  backgroundColor: "#dbeafe",
                }}
              >
                <Text
                  style={{ fontSize: 12, fontWeight: "600", color: "#1e40af" }}
                >
                  {getCategoryLabel(transaction.category)}
                </Text>
              </View>

              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  backgroundColor:
                    transaction.status === "completed"
                      ? "#dcfce7"
                      : transaction.status === "pending"
                      ? "#fef9c3"
                      : transaction.status === "failed"
                      ? "#fee2e2"
                      : "#f4f4f5",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color:
                      transaction.status === "completed"
                        ? "#16a34a"
                        : transaction.status === "pending"
                        ? "#ca8a04"
                        : transaction.status === "failed"
                        ? "#dc2626"
                        : "#71717a",
                  }}
                >
                  {transaction.status === "completed" && "Concluída"}
                  {transaction.status === "pending" && "Pendente"}
                  {transaction.status === "failed" && "Falhou"}
                  {transaction.status === "cancelled" && "Cancelada"}
                </Text>
              </View>
            </View>

            <Text style={{ fontSize: 16, fontWeight: "500", color: "#18181b" }}>
              {transaction.description || "Sem descrição"}
            </Text>

            {transaction.sender_name && (
              <Text style={{ fontSize: 14, color: "#71717a" }}>
                <Text style={{ fontWeight: "500" }}>Remetente:</Text>{" "}
                {transaction.sender_name}
              </Text>
            )}

            <Text style={{ fontSize: 14, color: "#71717a", marginTop: 4 }}>
              {formatDate(transaction.created_at)}
            </Text>

            {transaction.reference_number && (
              <Text style={{ fontSize: 12, color: "#a1a1aa" }}>
                Ref: {transaction.reference_number}
              </Text>
            )}
          </View>
        </View>

        {/* Valor */}
        <View style={{ alignItems: "flex-end", justifyContent: "center" }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color:
                transaction.transaction_type === "deposit"
                  ? "#16a34a"
                  : "#dc2626",
            }}
          >
            {getAmountPrefix(transaction.transaction_type)}
            {formatAmount(transaction.amount)}
          </Text>

          {/* Botões de ação se necessário */}
          {(onDelete || onProcess) && (
            <View style={{ flexDirection: "row", marginTop: 8, gap: 8 }}>
              {onDelete && (
                <TouchableOpacity
                  style={{ padding: 4 }}
                  onPress={() => onDelete(transaction.id)}
                >
                  <Text style={{ color: "#ef4444", fontSize: 12 }}>
                    Excluir
                  </Text>
                </TouchableOpacity>
              )}

              {onProcess && transaction.status === "pending" && (
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    style={{ padding: 4 }}
                    onPress={() => onProcess(transaction.id, "complete")}
                  >
                    <Text style={{ color: "#16a34a", fontSize: 12 }}>
                      Concluir
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ padding: 4 }}
                    onPress={() => onProcess(transaction.id, "fail")}
                  >
                    <Text style={{ color: "#dc2626", fontSize: 12 }}>
                      Falhar
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
