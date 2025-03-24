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
            case 'volume':
                aValue = a.total_volume || 0;
                bValue = b.total_volume || 0;
                return sortDirection * (aValue - bValue);
            default:
                return 0;
        }
    });

    sortedData.forEach(coin => {
        const price = coin.current_price ? `$${coin.current_price.toFixed(2)}` : 'N/A';
        const change24h = coin.price_change_percentage_24h !== null ? coin.price_change_percentage_24h.toFixed(2) : 'N/A';
        const volume = coin.total_volume ? `$${coin.total_volume.toLocaleString()}` : 'N/A';
        const changeClass = change24h >= 0 ? 'positive' : 'negative';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="crypto-name">
                <img src="${coin.image}" alt="${coin.id} icon" class="crypto-icon">
                ${coin.id}
            </td>
            <td class="crypto-price">${price}</td>
            <td class="crypto-change ${changeClass}">${change24h}%</td>
            <td class="crypto-volume">${volume}</td>
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
fetchCryptoData();
setupSorting();
setInterval(fetchCryptoData, 60000); // Refresh every 60 seconds
