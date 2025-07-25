Promise.all([
  d3.csv("data/home_values.csv", d3.autoType),
  d3.json("geo/counties_topo.json")
]).then(([raw, topo]) => {
  drawTimeSeries(raw);
  drawChoropleth(raw, topo);
});

function drawTimeSeries(data) {
  const svg = d3.select("#timeseries"),
        W = +svg.attr("width"),
        H = +svg.attr("height"),
        margin = { top: 40, right: 20, bottom: 40, left: 50 },
        w = W - margin.left - margin.right,
        h = H - margin.top - margin.bottom;

  // pivot data into time series for Georgia (or nest by county if you want multiples)
  // here we assume home_values.csv has: year, county, median_value fields
  const gaSeries = data
    .filter(d => d.county === "Georgia")   // or whichever key
    .sort((a,b) => d3.ascending(a.year,b.year));

  const x = d3.scaleLinear()
      .domain(d3.extent(gaSeries, d => d.year))
      .range([0, w]);

  const y = d3.scaleLinear()
      .domain([0, d3.max(gaSeries, d => d.median_value)])
      .nice()
      .range([h, 0]);

  const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  g.append("g")
    .attr("transform", `translate(0,${h})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  g.append("g")
    .call(d3.axisLeft(y));

  const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.median_value));

  g.append("path")
    .datum(gaSeries)
    .attr("fill","none")
    .attr("stroke","#4682b4")
    .attr("stroke-width",2)
    .attr("d", line);

  svg.append("text")
     .attr("x", W/2).attr("y", margin.top/2)
     .attr("text-anchor","middle")
     .text("Median Home Value in Georgia (2000–2025)");
}

function drawChoropleth(data, topo) {
  const svg = d3.select("#map"),
        W = +svg.attr("width"),
        H = +svg.attr("height"),
        margin = { top: 40, right: 20, bottom: 40, left: 20 },
        w = W - margin.left - margin.right,
        h = H - margin.top - margin.bottom;

  // pick latest year per county
  const latestYear = d3.max(data, d => d.year);
  const latestData = new Map(
    data.filter(d => d.year === latestYear)
        .map(d => [d.county, d.median_value])
  );

  const geojson = topojson.feature(topo, topo.objects.counties);
  const projection = d3.geoIdentity()
      .fitSize([w, h], geojson);
  const path = d3.geoPath(projection);

  const values = Array.from(latestData.values());
  const color = d3.scaleSequential(d3.interpolateBlues)
      .domain([d3.min(values), d3.max(values)]);

  const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  g.selectAll("path")
    .data(geojson.features)
    .join("path")
      .attr("d", path)
      .attr("fill", d => {
        const v = latestData.get(d.properties.NAME);
        return v != null ? color(v) : "#eee";
      })
      .attr("stroke","#999");

  svg.append("text")
     .attr("x", W/2).attr("y", margin.top/2)
     .attr("text-anchor","middle")
     .text(`Median Home Value by County (${latestYear})`);
}
