import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { ticker: string } }
) {
  try {
    const ticker = params.ticker.toUpperCase()
    const fund = await prisma.fund.findUnique({
      where: { ticker }
    })

    if (!fund) {
      return NextResponse.json(
        { error: 'Fund not found' },
        { status: 404 }
      )
    }

    // Check if fund needs update (older than 8 minutes)
    const needsUpdate = !fund.updatedAt || 
      new Date().getTime() - fund.updatedAt.getTime() > 8 * 60 * 1000

    if (needsUpdate) {
      const BRAPI_TOKEN = process.env.BRAPI_TOKEN

      // Buscar dados do fundo incluindo dividendos
      const response = await fetch(
        `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&dividends=true&range=1mo`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch fund details')
      }

      const data = await response.json()
      const stockData = data.results[0]

      if (stockData) {
        let lastDividend = fund.lastDividend

        // Pegar o último dividendo dos dados retornados
        if (stockData.dividendsData?.cashDividends?.length > 0) {
          // Ordenar por data de pagamento e pegar o mais recente
          const sortedDividends = stockData.dividendsData.cashDividends.sort((a: any, b: any) => 
            new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
          )
          lastDividend = sortedDividends[0].rate
          console.log(`Último dividendo encontrado para ${ticker}: ${lastDividend}`)
        } else {
          console.log(`Nenhum dividendo encontrado para ${ticker}`)
        }

        const updatedFund = await prisma.fund.update({
          where: { ticker },
          data: {
            currentPrice: stockData.regularMarketPrice || fund.currentPrice,
            lastDividend: lastDividend,
            updatedAt: new Date()
          }
        })
        return NextResponse.json(updatedFund)
      }
    }

    return NextResponse.json(fund)

  } catch (error) {
    console.error('Error fetching fund details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fund details' },
      { status: 500 }
    )
  }
}
