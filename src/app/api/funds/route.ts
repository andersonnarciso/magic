import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('itemsPerPage') || '24');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const orderBy = searchParams.get('orderBy') || 'pvp';  // OrdenaÃ§Ã£o padrÃ£o por P/VP
    const order = searchParams.get('order') || 'asc';  // Ordem ascendente por padrÃ£o

    console.log('=== DEBUG FUNDS API ===');
    console.log('Search params:', {
      page,
      perPage,
      search,
      type,
      orderBy,
      order
    });

    // Construir o where
    const where: Prisma.FundWhereInput = {
      AND: [
        // Pesquisa por nome ou ticker
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { ticker: { contains: search, mode: 'insensitive' } }
          ]
        },
        // Filtro por tipo (ignorar se for 'all')
        ...(type && type !== 'all' ? [{ type }] : [])
      ]
    };

    console.log('Where clause:', JSON.stringify(where, null, 2));

    // Contar total de fundos com os filtros
    const total = await prisma.fund.count({ where });
    console.log('Total funds:', total);

    // Calcular total de pÃ¡ginas
    const totalPages = Math.ceil(total / perPage);
    console.log('Total pages:', totalPages);

    // Ajustar pÃ¡gina atual se necessÃ¡rio
    const currentPage = Math.min(Math.max(1, page), totalPages);
    console.log('Current page:', currentPage);

    // Construir orderBy
    let orderByClause: any;

    // Determinar a ordem baseado no campo
    const getOrder = (field: string) => {
      switch (field) {
        case 'pvp':
        case 'dividendYield':
        case 'lastDividend':
        case 'marketValue':
          return 'asc'; // Menor para maior para todos os campos numÃ©ricos
        case 'name':
        case 'ticker':
          return 'asc'; // A-Z para campos de texto
        default:
          return 'asc';
      }
    };

    // OrdenaÃ§Ã£o para todos os campos
    orderByClause = [
      {
        [orderBy]: {
          sort: getOrder(orderBy),
          nulls: 'last',
        }
      },
      // OrdenaÃ§Ã£o secundÃ¡ria sempre por ticker para manter consistÃªncia
      { ticker: 'asc' }
    ];

    console.log('Order by:', orderByClause);

    // Buscar fundos com paginaÃ§Ã£o, filtros e ordenaÃ§Ã£o
    const funds = await prisma.fund.findMany({
      where,
      orderBy: orderByClause,
      skip: (currentPage - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        ticker: true,
        name: true,
        type: true,
        currentPrice: true,
        marketValue: true,
        pvp: true,
        lastDividend: true,
        lastDividendDate: true,
        dividendYield: true
      }
    });

    console.log('Found funds:', funds.length);

    return NextResponse.json({
      funds,
      total,
      page: currentPage,
      perPage,
      totalPages
    });
  } catch (error) {
    console.error('Error fetching funds:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


