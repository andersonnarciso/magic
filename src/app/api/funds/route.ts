import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Number(searchParams.get('page')) || 1
    const perPage = Math.min(Number(searchParams.get('perPage')) || 8, 52)
    const search = searchParams.get('search') || ''
    const orderBy = searchParams.get('orderBy') || 'ticker'
    const order = searchParams.get('order') || 'asc'

    console.log('Searching funds with params:', { page, perPage, search, orderBy, order })

    const skip = (page - 1) * perPage

    const where = search ? {
      OR: [
        { ticker: { contains: search.toUpperCase() } },
        { name: { contains: search } }
      ]
    } : {}

    // Definir ordenação
    let orderByClause: any = { [orderBy]: order }
    if (orderBy === 'currentPrice' || orderBy === 'lastDividend') {
      // Tratar campos numéricos como números
      orderByClause = {
        [orderBy]: order === 'desc' ? 'desc' : 'asc'
      }
    }

    console.log('Database query params:', { where, skip, take: perPage, orderBy: orderByClause })

    const [funds, totalFunds] = await Promise.all([
      prisma.fund.findMany({
        where,
        skip,
        take: perPage,
        orderBy: orderByClause
      }),
      prisma.fund.count({ where })
    ])

    console.log(`Found ${funds.length} funds out of ${totalFunds} total`)

    // Se não houver fundos, buscar da API
    if (totalFunds === 0) {
      console.log('No funds found in database, fetching from API...')
      
      const BRAPI_TOKEN = process.env.BRAPI_TOKEN
      
      // Buscar lista de FIIs
      const listResponse = await fetch(
        `https://brapi.dev/api/quote/list?token=${BRAPI_TOKEN}`
      )

      if (!listResponse.ok) {
        console.error('API request failed:', listResponse.status, listResponse.statusText)
        throw new Error('Failed to fetch funds list')
      }

      const listData = await listResponse.json()
      const fiiList = listData.stocks.filter((stock: any) => stock.stock.endsWith('11'))

      console.log(`Found ${fiiList.length} FIIs from API`)

      // Buscar dividendos para cada FII
      const fiiWithDividends = await Promise.all(
        fiiList.map(async (fund: any) => {
          try {
            const dividendResponse = await fetch(
              `https://brapi.dev/api/quote/${fund.stock}?token=${BRAPI_TOKEN}&fundamental=true`
            )
            
            if (!dividendResponse.ok) {
              console.warn(`Failed to fetch dividends for ${fund.stock}:`, dividendResponse.status)
              return fund
            }

            const dividendData = await dividendResponse.json()
            const stats = dividendData.results[0]?.defaultKeyStatistics
            const lastDividend = stats?.lastDividendValue || 0
            const lastDividendDate = stats?.lastDividendDate ? new Date(stats.lastDividendDate) : null

            return {
              ...fund,
              lastDividend,
              lastDividendDate
            }
          } catch (error) {
            console.warn(`Error fetching dividends for ${fund.stock}:`, error)
            return fund
          }
        })
      )

      // Inserir fundos em lotes
      const batchSize = 50
      for (let i = 0; i < fiiWithDividends.length; i += batchSize) {
        const batch = fiiWithDividends.slice(i, i + batchSize)
        console.log(`Inserting batch ${i/batchSize + 1} of ${Math.ceil(fiiWithDividends.length/batchSize)}`)
        
        await prisma.fund.createMany({
          data: batch.map((fund: any) => ({
            ticker: fund.stock,
            name: fund.name,
            currentPrice: fund.close || 0,
            lastDividend: fund.lastDividend || 0,
            lastDividendDate: fund.lastDividendDate || null,
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
          orderBy: orderByClause
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
    console.error('Error in GET /api/funds:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
