import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getLastDividendFromInvestidor10 } from '@/services/scraping'

export async function GET() {
  try {
    console.log('Starting funds synchronization...')
    const BRAPI_TOKEN = process.env.BRAPI_TOKEN

    if (!BRAPI_TOKEN) {
      throw new Error('BRAPI_TOKEN not configured')
    }

    // Fetch list of all stocks from BRAPI
    console.log('Fetching funds list from BRAPI...')
    const response = await fetch(
      `https://brapi.dev/api/quote/list?token=${BRAPI_TOKEN}`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch funds list: ${response.status} ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response from BRAPI API: not JSON')
    }

    const data = await response.json()
    const fiiList = data.stocks.filter((stock: any) => stock.stock.endsWith('11'))
    console.log(`Found ${fiiList.length} FIIs in BRAPI`)

    // Buscar dividendos para cada FII do Investidor10
    console.log('Fetching dividends from Investidor10 for each FII...')
    const fiiWithDividends = await Promise.all(
      fiiList.map(async (fund: any) => {
        try {
          // Busca dividendos diretamente do Investidor10
          const investidor10Data = await getLastDividendFromInvestidor10(fund.stock)
          
          if (investidor10Data.value) {
            console.log(`Found dividend for ${fund.stock} from Investidor10: ${investidor10Data.value}`)
            return {
              ...fund,
              lastDividend: investidor10Data.value,
              lastDividendDate: investidor10Data.date,
              source: 'Investidor10'
            }
          }

          console.warn(`No dividend found for ${fund.stock} in Investidor10`)
          return {
            ...fund,
            lastDividend: 0,
            lastDividendDate: null,
            source: 'none'
          }

        } catch (error) {
          console.error(`Error fetching dividends for ${fund.stock}:`, error)
          return {
            ...fund,
            lastDividend: 0,
            lastDividendDate: null,
            source: 'error'
          }
        }
      })
    )

    // Estatísticas
    const stats = fiiWithDividends.reduce((acc: any, fund: any) => {
      acc.total++
      acc[fund.source] = (acc[fund.source] || 0) + 1
      return acc
    }, { total: 0 })

    console.log('Syncing funds to database...')
    // Processa os fundos em lotes para evitar sobrecarga
    const batchSize = 5 // Reduzido de 10 para 5
    const delay = 5000 // Aumentado de 2s para 5s

    for (let i = 0; i < fiiWithDividends.length; i += batchSize) {
      const batch = fiiWithDividends.slice(i, i + batchSize)
      
      // Processa o lote atual
      await Promise.all(batch.map(async (fund) => {
        try {
          const lastDividend = await getLastDividendFromInvestidor10(fund.stock)
          if (lastDividend.value !== null && lastDividend.date !== null) {
            await prisma.fund.upsert({
              where: { ticker: fund.stock },
              update: { lastDividendDate: lastDividend.date },
              create: { 
                ticker: fund.stock,
                name: fund.stock, // Usando o ticker como nome temporário
                currentPrice: 0,
                lastDividend: 0,
                lastDividendDate: lastDividend.date,
                updatedAt: new Date()
              }
            })
          }
        } catch (error) {
          console.error(`Error processing fund ${fund.stock}:`, error)
        }
      }))

      // Aguarda o delay antes de processar o próximo lote
      if (i + batchSize < fiiWithDividends.length) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    console.log('Synchronization completed successfully')
    return NextResponse.json({ 
      success: true, 
      message: 'Funds synchronized successfully',
      count: fiiWithDividends.length,
      stats
    })

  } catch (error) {
    console.error('Error syncing funds:', error)
    return NextResponse.json(
      { success: false, message: `Failed to sync funds: ${error}` },
      { status: 500 }
    )
  }
}
