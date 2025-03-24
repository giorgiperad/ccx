// List of cryptocurrencies to track (CoinGecko IDs) - 34 coins from your widget
const cryptoIds = [
    'bitcoin', 'rejuve-ai', 'sophiaverse', 'chia', 'stellar',
    'kava', 'decentraland', 'zksync', 'arbitrum', 'optimism',
    'dforce-token', 'band-protocol', 'notcoin', 'polkadot', 'solana',
    'singularity-finance', 'flare-networks', 'redbelly-network-token',
    'songbird', 'vestate', 'coin98', 'hypercycle', 'alien-worlds',
    'chainge-finance', 'befi-labs', 'hello-labs', 'masa-finance',
    'cardano', 'ripple', 'celo', 'osmosis', 'cosmos', 'berachain-bera',
    'sui'
];

// Function to fetch crypto data
async function fetchCryptoData() {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptoIds.join(',')}&order=market_cap_desc&per_page=100&page=1&sparkline=false`;
    const container = document.getElementById('crypto-list');

    try {
        console.log('Fetching from URL:', url);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API Response:', data);
        displayCryptoData(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        container.innerHTML = '<p class="error-message">Failed to load crypto data. Check console for details.</p>';
    }
}

// Function to display crypto data
function displayCryptoData(data) {
    const container = document.getElementById('crypto-list');
    container.innerHTML = ''; // Clear previous content

    data.forEach(coin => {
        const price = coin.current_price ? `$${coin.current_price.toFixed(2)}` : 'N/A';
        const marketCap = coin.market_cap ? `$${coin.market_cap.toLocaleString()}` : 'N/A';
        const change24h = coin.price_change_percentage_24h !== null ? coin.price_change_percentage_24h.toFixed(2) : 'N/A';
        const changeClass = change24h >= 0 ? 'positive' : 'negative';

        const card = document.createElement('div');
        card.className = 'crypto-card';
        card.innerHTML = `
            <div class="crypto-name">${coin.id}</div>
            <div class="crypto-details">
                <span class="crypto-price">Price: ${price}</span>
                <span class="crypto-market-cap">Market Cap: ${marketCap}</span>
                <span class="crypto-change ${changeClass}">24h Change: ${change24h}%</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// Fetch data immediately and refresh every 60 seconds
fetchCryptoData();
setInterval(fetchCryptoData, 60000);