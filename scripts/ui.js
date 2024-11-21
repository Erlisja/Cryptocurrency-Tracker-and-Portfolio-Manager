//import { getCoins } from './api.js';



// // Function to render market data on the homepage
// async function displayMarketData() {

//     const marketData = await getCoins();

//     if (marketData) {
//         marketData.forEach(crypto => {

//             // cryptoTable.innerHTML = ''; // Clear existing table content

//             // Create a table row for each cryptocurrency
//             const cryptoRow = document.createElement('tr');
//             cryptoRow.innerHTML = `
//             <td><img src="${crypto.image}" alt="${crypto.name}" width="25" height="25" style="margin-right: 5px";>  ${crypto.name.charAt(0).toUpperCase() + crypto.name.slice(1)}</td>
//             <td>${crypto.symbol.toUpperCase()}</td>
//              <td> ${crypto.current_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
//             <td>${crypto.market_cap.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
//             <td>${crypto.total_volume.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
//              <td>${crypto.price_change_percentage_24h}</td>
//         `;
//             // Append the row to the table
//             cryptoTable.appendChild(cryptoRow);
//         });
//     }
// }

// // Load and display data when the page loads
// document.addEventListener('DOMContentLoaded', displayMarketData);
const cryptoTable = document.getElementById('cryptoTable');
const cryptoCache = {}; // Cache object for storing search results

// Function to render market data on the homepage
async function displayMarketData() {
    try {
        const marketData = await getCoins();
        if (marketData) {
            updateCryptoTable(marketData);
        }
    } catch (error) {
        console.error('Error fetching market data:', error);
        cryptoTable.innerHTML = '<tr><td colspan="6">Failed to load market data.</td></tr>';
    }
}

function clearCryptoTable() {
    // Remove all rows except the header
    const rows = cryptoTable.querySelectorAll('tr:not(#cryptoHeader)');
    rows.forEach(row => row.remove());
}

// Function to update the table
function updateCryptoTable(data) {
    clearCryptoTable(); // Clear existing rows, keep the header

    if (!data || data.length === 0) {
        const noDataRow = document.createElement('tr');
        noDataRow.innerHTML = `<td colspan="6">No data available.</td>`;
        cryptoTable.appendChild(noDataRow);
        return;
    }

    data.forEach(crypto => {
        const name = crypto.name || 'Unknown';
        const symbol = crypto.symbol.toUpperCase() || 'N/A';
        const currentPrice = crypto.current_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || 'N/A';
        const marketCap = crypto.market_cap.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || 'N/A';
        const totalVolume = crypto.total_volume.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || 'N/A';
        const priceChange = crypto.price_change_percentage_24h.toFixed(2) + '%' || 'N/A';

        const cryptoRow = document.createElement('tr');
        cryptoRow.innerHTML = `
            <td><img src="${crypto.image || ''}" alt="${name}" width="25" height="25" style="margin-right: 5px;"> ${name.charAt(0).toUpperCase() + name.slice(1)}</td>
            <td>${symbol}</td>
            <td>${currentPrice}</td>
            <td>${marketCap}</td>
            <td>${totalVolume}</td>
            <td>${priceChange}</td>
        `;
        cryptoTable.appendChild(cryptoRow);
    });
}

// Load and display data when the page loads
document.addEventListener('DOMContentLoaded', displayMarketData);

// Debounce function to limit API calls
function debounce(func, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}
// Function to search for cryptocurrencies by name 
async function searchCrypto() {
    const searchInput = document.getElementById('searchCrypto');
    const searchTerm = searchInput.value.trim().toLowerCase();

    // search for the cryptocurrency in the cache
    if (cryptoCache[searchTerm]) {
        updateCryptoTable(cryptoCache[searchTerm]);
    } else {
        try {
            const data = await getCoins();
            const searchResults = data.filter(crypto => crypto.name.toLowerCase().includes(searchTerm));
            cryptoCache[searchTerm] = searchResults;
            updateCryptoTable(searchResults);
        } catch (error) {
            console.error('Error fetching search results:', error);
            cryptoTable.innerHTML = '<tr><td colspan="6">Failed to load search results.</td></tr>';
        }
    }
    // if the coin is not in the cache, search the coin in the api
    if (!cryptoCache[searchTerm]) {
        try {
            const res = await fetch(`${baseURL}/coins/markets?vs_currency=usd`);
            const data = await res.json();
            const searchResults = data.filter(crypto => crypto.name.toLowerCase().includes(searchTerm));
            cryptoCache[searchTerm] = searchResults;
            updateCryptoTable(searchResults);
        } catch (error) {
            console.error('Error fetching search results:', error);
            cryptoTable.innerHTML = '<tr><td colspan="6">Failed to load search results.</td></tr>';
        }
    }
    // If the search input is empty, search the coin in the api
    if (searchTerm === '') {
        displayMarketData();
    }
}



// Debounced search functionality
const debouncedSearchCrypto = debounce(searchCrypto, 500);
const searchInput = document.getElementById('searchCrypto');
if (searchInput) {
    searchInput.addEventListener('input', debouncedSearchCrypto);
}
