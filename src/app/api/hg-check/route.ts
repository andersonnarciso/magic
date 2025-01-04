import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const HG_TOKEN = process.env.HG_TOKEN || 'a82d8319';

    // Primeiro, vamos pegar a lista de todos os FIIs
    const fiiListResponse = await fetch(`https://api.hgbrasil.com/finance/ticker_list?key=${HG_TOKEN}&only=fii`);
    
    if (!fiiListResponse.ok) {
      throw new Error('Failed to fetch FII list from HG Brasil');
    }

    const fiiList = await fiiListResponse.json();
    console.log('FII List Response:', fiiList);

    // Pegar todos os tickers e dividir em grupos de 10 para não sobrecarregar a API
    const tickers = fiiList.symbols || [];
    const tickerGroups = [];
    for (let i = 0; i < tickers.length; i += 10) {
      tickerGroups.push(tickers.slice(i, i + 10));
    }

    // Buscar detalhes de cada grupo
    const allDetails = [];
    for (const group of tickerGroups) {
      const symbols = group.join(',');
      const detailsResponse = await fetch(`https://api.hgbrasil.com/finance/stock_price?key=${HG_TOKEN}&symbol=${symbols}`);
      
      if (!detailsResponse.ok) {
        console.error(`Failed to fetch details for group: ${symbols}`);
        continue;
      }

      const data = await detailsResponse.json();
      if (data.results) {
        Object.entries(data.results).forEach(([ticker, details]) => {
          allDetails.push({ ticker, ...details });
        });
      }
    }

    // Agrupar por setor
    const sectorMap = new Map();
    allDetails.forEach(fund => {
      const sector = fund.sector || 'Sem setor';
      if (!sectorMap.has(sector)) {
        sectorMap.set(sector, []);
      }
      sectorMap.get(sector).push({
        ticker: fund.ticker,
        name: fund.name,
        sector: fund.sector,
        price: fund.price,
        change_percent: fund.change_percent
      });
    });

    // Converter para formato mais legível
    const sectorStats = Array.from(sectorMap.entries()).map(([sector, funds]) => ({
      sector,
      count: funds.length,
      funds: funds.sort((a, b) => a.ticker.localeCompare(b.ticker)) // Ordenar fundos por ticker
    }));

    // Ordenar setores por quantidade de fundos
    sectorStats.sort((a, b) => b.count - a.count);

    return NextResponse.json({
      total_fiis: allDetails.length,
      sectors: sectorStats,
      raw_list: fiiList.symbols,
      example_details: allDetails.slice(0, 3) // Mostrar apenas 3 exemplos para não sobrecarregar o log
    });

  } catch (error) {
    console.error('Error checking HG Brasil:', error);
    return NextResponse.json({ 
      error: 'Failed to check HG Brasil',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
