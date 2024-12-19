import { NextResponse } from 'next/server'
import { getLastDividendFromInvestidor10, getDividendYieldFromInvestidor10 } from '@/services/scraping'

export async function GET(
  request: Request,
  { params }: { params: { ticker: string } }
) {
  try {
    const ticker = params.ticker.toLowerCase()
    
    const [lastDividend, dy] = await Promise.all([
      getLastDividendFromInvestidor10(ticker),
      getDividendYieldFromInvestidor10(ticker)
    ])
    
    return NextResponse.json({
      ticker,
      lastDividend,
      dy
    })
  } catch (error) {
    console.error(`Error fetching data for ${params.ticker}:`, error)
    return NextResponse.json({ error: 'Failed to fetch FII data' }, { status: 500 })
  }
}
