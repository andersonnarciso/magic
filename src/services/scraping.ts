import { getFundData } from './brapi';

export interface DividendData {
  value: number;
  date: Date;
}

export async function getFundDetails(ticker: string) {
  try {
    const data = await getFundData(ticker);
    console.log(`Scraping data for ${ticker}:`, data);
    return {
      ticker,
      ...data
    };
  } catch (error) {
    console.error(`Error fetching data for ${ticker}:`, error);
    throw error;
  }
}