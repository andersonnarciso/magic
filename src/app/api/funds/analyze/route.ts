import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHGToken } from '@/lib/config';

export async function GET() {
    try {
        console.log('=== INICIANDO ANÁLISE ===');
        
        const HG_TOKEN = getHGToken();
        console.log('Token obtido:', HG_TOKEN ? 'Sim' : 'Não');
        
        if (!HG_TOKEN) {
            console.error('Token não configurado');
            return NextResponse.json({ error: 'Token não configurado' }, { status: 500 });
        }

        // Vamos analisar vários grupos de fundos
        const grupos = [
            {
                nome: "Recebíveis",
                fundos: ['MXRF11', 'CPTS11', 'KNIP11', 'KNCR11', 'RVBI11']
            },
            {
                nome: "Logística",
                fundos: ['HGLG11', 'VILG11', 'BRCO11', 'LVBI11', 'PATL11']
            },
            {
                nome: "Lajes Corporativas",
                fundos: ['HGRE11', 'RCRB11', 'BRCR11', 'HGPO11', 'PVBI11']
            },
            {
                nome: "Shopping",
                fundos: ['XPML11', 'VISC11', 'HSML11', 'MALL11', 'SHOP11']
            },
            {
                nome: "FiAgro",
                fundos: ['AGCX11', 'RZAG11', 'SNAG11', 'ARCT11', 'GCRA11']
            }
        ];

        const resultados = [];

        // Analisar cada grupo
        for (const grupo of grupos) {
            console.log(`\n=== ANALISANDO GRUPO: ${grupo.nome} ===`);
            
            const url = `https://api.hgbrasil.com/finance/stock_price?key=${HG_TOKEN}&symbol=${grupo.fundos.join(',')}`;
            console.log('Fundos:', grupo.fundos.join(', '));
            
            const response = await fetch(url);
            const data = await response.json();

            if (data?.results) {
                const setores = Object.entries(data.results).reduce((acc: {[key: string]: string[]}, [ticker, info]: [string, any]) => {
                    const setor = info.sector || 'Sem Setor';
                    if (!acc[setor]) acc[setor] = [];
                    acc[setor].push(ticker);
                    return acc;
                }, {});

                resultados.push({
                    grupo: grupo.nome,
                    fundos: grupo.fundos,
                    setores,
                    dados: data.results
                });

                console.log('Setores encontrados:', JSON.stringify(setores, null, 2));
            }

            // Esperar 1 segundo entre as requisições
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return NextResponse.json({
            success: true,
            resultados
        });

    } catch (error: any) {
        console.error('Erro na análise:', error);
        console.error('Stack trace:', error.stack);
        return NextResponse.json({ 
            error: 'Erro ao analisar fundos',
            details: error.message
        }, { status: 500 });
    }
}
