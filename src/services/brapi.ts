interface BrapiQuoteResponse {
  results: Array<{
    symbol: string;
    regularMarketPrice: number;
    defaultKeyStatistics: {
      priceToBook: number;
      lastDividendValue: number;
      lastDividendDate: string;
    };
    summaryProfile?: {
      industry?: string;
      sector?: string;
    };
  }>;
}

interface BrapiDividendsResponse {
  results: Array<{
    value: number;
    payDate: string;
  }>;
}

const BRAPI_TOKEN = 'w1kY4iCgJsAC23hTGX5rY9';

async function getLast12MonthsDividends(ticker: string): Promise<number> {
  try {
    const response = await fetch(
      `https://brapi.dev/api/dividend/${ticker}?token=${BRAPI_TOKEN}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as BrapiDividendsResponse;
    const now = new Date();
    const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));

    // Filtra dividendos dos últimos 12 meses
    const last12MonthsDividends = data.results
      .filter(dividend => new Date(dividend.payDate) >= oneYearAgo)
      .reduce((total, dividend) => total + dividend.value, 0);

    return last12MonthsDividends;
  } catch (error) {
    console.error('Error fetching dividends from BRAPI:', error);
    return 0;
  }
}

export async function getFundData(ticker: string) {
  try {
    console.log(`Getting data for ${ticker}`);
    const [quoteResponse, totalDividends] = await Promise.all([
      fetch(
        `https://brapi.dev/api/quote/${ticker}?modules=summaryProfile,defaultKeyStatistics&token=${BRAPI_TOKEN}`
      ),
      getLast12MonthsDividends(ticker)
    ]);

    if (!quoteResponse.ok) {
      throw new Error(`HTTP error! status: ${quoteResponse.status}`);
    }

    const data = await quoteResponse.json() as BrapiQuoteResponse;
    const fundData = data.results[0];
    
    if (!fundData) {
      throw new Error(`No data found for ticker ${ticker}`);
    }

    const marketPrice = fundData.regularMarketPrice;
    const pvp = fundData.defaultKeyStatistics?.priceToBook;
    const lastDividendValue = fundData.defaultKeyStatistics?.lastDividendValue || totalDividends / 12;
    const dividendYield = lastDividendValue ? (lastDividendValue * 12 / marketPrice) * 100 : null;

    // Determina o tipo do fundo baseado na indústria
    const industry = fundData.summaryProfile?.industry || '';
    let type = 'FOF';
    if (industry.includes('REIT - Diversified')) {
      type = 'Híbrido';
    } else if (industry.includes('REIT - Office') || industry.includes('REIT - Industrial') || industry.includes('REIT - Retail')) {
      type = 'Tijolo';
    } else if (industry.includes('REIT - Mortgage') || industry.includes('REIT - Specialty')) {
      type = 'Papel';
    }

    console.log(`Fund ${ticker} details:`, {
      marketPrice,
      pvp,
      lastDividendValue,
      dividendYield,
      type,
      industry
    });

    return {
      marketValue: marketPrice,
      pvp: pvp || null,
      lastDividendValue: lastDividendValue || null,
      lastDividendDate: fundData.defaultKeyStatistics?.lastDividendDate || null,
      dividendYield: dividendYield || null,
      type
    };
  } catch (error) {
    console.error('Error fetching fund data from BRAPI:', error);
    throw error;
  }
}
