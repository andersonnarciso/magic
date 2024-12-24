import { NextResponse } from 'next/server';

const BRAPI_TOKEN = process.env.BRAPI_TOKEN;

async function fetchBCBIndicator(code: number) {
  try {
    // Para o CDI, vamos usar uma API diferente
    if (code === 4389) {
      try {
        const response = await fetch(
          'https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados/ultimos/1?formato=json'
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('CDI Response:', text);
        
        try {
          const data = JSON.parse(text);
          const value = Number(data[0]?.valor || 0);
          console.log('CDI Value:', value);
          return value;
        } catch (parseError) {
          console.error('Error parsing CDI JSON:', parseError);
          // Se falhar, vamos tentar calcular com base na SELIC (98.5% da SELIC)
          const selicResponse = await fetch(
            'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json'
          );
          const selicData = await selicResponse.json();
          const selicValue = Number(selicData[0]?.valor || 0);
          return selicValue * 0.985; // CDI é aproximadamente 98.5% da SELIC
        }
      } catch (error) {
        console.error('Error fetching CDI:', error);
        return 0;
      }
    }

    const response = await fetch(
      `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados/ultimos/1?formato=json`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return Number(data[0]?.valor || 0);
  } catch (error) {
    console.error(`Error fetching BCB indicator ${code}:`, error);
    return 0;
  }
}

export async function GET() {
  try {
    console.log('Fetching indicators...');
    
    // Busca indicadores do BCB
    const [selic, ipca, cdi, igpm] = await Promise.all([
      fetchBCBIndicator(432),  // SELIC
      fetchBCBIndicator(433),  // IPCA
      fetchBCBIndicator(4389), // CDI
      fetchBCBIndicator(189)   // IGP-M
    ]);

    console.log('Indicators fetched:', { selic, ipca, cdi, igpm });

    // Busca cotação do dólar da Brapi
    const usdResponse = await fetch(
      `https://brapi.dev/api/v2/currency?currency=USD-BRL&token=${BRAPI_TOKEN}`
    );
    const usdData = await usdResponse.json();
    
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
        value: Number(usdData.currency?.[0]?.bidPrice || 0),
        description: 'Cotação do dólar em reais'
      }
    };

    console.log('Final indicators:', indicators);
    
    return NextResponse.json(indicators);
  } catch (error) {
    console.error('Error fetching indicators:', error);
    return NextResponse.json({ error: 'Failed to fetch indicators' }, { status: 500 });
  }
}
