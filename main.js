// main.js
const width  = 500,
      height = 400,
      margin = { top: 40, right: 20, bottom: 40, left: 50 };

let svg = d3.select("#graphic")
  .append("svg")
    .attr("width",  width + margin.left + margin.right)
    .attr("height", height + margin.top  + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// load data once
d3.csv("data/home_values.csv", d => ({
  year:   +d.year,
  median: +d.median  // your CSV must have columns "year" and "median"
})).then(data => {
  // keep it in outer scope
  window.narrativeData = data;
  initScroll();
});

function initScroll() {
  const scroller = scrollama();

  scroller
    .setup({
      step: ".step",
      offset: 0.6
    })
    .onStepEnter(response => {
      d3.selectAll(".step").classed("is-active", d => d3.select(d.target).datum() === response.element ? true : false);
      drawScene(+response.element.getAttribute("data-step"));
    });
}

function drawScene(step) {
  if (step === 1) drawBars();
  if (step === 2) drawLine();
  // step 3 is just the “Switch to dashboard” link, no chart update
}

function drawBars() {
  const data = window.narrativeData.slice(-5);  // last 5 years, for example

  // clear
  svg.selectAll("*").remove();

  const x = d3.scaleBand()
      .domain(data.map(d => d.year))
      .range([0, width])
      .padding(0.3);

  const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.median)*1.1])
      .range([height, 0]);

  svg.append("g")
     .call(d3.axisLeft(y));

  svg.append("g")
     .attr("transform", `translate(0,${height})`)
     .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg.selectAll(".bar")
    .data(data)
    .join("rect")
      .attr("class","bar")
      .attr("x", d => x(d.year))
      .attr("y", d => y(d.median))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.median))
      .attr("fill", "teal");

  // annotation
  const top = data[data.length-1];
  svg.append("text")
     .attr("x", x(top.year) + x.bandwidth()/2)
     .attr("y", y(top.median) - 6)
     .attr("text-anchor","middle")
     .text("Latest value");
}

function drawLine() {
  const data = window.narrativeData;

  // clear
  svg.selectAll("*").remove();

  const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([0, width]);

  const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.median)*1.1])
      .range([height, 0]);

  svg.append("g")
     .call(d3.axisLeft(y));

  svg.append("g")
     .attr("transform", `translate(0,${height})`)
     .call(d3.axisBottom(x).ticks(data.length).tickFormat(d3.format("d")));

  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.median));

  svg.append("path")
     .datum(data)
     .attr("fill","none")
     .attr("stroke","orange")
     .attr("stroke-width",2)
     .attr("d", line);

  // annotation at the very end
  const last = data[data.length-1];
  svg.append("text")
     .attr("x", x(last.year))
     .attr("y", y(last.median) - 10)
     .attr("text-anchor","end")
     .attr("fill","orange")
     .text("Peak value");
}
