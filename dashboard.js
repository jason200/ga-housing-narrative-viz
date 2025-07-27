// dashboard.js
import * as d3 from 'https://unpkg.com/d3@6?module';

const width = 400, height = 300, margin = { top: 30, right: 20, bottom: 40, left: 50 };
const parseDate = d3.timeParse('%Y-%m-%d');

d3.csv('data/home_values.csv').then(rows => {
  const ga = rows.find(r => r.RegionName === 'Georgia');
  const data = Object.keys(ga)
    .filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k))
    .map(k => ({ date: parseDate(k), value: +ga[k] }))
    .sort((a,b) => a.date - b.date);

  // line chart
  const svg1 = d3.select('#lineChart')
    .append('svg').attr('width', width).attr('height', height);
  const g1 = svg1.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
  const x1 = d3.scaleTime().domain(d3.extent(data, d=>d.date)).range([0, width-margin.left-margin.right]);
  const y1 = d3.scaleLinear().domain([0, d3.max(data, d=>d.value)]).range([height-margin.top-margin.bottom,0]).nice();
  g1.append('g').attr('transform',`translate(0,${height-margin.top-margin.bottom})`).call(d3.axisBottom(x1).ticks(5));
  g1.append('g').call(d3.axisLeft(y1));
  g1.append('path').datum(data)
    .attr('fill','none').attr('stroke','#0066cc').attr('stroke-width',2)
    .attr('d', d3.line().x(d=>x1(d.date)).y(d=>y1(d.value)));

  // bar chart: every 5 years
  const data5 = data.filter(d => d.date.getFullYear() % 5 === 0);
  const svg2 = d3.select('#barChart')
    .append('svg').attr('width', width).attr('height', height);
  const g2 = svg2.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
  const x2 = d3.scaleBand().domain(data5.map(d=>d.date.getFullYear())).range([0, width-margin.left-margin.right]).padding(0.3);
  const y2 = d3.scaleLinear().domain([0, d3.max(data5, d=>d.value)]).range([height-margin.top-margin.bottom,0]).nice();
  g2.append('g').attr('transform',`translate(0,${height-margin.top-margin.bottom})`)
    .call(d3.axisBottom(x2));
  g2.append('g').call(d3.axisLeft(y2));
  g2.selectAll('rect')
    .data(data5).enter().append('rect')
    .attr('x', d=>x2(d.date.getFullYear()))
    .attr('y', d=>y2(d.value))
    .attr('width', x2.bandwidth())
    .attr('height', d=>height-margin.top-margin.bottom - y2(d.value))
    .attr('fill','#339966');
});
