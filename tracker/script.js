// List of cryptocurrencies to track (CoinGecko IDs)
const cryptoIds = [
    'bitcoin', 'ethereum', 'cardano', 'solana', 'chainlink',
    'ripple', 'polkadot', 'stellar', 'decentraland', 'cosmos',
    'dogecoin' // Added Dogecoin here
];

// Function to fetch prices
async function fetchCryptoPrices() {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds.join(',')}&vs_currencies=usd`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayPrices(data);
    } catch (error) {
        console.error('Error fetching prices:', error);
    }
}

// Function to display prices
function displayPrices(data) {
    const container = document.getElementById('crypto-list');
    container.innerHTML = ''; // Clear previous content

    cryptoIds.forEach(id => {
        const price = data[id]?.usd ? `$${data[id].usd.toFixed(2)}` : 'N/A';
        const item = document.createElement('div');
        item.className = 'crypto-item';
        item.innerHTML = `
            <span class="crypto-name">${id}</span>
            <span class="crypto-price">${price}</span>
        `;
        container.appendChild(item);
    });
}

// Fetch prices immediately and refresh every 30 seconds
fetchCryptoPrices();
setInterval(fetchCryptoPrices, 30000);