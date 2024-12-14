import { prisma } from './prisma'

const BRAPI_TOKEN = process.env.BRAPI_TOKEN

export async function getFunds(page: number = 1, pageSize: number = 20) {
  try {
    console.log('Getting funds from database...') // Debug log
    const skip = (page - 1) * pageSize
    const take = pageSize

    // Get funds from database
    const [funds, totalFunds] = await Promise.all([
      prisma.fund.findMany({
        skip,
        take,
        orderBy: { ticker: 'asc' }
      }),
      prisma.fund.count()
    ])

    console.log(`Found ${funds.length} funds, total: ${totalFunds}`) // Debug log

    return {
      funds,
      totalFunds,
      totalPages: Math.ceil(totalFunds / pageSize)
    }
  } catch (error) {
    console.error('Error fetching funds:', error)
    throw error
  }
}

export async function getFundDetails(ticker: string) {
  try {
    console.log(`Getting details for fund ${ticker}...`) // Debug log
    // First try to get from database
    const fund = await prisma.fund.findUnique({
      where: { ticker }
    })

    if (!fund) {
      throw new Error('Fund not found')
    }

    // If fund is older than 24h, update it
    if (Date.now() - fund.updatedAt.getTime() > 24 * 60 * 60 * 1000) {
      console.log(`Updating fund ${ticker} from API...`) // Debug log
      const response = await fetch(
        `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&fundamental=true&dividends=true`
      )
      
      if (!response.ok) {
        console.log(`API request failed, returning cached data for ${ticker}`) // Debug log
        return fund // Return old data if API fails
      }

      const data = await response.json()
      const quote = data.results[0]

      // Update the fund in database with latest data
      return await prisma.fund.update({
        where: { ticker },
        data: {
          name: quote.shortName || fund.name,
          currentPrice: quote.regularMarketPrice || fund.currentPrice,
          lastDividend: quote.dividendsData?.cashDividends[0]?.value || fund.lastDividend,
          updatedAt: new Date()
        }
      })
    }

    console.log(`Returning cached data for ${ticker}`) // Debug log
    return fund
  } catch (error) {
    console.error(`Error fetching fund details for ${ticker}:`, error)
    throw error
  }
}
