// margins & SVG setup
const margin = { top:40, right:20, bottom:40, left:50 };
const w = 500 - margin.left - margin.right;
const h = 400 - margin.top - margin.bottom;

const svg = d3.select("#graphic")
  .append("svg")
    .attr("width",  w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// load data
d3.csv("data/home_values.csv", d => ({
  year:   +d.year,
  median: +d.median
}))
.then(data => {
  window.narrativeData = data;
  initScroll();
  drawScene(1);
})
.catch(console.error);

function initScroll() {
  const scroller = scrollama();
  scroller
    .setup({ step: ".step", offset: 0.6 })
    .onStepEnter(resp => {
      d3.selectAll(".step").classed("is-active", false);
      d3.select(resp.element).classed("is-active", true);
      drawScene(+resp.element.getAttribute("data-step"));
    });
}

function drawScene(step) {
  if (step === 1) drawBars();
  else if (step === 2) drawLine();
  // step 3 just links out
}

function drawBars() {
  const data = window.narrativeData.slice(-5);
  svg.selectAll("*").remove();

  const x = d3.scaleBand()
    .domain(data.map(d=>d.year))
    .range([0,w]).padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data,d=>d.median)*1.1])
    .range([h,0]);

  svg.append("g").call(d3.axisLeft(y));
  svg.append("g")
     .attr("transform",`translate(0,${h})`)
     .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg.selectAll("rect")
     .data(data)
     .join("rect")
       .attr("x", d=>x(d.year))
       .attr("y", d=>y(d.median))
       .attr("width", x.bandwidth())
       .attr("height", d=>h - y(d.median))
       .attr("fill", "teal");

  const latest = data[data.length-1];
  svg.append("text")
     .attr("x", x(latest.year)+x.bandwidth()/2)
     .attr("y", y(latest.median)-6)
     .attr("text-anchor","middle")
     .text("Latest");
}

function drawLine() {
  const data = window.narrativeData;
  svg.selectAll("*").remove();

  const x = d3.scaleLinear()
    .domain(d3.extent(data,d=>d.year))
    .range([0,w]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data,d=>d.median)*1.1])
    .range([h,0]);

  svg.append("g").call(d3.axisLeft(y));
  svg.append("g")
     .attr("transform",`translate(0,${h})`)
     .call(d3.axisBottom(x).ticks(data.length).tickFormat(d3.format("d")));

  const line = d3.line()
    .x(d=>x(d.year))
    .y(d=>y(d.median));

  svg.append("path")
     .datum(data)
     .attr("fill","none")
     .attr("stroke","orange")
     .attr("stroke-width",2)
     .attr("d", line);

  const top = data[data.length-1];
  svg.append("text")
     .attr("x", x(top.year))
     .attr("y", y(top.median)-10)
     .attr("text-anchor","end")
     .attr("fill","orange")
     .text("Peak");
}
