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
    if (Object.keys(allCoins).length === 0) {
        fetchAndDisplayCoins();
    }
});

// Close the popup
closePopupButton.addEventListener("click", () => {
    popup.classList.add("hidden");
});

// Function to fetch the image URL for a given cryptocurrency symbol
function getCryptoImage(symbol) {
    // Convert the symbol to lowercase and build the image URL
    return `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;
}

// Render the coin table with a limit on the number of coins displayed
async function renderCoinTable(coins, limit = 10) {
    // Clear the table from previous data
    coinTableBody.innerHTML = "";

    // Only render up to the specified limit
    const limitedCoins = coins.slice(0, limit);

    // Loop through each coin
    for (let coin of limitedCoins) {
        const iconURL = getCryptoImage(coin.symbol); // Fetch the icon using the new logic
        createTableRow(coin, iconURL);
    }
}

// Function to create a table row for each coin
function createTableRow(coin, iconURL) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>
            <img src="${iconURL}" alt="${coin.name}" width="30">
        </td>
        <td>${coin.name}</td>
        <td>${coin.symbol.toUpperCase()}</td>
        <td>
            <span class="star ${selectedCoins.has(coin.symbol) ? "selected" : ""}">
                &#9733;
            </span>
        </td>
    `;
    row.addEventListener("click", () => toggleCoinSelection(coin.symbol));
    coinTableBody.appendChild(row);
}

// Fetch and display coins (limit to 10 initially)
async function fetchAndDisplayCoins() {
    try {
        allCoins = await getCoins();
        renderCoinTable(Object.values(allCoins),10); // Show up to 10 coins initially
        console.log("Fetched coins:", allCoins);
    } catch (error) {
        console.log("Error fetching coins:", error);
    }
}

// Toggle coin selection
function toggleCoinSelection(symbol) {
    if (selectedCoins.has(symbol)) {
        selectedCoins.delete(symbol);
    } else {
        selectedCoins.add(symbol);
        console.log(selectedCoins);
    }
    renderCoinTable(Object.values(allCoins)); // Re-render to update the stars
}

// Function to search for a coin
async function searchCoin() {
    const searchValue = searchBar.value.trim().toLowerCase();

    if (searchValue === "") {
        renderCoinTable(Object.values(allCoins),10); // Reset to default 10 coins
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

const selectedCoinsTableBody = document.getElementById("portfolioTable").querySelector("tbody");
const selectedCoinsTable = document.getElementById("portfolioTable");
// function to render the table with the selected coins
function renderSelectedCoinsTable (){
    
    selectedCoinsTableBody.innerHTML = "";
    selectedCoins.forEach(symbol =>{
        const coin = allCoins[symbol];
        const iconURL = getCryptoImage(coin.symbol);
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <img src="${iconURL}" alt="${coin.name}" width="30">
            </td>
            <td>${coin.name}</td>
            <td>${coin.symbol.toUpperCase()}</td>
        `;
        selectedCoinsTableBody.appendChild(row)

    });
    
}
// if there is a portfolio table, render it initially with the selected coins 
// delete the content of the portfolio table div and render the selected coins table
const divContent = document.getElementById("portfolio");

function createPortfolio(){
    if(selectedCoins.size > 0){
        divContent.classList.add("hidden");
        renderSelectedCoinsTable();
    }else{
        divContent.classList.remove("hidden");
           // Ensure the coin table is also rendered if needed
           if (Object.keys(allCoins).length > 0) {
            renderCoinTable(Object.values(allCoins), 10);
           }
    }
}



// after closing the popup render the selected coins table
closePopupButton.addEventListener("click", createPortfolio);