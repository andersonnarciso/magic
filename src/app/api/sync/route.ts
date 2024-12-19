import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getLastDividendFromInvestidor10 } from '@/services/scraping'

export async function GET() {
  try {
    const BRAPI_TOKEN = process.env.BRAPI_TOKEN

    // Fetch list of all stocks
    const response = await fetch(
      `https://brapi.dev/api/quote/list?token=${BRAPI_TOKEN}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch funds list')
    }

    const data = await response.json()
    const fiiList = data.stocks.filter((stock: any) => stock.stock.endsWith('11'))

    // Buscar dividendos para cada FII
    const fiiWithDividends = await Promise.all(
      fiiList.map(async (fund: any) => {
        try {
          // Primeiro tenta buscar da API BRAPI
          const dividendResponse = await fetch(
            `https://brapi.dev/api/quote/${fund.stock}/dividends?token=${BRAPI_TOKEN}`
          )
          
          if (dividendResponse.ok) {
            const dividendData = await dividendResponse.json()
            const dividends = dividendData.dividends || []
            const lastDividend = dividends[0]?.value || 0
            const lastDividendDate = dividends[0]?.paymentDate ? new Date(dividends[0].paymentDate) : null

            if (lastDividend > 0) {
              console.log(`Found dividend for ${fund.stock} from BRAPI: ${lastDividend}`)
              return {
                ...fund,
                lastDividend,
                lastDividendDate
              }
            }
          }

          // Se não encontrou na BRAPI, tenta buscar do Investidor10
          console.log(`Trying Investidor10 for ${fund.stock}...`)
          const investidor10Data = await getLastDividendFromInvestidor10(fund.stock)
          
          if (investidor10Data.value) {
            console.log(`Found dividend for ${fund.stock} from Investidor10: ${investidor10Data.value}`)
            return {
              ...fund,
              lastDividend: investidor10Data.value,
              lastDividendDate: investidor10Data.date
            }
          }

          console.warn(`No dividend found for ${fund.stock} in any source`)
          return fund

        } catch (error) {
          console.warn(`Error fetching dividends for ${fund.stock}:`, error)
          return fund
        }
      })
    )

    // Upsert all funds in parallel
    await Promise.all(
      fiiWithDividends.map(async (fund: any) => {
        return prisma.fund.upsert({
          where: { ticker: fund.stock },
          create: {
            ticker: fund.stock,
            name: fund.name,
            currentPrice: fund.close || 0,
            lastDividend: fund.lastDividend || 0,
            lastDividendDate: fund.lastDividendDate || null,
            updatedAt: new Date()
          },
          update: {
            name: fund.name,
            currentPrice: fund.close || 0,
            lastDividend: fund.lastDividend || 0,
            lastDividendDate: fund.lastDividendDate || null,
            updatedAt: new Date()
          }
        })
      })
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Funds synchronized successfully',
      count: fiiWithDividends.length
    })

  } catch (error) {
    console.error('Error syncing funds:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to sync funds' },
      { status: 500 }
    )
  }
}
