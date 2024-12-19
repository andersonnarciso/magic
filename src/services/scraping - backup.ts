import { JSDOM } from 'jsdom'
import { getFundData } from './brapi';

export interface DividendData {
  value: number
  date: Date
}

export async function getLastDividendFromInvestidor10(ticker: string): Promise<DividendData | null> {
  try {
    const response = await fetch(`https://investidor10.com.br/fiis/${ticker}`)
    const html = await response.text()
    const dom = new JSDOM(html)
    const document = dom.window.document

    const dividendElement = document.querySelector('.card-body .fw-bold')
    if (!dividendElement) return null

    const dateElement = document.querySelector('.card-body small')
    if (!dateElement) return null

    const value = parseFloat(dividendElement.textContent?.replace('R$ ', '').replace(',', '.') || '0')
    const dateText = dateElement.textContent?.trim() || ''
    const [day, month, year] = dateText.split('/')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))

    return { value, date }
  } catch (error) {
    console.error(`Error fetching dividend data for ${ticker}:`, error)
    return null
  }
}

export async function getDividendYieldFromInvestidor10(ticker: string): Promise<number | null> {
  try {
    const response = await fetch(`https://investidor10.com.br/fiis/${ticker}`)
    const html = await response.text()
    const dom = new JSDOM(html)
    const document = dom.window.document

    const dyElement = document.querySelector('.dy-value')
    if (!dyElement) return null

    const value = parseFloat(dyElement.textContent?.replace('%', '').replace(',', '.') || '0')
    return value / 100
  } catch (error) {
    console.error(`Error fetching DY data for ${ticker}:`, error)
    return null
  }
}

export async function getPVPFromInvestidor10(ticker: string): Promise<number | null> {
  try {
    const response = await fetch(`https://investidor10.com.br/fiis/${ticker}`)
    const html = await response.text()
    const dom = new JSDOM(html)
    const document = dom.window.document

    const pvpElement = document.querySelector('.pvp-value')
    if (!pvpElement) return null

    const value = parseFloat(pvpElement.textContent?.replace(',', '.') || '0')
    return value
  } catch (error) {
    console.error(`Error fetching P/VP data for ${ticker}:`, error)
    return null
  }
}

export async function getMarketValueFromInvestidor10(ticker: string): Promise<number | null> {
  try {
    const response = await fetch(`https://investidor10.com.br/fiis/${ticker}`)
    const html = await response.text()
    const dom = new JSDOM(html)
    const document = dom.window.document

    const marketValueElement = document.querySelector('.market-value')
    if (!marketValueElement) return null

    const valueText = marketValueElement.textContent?.trim() || '0'
    const value = parseFloat(valueText.replace('R$ ', '').replace(',', '.').replace(/[MB]/g, ''))
    
    // Converter para o valor real
    if (valueText.includes('B')) {
      return value * 1000000000
    } else if (valueText.includes('M')) {
      return value * 1000000
    }
    return value
  } catch (error) {
    console.error(`Error fetching market value data for ${ticker}:`, error)
    return null
  }
}

export async function getFundDetails(ticker: string) {
  try {
    const data = await getFundData(ticker);
    return {
      ticker,
      ...data
    };
  } catch (error) {
    console.error(`Error fetching data for ${ticker}:`, error);
    throw error;
  }
}
