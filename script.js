const API_URL = "https://restcountries.com/v3.1/all?fields=name,population";

async function loadData() {
    const res = await fetch(API_URL);
    const countries = await res.json();
    console.log(countries);
}

loadData() 