import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

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
          const dividendResponse = await fetch(
            `https://brapi.dev/api/quote/${fund.stock}?token=${BRAPI_TOKEN}&fundamental=true`
          )
          
          if (!dividendResponse.ok) {
            console.warn(`Failed to fetch dividends for ${fund.stock}:`, dividendResponse.status)
            return fund
          }

          const dividendData = await dividendResponse.json()
          const stats = dividendData.results[0]?.defaultKeyStatistics
          const lastDividend = stats?.lastDividendValue || 0
          const lastDividendDate = stats?.lastDividendDate ? new Date(stats.lastDividendDate) : null

          return {
            ...fund,
            lastDividend,
            lastDividendDate
          }
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
