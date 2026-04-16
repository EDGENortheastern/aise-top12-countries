const API_URL = "https://restcountries.com/v3.1/all?fields=name,population";

const svgWidth = 800;
const svgHeight = 500;
const margin = { top: 20, right: 20, bottom: 100, left: 80 };
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip');

const svg = d3.select('#chart')
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

async function loadData() {
    const res = await fetch(API_URL);
    const countries = await res.json();

    const top12 = countries
        .filter(d => d.population)
        .sort((a, b) => b.population - a.population)
        .slice(0, 12);

    const colors = [
        'var(--orange-1)', 'var(--orange-2)', 'var(--orange-3)',
        'var(--yellow-1)', 'var(--yellow-2)', 'var(--yellow-3)',
        'var(--green-1)',  'var(--green-2)',  'var(--green-3)',
        'var(--blue-1)',   'var(--blue-2)',   'var(--blue-3)',
    ];

    const xScale = d3.scaleBand()
        .domain(top12.map(d => d.name.common))
        .range([0, width])
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .domain([0, top12[0].population])
        .nice()
        .range([height, 0]);

    // Bars
    svg.selectAll("rect")
        .data(top12)
        .join("rect")
        .attr("x", d => xScale(d.name.common))
        .attr("y", d => yScale(d.population))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.population))
        .style("fill", (_d, i) => colors[i])
        .style("stroke", "black")
        .on("mouseover", (_event, d) => {
            tooltip
                .html(`<strong>${d.name.common}</strong><br>${d.population.toLocaleString()}`)
                .style("opacity", 1);
        })
        .on("mousemove", (event) => {
            tooltip
                .style("left", `${event.pageX + 12}px`)
                .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseleave", () => {
            tooltip.style("opacity", 0);
        });

    // X axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .attr("text-anchor", "end")
        .attr("dx", "-0.5em")
        .attr("dy", "0.15em");

    // Y axis
    svg.append("g")
        .call(d3.axisLeft(yScale)
            .ticks(6)
            .tickFormat(d => `${(d / 1e9).toFixed(1)}B`));

    // X axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .attr("text-anchor", "middle")
        .text("Country");

    // Y axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .text("Population");
}

loadData();
