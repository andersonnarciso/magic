import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Number(searchParams.get('page')) || 1
    const perPage = Math.min(Number(searchParams.get('perPage')) || 8, 52)
    const search = searchParams.get('search') || ''

    console.log('Searching funds with params:', { page, perPage, search })

    const skip = (page - 1) * perPage

    const where = search ? {
      OR: [
        { ticker: { contains: search.toUpperCase() } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    } : {}

    console.log('Database query params:', { where, skip, take: perPage })

    const [funds, totalFunds] = await Promise.all([
      prisma.fund.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { ticker: 'asc' }
      }),
      prisma.fund.count({ where })
    ])

    console.log(`Found ${funds.length} funds out of ${totalFunds} total`)

    // Se não houver fundos, buscar da API
    if (totalFunds === 0) {
      console.log('No funds found in database, fetching from API...')
      
      const BRAPI_TOKEN = process.env.BRAPI_TOKEN
      const response = await fetch(
        `https://brapi.dev/api/quote/list?token=${BRAPI_TOKEN}`
      )

      if (!response.ok) {
        console.error('API request failed:', response.status, response.statusText)
        throw new Error('Failed to fetch funds list')
      }

      const data = await response.json()
      const fiiList = data.stocks.filter((stock: any) => stock.stock.endsWith('11'))

      console.log(`Found ${fiiList.length} FIIs from API`)

      // Inserir fundos em lotes
      const batchSize = 50
      for (let i = 0; i < fiiList.length; i += batchSize) {
        const batch = fiiList.slice(i, i + batchSize)
        console.log(`Inserting batch ${i/batchSize + 1} of ${Math.ceil(fiiList.length/batchSize)}`)
        
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

      console.log('All funds inserted, fetching updated list...')

      // Buscar fundos novamente após inserção
      const [newFunds, newTotalFunds] = await Promise.all([
        prisma.fund.findMany({
          where,
          skip,
          take: perPage,
          orderBy: { ticker: 'asc' }
        }),
        prisma.fund.count({ where })
      ])

      console.log(`Returning ${newFunds.length} funds out of ${newTotalFunds} total after API fetch`)

      return NextResponse.json({
        funds: newFunds,
        totalFunds: newTotalFunds,
        page,
        perPage,
        totalPages: Math.ceil(newTotalFunds / perPage)
      })
    }

    return NextResponse.json({
      funds,
      totalFunds,
      page,
      perPage,
      totalPages: Math.ceil(totalFunds / perPage)
    })
  } catch (error) {
    console.error('Error fetching funds:', error)
    return NextResponse.json(
      { error: 'Failed to fetch funds' },
      { status: 500 }
    )
  }
}
