import { prisma } from '../lib/prisma'

async function syncRates() {
  try {
    const HG_TOKEN = process.env.HG_TOKEN

    console.log('Fetching rates from HG Brasil...')
    const response = await fetch(
      `https://api.hgbrasil.com/finance/taxes?key=${HG_TOKEN}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch rates')
    }

    const data = await response.json()
    console.log('Taxes data:', JSON.stringify(data, null, 2))

    // Atualiza SELIC
    await prisma.referenceRate.upsert({
      where: { name: 'SELIC' },
      create: {
        name: 'SELIC',
        value: data.results[0].selic,
      },
      update: {
        value: data.results[0].selic,
      },
    })

    // Atualiza CDI
    await prisma.referenceRate.upsert({
      where: { name: 'CDI' },
      create: {
        name: 'CDI',
        value: data.results[0].cdi,
      },
      update: {
        value: data.results[0].cdi,
      },
    })

    console.log('Rates updated successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error syncing rates:', error)
    process.exit(1)
  }
}

syncRates()
