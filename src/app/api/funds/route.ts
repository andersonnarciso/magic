import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '8') 
    const search = searchParams.get('search') || ''
    const orderBy = searchParams.get('orderBy') || ''
    const order = searchParams.get('order') || 'asc'
    const type = searchParams.get('type')
    const dividend = searchParams.get('dividend')

    console.log('Searching funds with params:', { page, perPage, search, orderBy, order })

    const where = search ? {
      OR: [
        { ticker: { contains: search.toUpperCase() } },
        { name: { contains: search, mode: 'insensitive' } }
      ],
      AND: {
        ticker: { endsWith: '11' }
      }
    } : {
      ticker: { endsWith: '11' }
    };

    if (type && type !== 'all') {
      where.type = type
    }

    // Busca todos os fundos
    const funds = await prisma.fund.findMany({
      where,
      orderBy: {
        ticker: 'asc'
      }
    });

    console.log('Total de fundos:', funds.length);
    console.log('Primeiros 5 fundos:', funds.slice(0, 5).map(f => ({ ticker: f.ticker, pvp: f.pvp })));

    // Separa em dois grupos
    const fundsWithPvp = funds.filter(f => f.pvp > 0)
      .sort((a, b) => (a.pvp || 0) - (b.pvp || 0)); // Ordena por P/VP crescente
    const fundsWithoutPvp = funds.filter(f => !f.pvp || f.pvp === 0)
      .sort((a, b) => a.ticker.localeCompare(b.ticker)); // Ordena por ticker

    console.log('Total de fundos com P/VP:', fundsWithPvp.length);
    console.log('Total de fundos sem P/VP:', fundsWithoutPvp.length);
    console.log('Fundos com P/VP (primeiros 5):', fundsWithPvp.slice(0, 5).map(f => ({ ticker: f.ticker, pvp: f.pvp })));

    // Junta na ordem correta
    const allFunds = [...fundsWithPvp, ...fundsWithoutPvp];
    
    // Aplica paginação
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const sortedFunds = allFunds.slice(start, end);

    console.log('Total após juntar:', allFunds.length);
    console.log('Página atual:', page);
    console.log('Itens por página:', perPage);
    console.log('Start:', start);
    console.log('End:', end);
    console.log('Total na página:', sortedFunds.length);

    // Calcula o dividend yield e prepara os fundos para ordenação
    const fundsWithYield = sortedFunds.map(fund => {
      const dividendYield = fund.lastDividend && fund.currentPrice 
        ? ((fund.lastDividend * 12) / fund.currentPrice) * 100 
        : null;

      return {
        ...fund,
        marketValue: fund.currentPrice,
        dividendYield,
      }
    });

    const totalFunds = await prisma.fund.count({ where })
    const totalPages = Math.ceil(totalFunds / perPage)

    const response = {
      data: fundsWithYield,
      pagination: {
        total: totalFunds,
        totalPages,
        currentPage: page,
        perPage
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching funds:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
