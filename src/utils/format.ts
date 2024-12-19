export const formatCurrency = (value: number | null | undefined) => {
  if (value == null) return '-'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export const formatPercent = (value: number | null | undefined) => {
  if (value == null) return '-'
  return value === 0 ? '0,00%' : `${(value * 100).toFixed(2)}%`
}
