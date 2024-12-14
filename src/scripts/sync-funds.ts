import { prisma } from '../lib/prisma'

async function syncFunds() {
  try {
    const BRAPI_TOKEN = process.env.BRAPI_TOKEN

    console.log('Fetching funds from API...')
    const response = await fetch(
      `https://brapi.dev/api/quote/list?token=${BRAPI_TOKEN}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch funds list')
    }

    const data = await response.json()
    const fiiList = data.stocks.filter((stock: any) => stock.stock.endsWith('11'))

    console.log(`Found ${fiiList.length} funds. Starting sync...`)

    // Upsert all funds in parallel
    await Promise.all(
      fiiList.map(async (fund: any) => {
        return prisma.fund.upsert({
          where: { ticker: fund.stock },
          create: {
            ticker: fund.stock,
            name: fund.name,
            currentPrice: fund.close || 0,
            lastDividend: 0,
            updatedAt: new Date()
          },
          update: {
            name: fund.name,
            currentPrice: fund.close || 0,
            updatedAt: new Date()
          }
        })
      })
    )

    console.log('Sync completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error syncing funds:', error)
    process.exit(1)
  }
}

syncFunds()
