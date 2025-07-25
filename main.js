// Global state and scenes array
let state = { scene: 1 };
const scenes = [drawScene1, drawScene2];

// When the page loads, draw the first scene
draw();

// Redraw whenever scene changes
d3.select("#next").on("click", () => {
  state.scene = Math.min(state.scene + 1, scenes.length);
  draw();
});
d3.select("#prev").on("click", () => {
  state.scene = Math.max(state.scene - 1, 1);
  draw();
});

function draw() {
  const svg = d3.select("#viz");
  svg.selectAll("*").remove();
  scenes[state.scene - 1]();
}

function drawScene1() {
  // Sample bar chart
  const data = [
    { name: "A", value: 30 },
    { name: "B", value: 80 },
    { name: "C", value: 45 },
  ];
  const svg = d3.select("#viz"),
        W = +svg.attr("width"),
        H = +svg.attr("height"),
        margin = { top: 40, right: 20, bottom: 40, left: 50 },
        w = W - margin.left - margin.right,
        h = H - margin.top - margin.bottom;

  const x = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, w])
      .padding(0.2);

  const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .nice()
      .range([h, 0]);

  const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  g.append("g")
    .attr("transform", `translate(0,${h})`)
    .call(d3.axisBottom(x));

  g.append("g")
    .call(d3.axisLeft(y));

  g.selectAll(".bar")
    .data(data)
    .join("rect")
      .attr("class","bar")
      .attr("x", d => x(d.name))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => h - y(d.value))
      .attr("fill", "#69b3a2");

  g.append("text")
    .attr("class","annotation-note")
    .attr("x", x("B") + x.bandwidth()/2)
    .attr("y", y(80) - 10)
    .attr("text-anchor","middle")
    .text("Highest value here");
}

function drawScene2() {
  // Sample line chart
  const data = [
    { x: 1, y: 2 },
    { x: 2, y: 5 },
    { x: 3, y: 3 },
    { x: 4, y: 7 },
  ];
  const svg = d3.select("#viz"),
        W = +svg.attr("width"),
        H = +svg.attr("height"),
        margin = { top: 40, right: 20, bottom: 40, left: 50 },
        w = W - margin.left - margin.right,
        h = H - margin.top - margin.bottom;

  const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x))
      .range([0, w]);

  const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.y)])
      .nice()
      .range([h, 0]);

  const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  g.append("g")
    .attr("transform", `translate(0,${h})`)
    .call(d3.axisBottom(x).ticks(4).tickFormat(d3.format("d")));

  g.append("g")
    .call(d3.axisLeft(y));

  const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y));

  g.append("path")
    .datum(data)
    .attr("fill","none")
    .attr("stroke","#ff7f0e")
    .attr("stroke-width",2)
    .attr("d", line);

  g.append("text")
    .attr("class","annotation-note")
    .attr("x", x(4))
    .attr("y", y(7) - 10)
    .attr("text-anchor","end")
    .text("Peak value");
}
