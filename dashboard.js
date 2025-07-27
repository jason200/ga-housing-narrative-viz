import * as d3 from "https://cdn.skypack.dev/d3@6";

const W = 400, H = 300;
const M = { top: 20, right: 20, bottom: 40, left: 50 };

// helper to make an SVG
function makeSVG(sel) {
  return d3.select(sel)
    .append("svg")
      .attr("width",  W)
      .attr("height", H);
}

d3.csv("data/home_values.csv").then(raw => {
  // find Georgia
  const ga = raw.find(d => d.RegionName === "Georgia");
  if (!ga) {
    console.error("Georgia row not found!");
    return;
  }

  // grab date-columns
  const cols = raw.columns.filter(c => /^\d{4}-\d{2}-\d{2}$/.test(c));
  const data = cols.map(col => ({
    year:   +col.slice(0,4),
    median: +ga[col]
  })).sort((a,b) => a.year - b.year)
    .filter(d => !isNaN(d.median));

  // full-series line
  const x1 = d3.scaleLinear()
    .domain(d3.extent(data, d=>d.year))
    .range([M.left, W - M.right]);
  const y1 = d3.scaleLinear()
    .domain([0, d3.max(data,d=>d.median)])
    .nice()
    .range([H - M.bottom, M.top]);
  const line = d3.line()
    .x(d=>x1(d.year))
    .y(d=>y1(d.median));

  const svg1 = makeSVG("#lineChart");
  svg1.append("path")
    .datum(data)
    .attr("fill","none")
    .attr("stroke","#1f78b4")
    .attr("stroke-width",2)
    .attr("d", line);
  svg1.append("g")
    .attr("transform",`translate(0,${H-M.bottom})`)
    .call(d3.axisBottom(x1).tickFormat(d3.format("d")));
  svg1.append("g")
    .attr("transform",`translate(${M.left},0)`)
    .call(d3.axisLeft(y1));

  // last 5 years bar
  const last5 = data.slice(-5);
  const x2 = d3.scaleBand()
    .domain(last5.map(d=>d.year))
    .range([M.left, W - M.right])
    .padding(0.3);
  const y2 = d3.scaleLinear()
    .domain([0, d3.max(last5,d=>d.median)])
    .nice()
    .range([H - M.bottom, M.top]);

  const svg2 = makeSVG("#barChart");
  svg2.selectAll("rect")
    .data(last5)
    .join("rect")
      .attr("x", d=>x2(d.year))
      .attr("y", d=>y2(d.median))
      .attr("width", x2.bandwidth())
      .attr("height", d=>y2(0) - y2(d.median))
      .attr("fill", "#33a02c");
  svg2.append("g")
    .attr("transform",`translate(0,${H-M.bottom})`)
    .call(d3.axisBottom(x2).tickFormat(d3.format("d")));
  svg2.append("g")
    .attr("transform",`translate(${M.left},0)`)
    .call(d3.axisLeft(y2));
});

// inside your <script> in dashboard.html
d3.json("data/counties.geojson").then(function(geoData) {
  // bind it to your map projection
  svgMap.append("g")
        .selectAll("path")
        .data(geoData.features)
        .enter().append("path")
          .attr("d", d3.geoPath().projection(projection))
          .attr("fill", d => colorScale(valueByCounty[d.properties.NAME]))
          .attr("stroke", "#333")
          .on("mouseover", highlightCounty)
          .on("mouseout", resetHighlight)
          .on("click", filterByCounty);
});

