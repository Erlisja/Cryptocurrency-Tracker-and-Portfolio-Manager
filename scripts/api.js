// crypto api

API_KEY = "CG-98mTUgkFhyDZPNwcwZjpF1Eb";
const baseURL = "https://api.coingecko.com/api/v3/";



// fetch cryptocurrency market data
async function getCoins() {
    try {
        const response = await fetch(`${baseURL}/coins/markets?vs_currency=usd&per_page=10`);
        if (!response.ok) {
            throw new Error(`Failed to fetch data from the API: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        return data;
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }

}
//getCoins();



