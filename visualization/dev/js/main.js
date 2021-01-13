function drawCalendar(dateData) {
  const weeksInMonth = (month) => {
    const m = d3.timeMonth.floor(month);
    return d3.timeWeeks(d3.timeWeek.floor(m), d3.timeMonth.offset(m, 1)).length;
  };

  const minDate = d3.min(dateData, (d) => new Date(d.day));
  const maxDate = d3.max(dateData, (d) => new Date(d.day));

  const cellMargin = 2;
  const cellSize = 20;

  const day = d3.timeFormat('%w');
  const week = d3.timeFormat('%U');
  const format = d3.timeFormat('%Y-%m-%d');
  const titleFormat = d3.utcFormat('%a, %d-%b');
  const monthName = d3.timeFormat('%B');
  const months = d3.timeMonth.range(d3.timeMonth.floor(minDate), maxDate);

  const svg = d3.select('#calendar').selectAll('svg')
    .data(months)
    .enter()
    .append('svg')
    .attr('class', 'month')
    .attr('height', ((cellSize * 7) + (cellMargin * 8) + 20)) // the 20 is for the month labels
    .attr('width', (d) => {
      const columns = weeksInMonth(d);
      return ((cellSize * columns) + (cellMargin * (columns + 1)));
    })
    .append('g');

  svg.append('text')
    .attr('class', 'month-name')
    .attr('y', (cellSize * 7) + (cellMargin * 8) + 15)
    .attr('x', (d) => {
      const columns = weeksInMonth(d);
      return (((cellSize * columns) + (cellMargin * (columns + 1))) / 2);
    })
    .attr('text-anchor', 'middle')
    .text((d) => monthName(d));

  const rect = svg.selectAll('rect.day')
    .data((d) => d3.timeDays(d, new Date(d.getFullYear(), d.getMonth() + 1, 1)))
    .enter().append('rect')
    .attr('class', 'day')
    .attr('width', cellSize)
    .attr('height', cellSize)
    .attr('rx', 3)
    .attr('ry', 3) // rounded corners
    .attr('fill', '#eaeaea') // default light grey fill
    .attr('y', (d) => (day(d) * cellSize) + (day(d) * cellMargin) + cellMargin)
    .attr('x', (d) => ((week(d) - week(new Date(d.getFullYear(), d.getMonth(), 1))) * cellSize) + ((week(d) - week(new Date(d.getFullYear(), d.getMonth(), 1))) * cellMargin) + cellMargin)
    .on('mouseover', function () {
      d3.select(this).classed('hover', true);
    })
    .on('mouseout', function () {
      d3.select(this).classed('hover', false);
    })
    .datum(format);

  rect.append('title')
    .text((d) => titleFormat(new Date(d)));

  const lookup = d3.nest()
    .key((d) => d.day)
    // eslint-disable-next-line radix
    .rollup((leaves) => d3.sum(leaves, (d) => parseInt(d.count)))
    .object(dateData);

  const scale = d3.scaleLinear()
    .domain(d3.extent(dateData, (d) => parseInt(d.count)))
    .range([0.4, 1]); // the interpolate used for color expects a number in the range
    // [0,1] but i don't want the lightest part of the color scheme

  rect.filter((d) => d in lookup)
    .style('fill', (d) => d3.interpolatePuBu(scale(lookup[d])))
    .select('title')
    .text((d) => titleFormat(`${new Date(d)}: ${lookup[d]}`));
}

d3.csv('assets/data.csv', (response) => {
  drawCalendar(response);
});
