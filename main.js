import * as d3 from "https://unpkg.com/d3@6?module";
import scrollama from "https://unpkg.com/scrollama?module";

const width = 800, height = 400, margin = { top: 20, right: 20, bottom: 40, left: 50 };

const svg = d3.select("#graphic")
  .append("svg").attr("width", width).attr("height", height);

d3.csv("data/home_values.csv", d => ({
  year: +d.year,
  median: +d.median
})).then(data => {
  // Scales
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year))
    .range([margin.left, width - margin.right]);
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.median)]).nice()
    .range([height - margin.bottom, margin.top]);

  // Line generator
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.median));

  // Draw axes
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")));
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickFormat(d3.format("$.2s")));

  // Draw path (initially hidden)
  svg.append("path")
    .datum(data)
    .attr("class", "line-path")
    .attr("d", line)
    .attr("stroke", "#333")
    .attr("fill", "none")
    .attr("stroke-width", 2)
    .attr("opacity", 0);

  // Scrollama setup
  const scroller = scrollama();
  scroller
    .setup({ step: "#narrative section" })
    .onStepEnter(({ index }) => {
      if (index === 0) {
        svg.select(".line-path").transition().duration(600).attr("opacity", 0);
      } else {
        svg.select(".line-path").transition().duration(600).attr("opacity", 1);
      }
    });
});
