exports.handler = async (event) => {
  const params = event.queryStringParameters;
  const url = `https://api.open-meteo.com/v1/forecast?${new URLSearchParams(params)}`;
  
  try {
    const response = await fetch(url);
    const data = await response.text();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: data
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Proxy failed' })
    };
  }
};