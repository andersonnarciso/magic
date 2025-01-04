import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHGToken } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Log dos parâmetros de busca
    console.log('=== DEBUG FUNDS API ===');
    console.log('Search params:', {
      search: searchParams.get('search') || '',
      orderBy: searchParams.get('orderBy') || '',
      sector: searchParams.get('sector') || 'all',
      dividend: searchParams.get('dividend') || '',
      page: Number(searchParams.get('page')) || 1,
      itemsPerPage: Number(searchParams.get('itemsPerPage')) || 8,
      completeness: searchParams.get('completeness') || 'all'
    });

    // Construir where clause baseado nos parâmetros
    const where: any = {};
    
    // Filtro de busca
    const search = searchParams.get('search');
    if (search) {
      where.OR = [
        { ticker: { contains: search.toUpperCase() } },
        { name: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filtro de setor
    const sector = searchParams.get('sector');
    if (sector && sector !== 'all') {
      // Filtrar pelo tipo do fundo
      where.type = sector;
    }

    // Filtro de dividend yield
    const dividend = searchParams.get('dividend');
    if (dividend) {
      where.dividendYield = {
        gte: parseFloat(dividend)
      };
    }

    // Filtro de completude
    const completeness = searchParams.get('completeness') || 'all';
    if (completeness !== 'all') {
      switch (completeness) {
        case 'complete':
          where.AND = [
            { currentPrice: { not: null } },
            { pvp: { not: null } },
            { lastDividend: { not: null } },
            { dividendYield: { not: null } }
          ];
          break;
        case 'partial':
          where.AND = [
            { currentPrice: { not: null } },
            { pvp: { not: null } },
            {
              OR: [
                { lastDividend: null },
                { dividendYield: null }
              ]
            }
          ];
          break;
        case 'incomplete':
          where.AND = [
            { currentPrice: { not: null } },
            {
              AND: [
                { pvp: null },
                { 
                  OR: [
                    { lastDividend: null },
                    { dividendYield: null },
                    { marketValue: null }
                  ]
                }
              ]
            }
          ];
          break;
      }
    }

    console.log('Where clause:', where);

    // Buscar total de fundos
    const totalItems = await prisma.fund.count({ where });

    // Buscar todos os fundos primeiro
    const allFunds = await prisma.fund.findMany({
      where,
    });

    // Separar em categorias
    const completeFunds = allFunds.filter(fund => 
      fund.currentPrice !== null && // Tem preço
      fund.pvp !== null && // Tem PVP
      fund.lastDividend !== null && // Tem último pagamento
      fund.dividendYield !== null // Tem dividend yield
    );

    const partialFunds = allFunds.filter(fund => 
      !completeFunds.includes(fund) && // Não está nos completos
      fund.currentPrice !== null && // Tem preço
      fund.pvp !== null // E PVP
    );

    const incompleteFunds = allFunds.filter(fund => 
      !completeFunds.includes(fund) && 
      !partialFunds.includes(fund) &&
      fund.currentPrice !== null && // Tem apenas preço
      (
        fund.pvp === null || // Não tem PVP
        fund.dividendYield === null || // Não tem dividend yield
        fund.marketValue === null // Não tem valor de mercado
      )
    );

    // Análise dos setores dos fundos completos
    console.log('=== ANÁLISE DE SETORES DOS FUNDOS COMPLETOS ===');
    const setoresCompletos = completeFunds.reduce((acc: {[key: string]: number}, fund) => {
      const setor = fund.sector || 'Sem Setor';
      acc[setor] = (acc[setor] || 0) + 1;
      return acc;
    }, {});
    console.log(JSON.stringify(setoresCompletos, null, 2));

    // Vamos pegar alguns fundos de exemplo de cada setor para verificar
    const fundosPorSetor = completeFunds.reduce((acc: {[key: string]: string[]}, fund) => {
      const setor = fund.sector || 'Sem Setor';
      if (!acc[setor]) acc[setor] = [];
      if (acc[setor].length < 3) { // pega até 3 exemplos por setor
        acc[setor].push(fund.ticker);
      }
      return acc;
    }, {});
    console.log('=== EXEMPLOS DE FUNDOS POR SETOR ===');
    console.log(JSON.stringify(fundosPorSetor, null, 2));

    // Primeiro vamos pegar a lista completa de FIIs disponíveis
    console.log('=== OBTENDO LISTA DE FIIS DISPONÍVEIS ===');
    const listResponse = await fetch(`https://api.hgbrasil.com/finance/ticker_list?key=${getHGToken()}&only=fii`);
    const listData = await listResponse.json();
    console.log('Lista de FIIs:', JSON.stringify(listData, null, 2));

    // Agora vamos consultar os fundos em grupos de 5
    const testFunds = [
      // Grupo 1
      ['MXRF11', 'CPTS11', 'KNIP11', 'KNCR11', 'RVBI11'],
      // Grupo 2
      ['HGLG11', 'VILG11', 'HGRE11', 'RCRB11', 'BRCR11'],
      // Grupo 3
      ['XPML11', 'VISC11', 'HSML11', 'RBRF11', 'KFOF11'],
      // Grupo 4
      ['AGCX11', 'RZAG11', 'SNAG11', 'BCIA11', 'BRCO11']
    ];

    console.log('=== VERIFICANDO SETORES POR GRUPOS ===');
    for (const group of testFunds) {
      const response = await fetch(`https://api.hgbrasil.com/finance/stock_price?key=${getHGToken()}&symbol=${group.join(',')}`);
      const data = await response.json();
      
      if (data?.results) {
        console.log(`Grupo ${testFunds.indexOf(group) + 1}:`, JSON.stringify(data.results, null, 2));
        
        // Analisar setores deste grupo
        const setores = Object.entries(data.results).reduce((acc: {[key: string]: string[]}, [ticker, info]: [string, any]) => {
          const setor = info.sector || 'Sem Setor';
          if (!acc[setor]) acc[setor] = [];
          acc[setor].push(ticker);
          return acc;
        }, {});
        
        console.log(`Setores do Grupo ${testFunds.indexOf(group) + 1}:`, JSON.stringify(setores, null, 2));
      }
    }

    // Vamos verificar na API da HG Brasil alguns fundos específicos
    const testFunds2 = [
      // Logística
      'HGLG11', 'VILG11', 'BRCO11',
      // Lajes Corporativas
      'HGRE11', 'RCRB11', 'BRCR11',
      // Shopping
      'XPML11', 'VISC11', 'HSML11',
      // FiAgro
      'AGCX11', 'RZAG11', 'SNAG11',
      // Recebíveis
      'KNIP11', 'KNCR11', 'RVBI11',
      // Fundo de Fundos
      'RBRF11', 'KFOF11', 'BCIA11'
    ];
    
    const hgResponse = await fetch(`https://api.hgbrasil.com/finance/stock_price?key=${getHGToken()}&symbol=${testFunds2.join(',')}`);
    const hgData = await hgResponse.json();
    
    console.log('=== VERIFICAÇÃO DE SETORES NA HG BRASIL ===');
    console.log('Fundos consultados:', testFunds2);
    console.log('Resposta:', JSON.stringify(hgData?.results || {}, null, 2));

    // Analisar os setores retornados
    if (hgData?.results) {
      console.log('=== ANÁLISE DOS SETORES RETORNADOS ===');
      const setoresHG = Object.entries(hgData.results).reduce((acc: {[key: string]: string[]}, [ticker, data]: [string, any]) => {
        const setor = data.sector || 'Sem Setor';
        if (!acc[setor]) acc[setor] = [];
        acc[setor].push(ticker);
        return acc;
      }, {});
      console.log(JSON.stringify(setoresHG, null, 2));
    }

    // Ordenar cada categoria se necessário
    const orderBy = searchParams.get('orderBy');
    if (orderBy) {
      const [field, direction] = orderBy.split(':');
      const compareFunction = (a: any, b: any) => {
        const aValue = a[field] ?? -Infinity;
        const bValue = b[field] ?? -Infinity;
        const comparison = direction === 'asc' ? aValue - bValue : bValue - aValue;
        return comparison === 0 ? a.ticker.localeCompare(b.ticker) : comparison;
      };

      completeFunds.sort(compareFunction);
      partialFunds.sort(compareFunction);
      incompleteFunds.sort((a, b) => a.ticker.localeCompare(b.ticker));
    } else {
      // Se não tem ordenação, ordena por ticker dentro de cada categoria
      completeFunds.sort((a, b) => a.ticker.localeCompare(b.ticker));
      partialFunds.sort((a, b) => a.ticker.localeCompare(b.ticker));
      incompleteFunds.sort((a, b) => a.ticker.localeCompare(b.ticker));
    }

    // Juntar na ordem correta
    const orderedFunds = [...completeFunds, ...partialFunds, ...incompleteFunds];

    // Aplicar paginação
    const page = Number(searchParams.get('page')) || 1;
    const itemsPerPage = Number(searchParams.get('itemsPerPage')) || 8;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedFunds = orderedFunds.slice(start, end);

    // Buscar dados do HG Brasil apenas para os fundos paginados
    const HG_TOKEN = getHGToken();
    if (!HG_TOKEN) {
      console.error('HG_TOKEN não encontrado');
      return NextResponse.json({ error: 'Token de API não configurado' }, { status: 500 });
    }

    const tickers = paginatedFunds.map(f => f.ticker).join(',');
    const response = await fetch(`https://api.hgbrasil.com/finance/stock_price?key=${HG_TOKEN}&symbol=${tickers}`);
    const updatedData = await response.json();
      
    console.log('=== DADOS DO HG BRASIL ===');
    console.log('Tickers consultados:', tickers);
    console.log('Resposta:', JSON.stringify(updatedData, null, 2));

    // Atualizar os fundos com os dados do HG Brasil
    if (updatedData.results) {
      for (const fund of paginatedFunds) {
        const hgFund = updatedData.results[fund.ticker];
        if (hgFund) {
          fund.currentPrice = hgFund.price || fund.currentPrice;
          fund.sector = hgFund.sector || fund.sector;
        }
      }
    }

    // Mapeamento de setores para exibição
    const setorMap: { [key: string]: string } = {
      'Papéis': 'Recebíveis',
      'Imóveis Industriais e Logísticos': 'Logística',
      'Lajes Corporativas': 'Lajes',
      'Shoppings': 'Shopping',
      'FIAgro': 'FiAgro',
      'Fundo de Fundos': 'FOF',
      'Financeiro e Outros/Fundos/Fundos Imobiliários': 'Lajes',
      'Sem Setor': 'Outros'
    };

    // Buscar setores disponíveis apenas de fundos que têm pelo menos preço
    const availableSectors = await prisma.fund.groupBy({
      by: ['sector'],
      _count: {
        ticker: true
      },
      where: {
        AND: [
          { sector: { not: null } },
          { currentPrice: { not: null } },
          { ticker: { endsWith: '11' } } // Garantir que são apenas FIIs
        ]
      }
    });

    // Ordenar setores por contagem e mapear para nomes amigáveis
    const sectors = availableSectors
      .filter(s => s.sector && s._count.ticker > 0) // Remove setores nulos e vazios
      .map(s => ({
        original: s.sector,
        friendly: setorMap[s.sector] || s.sector,
        count: s._count.ticker
      }))
      .sort((a, b) => b.count - a.count) // Ordena por quantidade
      .map(s => s.friendly); // Pega só o nome amigável

    // Adicionar "Todos" como primeira opção
    const finalSectors = ['all', ...sectors];

    // Calcular total de páginas
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return NextResponse.json({
      items: paginatedFunds,
      page,
      totalPages,
      totalItems,
      availableSectors: finalSectors,
      stats: {
        complete: completeFunds.length,
        partial: partialFunds.length,
        incomplete: incompleteFunds.length
      }
    });

  } catch (error) {
    console.error('Error fetching funds:', error);
    return NextResponse.json({ error: 'Error fetching funds' }, { status: 500 });
  }
}
