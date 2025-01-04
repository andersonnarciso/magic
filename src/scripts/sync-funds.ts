import { prisma } from '../lib/prisma'

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

interface FiiResponse {
  kind: string
  symbol: string
  name: string
  company_name: string
  document: string
  description: string
  website: string
  sector: string
  financials: {
    equity: number
    quota_count: number
    equity_per_share: number
    price_to_book_ratio: number
    dividends: {
      yield_12m: number
      yield_12m_sum: number
    }
  }
  market_cap: number
  price: number
  change_percent: number
  change_price: number
  updated_at: string
}

async function getFundDetails(tickers: string[]) {
  const HG_TOKEN = process.env.HG_TOKEN
  const response = await fetch(
    `https://api.hgbrasil.com/finance/stock_price?key=${HG_TOKEN}&symbol=${tickers.join(',')}`
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch details for ${tickers.join(',')}`)
  }

  const data = await response.json()
  if (!data.valid_key) {
    throw new Error('Invalid API key')
  }

  return data.results as Record<string, FiiResponse>
}

function getFundType(ticker: string, fiis: typeof FIIS): 'Papel' | 'Tijolo' {
  if (fiis.papel.includes(ticker) || fiis.fof.includes(ticker)) {
    return 'Papel'
  }
  return 'Tijolo'
}

function normalizeSector(sector: string | null, ticker: string, fiis: typeof FIIS): string {
  if (!sector || sector === 'Indefinido') {
    // Define o setor baseado na lista em que o FII está
    if (fiis.papel.includes(ticker)) return 'Recebíveis Imobiliários'
    if (fiis.logistica.includes(ticker)) return 'Logística'
    if (fiis.shopping.includes(ticker)) return 'Shopping'
    if (fiis.corporativo.includes(ticker)) return 'Lajes Corporativas'
    if (fiis.fof.includes(ticker)) return 'Fundo de Fundos'
    return 'Outros'
  }

  // Normaliza os setores da API
  sector = sector.toLowerCase()
  if (sector.includes('fundo de fundos')) return 'Fundo de Fundos'
  if (sector.includes('logísticos') || sector.includes('industriais')) return 'Logística'
  if (sector.includes('lajes')) return 'Lajes Corporativas'
  if (sector.includes('shopping')) return 'Shopping'
  if (sector.includes('papéis') || sector.includes('recebíveis')) return 'Recebíveis Imobiliários'
  
  return 'Outros'
}

// Lista de FIIs organizados por tipo
const FIIS = {
  // Fundos de Papel - CRI
  papel: [
    'KNIP11', // Kinea Índices de Preços
    'KNCR11', // Kinea Rendimentos Imobiliários
    'IRDM11', // IRIDIUM RECEBÍVEIS IMOBILIÁRIOS
    'MXRF11', // MAXI RENDA
    'HGCR11', // CSHG RECEBÍVEIS IMOBILIÁRIOS
    'VGIR11', // VALORA RE III
    'RECR11', // REC RECEBÍVEIS IMOBILIÁRIOS
    'VCJR11', // VECTIS JUROS REAL
    'VGIP11', // VALORA CRI ÍNDICE DE PREÇO
    'RBRY11', // RBR CRÉDITO IMOB
    'RBRR11', // RBR HIGH GRADE
    'BTCR11', // BTG PACTUAL CRÉDITO IMOBILIÁRIO
  ],

  // Fundos de Tijolo - Logística
  logistica: [
    'VILG11', // VINCI LOGÍSTICA
    'HGLG11', // CSHG LOGÍSTICA
    'BRCO11', // BRESCO LOGÍSTICA
    'XPLG11', // XP LOG
    'LVBI11', // VBI LOGÍSTICA
    'BTLG11', // BTG PACTUAL LOGÍSTICA
  ],

  // Fundos de Tijolo - Shopping
  shopping: [
    'VISC11', // VINCI SHOPPING CENTERS
    'XPML11', // XP MALLS
    'MALL11', // MALLS BRASIL PLURAL
    'HSML11', // HSI MALLS
    'HGBS11', // HEDGE BRASIL SHOPPING
  ],

  // Fundos de Tijolo - Corporativo
  corporativo: [
    'HGRE11', // CSHG REAL ESTATE
    'RBRP11', // RBR PROPERTIES
    'BRCR11', // BC FUND
    'HGPO11', // CSHG PRIME OFFICES
    'RCRB11', // RIO BRAVO RENDA CORPORATIVA
    'BTRA11', // BTG PACTUAL TESOURO IPCA
  ],

  // Fundos de Fundos
  fof: [
    'RBRF11', // RBR ALPHA MULTIESTRATÉGIA
    'KFOF11', // KINEA FII
    'HFOF11', // HEDGE TOP FOFII 3
    'MGFF11', // MOGNO FUNDO DE FUNDOS
    'XPFI11', // XP FII FUND OF FUNDS
  ]
}

async function syncFunds() {
  try {
    // Junta todos os FIIs em uma única lista
    const allFiis = [
      ...FIIS.papel,
      ...FIIS.logistica,
      ...FIIS.shopping,
      ...FIIS.corporativo,
      ...FIIS.fof
    ]

    console.log(`Starting sync of ${allFiis.length} FIIs...`)
    
    // Set para armazenar todos os setores únicos
    const sectors = new Set<string>()
    
    // Processa os FIIs em grupos de 5
    for (let i = 0; i < allFiis.length; i += 5) {
      const tickerGroup = allFiis.slice(i, i + 5)
      console.log(`Processing group ${Math.floor(i / 5) + 1} of ${Math.ceil(allFiis.length / 5)}: ${tickerGroup.join(', ')}...`)
      
      try {
        const results = await getFundDetails(tickerGroup)

        // Processa cada FII do grupo
        for (const [ticker, fundData] of Object.entries(results)) {
          try {
            if (!fundData.price) {
              console.error(`No price data for ${ticker}`)
              continue
            }

            // Normaliza o setor e determina o tipo
            const sector = normalizeSector(fundData.sector, ticker, FIIS)
            const type = getFundType(ticker, FIIS)

            // Adiciona o setor normalizado ao Set de setores únicos
            sectors.add(sector)

            await prisma.fund.upsert({
              where: { ticker },
              create: {
                ticker,
                name: fundData.name,
                currentPrice: fundData.price,
                lastDividend: fundData.financials?.dividends?.yield_12m_sum || 0,
                dividendYield: fundData.financials?.dividends?.yield_12m || null,
                marketValue: fundData.market_cap || null,
                pvp: fundData.financials?.price_to_book_ratio || null,
                type,
                sector,
                netWorth: fundData.financials?.equity || null,
                description: fundData.description || null,
                updatedAt: new Date()
              },
              update: {
                name: fundData.name,
                currentPrice: fundData.price,
                lastDividend: fundData.financials?.dividends?.yield_12m_sum || 0,
                dividendYield: fundData.financials?.dividends?.yield_12m || null,
                marketValue: fundData.market_cap || null,
                pvp: fundData.financials?.price_to_book_ratio || null,
                type,
                sector,
                netWorth: fundData.financials?.equity || null,
                description: fundData.description || null,
                updatedAt: new Date()
              }
            })

            console.log(`Updated ${ticker}`)
          } catch (error) {
            console.error(`Error processing ${ticker}:`, error)
          }
        }
      } catch (error) {
        console.error(`Error processing group ${tickerGroup.join(', ')}:`, error)
      }

      // Aguarda 500ms entre cada grupo para evitar rate limiting
      await delay(500)
    }

    // Imprime todos os setores únicos encontrados
    console.log('\nSetores encontrados:')
    console.log(Array.from(sectors).sort().join('\n'))

    console.log('\nSync completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error syncing funds:', error)
    process.exit(1)
  }
}

syncFunds()
