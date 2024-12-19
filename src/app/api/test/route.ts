import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const ticker = 'MXRF11'
    
    // Tentar diferentes endpoints para histórico
    const responses = await Promise.all([
      // Histórico geral
      fetch(`https://brapi.dev/api/quote/${ticker}/history?token=${process.env.BRAPI_TOKEN}&range=12mo&interval=1mo`),
      // Histórico de dividendos
      fetch(`https://brapi.dev/api/quote/${ticker}/dividends/history?token=${process.env.BRAPI_TOKEN}`),
      // Dados atuais
      fetch(`https://brapi.dev/api/quote/${ticker}?token=${process.env.BRAPI_TOKEN}&fundamental=true`)
    ])

    const [historyResponse, dividendsHistoryResponse, fundamentalsResponse] = responses
    
    const results = await Promise.all([
      historyResponse.json().catch(() => ({ error: 'Failed to parse history' })),
      dividendsHistoryResponse.json().catch(() => ({ error: 'Failed to parse dividends history' })),
      fundamentalsResponse.json().catch(() => ({ error: 'Failed to parse fundamentals' }))
    ])

    return NextResponse.json({
      ticker,
      history: results[0],
      dividendsHistory: results[1],
      fundamentals: results[2],
      message: 'Verificando diferentes fontes de dados para calcular o DY'
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      type: 'Erro ao processar a requisição'
    }, { status: 500 })
  }
}
