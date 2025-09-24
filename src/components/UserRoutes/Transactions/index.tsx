import { View } from "react-native";
import { CustomText } from "../../ui/Text";
import { styles } from "./styles";

import { NewTransactionForm } from "./components/NewTransactionForm";
import { Transaction } from "../../../lib/transactions";
import { useState } from "react";
import { useAllTransactions } from "../../../hooks/useTransactions";

export function Transactions() {
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const {
    bankAccounts,
    primaryAccount,
    isLoadingAccounts,
    createTransaction,
    updateTransaction,
    isCreating,
    isUpdating,
  } = useAllTransactions();

  // Função para lidar com a edição de transações
  // const handleEditTransaction = (transaction: Transaction) => {
  //   setEditingTransaction(transaction)
  // }

  // Função para cancelar a edição
  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  if (isLoadingAccounts) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando transações...</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <View style={styles.container} className="bg-gray-1 dark:bg-gray-12">
        <NewTransactionForm
          primaryAccount={primaryAccount}
          bankAccounts={bankAccounts}
          isCreating={isCreating}
          onCreateTransaction={createTransaction}
          isEditing={!!editingTransaction}
          editingTransaction={editingTransaction}
          isUpdating={isUpdating}
          onUpdateTransaction={updateTransaction}
          onCancelEdit={handleCancelEdit}
        />
      </View>
    </>
  );
}
