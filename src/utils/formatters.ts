export function formatSector(sector: string): string {
  const sectorMap: { [key: string]: string } = {
    'Financeiro / Serviços Financeiros Diversos / Gestão de Recursos e Investimentos': 'Híbrido',
    'Financeiro e Outros/Fundos/Fundos Imobiliários': 'Híbrido',
    'Imóveis Industriais e Logísticos': 'Logística',
    'Industrial e Logístico': 'Logística',
    'Títulos e Valores Mobiliários': 'TVM',
    'Shopping / Varejo': 'Shopping',
    'Shopping Centers': 'Shopping',
    'Papel e Celulose': 'Papel',
    'Hospitalar / Laboratórios / Diagnósticos': 'Hospitalar',
    'Fundo de Fundos': 'FOF',
    'Imóveis Comerciais - Outros': 'Outros',
    'Imóveis Comerciais': 'Comercial',
    'Imóveis Residenciais': 'Residencial'
  }

  return sectorMap[sector] || sector
}

export function formatCurrency(value: number | null): string {
  if (!value) return 'N/A'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2
  }).format(value)
}

export function formatPercentage(value: number | null): string {
  if (!value) return 'N/A'
  return `${(value * 100).toFixed(2)}%`
}

export function formatNumber(value: number | null): string {
  if (!value) return 'N/A'
  return value.toFixed(2)
}

export function formatNetWorth(value: number | null): string {
  if (!value) return 'N/A'
  const billions = value / 1000000000
  const millions = value / 1000000
  
  if (billions >= 1) {
    return `R$ ${billions.toFixed(2)}B`
  }
  return `R$ ${millions.toFixed(2)}M`
}

export function formatMagicNumber(pvp: number | null, dividendYield: number | null): string {
  if (!pvp || !dividendYield) return 'N/A'
  return (pvp / dividendYield).toFixed(2)
}
