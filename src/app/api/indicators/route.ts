import { NextResponse } from 'next/server';

const BRAPI_TOKEN = process.env.BRAPI_TOKEN;

export async function GET() {
  try {
    // Busca indicadores econômicos
    const indicatorsResponse = await fetch(
      `https://brapi.dev/api/v2/prime-rate?country=brazil&token=${BRAPI_TOKEN}`
    );

    if (!indicatorsResponse.ok) {
      throw new Error(`HTTP error! status: ${indicatorsResponse.status}`);
    }

    const indicatorsData = await indicatorsResponse.json();
    
    // Busca cotação do dólar
    const usdResponse = await fetch(
      `https://brapi.dev/api/v2/currency?currency=USD-BRL&token=${BRAPI_TOKEN}`
    );

    if (!usdResponse.ok) {
      throw new Error(`HTTP error! status: ${usdResponse.status}`);
    }

    const usdData = await usdResponse.json();
    
    // Formata os dados
    const indicators = {
      selic: {
        name: 'Taxa Selic',
        value: Number(indicatorsData.selic?.value || 0),
        description: 'Taxa básica de juros da economia'
      },
      ipca: {
        name: 'IPCA',
        value: Number(indicatorsData.ipca?.value || 0),
        description: 'Índice oficial de inflação do Brasil'
      },
      cdi: {
        name: 'CDI',
        value: Number(indicatorsData.cdi?.value || 0),
        description: 'Certificado de Depósito Interbancário'
      },
      igpm: {
        name: 'IGP-M',
        value: Number(indicatorsData.igpm?.value || 0),
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
    return NextResponse.json(
      { error: 'Failed to fetch indicators' },
      { status: 500 }
    );
  }
}
