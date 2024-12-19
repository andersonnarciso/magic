import * as cheerio from 'cheerio'

export async function getDividendYieldFromInvestidor10(ticker: string): Promise<number | null> {
  try {
    const response = await fetch(`https://investidor10.com.br/fiis/${ticker.toLowerCase()}/`)
    
    if (!response.ok) {
      console.warn(`Failed to fetch data from Investidor10 for ${ticker}: ${response.status}`)
      return null
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    
    // Encontra o DY na tabela de indicadores
    const dyCell = $('#table-indicators td').filter(function() {
      return $(this).find('span[title="Dividend Yield"]').length > 0
    })
    
    if (dyCell.length === 0) {
      console.warn(`DY not found for ${ticker} on Investidor10`)
      return null
    }
    
    // Pega o valor do DY e converte para número
    const dyText = dyCell.text().trim()
    const dyValue = parseFloat(dyText.replace('%', '').replace(',', '.'))
    
    if (isNaN(dyValue)) {
      console.warn(`Invalid DY value for ${ticker} on Investidor10: ${dyText}`)
      return null
    }
    
    // Converte o percentual para decimal
    return dyValue / 100
  } catch (error) {
    console.error(`Error fetching data from Investidor10 for ${ticker}:`, error)
    return null
  }
}

export async function getLastDividendFromInvestidor10(ticker: string): Promise<{ value: number | null, date: Date | null }> {
  try {
    const response = await fetch(`https://investidor10.com.br/fiis/${ticker.toLowerCase()}/`)
    
    if (!response.ok) {
      console.warn(`Failed to fetch data from Investidor10 for ${ticker}: ${response.status}`)
      return { value: null, date: null }
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    
    // Encontra a tabela de proventos
    const proventosTable = $('table').filter(function() {
      return $(this).find('th:contains("Proventos")').length > 0
    })
    
    if (proventosTable.length === 0) {
      console.warn(`Proventos table not found for ${ticker} on Investidor10`)
      return { value: null, date: null }
    }
    
    // Pega a primeira linha (provento mais recente)
    const firstRow = proventosTable.find('tbody tr').first()
    if (firstRow.length === 0) {
      console.warn(`No proventos found for ${ticker} on Investidor10`)
      return { value: null, date: null }
    }
    
    // Extrai valor e data
    const valueText = firstRow.find('td:nth-child(2)').text().trim()
    const dateText = firstRow.find('td:nth-child(4)').text().trim()
    
    const value = parseFloat(valueText.replace('R$', '').replace(',', '.'))
    const [day, month, year] = dateText.split('/').map(Number)
    const date = new Date(year, month - 1, day)
    
    if (isNaN(value) || isNaN(date.getTime())) {
      console.warn(`Invalid provento data for ${ticker} on Investidor10: value=${valueText}, date=${dateText}`)
      return { value: null, date: null }
    }
    
    return { value, date }
  } catch (error) {
    console.error(`Error fetching data from Investidor10 for ${ticker}:`, error)
    return { value: null, date: null }
  }
}
