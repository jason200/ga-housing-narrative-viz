const margin = { top:40, right:20, bottom:40, left:50 };
const W = 400 - margin.left - margin.right;
const H = 300 - margin.top - margin.bottom;

// two svgs
const svgLine = d3.select("#lineChart")
  .append("svg")
    .attr("width",  W + margin.left + margin.right)
    .attr("height", H + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const svgBar = d3.select("#barChart")
  .append("svg")
    .attr("width",  W + margin.left + margin.right)
    .attr("height", H + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("data/home_values.csv", d=>({
  year:   +d.year,
  median: +d.median
}))
.then(data => {
  drawLineChart(data);
  drawBarChart(data.slice(-5));
})
.catch(console.error);

function drawLineChart(data) {
  const x = d3.scaleLinear()
    .domain(d3.extent(data,d=>d.year))
    .range([0,W]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data,d=>d.median)*1.1])
    .range([H,0]);

  svgLine.append("g").call(d3.axisLeft(y));
  svgLine.append("g")
    .attr("transform",`translate(0,${H})`)
    .call(d3.axisBottom(x).ticks(data.length).tickFormat(d3.format("d")));

  svgLine.append("path")
    .datum(data)
    .attr("fill","none")
    .attr("stroke","steelblue")
    .attr("stroke-width",2)
    .attr("d", d3.line()
      .x(d=>x(d.year))
      .y(d=>y(d.median))
    );

  svgLine.append("text")
    .attr("x", 0).attr("y",-10)
    .text("Median Value (2000–2025)");
}

function drawBarChart(data) {
  const x = d3.scaleBand()
    .domain(data.map(d=>d.year))
    .range([0,W]).padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data,d=>d.median)*1.1])
    .range([H,0]);

  svgBar.append("g").call(d3.axisLeft(y));
  svgBar.append("g")
    .attr("transform",`translate(0,${H})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svgBar.selectAll("rect")
    .data(data)
    .join("rect")
      .attr("x", d=>x(d.year))
      .attr("y", d=>y(d.median))
      .attr("width", x.bandwidth())
      .attr("height", d=>H - y(d.median))
      .attr("fill","teal");

  svgBar.append("text")
    .attr("x", 0).attr("y",-10)
    .text("Last 5 Years");
}
