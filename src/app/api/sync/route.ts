import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const BRAPI_TOKEN = 'w1kY4iCgJsAC23hTGX5rY9'

export async function GET() {
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

          // Verifica se é um FII baseado no nome e outras características
          const name = result.longName || stock.name || stock.stock;
          const nonFiiWords = [
            'BANCO', 'BANCOS', 'FINANCEIRA', 'SEGURADORA', 'HOLDING',
            'ENERGIA', 'ALIMENTOS', 'VAREJO', 'INDUSTRIA', 'PETROLEO',
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

          return {
            ticker: stock.stock,
            name: name,
            price: result.regularMarketPrice,
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

    // Save to database
    const savedFiis = await Promise.all(
      validFiis.map(async (fii) => {
        try {
          return await prisma.fund.upsert({
            where: { ticker: fii.ticker },
            update: {
              name: fii.name,
              price: fii.price,
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
              price: fii.price,
              pvp: fii.pvp,
              lastDividend: fii.lastDividend,
              dividendYield: fii.dividendYield,
              sector: fii.sector,
              lastDividendDate: fii.lastDividendDate ? new Date(fii.lastDividendDate) : null
            }
          });
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
