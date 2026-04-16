const API_URL = "https://restcountries.com/v3.1/all?fields=name,population";

const svg = d3.select('#chart')
    .append("svg")
    .attr("width", 800)
    .attr("height", 500);

async function loadData() {
    const res = await fetch(API_URL);
    const countries = await res.json();
    
    const top12 = countries
    .filter(d => d.population)
    .sort((a,b) => b.population - a.population)
    .slice(0, 12);

    const max = top12[0].population
    const barWidth = 50;
    const chartHeight = 460;

    svg.selectAll("rect")
    .data(top12)
    .join("rect")
    .attr("x", (_d, i) => (i*barWidth +10))
    .attr("y", d => chartHeight - d.population /max *chartHeight)
    .attr("width", barWidth)
    .attr("height", d => (d.population / max * chartHeight))
    .attr("fill", "pink");


    console.log(top12)
}

loadData() 