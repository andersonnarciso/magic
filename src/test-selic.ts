async function testSelicApi() {
  const response = await fetch(
    'https://brapi.dev/api/v2/prime-rate?country=brazil&sortBy=date&sortOrder=desc&token=w1kY4iCgJsAC23hTGX5rY9'
  );

  const data = await response.json();
  console.log('API Response:', data);
  console.log('Prime Rate:', data['prime-rate']);
  console.log('First Item:', data['prime-rate']?.[0]);
  console.log('Value:', data['prime-rate']?.[0]?.value);
}

testSelicApi().catch(console.error);
