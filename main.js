// Global state and scenes array
let state = { scene: 1 };
const scenes = [drawScene1, drawScene2];

// Main draw function
function draw() {
  const svg = d3.select('#viz');
  // clear previous marks
  svg.selectAll('*').remove();
  // run current scene
  scenes[state.scene - 1]();
}

// Scene 1: simple bar chart
function drawScene1() {
  const data = [
    { name: 'A', value: 30 },
    { name: 'B', value: 80 },
    { name: 'C', value: 45 }
  ];
  const svg = d3.select('#viz');
  const width = +svg.attr('width'),
        height = +svg.attr('height');

  // scales
  const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([40, width - 20])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([height - 30, 20]);

  // axes
  svg.append('g')
    .attr('transform', `translate(0,${height - 30})`)
    .call(d3.axisBottom(x));

  svg.append('g')
    .attr('transform', 'translate(40,0)')
    .call(d3.axisLeft(y));

  // bars
  svg.selectAll('.bar')
    .data(data)
    .join('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.name))
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => height - 30 - y(d.value))
      .attr('fill', '#69b3a2');

  // annotation
  svg.append('text')
    .attr('class', 'annotation-note')
    .attr('x', x('B') + x.bandwidth() / 2)
    .attr('y', y(80) - 10)
    .attr('text-anchor', 'middle')
    .text('Highest value here');
}

// Scene 2: simple line chart
function drawScene2() {
  const data = [
    { x: 1, y: 2 },
    { x: 2, y: 5 },
    { x: 3, y: 3 },
    { x: 4, y: 7 }
  ];
  const svg = d3.select('#viz');
  const width = +svg.attr('width'),
        height = +svg.attr('height');

  // scales
  const x = d3.scaleLinear()
    .domain([1, 4])
    .range([40, width - 20]);

  const y = d3.scaleLinear()
    .domain([0, 7])
    .range([height - 30, 20]);

  // axes
  svg.append('g')
    .attr('transform', `translate(0,${height - 30})`)
    .call(d3.axisBottom(x));

  svg.append('g')
    .attr('transform', 'translate(40,0)')
    .call(d3.axisLeft(y));

  // line generator
  const line = d3.line()
    .x(d => x(d.x))
    .y(d => y(d.y));

  // draw line
  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#ff7f0e')
    .attr('stroke-width', 2)
    .attr('d', line);

  // annotation
  svg.append('text')
    .attr('class', 'annotation-note')
    .attr('x', x(4))
    .attr('y', y(7) - 10)
    .attr('text-anchor', 'end')
    .text('Peak value');
}

// Wire up controls
d3.select('#next').on('click', () => {
  state.scene = Math.min(state.scene + 1, scenes.length);
  draw();
});
d3.select('#prev').on('click', () => {
  state.scene = Math.max(state.scene - 1, 1);
  draw();
});

// Initial render
draw();
