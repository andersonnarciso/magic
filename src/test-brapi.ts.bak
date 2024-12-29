import fetch from 'node-fetch';

const BRAPI_TOKEN = process.env.BRAPI_TOKEN;

async function test() {
  console.log('Testing BRAPI API...');
  
  const response = await fetch(
    `https://brapi.dev/api/quote/list?token=${BRAPI_TOKEN}`
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log(`Total stocks: ${data.stocks.length}`);
  
  // Conta quantos terminam em 11
  const endsWith11 = data.stocks.filter((stock: any) => stock.stock.endsWith('11'));
  console.log(`Stocks ending with 11: ${endsWith11.length}`);
  
  // Lista TODOS que terminam em 11 em ordem alfabética
  console.log('All stocks ending with 11:');
  endsWith11
    .sort((a: any, b: any) => a.stock.localeCompare(b.stock))
    .forEach((stock: any) => {
      console.log(`${stock.stock}: ${stock.name}`);
    });
}

test().catch(console.error);
