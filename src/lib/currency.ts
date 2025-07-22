export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100)
}

export const parseCurrency = (value: string): number => {
  const onlyNumbers = value.replace(/[\D]/g, '')
  if (!onlyNumbers) {
    return 0
  }
  return parseInt(onlyNumbers, 10)
}
