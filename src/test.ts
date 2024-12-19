const { getLastDividendFromInvestidor10, getDividendYieldFromInvestidor10 } = require('./services/scraping')

async function test() {
  console.log('Testando scraping do Investidor10...')
  
  const ticker = 'knri11'
  
  console.log('\nTestando getDividendYieldFromInvestidor10...')
  const dy = await getDividendYieldFromInvestidor10(ticker)
  console.log('DY:', dy)
  
  console.log('\nTestando getLastDividendFromInvestidor10...')
  const dividend = await getLastDividendFromInvestidor10(ticker)
  console.log('Último dividendo:', dividend)
}

test().catch(console.error)
