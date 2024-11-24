import { getCoins } from "./api.js";
import { debounce } from "./ui.js";

const API_KEY = "e8455185-7d52-4d1d-a1f8-3c31dc1e3e8d";
const baseURL = "https://api.coincap.io/v2";
const addCoinButton = document.getElementById("addCoin");
const popup = document.getElementById("coinPopup");
const closePopupButton = document.getElementById("closePopup");
const searchBar = document.getElementById("searchCrypto");
const coinTableBody = document.getElementById("coinTable").querySelector("tbody");


let allCoins = {}; // Store all fetched coins
const selectedCoins = new Set(); // Store selected coin symbols to add to the portfolio
let cachedSearchResults = {}; // Cache for storing search results to avoid multiple API calls



// Show the popup
addCoinButton.addEventListener("click", () => {
    popup.classList.remove("hidden");
    fetchAndDisplayCoins(); // Fetch and render coins when the popup opens
    console.log("Popup opened and table rendered");
});

// Close the popup
closePopupButton.addEventListener("click", () => {
    popup.classList.add("hidden");
    divContent.classList.add("hidden");
    createPortfolio(); // Render the selected coins table when the popup closes
    console.log("Popup closed and portfolio rendered");
    // add the hidden class from the portfolio div


});


function renderCoinTable(coins) {
    //const coinTableBody = document.getElementById('coinsTableBody');
    coinTableBody.innerHTML = ''; // Clear the table

    // Limit the number of coins to 10
    const limitedCoins = coins.slice(0, 10);

    limitedCoins.forEach(coin => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${coin.name}</td>
            <td>${coin.symbol}</td>
            <td><img src="https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png" alt="${coin.symbol} logo" width="30"></td>
          <td><button class="toggle-btn" data-symbol="${coin.symbol}"><span class="star ${selectedCoins.has(coin.symbol) ? "selected" : ""}">
                &#9733;
            </span></button></td>
        `;
        coinTableBody.appendChild(row);
    });
    // Add event listeners for toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(button => {
        button.addEventListener('click', function () {
            const symbol = this.getAttribute('data-symbol');
            toggleCoinSelection(symbol);
        });
    });

    document.getElementById("coinTable").classList.remove("hidden");
}


//Fetch and display coins (limit to 10 initially)
async function fetchAndDisplayCoins() {
    try {
        allCoins = await getCoins();
        renderCoinTable(Object.values(allCoins), 10); // Show up to 10 coins initially
        console.log("Fetched coins:", allCoins);
    } catch (error) {
        console.log("Error fetching coins:", error);
    }
}

// function to toggle coin selection
// Add or remove the selected coin symbol from the Set
// Update the star icon to show selection status

function toggleCoinSelection(symbol) {
    if (selectedCoins.has(symbol)) {
        selectedCoins.delete(symbol);
    } else {
        selectedCoins.add(symbol);
    }
    console.log(selectedCoins);
    renderCoinTable(Object.values(allCoins), 10);
}



// Function to search for a coin
async function searchCoin() {
    const searchValue = searchBar.value.trim().toLowerCase();

    if (searchValue === "") {
        renderCoinTable(Object.values(allCoins), 10); // Reset to default 10 coins
        return;
    }

    try {
        // Check if the search result is already cached
        if (cachedSearchResults[searchValue]) {
            renderCoinTable(cachedSearchResults[searchValue]);
            return;
        }

        // Search from the full coin list
        let searchResults = Object.values(allCoins).filter((coin) =>
            coin.name.toLowerCase().includes(searchValue) ||
            coin.symbol.toLowerCase().includes(searchValue)
        );

        // If no results found, fetch from the API
        if (searchResults.length === 0) {
            const response = await fetch(`${baseURL}/assets?search=${searchValue}`, {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch data from the API: ${response.status}`);
            }
            const data = await response.json();
            searchResults = data.data;
        }

        // If no results found after searching the API, display a message
        if (searchResults.length === 0) {
            coinTableBody.innerHTML = "<tr><td colspan='4'>No matching coins found</td></tr>";
            return;
        }

        // Cache the results to avoid repeated API calls
        cachedSearchResults[searchValue] = searchResults;

        renderCoinTable(searchResults, 10); // Display search results, limiting to 10 coins
    } catch (error) {
        console.error("Error fetching search results:", error);
        coinTableBody.innerHTML = "<tr><td colspan='4'>Failed to load search results</td></tr>"; // Display error message
    }
}

// Debounced search functionality
const debounceSearchCoin = debounce(searchCoin, 500);
if (searchBar) {
    searchBar.addEventListener("input", debounceSearchCoin);
}

// This function will render the selected coins table when called
function renderSelectedCoinsTable() {
    const selectedCoinsArray = Array.from(selectedCoins); // Convert Set to Array

    // Ensure there are selected coins
    if (selectedCoinsArray.length === 0) {
        console.log("No selected coins.");
        return;
    }

    const selectedCoinObjects = selectedCoinsArray.map(symbol => {
        // Find the coin object in the allCoins array using symbol
        const coin = allCoins.find(coin => coin.symbol.toLowerCase() === symbol.toLowerCase());
        if (!coin) {
            console.log(`Coin not found: ${symbol}`);
            return null; // Return null if coin is not found
        }
        return coin;
    }).filter(coin => coin !== null); // Remove null values (undefined coins)

    // Check if there are valid coins to render
    if (selectedCoinObjects.length === 0) {
        console.log("No valid coins to render.");
        return;
    }

    // Select the tbody of the portfolio table
    const selectedCoinsTableBody = document.getElementById("portfolioTable").querySelector("tbody");

    // Clear previous table content
    selectedCoinsTableBody.innerHTML = '';

    // Render the rows for each selected coin
    selectedCoinObjects.forEach(coin => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td><img src="https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png" alt="${coin.symbol} logo" width="30"></td>
            <td>${coin.name || 'Unknown'}</td>
            <td>${coin.symbol}</td>
          <td>${coin.priceUsd ? coin.priceUsd.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'N/A'}</td>
          <td>${coin.marketCapUsd ? coin.marketCapUsd.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'N/A'}</td>
         <td>${coin.volumeUsd24Hr ? coin.volumeUsd24Hr.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'N/A'}</td>
        <td> ${coin.changePercent24Hr ? `${Math.floor((coin.changePercent24Hr) * 1000) / 1000}%` : 'N/A'} </td>
            
        `;
        selectedCoinsTableBody.appendChild(row);
    });
}


// Function to create the portfolio table
function createPortfolio() {
    const portfolioIntroContent = document.querySelector('#portfolio .introContent');
    const portfolioTable = document.getElementById('portfolioTable');

    // Check if there are selected coins
    if (selectedCoins.size > 0) {
        // Hide the introductory content
        if (portfolioIntroContent) portfolioIntroContent.classList.add('hidden');
        // Render selected coins and show the table
        renderSelectedCoinsTable();
        portfolioTable.classList.remove('hidden');
    } else {
        // Show the introductory content if no coins are selected
        if (portfolioIntroContent) portfolioIntroContent.classList.remove('hidden');
        portfolioTable.classList.add('hidden');
    }
}

