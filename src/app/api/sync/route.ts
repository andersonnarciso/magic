import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const BRAPI_TOKEN = 'w1kY4iCgJsAC23hTGX5rY9'

export async function GET() {
  return POST();
}

export async function POST() {
  try {
    console.log('Starting fund sync...')
    
    // Limpa o banco antes de sincronizar
    console.log('Cleaning database...')
    await prisma.fund.deleteMany()
    
    // Get list of all stocks from BRAPI
    const stockListResponse = await fetch(
      `https://brapi.dev/api/quote/list?token=${BRAPI_TOKEN}`
    )

    if (!stockListResponse.ok) {
      throw new Error(`HTTP error! status: ${stockListResponse.status}`)
    }

    const stockListData = await stockListResponse.json()
    const stocks = stockListData.stocks || [];
    console.log(`Total stocks from API: ${stocks.length}`);

    // Filter potential FIIs (ending with 11)
    const potentialFiis = stocks.filter(
      (stock: any) => stock.stock?.endsWith('11')
    );
    
    console.log(`Found ${potentialFiis.length} potential FIIs`);
    console.log('First 10 potential FIIs:', potentialFiis.slice(0, 10));
    console.log('All potential FIIs:', potentialFiis.map(s => s.stock).join(', '));

    // Get detailed data for each potential FII
    const fiiDetails = await Promise.all(
      potentialFiis.map(async (stock: any) => {
        try {
          console.log(`Fetching details for ${stock.stock}...`);
          const quoteResponse = await fetch(
            `https://brapi.dev/api/quote/${stock.stock}?modules=summaryProfile,defaultKeyStatistics&token=${BRAPI_TOKEN}`
          );

          if (!quoteResponse.ok) {
            console.error(`Failed to fetch ${stock.stock}: ${quoteResponse.status}`);
            return null;
          }

          const quoteData = await quoteResponse.json();
          const result = quoteData.results[0];

          if (!result || !result.regularMarketPrice) {
            console.error(`No data for ${stock.stock}`);
            return null;
          }

          console.log(`Raw data from Brapi for ${stock.stock}:`, {
            name: result.longName,
            sector: result.summaryProfile?.sector,
            type: result.summaryProfile?.type,
            industry: result.summaryProfile?.industry,
            fullData: result
          });

          // Verifica se é um FII baseado no nome e outras características
          const name = result.longName || stock.name || stock.stock;
          const nonFiiWords = [
            'BANCO', 'BANCOS', 'FINANCEIRA', 'SEGURADORA', 'HOLDING',
            'ALIMENTOS', 'VAREJO', 'INDUSTRIA', 'PETROLEO',
            'ACUCAR', 'PAPEL', 'SIDERURGIA', 'TELECOMUNICACOES',
            'ON', 'PN', 'UNT', 'OR', 'PR', 'PNA', 'PNB', 'PNC', 'PND'
          ];

          // Se tem alguma palavra que indica que não é FII, pula
          if (nonFiiWords.some(word => name.toUpperCase().includes(word))) {
            console.log(`Skipping ${stock.stock} - name contains non-FII word`);
            return null;
          }

          // Se tem preço muito alto (acima de 1000), provavelmente não é FII
          if (result.regularMarketPrice > 1000) {
            console.log(`Skipping ${stock.stock} - price too high (${result.regularMarketPrice})`);
            return null;
          }

          // Determina o tipo do fundo baseado nos dados da API
          let type = null;
          const upperName = name.toUpperCase();
          const ticker = stock.stock.toUpperCase();
          const industry = (result.summaryProfile?.industry || '').toUpperCase();
          const sector = (result.summaryProfile?.sector || '').toUpperCase();
          
          console.log(`Analyzing fund ${ticker}:`, {
            name: upperName,
            industry,
            sector
          });

          // Energia
          if (industry.includes('ENERGY') || industry.includes('POWER') ||
              upperName.includes('ENERGIA') || upperName.includes('ENERGISA') || 
              upperName.includes('ENGIE') || ticker.startsWith('ENGI') ||
              upperName.includes('POWER') || upperName.includes('ENERGÉTICA') ||
              upperName.includes('RENOVAVEL') || upperName.includes('RENOVÁVEL') ||
              upperName.includes('SOLAR') || upperName.includes('EOLICA') ||
              upperName.includes('EÓLICA')) {
            type = 'Energia';
          }
          // Agro
          else if (industry.includes('AGRI') || industry.includes('FARM') ||
              upperName.includes('AGRO') || upperName.includes('AGRICULTURA') || 
              upperName.includes('AGRICOLA') || upperName.includes('AGRÍCOLA') ||
              upperName.includes('RURAL') || upperName.includes('FAZENDA') ||
              upperName.includes('TERRA') || upperName.includes('TERRAS')) {
            type = 'Agro';
          }
          // Papel
          else if (industry.includes('MORTGAGE') || industry.includes('DEBT') ||
              upperName.includes('RECEBÍVEIS') || upperName.includes('RECEBIVEIS') || 
              upperName.includes('CREDITO') || upperName.includes('CRÉDITO') ||
              upperName.includes('CRI') || upperName.includes('FINANCEIRO') || 
              upperName.includes('RENDA') || upperName.includes('IMOBILIARIO DE RENDA') ||
              upperName.includes('SECURITIES') || upperName.includes('SECURITIZAÇÃO') ||
              upperName.includes('SECURITIZACAO')) {
            type = 'Papel';
          } 
          // FOF
          else if (industry.includes('FUND') || industry.includes('ETF') ||
                   upperName.includes('FUNDO DE FUNDOS') || upperName.includes('FOF') ||
                   upperName.includes('FII') || upperName.includes('IMOBILIÁRIOS') ||
                   upperName.includes('FUNDO DE INVESTIMENTO EM COTAS') ||
                   upperName.includes('PORTFOLIO') || upperName.includes('PORTFÓLIO')) {
            type = 'FOF';
          } 
          // Híbrido
          else if (industry.includes('HYBRID') || industry.includes('MIXED') ||
                   upperName.includes('HÍBRIDO') || upperName.includes('HIBRIDO') ||
                   upperName.includes('MISTO') || upperName.includes('DESENVOLVIMENTO') ||
                   upperName.includes('MULTI') || upperName.includes('DIVERSIFICADO')) {
            type = 'Híbrido';
          }
          // Tijolo
          else if (industry.includes('OFFICE') || industry.includes('RETAIL') || 
                   industry.includes('INDUSTRIAL') || industry.includes('RESIDENTIAL') ||
                   industry.includes('DIVERSIFIED') ||
                   upperName.includes('LOGÍSTICA') || upperName.includes('LOGISTICA') || 
                   upperName.includes('INDUSTRIAL') || upperName.includes('SHOPPING') ||
                   upperName.includes('COMERCIAL') || upperName.includes('VAREJO') ||
                   upperName.includes('HOSPITAL') || upperName.includes('EDUCACIONAL') ||
                   upperName.includes('HOTEL') || upperName.includes('OFFICE') ||
                   upperName.includes('CORPORATIVO') || upperName.includes('GALPÃO') ||
                   upperName.includes('GALPAO') || upperName.includes('IMOBILIARIO') ||
                   upperName.includes('EDIFICIO') || upperName.includes('EDIFÍCIO') ||
                   upperName.includes('TORRE') || upperName.includes('SQUARE') ||
                   upperName.includes('CENTER') || upperName.includes('BUSINESS') ||
                   upperName.includes('CORPORATE') || upperName.includes('MALL') ||
                   upperName.includes('PLAZA') || upperName.includes('PARK') ||
                   upperName.includes('OUTLET') || upperName.includes('ANDAMENTO') ||
                   upperName.includes('COMERCIAIS') || upperName.includes('COMERCIAL') ||
                   upperName.includes('LAJES') || upperName.includes('ESCRITÓRIOS') ||
                   upperName.includes('ESCRITORIOS') || upperName.includes('OFFICES') ||
                   upperName.includes('SALA') || upperName.includes('SALAS') ||
                   upperName.includes('ANDAR') || upperName.includes('ANDARES')) {
            type = 'Tijolo';
          } 

          // Se ainda não identificou o tipo mas tem "FUNDO" no nome, é provavelmente Tijolo
          if (!type && upperName.includes('FUNDO') && upperName.includes('IMOBILIÁRIO')) {
            type = 'Tijolo';
          }

          // Se ainda não identificou o tipo mas é um FII (termina com 11), define como Tijolo
          if (!type && ticker.endsWith('11')) {
            type = 'Tijolo';
          }

          console.log(`Fund ${ticker} determined as type: ${type} based on industry: ${industry}, sector: ${sector}`);
          // Garante que todo FII tenha um tipo
          if (!type) {
            type = 'Tijolo'; // Tipo padrão para FIIs não identificados
          }

          console.log(`Fund ${ticker} type determined as: ${type}`);

          return {
            ticker: stock.stock,
            name: name,
            currentPrice: result.regularMarketPrice,
            type: type,
            pvp: result.defaultKeyStatistics?.priceToBook || null,
            lastDividend: result.defaultKeyStatistics?.lastDividendValue || null,
            dividendYield: result.defaultKeyStatistics?.dividendYield || null,
            sector: result.summaryProfile?.sector || null,
            lastDividendDate: result.defaultKeyStatistics?.lastDividendDate || null
          };
        } catch (error) {
          console.error(`Error fetching ${stock.stock}:`, error);
          return null;
        }
      })
    );

    // Filter out failed requests and non-FIIs
    const validFiis = fiiDetails.filter((fii): fii is NonNullable<typeof fii> => fii !== null);
    console.log(`Successfully fetched ${validFiis.length} valid FIIs`);
    console.log('Sample of FIIs before saving:', validFiis.slice(0, 5));

    // Save to database
    const savedFiis = await Promise.all(
      validFiis.map(async (fii) => {
        try {
          console.log(`Saving fund ${fii.ticker} with type: ${fii.type}`);
          const saved = await prisma.fund.upsert({
            where: { ticker: fii.ticker },
            update: {
              name: fii.name,
              currentPrice: fii.currentPrice,
              type: fii.type,
              pvp: fii.pvp,
              lastDividend: fii.lastDividend,
              dividendYield: fii.dividendYield,
              sector: fii.sector,
              lastDividendDate: fii.lastDividendDate ? new Date(fii.lastDividendDate) : null,
              updatedAt: new Date()
            },
            create: {
              ticker: fii.ticker,
              name: fii.name,
              currentPrice: fii.currentPrice,
              type: fii.type,
              pvp: fii.pvp,
              lastDividend: fii.lastDividend,
              dividendYield: fii.dividendYield,
              sector: fii.sector,
              lastDividendDate: fii.lastDividendDate ? new Date(fii.lastDividendDate) : null
            }
          });
          console.log(`Saved fund ${fii.ticker}:`, saved);
          return saved;
        } catch (error) {
          console.error(`Error saving ${fii.ticker}:`, error);
          return null;
        }
      })
    );

    const successfullySaved = savedFiis.filter((fii): fii is NonNullable<typeof fii> => fii !== null);
    console.log(`Successfully saved ${successfullySaved.length} FIIs`);

    return NextResponse.json({
      success: true,
      message: 'Funds synchronized successfully',
      count: successfullySaved.length
    });
  } catch (error) {
    console.error('Error syncing funds:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
