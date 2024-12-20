import { NextResponse } from 'next/server';

const BRAPI_TOKEN = process.env.BRAPI_TOKEN;

async function fetchBCBIndicator(code: number) {
  try {
    const response = await fetch(
      `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados/ultimos/1?formato=json`
    );
    const data = await response.json();
    return Number(data[0]?.valor || 0);
  } catch (error) {
    console.error(`Error fetching BCB indicator ${code}:`, error);
    return 0;
  }
}

export async function GET() {
  try {
    // Busca indicadores do BCB
    const [ipca, cdi, igpm] = await Promise.all([
      fetchBCBIndicator(433),  // IPCA
      fetchBCBIndicator(4389), // CDI
      fetchBCBIndicator(189)   // IGP-M
    ]);

    // Busca cotação do dólar da Brapi
    const usdResponse = await fetch(
      `https://brapi.dev/api/v2/currency?currency=USD-BRL&token=${BRAPI_TOKEN}`
    );
    const usdData = await usdResponse.json();
    
    // Formata os dados
    const indicators = {
      selic: {
        name: 'Taxa Selic',
        value: 0, // Será atualizado pelo endpoint específico
        description: 'Taxa básica de juros da economia'
      },
      ipca: {
        name: 'IPCA',
        value: ipca,
        description: 'Índice oficial de inflação do Brasil'
      },
      cdi: {
        name: 'CDI',
        value: cdi,
        description: 'Certificado de Depósito Interbancário'
      },
      igpm: {
        name: 'IGP-M',
        value: igpm,
        description: 'Índice Geral de Preços do Mercado'
      },
      usd: {
        name: 'Dólar',
        value: Number(usdData.currency?.[0]?.bidPrice || 0),
        description: 'Cotação do dólar em reais'
      }
    };
    
    return NextResponse.json(indicators);
  } catch (error) {
    console.error('Error fetching indicators:', error);
    return NextResponse.json({ error: 'Failed to fetch indicators' }, { status: 500 });
  }
}
