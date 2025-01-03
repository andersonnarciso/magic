import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const HG_TOKEN = process.env.HG_TOKEN;
    console.log('Starting rates sync with token:', HG_TOKEN);

    // Busca as taxas da API
    const url = `https://api.hgbrasil.com/finance/taxes?key=${HG_TOKEN}`;
    console.log('Fetching URL:', url);
    
    const response = await fetch(url, { 
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('API response not ok:', {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    // Extrai as taxas do primeiro resultado
    const rates = data.results?.[0];
    console.log('Rates object:', rates);
    console.log('Rates object type:', typeof rates);
    console.log('Rates object keys:', Object.keys(rates));
    console.log('Rates selic value:', rates?.selic, 'type:', typeof rates?.selic);
    console.log('Rates cdi value:', rates?.cdi, 'type:', typeof rates?.cdi);
    
    const selic = rates?.selic;
    const cdi = rates?.cdi;

    console.log('Extracted rates:', { selic, cdi });

    // Atualiza as taxas no banco
    const updatedRates = [];

    if (selic) {
      const selicRate = await prisma.referenceRate.upsert({
        where: { name: 'SELIC' },
        update: { value: selic },
        create: { name: 'SELIC', value: selic }
      });
      updatedRates.push(selicRate);
    }

    if (cdi) {
      const cdiRate = await prisma.referenceRate.upsert({
        where: { name: 'CDI' },
        update: { value: cdi },
        create: { name: 'CDI', value: cdi }
      });
      updatedRates.push(cdiRate);
    }

    return NextResponse.json({
      message: 'Reference rates synchronized',
      rates: updatedRates
    });
  } catch (error) {
    console.error('Error synchronizing reference rates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
