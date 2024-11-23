import { getCoins } from './api.js';

const baseURL = "https://api.coincap.io/v2";
const cryptoTable = document.getElementById('cryptoTable');
export const cryptoCache = {}; // Cache object for storing search results
const API_KEY = "e8455185-7d52-4d1d-a1f8-3c31dc1e3e8d";

// Function to render market data on the homepage
export async function displayMarketData() {
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


// Function to clear the table
function clearCryptoTable() {
    // Remove all rows except the header
    const rows = cryptoTable.querySelectorAll('tr:not(#cryptoHeader)');
    rows.forEach(row => row.remove());
}

// Function to fetch the image URL for a given cryptocurrency symbol
function getCryptoImage(symbol) {
    // Convert the symbol to lowercase and build the image URL
    return `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;
}




// Function to update the table
async function updateCryptoTable(data) {
    clearCryptoTable(); // Clear existing rows, keep the header

    // If there is no data, display a message
    if (!data || data.length === 0) {
        const noDataRow = document.createElement('tr');
        noDataRow.innerHTML = `<td colspan="6">No data available.</td>`;
        cryptoTable.appendChild(noDataRow);
        return;
    }

    // Loop through the data and display it in the table
    for (const crypto of data) {
        const name = crypto.name || 'Unknown';
        const symbol = crypto.symbol.toUpperCase() || 'N/A';
        const currentPrice = crypto.priceUsd ? crypto.priceUsd.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'N/A';
        const marketCap = crypto.marketCapUsd ? crypto.marketCapUsd.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'N/A';
        const totalVolume = crypto.volumeUsd24Hr ? crypto.volumeUsd24Hr.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'N/A';
        // Display the price change percentage with a % sign up to 3 decimal places
        const priceChange = crypto.changePercent24Hr ? `${Math.floor((crypto.changePercent24Hr)*1000)/1000}%` : 'N/A';
        // Get the image URL based on the symbol
        const imageSrc = getCryptoImage(crypto.symbol);

        const cryptoRow = document.createElement('tr');
        cryptoRow.innerHTML = `
        <td><img src="${imageSrc}" alt="${name}" width="25" height="25" style="margin-right: 5px;"> ${name.charAt(0).toUpperCase() + name.slice(1)}</td>
        <td>${symbol}</td>
        <td>${currentPrice}</td>
        <td>${marketCap}</td>
        <td>${totalVolume}</td>
        <td>${priceChange}</td>
    `;
        cryptoTable.appendChild(cryptoRow);
    }
}

// Load and display data when the page loads
document.addEventListener('DOMContentLoaded', displayMarketData);




// Debounce function to limit API calls
// Source: https://davidwalsh.name/javascript-debounce-function
// this function will limit the number of times the searchCrypto function is called
// it will wait for 500ms after the user stops typing before calling the searchCrypto function
// this is to prevent making too many API calls in a short period of time

export function debounce(func, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        // this will prevent the function from being called immediately
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}





// Function to search for cryptocurrencies based on user input 
export async function searchCrypto() {
    const searchInput = document.getElementById('searchCrypto');
    const searchTerm = searchInput.value.trim().toLowerCase();

    // If the search input is empty, reload the full market data
    if (!searchTerm) {
        displayMarketData();
        return;
    }

    try {
        // Check cache for the search term
        if (cryptoCache[searchTerm]) {
            console.log(`Using cached data for: ${searchTerm}`);
            // Update the table with the cached results
            updateCryptoTable(cryptoCache[searchTerm]);
            return;
        }

        // Fetch all assets
        const response = await fetch(`${baseURL}/assets`, {
            headers: {
                Authorization: `Bearer ${API_KEY}`, // Optional: include API key
            },
        });
        const { data } = await response.json();

        // Filter the data to find coins matching the search term
        const searchResults = data.filter((crypto) =>
            crypto.name.toLowerCase().includes(searchTerm) ||
            crypto.symbol.toLowerCase().includes(searchTerm)
        );

        // Cache the filtered results
        cryptoCache[searchTerm] = searchResults;

        // Handle no matches
        if (searchResults.length === 0) {
            cryptoTable.innerHTML = '<tr><td colspan="6">No results found.</td></tr>';
            return;
        }

        // Update the table with the filtered results
        updateCryptoTable(searchResults);
    } catch (error) {
        console.error('Error fetching search results:', error);
        cryptoTable.innerHTML = '<tr><td colspan="6">Failed to load search results.</td></tr>';
    }
}




// Debounced search functionality
// This will limit the number of times the searchCrypto function is called
const debouncedSearchCrypto = debounce(searchCrypto, 500);
const searchInput = document.getElementById('searchCrypto');
if (searchInput) {
    searchInput.addEventListener('input', debouncedSearchCrypto);
}
