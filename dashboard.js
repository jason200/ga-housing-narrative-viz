// dashboard.js
const svg1 = d3.select("#chart1")
  .attr("width", 500).attr("height", 400);
const svg2 = d3.select("#chart2")
  .attr("width", 500).attr("height", 400);

const margin = {top: 20, right:20, bottom:40, left:50},
      w1 = +svg1.attr("width")  - margin.left - margin.right,
      h1 = +svg1.attr("height") - margin.top  - margin.bottom,
      w2 = +svg2.attr("width")  - margin.left - margin.right,
      h2 = +svg2.attr("height") - margin.top  - margin.bottom;

const g1 = svg1.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
const g2 = svg2.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("data/home_values.csv", d3.autoType).then(raw => {
  const georgia = raw.find(d => d.RegionName==="Georgia" && d.RegionType==="state");
  const dateCols = Object.keys(georgia).filter(k=> /^\d{4}-\d{2}-\d{2}$/.test(k));
  const allData = dateCols.map(d=>({
    year: +d.slice(0,4),
    median: +georgia[d]
  })).sort((a,b)=>a.year-b.year);

  // chart1: full series line
  const x1 = d3.scaleLinear().domain(d3.extent(allData,d=>d.year)).range([0,w1]);
  const y1 = d3.scaleLinear().domain([0,d3.max(allData,d=>d.median)]).nice().range([h1,0]);
  g1.append("g").call(d3.axisLeft(y1));
  g1.append("g").attr("transform",`translate(0,${h1})`).call(d3.axisBottom(x1).ticks(6).tickFormat(d=>d));
  g1.append("path")
    .datum(allData)
    .attr("fill","none")
    .attr("stroke","#1f77b4")
    .attr("stroke-width",2)
    .attr("d", d3.line()
      .x(d=>x1(d.year))
      .y(d=>y1(d.median))
    );
  g1.append("text")
    .attr("x", w1/2).attr("y",-5).attr("text-anchor","middle")
    .text("Median Value (2000–2025)");

  // chart2: last 5 years bar
  const last5 = allData.slice(-5);
  const x2 = d3.scaleBand().domain(last5.map(d=>d.year)).range([0,w2]).padding(0.3);
  const y2 = d3.scaleLinear().domain([0,d3.max(last5,d=>d.median)]).nice().range([h2,0]);
  g2.append("g").call(d3.axisLeft(y2));
  g2.append("g").attr("transform",`translate(0,${h2})`).call(d3.axisBottom(x2));
  g2.selectAll("rect").data(last5).join("rect")
    .attr("x", d=>x2(d.year))
    .attr("y", d=>y2(d.median))
    .attr("width", x2.bandwidth())
    .attr("height", d=>h2-y2(d.median))
    .attr("fill","#2ca02c");
  g2.append("text")
    .attr("x", w2/2).attr("y",-5).attr("text-anchor","middle")
    .text("Last 5 Years");
});
