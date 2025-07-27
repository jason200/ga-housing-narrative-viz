import * as d3 from "https://cdn.skypack.dev/d3@6";
import scrollama from "https://cdn.skypack.dev/scrollama";

// SVG dimensions
const WIDTH  = 600;
const HEIGHT = 400;
const MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };

// append one SVG into #graphic
const svg = d3.select("#graphic")
  .append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

// load the CSV
d3.csv("data/home_values.csv").then(raw => {
  // 1️⃣ find the Georgia row
  const ga = raw.find(d => d.RegionName === "Georgia");
  if (!ga) {
    console.error("❌ Georgia not found in CSV!");
    return;
  }

  // 2️⃣ find all the date-columns (YYYY-MM-DD)
  const dateCols = raw.columns.filter(c => /^\d{4}-\d{2}-\d{2}$/.test(c));
  if (!dateCols.length) {
    console.error("❌ No date columns! got:", raw.columns);
    return;
  }

  // 3️⃣ build an array of {year, median}
  const data = dateCols.map(col => {
    const year   = +col.slice(0,4);
    const median = +ga[col];
    return { year, median };
  })
  .sort((a,b) => a.year - b.year)
  .filter(d => !isNaN(d.median));

  // 4️⃣ extract every-5-years for scene0 & scene2
  const fiveYears = data.filter(d => [2000,2005,2010,2015,2020,2025].includes(d.year));

  // scales for line chart (scene1)
  const xLine = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year))
    .range([MARGIN.left, WIDTH - MARGIN.right]);
  const yLine = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.median)])
    .nice()
    .range([HEIGHT - MARGIN.bottom, MARGIN.top]);
  const lineGen = d3.line()
    .x(d => xLine(d.year))
    .y(d => yLine(d.median));

  // scales for bar chart (scene0 & 2)
  const xBar = d3.scaleBand()
    .domain(fiveYears.map(d => d.year))
    .range([MARGIN.left, WIDTH - MARGIN.right])
    .padding(0.3);
  const yBar = d3.scaleLinear()
    .domain([0, d3.max(fiveYears, d => d.median)])
    .nice()
    .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

  // helper: clear + draw axes
  function drawAxes(xScale, yScale, isBand=false) {
    svg.append("g")
      .attr("transform", `translate(0,${HEIGHT - MARGIN.bottom})`)
      .call(
        isBand
          ? d3.axisBottom(xScale).tickFormat(d3.format("d"))
          : d3.axisBottom(xScale).ticks(6).tickFormat(d3.format("d"))
      );
    svg.append("g")
      .attr("transform", `translate(${MARGIN.left},0)`)
      .call(d3.axisLeft(yScale).ticks(6).tickFormat(d => `$${d/1000}k`));
  }

  // scene drawer functions
  function scene0() {
    svg.selectAll("*").remove();
    svg.selectAll("rect")
      .data(fiveYears)
      .join("rect")
        .attr("x", d => xBar(d.year))
        .attr("y", d => yBar(d.median))
        .attr("width", xBar.bandwidth())
        .attr("height", d => yBar(0) - yBar(d.median))
        .attr("fill", "#4C78A8");
    drawAxes(xBar, yBar, true);
  }

  function scene1() {
    svg.selectAll("*").remove();
    svg.append("path")
      .datum(data)
      .attr("fill","none")
      .attr("stroke","#F58518")
      .attr("stroke-width",2)
      .attr("d", lineGen);
    drawAxes(xLine, yLine);
  }

  function scene2() {
    svg.selectAll("*").remove();
    // same bars as scene0, but highlight the 2008 bar
    svg.selectAll("rect")
      .data(fiveYears)
      .join("rect")
        .attr("x", d => xBar(d.year))
        .attr("y", d => yBar(d.median))
        .attr("width", xBar.bandwidth())
        .attr("height", d => yBar(0) - yBar(d.median))
        .attr("fill", d => d.year === 2010 ? "#E45756" : "#4C78A8");
    drawAxes(xBar, yBar, true);
  }

  // 5️⃣ set up scrollama
  const sc = scrollama();
  sc.setup({
    step: "#narrative section",
    offset: 0.6,
  })
  .onStepEnter(({ index }) => {
    if (index === 0) scene0();
    if (index === 1) scene1();
    if (index === 2) scene2();
    if (index === 3) svg.selectAll("*").remove(); // blank for final
  });
});
