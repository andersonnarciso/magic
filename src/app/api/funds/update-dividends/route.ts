import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const fund = await prisma.fund.update({
      where: { ticker: data.ticker },
      data: {
        lastDividend: data.lastDividend,
        lastDividendDate: data.lastDividendDate ? new Date(data.lastDividendDate) : null,
        dividendYield: data.dy,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(fund)
  } catch (error) {
    console.error('Error updating fund:', error)
    return NextResponse.json(
      { error: 'Failed to update fund' },
      { status: 500 }
    )
  }
}
