// REST Countries v5 requires an API key: sign up at https://restcountries.com/sign-up
const API_KEY = "rc_live_f75e913fd7604dee8801bf304a1d4344";
const API_URL = "https://api.restcountries.com/countries/v5";
const PAGE_LIMIT = 100; // v5 maximum per request

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

const statusEl = document.getElementById('status');

// v5 has no sort parameter and caps results at 100, so page through every country.
async function fetchAllCountries() {
    const countries = [];
    let offset = 0;
    let more = true;
    while (more) {
        const url = `${API_URL}?response_fields=names.common,population&limit=${PAGE_LIMIT}&offset=${offset}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${API_KEY}` } });
        const body = await res.json();
        if (!res.ok || !body.data) {
            const msg = body.errors?.[0]?.message ?? `HTTP ${res.status}`;
            throw new Error(msg);
        }
        countries.push(...body.data.objects);
        more = body.data.meta.more;
        offset += PAGE_LIMIT;
    }
    return countries;
}

async function loadData() {
    const countries = await fetchAllCountries();

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
        .domain(top12.map(d => d.names.common))
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
        .attr("x", d => xScale(d.names.common))
        .attr("y", d => yScale(d.population))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.population))
        .style("fill", (_d, i) => colors[i])
        .style("stroke", "black")
        .on("mouseover", (_event, d) => {
            tooltip
                .html(`<strong>${d.names.common}</strong><br>${d.population.toLocaleString()}`)
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

    statusEl.textContent = "";
}

loadData().catch(err => {
    console.error(err);
    statusEl.textContent = `Could not load data: ${err.message}`;
});
