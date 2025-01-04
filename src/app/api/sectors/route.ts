import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Buscar todos os fundos com seus setores e tipos
    const funds = await prisma.fund.findMany({
      select: {
        ticker: true,
        sector: true,
        type: true
      },
      orderBy: {
        sector: 'asc'
      }
    });

    // Agrupar por setor
    const sectorMap = new Map();
    funds.forEach(fund => {
      if (!fund.sector) return;
      
      if (!sectorMap.has(fund.sector)) {
        sectorMap.set(fund.sector, {
          count: 0,
          type: fund.type,
          examples: []
        });
      }
      
      const sectorInfo = sectorMap.get(fund.sector);
      sectorInfo.count++;
      if (sectorInfo.examples.length < 3) {
        sectorInfo.examples.push(fund.ticker);
      }
    });

    // Converter para array e ordenar por contagem
    const sectors = Array.from(sectorMap.entries()).map(([sector, info]) => ({
      sector,
      ...info
    })).sort((a, b) => b.count - a.count);

    return NextResponse.json({
      total_funds: funds.length,
      sectors_count: sectors.length,
      sectors
    });

  } catch (error) {
    console.error('Error fetching sectors:', error);
    return NextResponse.json({ error: 'Failed to fetch sectors' }, { status: 500 });
  }
}
