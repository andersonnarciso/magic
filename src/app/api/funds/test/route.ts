import { NextResponse } from 'next/server';
import { getHGToken } from '@/lib/config';

export async function GET() {
    try {
        const HG_TOKEN = getHGToken();
        if (!HG_TOKEN) {
            return NextResponse.json({ error: 'Token não configurado' }, { status: 500 });
        }

        // Testar com um único FII conhecido
        const symbols = 'HGLG11';
        const url = `https://api.hgbrasil.com/finance/stock_price?key=${HG_TOKEN}&symbol=${symbols}`;
        
        console.log('URL:', url);
        console.log('Token:', HG_TOKEN);

        const response = await fetch(url);
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        console.log('Status:', response.status);

        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Erro:', error);
        return NextResponse.json({ 
            error: 'Erro ao testar API',
            details: error.message
        }, { status: 500 });
    }
}
