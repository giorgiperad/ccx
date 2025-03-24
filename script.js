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
let sortColumn = 'price'; // Default to price instead of market_cap
let sortDirection = -1; // -1 for descending, 1 for ascending
let cryptoData = [];

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
        cryptoData = data; // Store data globally for sorting
        displayCryptoData();
    } catch (error) {
        console.error('Error fetching data:', error);
        container.innerHTML = '<tr><td colspan="3" class="error-message">Failed to load crypto data. Check console for details.</td></tr>';
    }
}

// Function to display and sort crypto data
function displayCryptoData() {
    const container = document.getElementById('crypto-list');
    container.innerHTML = ''; // Clear previous content

    // Sort the data based on the current column and direction
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
            default:
                return 0;
        }
    });

    sortedData.forEach(coin => {
        const price = coin.current_price ? `$${coin.current_price.toFixed(2)}` : 'N/A';
        const change24h = coin.price_change_percentage_24h !== null ? coin.price_change_percentage_24h.toFixed(2) : 'N/A';
        const changeClass = change24h >= 0 ? 'positive' : 'negative';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="crypto-name">${coin.id}</td>
            <td class="crypto-price">${price}</td>
            <td class="crypto-change ${changeClass}">${change24h}%</td>
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
                // Toggle direction if same column
                sortDirection *= -1;
            } else {
                // New column, default to descending (except name, which is ascending)
                sortColumn = newSortColumn;
                sortDirection = newSortColumn === 'name' ? 1 : -1;
            }

            // Update active header style
            headers.forEach(h => h.classList.remove('active'));
            header.classList.add('active');

            displayCryptoData(); // Re-render with new sort
        });
    });
}

// Fetch data and set up sorting
fetchCryptoData();
setInterval(fetchCryptoData, 60000); // Refresh every 60 seconds
setupSorting();