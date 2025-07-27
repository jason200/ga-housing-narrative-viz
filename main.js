// main.js
import { select, scaleTime, scaleLinear, axisBottom, axisLeft, line, extent, csv, timeParse } from 'https://unpkg.com/d3@6?module';

const width = 700, height = 400, margin = { top: 20, right: 20, bottom: 50, left: 60 };

const svg = select('#graphic')
  .append('svg')
    .attr('width', width)
    .attr('height', height);

const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

const innerW = width - margin.left - margin.right;
const innerH = height - margin.top - margin.bottom;

const parseDate = timeParse('%Y-%m-%d');

// load & preprocess
csv('data/home_values.csv').then(rows => {
  // find the Georgia row
  const ga = rows.find(r => r.RegionName === 'Georgia');
  // convert date columns to { date, value }
  const data = Object.keys(ga)
    .filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k))
    .map(k => ({ date: parseDate(k), value: +ga[k] }));

  // scales
  const x = scaleTime().domain(extent(data, d => d.date)).range([0, innerW]);
  const y = scaleLinear().domain([0, d3.max(data, d => d.value)]).nice().range([innerH, 0]);

  // axes
  g.append('g')
    .attr('transform', `translate(0,${innerH})`)
    .call(axisBottom(x).ticks(5));
  g.append('g')
    .call(axisLeft(y));

  // line generator
  const lineGen = line()
    .x(d => x(d.date))
    .y(d => y(d.value));

  // path
  g.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#333')
    .attr('stroke-width', 2)
    .attr('d', lineGen);

  // scrollama
  const scroller = scrollama();
  scroller
    .setup({ step: '#narrative section', offset: 0.7 })
    .onStepEnter(({ index }) => {
      g.selectAll('path').attr('stroke', index === 0 ? '#aaa' : '#333');
      if (index === 0) {
        // show only the last point
        const last = data[data.length - 1];
        g.selectAll('.dot').remove();
        g.append('circle')
          .attr('class','dot')
          .attr('cx', x(last.date))
          .attr('cy', y(last.value))
          .attr('r', 5)
          .attr('fill', 'tomato');
      } else {
        g.selectAll('.dot').remove();
      }
    });
});
