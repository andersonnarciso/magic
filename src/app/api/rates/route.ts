import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const rates = await prisma.referenceRate.findMany();
    
    const ratesMap = rates.reduce((acc, rate) => {
      acc[rate.name] = rate.value;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json(ratesMap);
  } catch (error) {
    console.error('Error fetching reference rates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
