import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getLastDividendFromInvestidor10, getDividendYieldFromInvestidor10, getPVPFromInvestidor10, getMarketValueFromInvestidor10 } from '@/services/scraping'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '8')
    const search = searchParams.get('search') || ''
    const orderBy = searchParams.get('orderBy') || 'dividendYield'
    const order = searchParams.get('order') || 'desc'
    const forceUpdate = searchParams.get('forceUpdate') === 'true'

    console.log('Searching funds with params:', { page, perPage, search, orderBy, order })

    const skip = (page - 1) * perPage

    const where = search ? {
      OR: [
        { ticker: { contains: search.toUpperCase() } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    } : {}

    let orderByClause: any = {}
    
    // Primeiro ordena por fundos que têm dividendos
    if (orderBy === 'dividendYield') {
      orderByClause = {
        dividendYield: {
          sort: order,
          nulls: 'last'
        }
      }
    } else if (orderBy === 'marketValue') {
      orderByClause = {
        marketValue: {
          sort: order,
          nulls: 'last'
        }
      }
    } else if (orderBy === 'pvp') {
      orderByClause = {
        pvp: {
          sort: order,
          nulls: 'last'
        }
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

    // Só atualiza os dados do Investidor10 se forçado ou se os dados estiverem desatualizados
    const shouldUpdate = (fund: any) => {
      if (forceUpdate) return true;
      const lastUpdate = new Date(fund.updatedAt);
      const now = new Date();
      const hoursSinceLastUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
      return hoursSinceLastUpdate >= 24; // Atualiza se passou mais de 24 horas
    };

    // Primeiro retorna os dados do banco
    const totalPages = Math.ceil(totalFunds / perPage)
    const response = NextResponse.json({
      funds,
      totalFunds,
      totalPages,
      currentPage: page
    })

    // Depois atualiza em background apenas os fundos desatualizados
    const fundsToUpdate = funds.filter(shouldUpdate);
    if (fundsToUpdate.length > 0) {
      console.log(`Updating ${fundsToUpdate.length} funds in background`);
      Promise.all(
        fundsToUpdate.map(async (fund) => {
          try {
            const [lastDividendData, dy, pvp, marketValue] = await Promise.all([
              getLastDividendFromInvestidor10(fund.ticker),
              getDividendYieldFromInvestidor10(fund.ticker),
              getPVPFromInvestidor10(fund.ticker),
              getMarketValueFromInvestidor10(fund.ticker)
            ])

            await prisma.fund.update({
              where: { ticker: fund.ticker },
              data: {
                lastDividend: lastDividendData?.value || fund.lastDividend,
                lastDividendDate: lastDividendData?.date || fund.lastDividendDate,
                dividendYield: dy,
                pvp,
                marketValue,
                updatedAt: new Date()
              }
            })
          } catch (error) {
            console.warn(`Error updating data for ${fund.ticker}:`, error)
          }
        })
      ).catch(error => {
        console.error('Error in background update:', error)
      })
    }

    return response
  } catch (error) {
    console.error('Error in GET /api/funds:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
