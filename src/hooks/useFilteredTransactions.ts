import { useQuery } from "@tanstack/react-query";
import { getFilteredTransactions } from "../lib/transactions";
import type { PaginationOptions } from "../lib/transactions";
import { QUERY_KEYS, QUERY_CONFIG } from "../lib/query-config";
import { FilterOptions } from "../components/UserRoutes/Extrato/components";

/**
 * Hook para buscar transações filtradas usando React Query
 * @param filters - Filtros aplicados
 * @param userId - ID do usuário
 * @param pagination - Opções de paginação
 * @param enabled - Se a query deve ser executada
 */
export function useFilteredTransactions(
  filters: FilterOptions,
  userId: string,
  pagination?: PaginationOptions,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: [...QUERY_KEYS.transactions.list(filters), userId, pagination],
    queryFn: () => getFilteredTransactions(filters, userId, pagination),
    enabled: enabled && !!userId,
    ...QUERY_CONFIG.transactions,
  });
}

// Hook customizado removido - usar useFilteredTransactions com FilterOptions
