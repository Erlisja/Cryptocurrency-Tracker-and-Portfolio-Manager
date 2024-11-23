// crypto api

const API_KEY = "e8455185-7d52-4d1d-a1f8-3c31dc1e3e8d";


// fetch cryptocurrency market data
export async function getCoins() {
   const baseURL = "https://api.coincap.io/v2";

    try {
        const response = await fetch(`${baseURL}/assets`, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch data from the API: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        return data.data;
    }
    catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }

}
//getCoins();



