//import { getCoins } from './api.js';



// Function to render market data on the homepage
async function displayMarketData() {
    const marketData = await getCoins();

    if (marketData) {
        const cryptoListContainer = document.getElementById('cryptoList');
        marketData.forEach(crypto => {
            // Create elements to display the data
            // get the div element
            const cryptoDiv = document.getElementById('cryptoList');
            // get the table element
            const cryptoTable = document.getElementById('cryptoTable');
            // get the table header 
            const cryptoHeader = document.getElementById('cryptoHeader');
            // Create a table row for each cryptocurrency

            const cryptoRow = document.createElement('tr');
            cryptoRow.innerHTML = `
            <td><img src="${crypto.image}" alt="${crypto.name}" width="25" height="25" style="margin-right: 5px";>  ${crypto.name.charAt(0).toUpperCase() + crypto.name.slice(1)}</td>
            <td>${crypto.symbol.toUpperCase()}</td>
             <td> ${crypto.current_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
            <td>${crypto.market_cap.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
            <td>${crypto.total_volume.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
             <td>${crypto.price_change_percentage_24h}</td>
        `;
            // Append the row to the table
            cryptoTable.appendChild(cryptoRow);
        });
    }
}

// Load and display data when the page loads
document.addEventListener('DOMContentLoaded', displayMarketData);

// implement the search functionality to filter the data from the table
async function searchCrypto() {
    // get the input element
    let inputField = document.getElementById('searchCrypto');
    let cryptoName = inputField.value.toLowerCase();
    // get the crypto from the API
    let res = await fetch(`${baseURL}/coins/search?query=${cryptoName}`);
    // get the data
    let cryptoFetched = await res.json();
    //clear the table and display the data of the searched crypto
    const cryptoTable = document.getElementById('cryptoTable');
    cryptoTable.innerHTML = '';
    // Create a table row for the searched cryptocurrency
    const cryptoRow = document.createElement('tr');
    cryptoRow.innerHTML = `
            <td><img src="${cryptoFetched.image}" alt="${cryptoFetched.name}" width="25" height="25" style="margin-right: 5px";>  ${cryptoFetched.name.charAt(0).toUpperCase() + cryptoFetched.name.slice(1)}</td>
            <td>${cryptoFetched.symbol.toUpperCase()}</td>
             <td> ${cryptoFetched.current_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
            <td>${cryptoFetched.market_cap.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
            <td>${cryptoFetched.total_volume.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
             <td>${cryptoFetched.price_change_percentage_24h}</td>
        `;
    // Append the row to the table
    cryptoTable.appendChild(cryptoRow);
}



// add the event listener
let searchButton = document.getElementById('searchButton');
searchButton.addEventListener('click', searchCrypto);