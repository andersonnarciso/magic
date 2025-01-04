import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHGToken } from '@/lib/config';

async function fetchWithErrorHandling(url: string) {
    try {
        console.log('Fazendo requisição para:', url.replace(/key=([^&]+)/, 'key=XXXXX'));
        const response = await fetch(url);
        const contentType = response.headers.get('content-type');
        
        console.log('Status:', response.status);
        console.log('Content-Type:', contentType);
        
        if (!response.ok) {
            throw new Error(`API retornou status ${response.status}`);
        }

        if (!contentType?.includes('application/json')) {
            const text = await response.text();
            console.error('Resposta não-JSON:', text);
            throw new Error(`API retornou ${contentType} em vez de JSON. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Resposta:', JSON.stringify(data, null, 2));
        return data;
    } catch (error) {
        console.error('Erro ao fazer requisição:', error);
        throw error;
    }
}

export async function GET() {
    try {
        console.log('\nSincronizando taxas de referência...');
        const HG_TOKEN = getHGToken();
        if (!HG_TOKEN) {
            console.error('❌ Token não configurado');
            return NextResponse.json({ error: 'Token não configurado' }, { status: 500 });
        }

        // Buscar taxas da API
        const url = `https://api.hgbrasil.com/finance/taxes?key=${HG_TOKEN}`;
        const data = await fetchWithErrorHandling(url);

        if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
            console.error('❌ API não retornou results:', data);
            throw new Error('API não retornou resultados');
        }

        const rates = data.results[0];
        let updated = { selic: null, cdi: null };

        // Atualizar SELIC
        if (typeof rates.selic === 'number') {
            const selic = await prisma.referenceRate.upsert({
                where: { name: 'SELIC' },
                update: { value: rates.selic },
                create: { name: 'SELIC', value: rates.selic }
            });
            console.log(`✅ SELIC atualizada: ${selic.value}%`);
            updated.selic = selic.value;
        } else {
            console.error('❌ SELIC inválida:', rates.selic);
        }

        // Atualizar CDI
        if (typeof rates.cdi === 'number') {
            const cdi = await prisma.referenceRate.upsert({
                where: { name: 'CDI' },
                update: { value: rates.cdi },
                create: { name: 'CDI', value: rates.cdi }
            });
            console.log(`✅ CDI atualizado: ${cdi.value}%`);
            updated.cdi = cdi.value;
        } else {
            console.error('❌ CDI inválido:', rates.cdi);
        }

        return NextResponse.json({
            message: 'Taxas atualizadas com sucesso',
            ...updated
        });

    } catch (error) {
        console.error('❌ Erro ao sincronizar taxas:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
