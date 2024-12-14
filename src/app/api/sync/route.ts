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

    return NextResponse.json({ 
      success: true, 
      message: 'Funds synchronized successfully',
      count: fiiList.length
    })

  } catch (error) {
    console.error('Error syncing funds:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to sync funds' },
      { status: 500 }
    )
  }
}
