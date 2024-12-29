import { NextResponse } from 'next/server'
import { getFundDetails } from '@/services/scraping'

export async function GET(
  request: Request,
  { params }: { params: { ticker: string } }
) {
  try {
    const ticker = params.ticker.toLowerCase()
    const fundDetails = await getFundDetails(ticker)
    
    return NextResponse.json(fundDetails)
  } catch (error) {
    console.error(`Error fetching data for ${params.ticker}:`, error)
    return NextResponse.json({ error: 'Failed to fetch FII data' }, { status: 500 })
  }
}
