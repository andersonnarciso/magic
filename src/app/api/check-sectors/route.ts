import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Primeiro, vamos ver todos os setores no nosso banco
    const dbSectors = await prisma.fund.groupBy({
      by: ['sector'],
      _count: true,
      where: {
        sector: { not: null }
      }
    });

    console.log('=== SETORES NO BANCO ===');
    console.log(dbSectors);

    // Agora vamos pegar alguns fundos de exemplo do HG
    const HG_TOKEN = process.env.HG_TOKEN || 'a82d8319';
    const testFunds = ['HVFF11', 'HCTR11', 'NSLU11']; // Fundos que deveriam ser hospitalares
    
    const response = await fetch(`https://api.hgbrasil.com/finance/stock_price?key=${HG_TOKEN}&symbol=${testFunds.join(',')}`);
    const hgData = await response.json();

    console.log('=== DADOS DO HG ===');
    console.log(JSON.stringify(hgData, null, 2));

    // Vamos ver esses mesmos fundos no nosso banco
    const dbFunds = await prisma.fund.findMany({
      where: {
        ticker: {
          in: testFunds
        }
      },
      select: {
        ticker: true,
        sector: true,
        type: true
      }
    });

    return NextResponse.json({
      database_sectors: dbSectors,
      hg_data: hgData.results,
      database_funds: dbFunds
    });

  } catch (error) {
    console.error('Error checking sectors:', error);
    return NextResponse.json({ error: 'Failed to check sectors' }, { status: 500 });
  }
}
