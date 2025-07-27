// main.js
import * as d3 from "https://unpkg.com/d3@6?module";
import scrollama from "https://unpkg.com/scrollama?module";

const svg = d3.select("#graphic")
  .append("svg")
  .attr("width", 600)
  .attr("height", 400);

const margin = { top: 20, right: 20, bottom: 40, left: 40 },
      width  = +svg.attr("width")  - margin.left - margin.right,
      height = +svg.attr("height") - margin.top  - margin.bottom;

const g = svg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

Promise.all([
  d3.csv("data/home_values.csv", d3.autoType)
])
.then(([raw]) => {
  // 1) pick out Georgia
  const georgia = raw.find(d => d.RegionName === "Georgia" && d.RegionType === "state");

  // 2) get all the monthly date-columns
  const dateCols = Object.keys(georgia)
    .filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k));

  // 3) reshape into [{year:2000, median:127946.88}, ...]
  const allData = dateCols.map(d => ({
    year: +d.slice(0,4),
    median: +georgia[d]
  }))
  // sort by year
  .sort((a,b) => a.year - b.year);

  // 4) pick every 5th year (2000,05,...,25)
  const narrativeData = allData.filter(d => d.year % 5 === 0);

  // set up scales
  const x = d3.scaleBand()
      .domain(narrativeData.map(d => d.year))
      .range([0, width])
      .padding(0.3);

  const y = d3.scaleLinear()
      .domain([0, d3.max(narrativeData, d => d.median)]).nice()
      .range([height, 0]);

  // axes
  g.append("g").call(d3.axisLeft(y));
  const xg = g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

  // bars (initially zero height)
  const bars = g.selectAll("rect").data(narrativeData).join("rect")
      .attr("x", d => x(d.year))
      .attr("width", x.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", "#008080");

  // annotation labels above bars
  const labels = g.selectAll("text.bar-label")
    .data(narrativeData).join("text")
      .attr("class", "bar-label")
      .attr("text-anchor", "middle")
      .attr("x", d => x(d.year) + x.bandwidth()/2)
      .attr("y", height)
      .text("");

  // scrollama setup
  const scroller = scrollama();
  scroller
    .setup({
      step: "#narrative section",
      offset: 0.5,
    })
    .onStepEnter(({ index }) => {
      d3.selectAll("#narrative section")
        .classed("is-active", (d,i) => i === index);

      // on step 0: show only first bar
      // step 1,2: animate in all bars
      // step 3: no change
      if (index === 0) {
        bars.transition().duration(600)
          .attr("y", (d,i) => i===narrativeData.length-1 ? y(narrativeData[i].median) : height)
          .attr("height", (d,i) => i===narrativeData.length-1 ? height - y(d.median) : 0);
        labels.transition().duration(600)
          .attr("y", (d,i) => i===narrativeData.length-1 ? y(d.median)-5 : height)
          .text((d,i) => i===narrativeData.length-1 ? "Latest" : "");
      } else if (index < 3) {
        bars.transition().duration(600)
          .attr("y", d => y(d.median))
          .attr("height", d => height - y(d.median));
        labels.transition().duration(600)
          .attr("y", d => y(d.median)-5)
          .text(d => d.median.toLocaleString());
      }
    });
});
