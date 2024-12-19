import axios from 'axios';

async function testBrapi() {
    const token = 'w1kY4iCgJsAC23hTGX5rY9';
    const ticker = 'MXRF11';
    
    try {
        // Teste básico de cotação
        const quoteUrl = `https://brapi.dev/api/quote/${ticker}?token=${token}`;
        const quoteResponse = await axios.get(quoteUrl);
        console.log('Quote Response:', JSON.stringify(quoteResponse.data, null, 2));

        // Teste de fundamentos
        const fundamentalsUrl = `https://brapi.dev/api/quote/${ticker}/fundamentals?token=${token}`;
        const fundamentalsResponse = await axios.get(fundamentalsUrl);
        console.log('Fundamentals Response:', JSON.stringify(fundamentalsResponse.data, null, 2));

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('API Error:', error.response?.data);
        } else {
            console.error('Error:', error);
        }
    }
}

testBrapi();
