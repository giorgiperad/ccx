// List of cryptocurrencies to track (CoinGecko IDs) - 34 coins
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

// Store the current sort state
let sortColumn = 'price';
let sortDirection = -1; // -1 for descending, 1 for ascending
let cryptoData = [];
let fearGreedIndex = null;

// Function to fetch Fear and Greed Index
async function fetchFearGreedIndex() {
    const url = 'https://api.alternative.me/fng/?limit=1';
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        fearGreedIndex = parseInt(data.data[0].value);
        updateFearGreedDisplay();
    } catch (error) {
        console.error('Error fetching Fear & Greed Index:', error);
        document.getElementById('fear-greed-value').textContent = 'Error';
    }
}

// Function to update Fear and Greed display
function updateFearGreedDisplay() {
    const fillElement = document.getElementById('fear-greed-fill');
    const valueElement = document.getElementById('fear-greed-value');
    if (fearGreedIndex !== null) {
        fillElement.style.width = `${fearGreedIndex}%`;
        valueElement.textContent = `${fearGreedIndex} - ${getFearGreedClassification(fearGreedIndex)}`;
    }
}

// Function to classify Fear and Greed value
function getFearGreedClassification(value) {
    if (value <= 24) return 'Extreme Fear';
    if (value <= 49) return 'Fear';
    if (value <= 74) return 'Greed';
    return 'Extreme Greed';
}

// Function to fetch crypto data
async function fetchCryptoData() {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptoIds.join(',')}&order=market_cap_desc&per_page=100&page=1&sparkline=false`;
    const container = document.getElementById('crypto-list');

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        cryptoData = data;
        displayCryptoData();
    } catch (error) {
        console.error('Error fetching crypto data:', error);
        container.innerHTML = '<tr><td colspan="4" class="error-message">Failed to load crypto data.</td></tr>';
    }
}

// Function to display and sort crypto data
function displayCryptoData() {
    const container = document.getElementById('crypto-list');
    container.innerHTML = '';

    const sortedData = [...cryptoData].sort((a, b) => {
        let aValue, bValue;
        switch (sortColumn) {
            case 'name':
                aValue = a.id.toLowerCase();
                bValue = b.id.toLowerCase();
                return sortDirection * aValue.localeCompare(bValue);
            case 'price':
                aValue = a.current_price || 0;
                bValue = b.current_price || 0;
                return sortDirection * (aValue - bValue);
            case 'change_24h':
                aValue = a.price_change_percentage_24h || 0;
                bValue = b.price_change_percentage_24h || 0;
                return sortDirection * (aValue - bValue);
            case 'fear_greed':
                aValue = fearGreedIndex || 0;
                bValue = fearGreedIndex || 0;
                return 0; // Static value, no variation
            default:
                return 0;
        }
    });

    sortedData.forEach(coin => {
        const price = coin.current_price ? `$${coin.current_price.toFixed(2)}` : 'N/A';
        const change24h = coin.price_change_percentage_24h !== null ? coin.price_change_percentage_24h.toFixed(2) : 'N/A';
        const changeClass = change24h >= 0 ? 'positive' : 'negative';
        const fearGreed = fearGreedIndex !== null ? fearGreedIndex : 'N/A';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="crypto-name">${coin.id}</td>
            <td class="crypto-price">${price}</td>
            <td class="crypto-change ${changeClass}">${change24h}%</td>
            <td class="crypto-fear-greed">${fearGreed}</td>
        `;
        container.appendChild(row);
    });
}

// Function to handle sorting
function setupSorting() {
    const headers = document.querySelectorAll('.crypto-table th');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const newSortColumn = header.getAttribute('data-sort');
            if (newSortColumn === sortColumn) {
                sortDirection *= -1;
            } else {
                sortColumn = newSortColumn;
                sortDirection = newSortColumn === 'name' ? 1 : -1;
            }

            headers.forEach(h => h.classList.remove('active'));
            header.classList.add('active');
            displayCryptoData();
        });
    });
}

// Fetch data and set up
fetchFearGreedIndex();
fetchCryptoData();
setupSorting();
setInterval(fetchFearGreedIndex, 60000); // Refresh Fear & Greed every 60s
setInterval(fetchCryptoData, 60000); // Refresh crypto data every 60s
