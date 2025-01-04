import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHGToken } from '@/lib/config';

async function fetchWithErrorHandling(url: string) {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    
    if (!contentType?.includes('application/json')) {
        throw new Error(`API retornou ${contentType} em vez de JSON. Status: ${response.status}`);
    }

    if (!response.ok) {
        throw new Error(`API retornou status ${response.status}`);
    }

    return response.json();
}

export async function GET() {
    try {
        const HG_TOKEN = getHGToken();
        if (!HG_TOKEN) {
            console.error('Token não configurado');
            return NextResponse.json({ error: 'Token não configurado' }, { status: 500 });
        }

        console.log('Iniciando reset do banco de dados...');

        // 1. Limpar o banco
        await prisma.fund.deleteMany({});
        console.log('Banco limpo com sucesso');

        // 2. Buscar lista de FIIs da API
        console.log('Buscando lista de FIIs...');
        const listUrl = `https://api.hgbrasil.com/finance/stock_list?key=${HG_TOKEN}&type=fii`;
        console.log('URL:', listUrl);
        
        const listData = await fetchWithErrorHandling(listUrl);
        
        if (!listData?.results?.stocks) {
            throw new Error('API não retornou lista de FIIs');
        }

        const fiiList = listData.results.stocks;
        console.log(`Total de FIIs encontrados: ${fiiList.length}`);

        // 3. Dividir em grupos de 5 para consultar detalhes
        const grupos = [];
        for (let i = 0; i < fiiList.length; i += 5) {
            grupos.push(fiiList.slice(i, i + 5));
        }

        console.log(`Total de grupos: ${grupos.length}`);

        // 4. Processar cada grupo
        const fundosProcessados = [];
        const erros = [];

        for (const [index, grupo] of grupos.entries()) {
            console.log(`\nProcessando grupo ${index + 1} de ${grupos.length}`);
            const tickers = grupo.join(',');
            console.log('Tickers:', tickers);

            try {
                const detailsUrl = `https://api.hgbrasil.com/finance/stock_price?key=${HG_TOKEN}&symbol=${tickers}`;
                console.log('URL:', detailsUrl);
                
                const detailsData = await fetchWithErrorHandling(detailsUrl);

                if (detailsData?.results) {
                    // Processar cada fundo do grupo
                    for (const ticker of grupo) {
                        const info = detailsData.results[ticker];
                        if (info && !info.error) {
                            // Criar fundo no banco
                            await prisma.fund.create({
                                data: {
                                    ticker: ticker,
                                    name: info.name || ticker,
                                    sector: info.sector || null,
                                    currentPrice: info.price || null,
                                    dividendYield: info.dividends?.yield_12m || null,
                                    lastDividend: info.dividends?.yield_12m_sum || null,
                                    equity: info.financials?.equity || null,
                                    equityPerShare: info.financials?.equity_per_share || null,
                                    priceToBookRatio: info.financials?.price_to_book_ratio || null,
                                    lastUpdate: new Date()
                                }
                            });
                            fundosProcessados.push({
                                ticker,
                                sector: info.sector
                            });
                            console.log(`✅ ${ticker} processado com sucesso (${info.sector})`);
                        } else {
                            erros.push({
                                ticker,
                                erro: info?.error?.message || 'Fundo não encontrado'
                            });
                            console.log(`❌ Erro ao processar ${ticker}:`, info?.error?.message || 'Fundo não encontrado');
                        }
                    }
                }

                // Esperar 1 segundo entre as requisições para não sobrecarregar a API
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                console.error(`Erro ao processar grupo ${index + 1}:`, error);
                erros.push({
                    grupo: index + 1,
                    tickers: grupo,
                    erro: error.message
                });
            }
        }

        // 5. Retornar resumo
        return NextResponse.json({
            success: true,
            total: fiiList.length,
            processados: fundosProcessados.length,
            erros: erros.length,
            detalhes: {
                fundos: fundosProcessados,
                erros
            }
        });

    } catch (error: any) {
        console.error('Erro no reset:', error);
        return NextResponse.json({ 
            error: 'Erro ao resetar banco de dados',
            details: error.message
        }, { status: 500 });
    }
}
