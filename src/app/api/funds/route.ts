import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const orderByParam = searchParams.get('orderBy') || 'pvp_asc';
    const type = searchParams.get('type') || 'all';
    const page = Number(searchParams.get('page')) || 1;
    const itemsPerPage = Number(searchParams.get('itemsPerPage')) || 8;

    console.log('=== DEBUG FUNDS API ===');
    console.log('Search params:', {
      search,
      orderByParam,
      type,
      page,
      itemsPerPage
    });

    // Construir o where
    let whereClause: any = {};

    // Adiciona condição de busca se houver
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { ticker: { contains: search.toUpperCase() } }
      ];
    }

    // Adiciona filtro por tipo se não for 'all'
    if (type !== 'all') {
      whereClause.type = type;
    }

    console.log('Where clause:', JSON.stringify(whereClause, null, 2));

    // Buscar todos os fundos primeiro
    const allFunds = await prisma.fund.findMany({
      where: whereClause,
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

    // Separa os fundos em dois grupos
    const completeFunds = allFunds.filter(f => 
      f.lastDividend !== null && 
      f.dividendYield !== null && 
      f.pvp !== null && 
      f.pvp >= 0.1
    );

    const incompleteFunds = allFunds.filter(f => 
      f.lastDividend === null || 
      f.dividendYield === null || 
      f.pvp === null || 
      f.pvp < 0.1
    );

    // Determina o campo de ordenação
    const orderByField = orderByParam === 'pvp_asc' ? 'pvp'
                      : orderByParam === 'pvp_desc' ? 'pvp'
                      : orderByParam === 'dividendYield_asc' ? 'dividendYield'
                      : orderByParam === 'dividendYield_desc' ? 'dividendYield'
                      : orderByParam === 'lastDividend_asc' ? 'lastDividend'
                      : orderByParam === 'lastDividend_desc' ? 'lastDividend'
                      : orderByParam === 'marketValue_asc' ? 'marketValue'
                      : orderByParam === 'marketValue_desc' ? 'marketValue'
                      : 'pvp';

    const isAscending = orderByParam === undefined ? true : orderByParam.endsWith('_asc');

    // Ordena os fundos completos usando o método sort do array
    completeFunds.sort((a, b) => {
      const aValue = a[orderByField] || 0;
      const bValue = b[orderByField] || 0;
      return isAscending ? aValue - bValue : bValue - aValue;
    });

    // Junta os fundos ordenados
    const sortedFunds = [...completeFunds, ...incompleteFunds];

    // Aplica paginação
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedFunds = sortedFunds.slice(start, end);

    // Calcula informações de paginação
    const totalItems = sortedFunds.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    console.log('Found funds:', paginatedFunds.length);
    console.log('Total funds:', totalItems);

    return NextResponse.json({
      funds: paginatedFunds,
      totalPages,
      currentPage: page,
      itemsPerPage,
      totalItems
    });

  } catch (error) {
    console.error('Error fetching funds:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
