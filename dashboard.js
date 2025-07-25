// dashboard.js

const dmb = { top: 30, right: 20, bottom: 40, left: 50 };
const dashWidth  = 400 - dmb.left - dmb.right;
const dashHeight = 350 - dmb.top  - dmb.bottom;

// load the same CSV (must exist at data/home_values.csv)
d3.csv("data/home_values.csv", d => ({
  year:   +d.year,
  median: +d.median
})).then(data => {
  drawLeftBar(data);
  drawRightLine(data);
});

function drawLeftBar(data) {
  const svg = d3.select("#bar-chart")
    .append("svg")
      .attr("width",  dashWidth + dmb.left + dmb.right)
      .attr("height", dashHeight + dmb.top + dmb.bottom)
    .append("g")
      .attr("transform", `translate(${dmb.left},${dmb.top})`);

  // just show first & last for demo
  const sub = data.filter(d => d.year % 5 === 0);

  const x = d3.scaleBand()
      .domain(sub.map(d => d.year))
      .range([0, dashWidth])
      .padding(0.3);

  const y = d3.scaleLinear()
      .domain([0, d3.max(sub, d => d.median)*1.1])
      .range([dashHeight, 0]);

  svg.append("g").call(d3.axisLeft(y).ticks(5));
  svg.append("g")
     .attr("transform", `translate(0,${dashHeight})`)
     .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg.selectAll("rect")
    .data(sub)
    .join("rect")
      .attr("x", d => x(d.year))
      .attr("y", d => y(d.median))
      .attr("width", x.bandwidth())
      .attr("height", d => dashHeight - y(d.median))
      .attr("fill", "steelblue");

  svg.append("text")
     .attr("x", dashWidth/2)
     .attr("y", -10)
     .attr("text-anchor","middle")
     .text("Median Value every 5 years");
}

function drawRightLine(data) {
  const svg = d3.select("#line-chart")
    .append("svg")
      .attr("width",  dashWidth + dmb.left + dmb.right)
      .attr("height", dashHeight + dmb.top + dmb.bottom)
    .append("g")
      .attr("transform", `translate(${dmb.left},${dmb.top})`);

  const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([0, dashWidth]);

  const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.median)*1.1])
      .range([dashHeight, 0]);

  svg.append("g").call(d3.axisLeft(y).ticks(5));
  svg.append("g")
     .attr("transform", `translate(0,${dashHeight})`)
     .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("d")));

  const line = d3.line()
     .x(d => x(d.year))
     .y(d => y(d.median));

  svg.append("path")
     .datum(data)
     .attr("fill","none")
     .attr("stroke","tomato")
     .attr("stroke-width",2)
     .attr("d", line);

  svg.append("text")
     .attr("x", dashWidth)
     .attr("y", y(data[data.length-1].median) - 10)
     .attr("text-anchor","end")
     .attr("fill","tomato")
     .text("Full series");
}
