import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Fetching Selic rate...');
    const response = await fetch(
      'https://brapi.dev/api/v2/prime-rate?country=brazil&sortBy=date&sortOrder=desc&token=w1kY4iCgJsAC23hTGX5rY9',
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    console.log('Raw response:', text);

    const data = JSON.parse(text);
    console.log('Parsed data:', data);

    const rate = data['prime-rate']?.[0]?.value;
    console.log('Rate:', rate);
    
    const result = {
      selic: rate ? parseFloat(rate) : 0
    };
    console.log('Final result:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ selic: 0 });
  }
}
