// main.js
// v0.1: Load CSVs, join data, render 3-stage Sankey (Theories → Studies → Themes)

// Utility to load multiple CSVs
async function loadCSVs(paths) {
  const results = await Promise.all(paths.map(path => d3.csv(path)));
  return Object.fromEntries(paths.map((p, i) => [p.split('/').pop().replace('.csv',''), results[i]]));
}

// Prepare Sankey data structure
function buildSankeyData(theories, studies, themes, theory_study, study_theme) {
  // Assign node IDs
  const nodes = [];
  const nodeMap = {};
  let idx = 0;
  let errors = [];

  function addNode(item, type) {
    // Use correct ID field
    let rawId = (type === 'theory') ? item.theory_id : (type === 'study') ? item.study_id : (type === 'theme') ? item.theme_id : item.id;
    if (!rawId) {
      errors.push(`Missing ID for ${type} node: ${JSON.stringify(item)}`);
      return null;
    }
    const id = `${type}:${rawId}`;
    if (!(id in nodeMap)) {
      nodeMap[id] = idx++;
      nodes.push({ ...item, type, nodeId: nodeMap[id], id: rawId });
    }
    return nodeMap[id];
  }

  // Add all nodes
  theories.forEach(t => addNode(t, 'theory'));
  studies.forEach(s => addNode(s, 'study'));
  themes.forEach(th => addNode(th, 'theme'));

  // Links: Theories → Studies
  const links1 = theory_study.map(row => {
    const source = nodeMap[`theory:${row.theory_id}`];
    const target = nodeMap[`study:${row.study_id}`];
    if (source === undefined || target === undefined) {
      errors.push(`Invalid theory-study link: ${JSON.stringify(row)}`);
    }
    return {
      source,
      target,
      value: +row.strength || 1,
      meta: row
    };
  }).filter(l => l.source !== undefined && l.target !== undefined);

  // Links: Studies → Themes
  const links2 = study_theme.map(row => {
    const source = nodeMap[`study:${row.study_id}`];
    const target = nodeMap[`theme:${row.theme_id}`];
    if (source === undefined || target === undefined) {
      errors.push(`Invalid study-theme link: ${JSON.stringify(row)}`);
    }
    return {
      source,
      target,
      value: +row.strength || 1,
      meta: row
    };
  }).filter(l => l.source !== undefined && l.target !== undefined);

  // Show errors if any
  if (errors.length) {
    let errorDiv = document.getElementById('sankey-errors');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.id = 'sankey-errors';
      errorDiv.style.color = 'red';
      errorDiv.style.whiteSpace = 'pre-wrap';
      document.getElementById('sankey-container').prepend(errorDiv);
    }
    errorDiv.textContent = 'Data errors:\n' + errors.join('\n');
  }

  return {
    nodes,
    links: links1.concat(links2)
  };
}

function renderSankey({nodes, links}) {
  const width = 1200, height = 700;
  const svg = d3.select('#sankey');
  svg.selectAll('*').remove();

  const sankey = d3.sankey()
    .nodeWidth(24)
    .nodePadding(24)
    .extent([[1, 1], [width - 1, height - 6]]);

  const {nodes: sankeyNodes, links: sankeyLinks} = sankey({nodes: nodes.map(d => Object.assign({}, d)), links: links.map(d => Object.assign({}, d))});

  // Draw links
  svg.append('g')
    .selectAll('path')
    .data(sankeyLinks)
    .join('path')
      .attr('class', 'link')
      .attr('d', d3.sankeyLinkHorizontal())
      .attr('stroke', d => {
        if (d.source.type === 'theory') return '#3b82f6';
        if (d.source.type === 'study') return '#f59e42';
        return '#aaa';
      })
      .attr('stroke-width', d => Math.max(1, d.width))
      .attr('stroke-opacity', 0.5);

  // Draw nodes
  const node = svg.append('g')
    .selectAll('g')
    .data(sankeyNodes)
    .join('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

  node.append('rect')
    .attr('height', d => d.y1 - d.y0)
    .attr('width', d => d.x1 - d.x0)
    .attr('fill', d => {
      if (d.type === 'theory') return '#2563eb';
      if (d.type === 'study') return '#f59e42';
      if (d.type === 'theme') return '#10b981';
      return '#888';
    });

  node.append('text')
    .attr('x', 6)
    .attr('y', d => (d.y1 - d.y0) / 2)
    .attr('dy', '0.35em')
    .attr('font-size', 14)
    .attr('fill', '#222')
    .text(d => d.name || d.label || d.id);
}

async function main() {
  // Data file paths
  const dataDir = 'data/';
  const paths = [
    dataDir + 'Sankey-Theories.csv',
    dataDir + 'Sankey-Studies.csv',
    dataDir + 'Sankey-Themes.csv',
    dataDir + 'Sankey-Theory-Study-Connections.csv',
    dataDir + 'Sankey-Study-Theme-Connections.csv',
    dataDir + 'Sankey-Theme-Resources.csv'
  ];
  // Show loading status
  const container = document.getElementById('sankey-container');
  const status = document.createElement('div');
  status.id = 'loading-status';
  status.textContent = 'Loading data...';
  container.prepend(status);
  try {
    const csvs = await loadCSVs(paths);
    // For now, ignore resource_links
    const sankeyData = buildSankeyData(
      csvs['Sankey-Theories'],
      csvs['Sankey-Studies'],
      csvs['Sankey-Themes'],
      csvs['Sankey-Theory-Study-Connections'],
      csvs['Sankey-Study-Theme-Connections']
    );
    renderSankey(sankeyData);
    status.remove();
  } catch (err) {
    status.textContent = 'Error loading data. Please check that all CSV files are present and named exactly as in the repository.';
    console.error('Data loading error:', err);
  }
}

main();
