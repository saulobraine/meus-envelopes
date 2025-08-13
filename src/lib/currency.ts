export const formatCurrency = (valor: number) => {
  if (isNaN(valor) || valor === null || valor === undefined) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor / 100);
};

export const parseCurrency = (value: string): number => {
  // Remove todos os caracteres exceto números, vírgulas e pontos
  const cleanValue = value.replace(/[^\d,.-]/g, "");

  if (!cleanValue) {
    return 0;
  }

  let floatValue: number;

  // Se há vírgula, assume formato brasileiro (vírgula como separador decimal)
  if (cleanValue.includes(",")) {
    // Remove pontos (separadores de milhares) e substitui vírgula por ponto
    const normalizedValue = cleanValue.replace(/\./g, "").replace(",", ".");
    floatValue = parseFloat(normalizedValue);
  } else {
    // Se não há vírgula, assume formato americano ou apenas números
    floatValue = parseFloat(cleanValue);
  }

  // Se o valor é inválido, retorna 0
  if (isNaN(floatValue)) {
    return 0;
  }

  // Converte para centavos
  return Math.round(floatValue);
};
