// api/crypto.js – Vercel Serverless Function
export default async function handler(req, res) {
  // CORS ჰედერები ყველა მოთხოვნისთვის
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { url } = req.query; // მოთხოვნის URL-ის პარამეტრი (e.g., /api/crypto?url=https://api.coingecko.com/...)
  if (!url) {
    res.status(400).json({ error: 'Missing URL parameter' });
    return;
  }

  try {
    // Fetch CoinGecko-დან (Vercel-ის სერვერზე CORS არ იბლოკება)
    const response = await fetch(decodeURIComponent(url), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CryptoCollectiveX/1.0)' // თავიდან ამოღება rate limit-ისთვის
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch data: ' + error.message });
  }
}