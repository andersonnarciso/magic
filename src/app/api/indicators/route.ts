import { NextResponse } from 'next/server';

const HG_TOKEN = process.env.HG_TOKEN;

export async function GET() {
  try {
    console.log('Fetching indicators...');
    
    // Busca taxas (CDI e SELIC)
    const taxesResponse = await fetch(
      `https://api.hgbrasil.com/finance/taxes?key=${HG_TOKEN}`
    );

    if (!taxesResponse.ok) {
      throw new Error(`HTTP error! status: ${taxesResponse.status}`);
    }

    const taxesData = await taxesResponse.json();
    console.log('Taxes data:', JSON.stringify(taxesData, null, 2));
    
    // A API retorna os valores como strings, precisamos converter para número
    const cdi = parseFloat(taxesData.results?.[0]?.cdi || '0');
    const selic = parseFloat(taxesData.results?.[0]?.selic || '0');

    // Busca cotação do dólar
    const quotesResponse = await fetch(
      `https://api.hgbrasil.com/finance/quotations?key=${HG_TOKEN}`
    );

    if (!quotesResponse.ok) {
      throw new Error(`HTTP error! status: ${quotesResponse.status}`);
    }

    const quotesData = await quotesResponse.json();
    console.log('Quotes data:', JSON.stringify(quotesData, null, 2));
    
    const usdValue = parseFloat(quotesData.results?.currencies?.USD?.buy || '0');

    // Busca IPCA e IGPM do BCB
    const [ipca, igpm] = await Promise.all([
      fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/1?formato=json')
        .then(res => res.json())
        .then(data => parseFloat(data[0]?.valor || '0'))
        .catch(() => 0),
      fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.189/dados/ultimos/1?formato=json')
        .then(res => res.json())
        .then(data => parseFloat(data[0]?.valor || '0'))
        .catch(() => 0)
    ]);
    
    // Formata os dados
    const indicators = {
      selic: {
        name: 'Taxa Selic',
        value: selic,
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
        value: usdValue,
        description: 'Cotação do dólar comercial'
      }
    };

    console.log('Final indicators:', indicators);
    return NextResponse.json(indicators);
  } catch (error) {
    console.error('Error fetching indicators:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
