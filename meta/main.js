import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

let commits = [];
let xScale;
let yScale;

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
  return data;
}

function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      const first = lines[0];
      const { author, date, time, timezone, datetime } = first;

      const ret = {
        id: commit,
        url: 'https://github.com/nabilafifahq/portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        writable: false,
        configurable: false,
        enumerable: false,
      });

      return ret;
    });
}

function renderCommitInfo(data, commits) {
  const root = d3
    .select('#stats')
    .append('section')
    .attr('class', 'stats summary-stats');

  root.append('h2').text('Summary');

  const dl = root.append('dl').attr('class', 'summary-grid');

  const numFiles = d3.group(data, (d) => d.file).size;

  const maxDepth = d3.max(data, (d) => d.depth);
  const longestLineLength = d3.max(data, (d) => d.length);

  const fileLineCounts = d3.rollups(
    data,
    (v) => d3.max(v, (r) => r.line),
    (d) => d.file,
  );
  const maxLinesInFile = d3.max(fileLineCounts, (d) => d[1]);

  const items = [
    { label: 'COMMITS', value: commits.length },
    { label: 'FILES', value: numFiles },
    { label: 'TOTAL LOC', value: data.length },
    { label: 'MAX DEPTH', value: maxDepth ?? 0 },
    { label: 'LONGEST LINE', value: longestLineLength ?? 0 },
    { label: 'MAX LINES', value: maxLinesInFile ?? 0 },
  ];

  items.forEach((item) => {
    dl
      .append('dt')
      .attr('class', 'summary-label')
      .text(item.label);
    dl
      .append('dd')
      .attr('class', 'summary-value')
      .text(item.value);
  });
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  if (!tooltip) return;
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  if (!tooltip) return;
  tooltip.style.left = `${event.clientX + 14}px`;
  tooltip.style.top = `${event.clientY + 14}px`;
}

function renderTooltipContent(commit) {
  if (!commit) return;

  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (!link || !date || !time || !author || !lines) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime.toLocaleString('en', {
    dateStyle: 'full',
  });
  time.textContent = commit.datetime.toLocaleTimeString('en', {
    hour: '2-digit',
    minute: '2-digit',
  });
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;
}

function isCommitSelected(selection, commit) {
  if (!selection || !xScale || !yScale) return false;
  const [[x0, y0], [x1, y1]] = selection;
  const x = xScale(commit.datetime);
  const y = yScale(commit.hourFrac);
  return x0 <= x && x <= x1 && y0 <= y && y <= y1;
}

function renderSelectionCount(selection) {
  const selected = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];
  const el = document.getElementById('selection-count');
  if (!el) return selected;
  el.textContent = `${selected.length || 'No'} commits selected`;
  return selected;
}

function renderLanguageBreakdown(selection) {
  const container = document.getElementById('language-breakdown');
  if (!container) return;

  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];

  container.innerHTML = '';

  if (!selection || selectedCommits.length === 0) {
    return;
  }

  const lines = selectedCommits.flatMap((d) => d.lines);
  if (lines.length === 0) return;

  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type,
  );

  const total = lines.length;

  const wrap = document.createElement('div');
  wrap.className = 'lang-grid';
  container.appendChild(wrap);

  for (const [language, count] of breakdown) {
    const proportion = count / total;
    const formatted = d3.format('.1~%')(proportion);

    const item = document.createElement('div');
    item.className = 'lang-item';
    item.innerHTML = `
      <div class="lang-name">${language || 'Other'}</div>
      <div class="lang-lines">${count} lines</div>
      <div class="lang-percent">${formatted}</div>
    `;
    wrap.appendChild(item);
  }
}

function renderScatterPlot() {
  const width = 1000;
  const height = 600;
  const margin = { top: 10, right: 10, bottom: 30, left: 40 };

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  const usable = {
    left: margin.left,
    right: width - margin.right,
    top: margin.top,
    bottom: height - margin.bottom,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([usable.left, usable.right])
    .nice();

  yScale = d3
    .scaleLinear()
    .domain([0, 24])
    .range([usable.bottom, usable.top]);

  const grid = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usable.left}, 0)`);

  grid.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usable.width));

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  svg
    .append('g')
    .attr('transform', `translate(0, ${usable.bottom})`)
    .call(xAxis);

  svg
    .append('g')
    .attr('transform', `translate(${usable.left}, 0)`)
    .call(yAxis);

  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3
    .scaleSqrt()
    .domain([minLines || 1, maxLines || 1])
    .range([4, 28]);

  const dots = svg.append('g').attr('class', 'dots');

  const sorted = d3.sort(commits, (d) => -d.totalLines);

  dots
    .selectAll('circle')
    .data(sorted)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .attr('fill', 'var(--brand-primary)')
    .style('fill-opacity', 0.7)
    .on('mouseenter', (event, d) => {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      renderTooltipContent(d);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mousemove', (event) => {
      updateTooltipPosition(event);
    })
    .on('mouseleave', (event) => {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipVisibility(false);
    });

  const brush = d3
    .brush()
    .on('start brush end', (event) => {
      const selection = event.selection;
      d3.selectAll('circle').classed('selected', (d) =>
        isCommitSelected(selection, d),
      );
      renderSelectionCount(selection);
      renderLanguageBreakdown(selection);
    });

  svg.call(brush);

  svg.selectAll('.dots, .overlay ~ *').raise();
}

async function init() {
  const data = await loadData();
  commits = processCommits(data);

  if (!data.length || !commits.length) {
    const stats = document.querySelector('#stats');
    if (stats) {
      stats.textContent =
        'No commit data found. Make sure you ran elocuent to generate meta/loc.csv.';
    }
    return;
  }

  renderCommitInfo(data, commits);
  renderScatterPlot();
}

init();