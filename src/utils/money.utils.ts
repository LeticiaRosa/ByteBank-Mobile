/**
 * Utilitários para manipulação de valores monetários
 * Responsável por conversões entre centavos/reais e formatação
 */
export const MoneyUtils = {
  /**
   * Converte reais para centavos
   * @param reais Valor em reais (ex: 25.50)
   * @returns Valor em centavos (ex: 2550)
   */
  reaisToCents: (reais: number): number => {
    return Math.round(reais * 100);
  },

  /**
   * Converte centavos para reais
   * @param cents Valor em centavos (ex: 2550)
   * @returns Valor em reais (ex: 25.50)
   */
  centsToReais: (cents: number): number => {
    return cents / 100;
  },

  /**
   * Formata valor em centavos para string em reais
   * @param cents Valor em centavos (ex: 2550)
   * @returns String formatada (ex: "R$ 25,50")
   */
  formatCents: (cents: number): string => {
    const reais = MoneyUtils.centsToReais(cents);
    return reais.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  },

  /**
   * Formata valor em reais para string
   * @param reais Valor em reais (ex: 25.50)
   * @returns String formatada (ex: "R$ 25,50")
   */
  formatReais: (reais: number): string => {
    return reais.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  },

  /**
   * Converte string de moeda para centavos
   * @param currencyString String como "R$ 25,50" ou "25,50"
   * @returns Valor em centavos (ex: 2550)
   */
  parseCurrencyToCents: (currencyString: string): number => {
    // Remove símbolos de moeda e espaços
    const cleanValue = currencyString
      .replace(/[R$\s]/g, "")
      .replace(/\./g, "") // Remove pontos (milhares)
      .replace(",", "."); // Converte vírgula para ponto decimal

    const reais = parseFloat(cleanValue);
    return isNaN(reais) ? 0 : MoneyUtils.reaisToCents(reais);
  },

  /**
   * Converte string de moeda para reais
   * @param currencyString String como "R$ 25,50" ou "25,50"
   * @returns Valor em reais (ex: 25.50)
   */
  parseCurrencyToReais: (currencyString: string): number => {
    const cents = MoneyUtils.parseCurrencyToCents(currencyString);
    return MoneyUtils.centsToReais(cents);
  },

  /**
   * Valida se um valor monetário é válido
   * @param value Valor a ser validado
   * @returns true se o valor é válido
   */
  isValidAmount: (value: number): boolean => {
    return !isNaN(value) && isFinite(value) && value >= 0;
  },

  /**
   * Formata um número para exibição (sem símbolo de moeda)
   * @param value Valor numérico a ser formatado
   * @returns String formatada com separadores de milhares (ex: "1.234,56")
   */
  formatNumber: (value: number): string => {
    return value.toLocaleString("pt-BR");
  },
};
