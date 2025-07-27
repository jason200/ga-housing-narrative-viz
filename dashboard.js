import * as d3 from "https://unpkg.com/d3@6?module";

const width = 400, height = 300, margin = { top: 20, right: 20, bottom: 40, left: 50 };

// Load the same CSV
d3.csv("data/home_values.csv", d => ({
  year: +d.year,
  median: +d.median
})).then(data => {
  // LINE CHART
  const x1 = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year)).range([margin.left, width - margin.right]);
  const y1 = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.median)]).nice()
    .range([height - margin.bottom, margin.top]);
  const svg1 = d3.select("#lineChart")
    .append("svg").attr("width", width).attr("height", height);
  svg1.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x1).ticks(5).tickFormat(d3.format("d")));
  svg1.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y1).tickFormat(d3.format("$.2s")));
  svg1.append("path")
      .datum(data)
      .attr("d", d3.line().x(d=>x1(d.year)).y(d=>y1(d.median)))
      .attr("stroke","#1f77b4").attr("fill","none").attr("stroke-width",2);

  // BAR CHART (last 5 years)
  const last5 = data.slice(-5);
  const x2 = d3.scaleBand()
    .domain(last5.map(d=>d.year)).range([margin.left, width - margin.right]).padding(0.3);
  const y2 = d3.scaleLinear()
    .domain([0, d3.max(last5, d=>d.median)]).nice()
    .range([height - margin.bottom, margin.top]);
  const svg2 = d3.select("#barChart")
    .append("svg").attr("width", width).attr("height", height);
  svg2.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x2).tickFormat(d3.format("d")));
  svg2.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y2).tickFormat(d3.format("$.2s")));
  svg2.selectAll("rect")
      .data(last5)
      .join("rect")
      .attr("x", d=>x2(d.year))
      .attr("y", d=>y2(d.median))
      .attr("width", x2.bandwidth())
      .attr("height", d=>height - margin.bottom - y2(d.median))
      .attr("fill", "#ff7f0e");
});
