# Top 12 Most Populous Countries

An interactive bar chart showing the 12 most populous countries in the world, built with D3.js and live data from the REST Countries API.

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

Data is fetched at runtime from the [REST Countries API](https://restcountries.com/):

```http
GET https://restcountries.com/v3.1/all?fields=name,population
```

The response is an array of country objects. `script.js` filters out entries with no population value, sorts descending by `population`, and takes the first 12.

### Rendering pipeline (`script.js`)

1. **Fetch** — `loadData()` calls the API with `fetch()`.
2. **Filter & sort** — removes nulls, sorts by population descending, slices top 12.
3. **Scales** —
   - `xScale`: `d3.scaleBand` mapping country names to horizontal positions.
   - `yScale`: `d3.scaleLinear` mapping population to vertical positions, domain `[0, max]`.
4. **Bars** — `svg.selectAll("rect").data(top12).join("rect")` — each bar's height is `height - yScale(d.population)`.
5. **Axes** — bottom axis with 40° rotated labels; left axis with 6 ticks formatted as `XB`.
6. **Tooltip** — a `div.tooltip` appended to `<body>`, positioned via `mousemove` page coordinates, shown/hidden by toggling `opacity`.

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
