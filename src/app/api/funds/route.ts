import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const itemsPerPage = Number(searchParams.get('itemsPerPage')) || 8;
    const search = searchParams.get('search') || '';
    const orderBy = searchParams.get('orderBy') || '';
    const sector = searchParams.get('sector') || 'all';
    const dividend = searchParams.get('dividend') || '';

    console.log('=== DEBUG FUNDS API ===');
    console.log('Search params:', {
      search,
      orderBy,
      sector,
      dividend,
      page,
      itemsPerPage,
    });

    // Construir o where baseado nos filtros
    let where: any = {};

    // Filtro de busca
    if (search) {
      where.OR = [
        { ticker: { contains: search.toUpperCase(), mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtro de setor
    if (sector !== 'all') {
      console.log('=== DEBUG SETOR ===');
      console.log('Setor selecionado:', sector);

      // Debug específico para TVM
      if (sector === 'TVM') {
        const tvmFunds = await prisma.fund.findMany({
          where: {
            sector: {
              contains: 'TVM',
              mode: 'insensitive'
            }
          },
          select: {
            ticker: true,
            sector: true
          }
        });
        console.log('Fundos TVM encontrados:', tvmFunds);
      }

      // Mapeamento de setores baseado nos valores do banco
      const sectorMap: { [key: string]: string[] } = {
        'Papel': ['Papel e Celulose', 'Papéis', 'CRI', 'Recebíveis', 'Papel', 'Títulos e Val. Mob.'],
        'Híbrido': ['Financeiro / Serviços Financeiros Diversos / Gestão de Recursos e Investimentos', 'Híbrido', 'Financeiro e Outros/Fundos/Fundos Imobiliários', 'Financeiro'],
        'FiAgro': ['FIAgro', 'Agronegócio', 'Agricultura'],
        'Educacional': ['Educacional', 'Educação'],
        'Shopping': ['Shopping / Varejo', 'Shopping Centers', 'Shoppings', 'Shopping'],
        'Lajes Corporativas': ['Lajes Corporativas', 'Lajes'],
        'FOF': ['Fundo de Fundos', 'FoF', 'FOF'],
        'Misto': ['Misto', 'Híbrido'],
        'Logística': ['Imóveis Industriais e Logísticos', 'Logística', 'Industrial e Logístico', 'Logístico'],
        'Hotel': ['Hotel', 'Hotelaria', 'Hotéis', 'Imóveis Hoteleiros'],
        'Hospitalar': ['Hospitalar', 'Hospital', 'Hospitalar / Laboratórios / Diagnósticos'],
        'TVM': ['Títulos e Valores Mobiliários', 'TVM', 'Títulos e Val. Mob.', 'Ativos Financeiros', 'Valores Mobiliários'],
        'Outros': ['Imóveis Comerciais - Outros', 'Outros', 'Diversos']
      };

      // Primeiro, tenta encontrar o setor exato no mapeamento
      const possibleValues = sectorMap[sector];
      
      if (possibleValues) {
        // Se encontrou no mapeamento, usa todos os valores possíveis
        where.sector = {
          in: possibleValues
        };
      } else {
        // Se não encontrou no mapeamento, procura em todos os arrays de valores
        const matchingSectors = Object.entries(sectorMap).find(([_, values]) => 
          values.some(value => value.toLowerCase() === sector.toLowerCase())
        );

        if (matchingSectors) {
          // Se encontrou o setor em algum array, usa todos os valores daquele array
          where.sector = {
            in: sectorMap[matchingSectors[0]]
          };
        } else {
          // Se não encontrou em lugar nenhum, usa o valor original
          where.sector = sector;
        }
      }

      console.log('Cláusula where:', where);
    }

    // Filtro de dividend yield
    if (dividend) {
      const [min, max] = dividend.split('-').map(Number);
      where.dividendYield = {
        gte: min / 100,
        ...(max && { lte: max / 100 }),
      };
    }

    console.log('Where clause:', JSON.stringify(where, null, 2));

    // Buscar todos os fundos
    const allFunds = await prisma.fund.findMany({
      where,
      select: {
        id: true,
        ticker: true,
        name: true,
        type: true,
        sector: true,
        description: true,
        currentPrice: true,
        marketValue: true,
        pvp: true,
        lastDividend: true,
        dividendYield: true,
        netWorth: true,
        updatedAt: true,
      },
    });

    // Separar fundos completos e incompletos
    const completeFunds = allFunds.filter(
      (fund) =>
        fund.currentPrice !== null &&
        fund.lastDividend !== null &&
        fund.dividendYield !== null &&
        fund.pvp !== null &&
        fund.marketValue !== null &&
        fund.netWorth !== null
    );

    const incompleteFunds = allFunds.filter(
      (fund) =>
        fund.currentPrice === null ||
        fund.lastDividend === null ||
        fund.dividendYield === null ||
        fund.pvp === null ||
        fund.marketValue === null ||
        fund.netWorth === null
    );

    // Ordenar fundos completos
    if (orderBy) {
      const [field, direction] = orderBy.split('_');
      completeFunds.sort((a, b) => {
        const aValue = a[field] || 0;
        const bValue = b[field] || 0;
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    // Juntar fundos ordenados
    const sortedFunds = [...completeFunds, ...incompleteFunds];

    // Aplicar paginação
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedFunds = sortedFunds.slice(start, end);

    // Calcular totais
    const totalItems = sortedFunds.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    console.log('Found funds:', paginatedFunds.length);
    console.log('Total funds:', totalItems);

    return NextResponse.json({
      funds: paginatedFunds,
      totalPages,
      totalItems,
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching funds:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
