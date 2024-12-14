import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = 20
    const skip = (page - 1) * pageSize

    // Get paginated funds
    const [funds, totalFunds] = await Promise.all([
      prisma.fund.findMany({
        skip,
        take: pageSize,
        orderBy: { ticker: 'asc' }
      }),
      prisma.fund.count()
    ])

    // If no funds, fetch from API
    if (totalFunds === 0) {
      const BRAPI_TOKEN = process.env.BRAPI_TOKEN
      const response = await fetch(
        `https://brapi.dev/api/quote/list?token=${BRAPI_TOKEN}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch funds list')
      }

      const data = await response.json()
      const fiiList = data.stocks.filter((stock: any) => stock.stock.endsWith('11'))

      // Insert funds in batches
      const batchSize = 50
      for (let i = 0; i < fiiList.length; i += batchSize) {
        const batch = fiiList.slice(i, i + batchSize)
        await prisma.fund.createMany({
          data: batch.map((fund: any) => ({
            ticker: fund.stock,
            name: fund.name,
            currentPrice: fund.close || 0,
            lastDividend: 0,
            updatedAt: new Date()
          }))
        })
      }

      // Get funds again after inserting
      const [newFunds, newTotalFunds] = await Promise.all([
        prisma.fund.findMany({
          skip,
          take: pageSize,
          orderBy: { ticker: 'asc' }
        }),
        prisma.fund.count()
      ])

      return NextResponse.json({
        funds: newFunds,
        totalFunds: newTotalFunds,
        totalPages: Math.ceil(newTotalFunds / pageSize)
      })
    }

    // Check if we need to update all funds (older than 8 minutes)
    const oldestFund = await prisma.fund.findFirst({
      orderBy: { updatedAt: 'asc' }
    })

    const needsUpdate = !oldestFund?.updatedAt || 
      new Date().getTime() - oldestFund.updatedAt.getTime() > 8 * 60 * 1000

    if (needsUpdate) {
      const BRAPI_TOKEN = process.env.BRAPI_TOKEN
      const response = await fetch(
        `https://brapi.dev/api/quote/list?token=${BRAPI_TOKEN}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch funds list')
      }

      const data = await response.json()
      const fiiList = data.stocks.filter((stock: any) => stock.stock.endsWith('11'))

      // Update funds in batches
      const batchSize = 50
      for (let i = 0; i < fiiList.length; i += batchSize) {
        const batch = fiiList.slice(i, i + batchSize)
        await Promise.all(
          batch.map((fund: any) =>
            prisma.fund.update({
              where: { ticker: fund.stock },
              data: {
                currentPrice: fund.close || 0,
                updatedAt: new Date()
              }
            }).catch(() => null) // Ignore errors for individual updates
          )
        )
      }

      // Get updated funds
      const [updatedFunds, newTotalFunds] = await Promise.all([
        prisma.fund.findMany({
          skip,
          take: pageSize,
          orderBy: { ticker: 'asc' }
        }),
        prisma.fund.count()
      ])

      return NextResponse.json({
        funds: updatedFunds,
        totalFunds: newTotalFunds,
        totalPages: Math.ceil(newTotalFunds / pageSize)
      })
    }

    return NextResponse.json({
      funds,
      totalFunds,
      totalPages: Math.ceil(totalFunds / pageSize)
    })

  } catch (error) {
    console.error('Error in funds API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch funds' },
      { status: 500 }
    )
  }
}
