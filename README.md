# Top 12 Most Populous Countries

An interactive bar chart showing the 12 most populous countries in the world, built with D3.js and live data from the REST Countries API (v5).

**Live:** [edgenortheastern.github.io/aise-top12-countries](https://edgenortheastern.github.io/aise-top12-countries/)

---

## User Guide

### Interacting with the chart

- **Hover** over any bar to see the country name and exact population in a tooltip.
- Move your cursor away from a bar to dismiss the tooltip.
- Bars are ordered left-to-right from most to least populous.
- The Y-axis shows population in billions (e.g. `1.4B`).

---

## Technical Documentation

### Architecture

The project is a single-page static app with three files:

| File         | Role                                                          |
| ------------ | ------------------------------------------------------------- |
| `index.html` | Shell — mounts the chart container and loads scripts          |
| `script.js`  | Data fetching, D3 scales, SVG rendering, tooltip logic        |
| `styles.css` | Layout, colour palette (CSS custom properties), tooltip style |

There is no build toolchain, bundler, or local server needed.

### Data source

Data is fetched at runtime from [REST Countries API v5](https://restcountries.com/docs/countries). Earlier versions (v1–v4, including the `v3.1/all` endpoint this project originally used) have been retired and now return an error.

v5 requires an API key, sent as a bearer token:

```http
GET https://api.restcountries.com/countries/v5?response_fields=names.common,population&limit=100&offset=0
Authorization: Bearer <API_KEY>
```

The key is set in the `API_KEY` constant at the top of `script.js`. To use your own, sign up at [restcountries.com/sign-up](https://restcountries.com/sign-up) and replace the value.

v5 has no sort parameter and returns at most 100 countries per request, so `script.js` pages through the full list (currently ~254 countries, **3 requests per page load**) and then sorts it locally.

### Rendering pipeline (`script.js`)

1. **Fetch** — `fetchAllCountries()` requests pages of 100 with `fetch()`, following `meta.more` until every country has been retrieved.
2. **Filter & sort** — removes entries with no population, sorts by population descending, slices top 12.
3. **Scales** —
   - `xScale`: `d3.scaleBand` mapping country names (`names.common`) to horizontal positions.
   - `yScale`: `d3.scaleLinear` mapping population to vertical positions, domain `[0, max]`.
4. **Bars** — `svg.selectAll("rect").data(top12).join("rect")` — each bar's height is `height - yScale(d.population)`.
5. **Axes** — bottom axis with 40° rotated labels; left axis with 6 ticks formatted as `XB`.
6. **Tooltip** — a `div.tooltip` appended to `<body>`, positioned via `mousemove` page coordinates, shown/hidden by toggling `opacity`.
7. **Status** — the "Loading data..." message is cleared on success. If any request fails, the API's error message is shown in its place and logged to the console.

### Known risks and limitations

- **The API key is public.** Because this is a static site with no backend, the key is in `script.js`, so it is visible in this repository and to anyone who opens the browser dev tools on the live page. Anyone can copy it and use it in their own projects, using up this project's quota. If that happens, revoke the key in the REST Countries dashboard and issue a new one.
- **The quota is limited.** The free plan allows 1,000 requests per month. Each page load uses 3 requests, so the site supports **about 330 page loads a month**, including refreshes during development. Once the quota runs out, the chart stops loading and an error message is shown until the quota resets.
- **It depends on an external service.** If REST Countries changes its response format, retires v5, or goes down, the chart breaks, as happened when v3.1 was retired. The page shows the error message instead of failing silently.
- **Safer alternatives.** If the site needs to handle more traffic or must not expose a key, either save the data as a static JSON file in the repo (no key, no quota, but not live), or put the API call behind a small server or serverless function that keeps the key secret.

### Colour palette

12 bars are coloured by fixed index using four CSS variable groups defined in `:root`:

| Index | Group  | Variables                    |
| ----- | ------ | ---------------------------- |
| 0–2   | Orange | `--orange-1` → `--orange-3`  |
| 3–5   | Yellow | `--yellow-1` → `--yellow-3`  |
| 6–8   | Green  | `--green-1` → `--green-3`    |
| 9–11  | Blue   | `--blue-1` → `--blue-3`      |

To change colours, edit the CSS custom properties in `styles.css` — no JavaScript changes needed.

### SVG dimensions

```js
const svgWidth  = 800;
const svgHeight = 500;
const margin    = { top: 20, right: 20, bottom: 100, left: 80 };
```

The large `bottom` margin accommodates the rotated X-axis labels.

### Dependencies

| Library                    | Version | How loaded                         |
| -------------------------- | ------- | ---------------------------------- |
| [D3.js](https://d3js.org/) | v7      | CDN `<script>` tag in `index.html` |

No npm packages, no `package.json`.

### Browser requirements

Any modern browser with `fetch` and ES2017 support (async/await). No polyfills are included.
