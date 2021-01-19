const shortDays = ['S', 'M', 'D', 'M', 'D', 'F', 'S'];

d3.timeFormatDefaultLocale({
  decimal: ',',
  thousands: '.',
  grouping: [3],
  currency: ['€', ''],
  dateTime: '%a %b %e %X %Y',
  date: '%d.%m.%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  shortDays,
  months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  shortMonths: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
});

function showDailyTweets(day, tweets, colorValue, no2Value) {
  // clear tweets from previous selection
  const tweetsContainer = document.querySelector('#tweets');
  tweetsContainer.innerHTML = '';
  tweetsContainer.style.display = 'none';
  // create masonry sizer div
  const gridSizer = document.createElement('div');
  gridSizer.classList.add('grid-sizer');
  tweetsContainer.appendChild(gridSizer);
  // show loading spinner
  const loader = document.querySelector('.loader');
  loader.style.display = 'block';

  let tweetCounter = 0;

  // create climate card
  const date = new Date(day);
  let formattedDate = date.toLocaleString('de', { day: '2-digit', month: 'short', year: 'numeric' });

  d3.select('#tweets')
    .append('div')
    .attr('class', 'tweet heat-card')
    .attr('style', `background-color: ${colorValue}; border: 1px solid ${colorValue};`)
    .each(function () {
      d3.select(this)
        .append('h1')
        .html(formattedDate);
      d3.select(this)
        .append('div')
        .html(() => {
          if (no2Value > 0) {
            return `<b>Stickstoffdioxid: Friedrichstraße, Berlin</b><br>${no2Value} μg m³ NO2`;
          }

          return 'An diesem Tag wurden keine Stickstoffdaten gemessen.';
        });
    });

  // search tweets
  tweets.forEach((tweet) => {
    if (tweet.date === day && tweetCounter < 5) {
      formattedDate = date.toLocaleString('de', { day: '2-digit', month: 'short' });
      d3.select('#tweets')
        .append('div')
        .attr('class', 'tweet')
        .each(function () {
          d3.select(this)
            .append('div')
            .attr('class', 'tweet-user')
            .html(tweet.name)
            .append('span')
            .attr('class', 'tweet-meta')
            // eslint-disable-next-line prefer-template
            .html('@' + tweet.username + ' · ' + formattedDate);
          d3.select(this)
            .append('div')
            .attr('class', 'tweet-text')
            .html(tweet.tweet);
          const images = JSON.parse(tweet.photos.replace(/'/g, '"')); // read photos array from csv
          if (images.length) {
            d3.select(this)
              .append('img')
              .attr('class', 'tweet-image')
              .attr('src', images[0]);
          }
        });
      tweetCounter += 1;
    }
  });

  // Apply Masonry layout to tweets, if they exist
  if (tweetCounter === 0) {
    d3.select('#tweets')
      .append('div')
      .attr('class', 'tweet')
      .html('Es existieren keine Tweets für diesen Tag.');
  }

  const container = document.querySelector('#tweets');
  // eslint-disable-next-line no-undef
  imagesLoaded(container, () => { // wait for images to be loaded
    loader.style.display = 'none';
    tweetsContainer.style.display = 'block';
    // eslint-disable-next-line no-undef, no-unused-vars
    const msnry = new Masonry(container, {
      // options
      itemSelector: '.tweet',
      columnWidth: '.grid-sizer',
      percentPosition: true,
      gutter: 20,
    });
  });
}

function drawCalendar(airData, tweets) {
  const weeksInMonth = (month) => {
    const m = d3.timeMonth.floor(month);
    return d3.timeWeeks(d3.timeWeek.floor(m), d3.timeMonth.offset(m, 1)).length;
  };

  const minDate = d3.min(airData, (d) => new Date(d.day));
  const maxDate = d3.max(airData, (d) => new Date(d.day));

  const cellMargin = 2;
  const cellSize = 20;

  const day = d3.timeFormat('%w');
  const week = d3.timeFormat('%U');
  const format = d3.timeFormat('%Y-%m-%d');
  const titleFormat = d3.utcFormat('%d. %b');
  const monthName = d3.timeFormat('%B');
  const months = d3.timeMonth.range(d3.timeMonth.floor(minDate), maxDate);

  const dayLabels = d3.select('#calendar')
    .append('svg')
    .attr('width', 20)
    .attr('height', ((cellSize * 7) + (cellMargin * 8) + 20)); // the 20 is for the month labels

  shortDays.forEach((d, i) => {
    dayLabels.append('text')
      .attr('class', 'day-label')
      .attr('x', 0)
      .attr('y', () => (i * cellSize) + (i * cellMargin) + 2.5 * cellMargin)
      .attr('dominant-baseline', 'hanging')
      .text(d);
  });

  // lookup air quality data for day
  const lookup = d3.nest()
    .key((d) => d.day)
    .rollup((leaves) => d3.sum(leaves, (d) => parseInt(d.count)))
    .object(airData);

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

  // draw carfree line
  d3.select('#calendar')
    .insert('svg', 'svg:nth-child(3)')
    .attr('height', ((cellSize * 7) + (cellMargin * 8) + 20)) // the 20 is for the month labels
    .attr('width', (d) => {
      const columns = weeksInMonth(d);
      return ((cellSize * columns) + (cellMargin * (columns + 1)));
    })
    .attr('class', 'carfree-line')
    .append('line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 0)
    .attr('y2', ((cellSize * 7) + (cellMargin * 8)))
    .style('stroke-width', 2)
    .style('stroke', 'yellow')
    .attr('stroke-dasharray', '3 3');

  const rect = svg.selectAll('rect.day')
    .data((d) => d3.timeDays(d, new Date(d.getFullYear(), d.getMonth() + 1, 1)))
    .enter() // returns enter selection that represents elements to be added
    .append('rect')
    .attr('class', 'day')
    .attr('width', cellSize)
    .attr('height', cellSize)
    .attr('rx', 3)
    .attr('ry', 3) // rounded corners
    .attr('fill', '#eaeaea') // default light grey fill
    .attr('y', (d) => (day(d) * cellSize) + (day(d) * cellMargin) + cellMargin)
    .attr('x', (d) => ((week(d) - week(new Date(d.getFullYear(), d.getMonth(), 1))) * cellSize) + ((week(d) - week(new Date(d.getFullYear(), d.getMonth(), 1))) * cellMargin) + cellMargin)
    .on('click', function (d) {
      if (!d3.select(this).classed('selected')) {
        svg.selectAll('rect.day').classed('selected', false); // clear all previous selections
        d3.select(this).classed('selected', true);
      } else {
        d3.select(this).classed('selected', false);
      }
      const currentColor = window.getComputedStyle(this, null).getPropertyValue('fill');
      showDailyTweets(d, tweets, currentColor, lookup[d]);
    })
    .datum(format);

  rect.append('title')
    .text((d) => titleFormat(new Date(d)));

  const scale = d3.scaleLinear()
    .domain(d3.extent(airData, (d) => parseInt(d.count)))
    .range([0.2, 1]); // the interpolate used for color expects a number in the range
    // [0,1] but i don't want the lightest part of the color scheme

  // construct title to show on hover
  rect.filter((d) => d in lookup)
    .style('fill', (d) => {
      if (lookup[d] > 0) { // only color rectangle when value is bigger than 0
        return d3.interpolateYlOrRd(scale(lookup[d]));
      }

      return '#eaeaea';
    })
    .select('title')
    .text((d) => `${titleFormat(new Date(d))}: ${lookup[d]} μg m³`);

  // draw legend
  const legendWidth = 15;
  const legendHeight = 120;

  const legend = d3.select('#calendar').append('svg')
    .attr('height', ((cellSize * 7) + (cellMargin * 8) + 20)) // the 20 is for the month labels
    .attr('width', legendWidth + 80)
    .attr('class', 'legend')
    .append('g');

  legend.append('text')
    .text('NO2 in μg m³')
    .attr('y', 15)
    .attr('x', 0);

  legend.append('image')
    .attr('xlink:href', 'assets/images/YlOrRd.png')
    .attr('preserveAspectRatio', 'none')
    .attr('width', legendWidth - 1)
    .attr('height', legendHeight - 1)
    .attr('y', 36);

  const ticks = d3.axisRight(d3.scaleLinear()
    .domain([0, 40])
    .range([0, 118]))
    .ticks(5);

  legend.append('g')
    .attr('transform', `translate(${legendWidth}, 36)`)
    .call(ticks);
}

d3.csv('assets/data.csv', (airData) => {
  d3.csv('assets/tweets.csv', (tweets) => {
    drawCalendar(airData, tweets);
  });
});
