import Papa from 'papaparse'

/**
 * Load and parse CSV data files
 * @returns {Promise<{nodes: Array, links: Array}>}
 */
export async function loadData() {
  try {
    // Load both CSV files in parallel
    // Use base path for GitHub Pages deployment
    const basePath = import.meta.env.BASE_URL || '/'
    const [nodesResponse, linksResponse] = await Promise.all([
      fetch(`${basePath}Data/data_nodes_v2.csv`),
      fetch(`${basePath}Data/data_links_v2.csv`)
    ])

    if (!nodesResponse.ok || !linksResponse.ok) {
      throw new Error('Failed to load data files')
    }

    const [nodesText, linksText] = await Promise.all([
      nodesResponse.text(),
      linksResponse.text()
    ])

    // Parse CSV data
    const nodesData = Papa.parse(nodesText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    })

    const linksData = Papa.parse(linksText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    })

    if (nodesData.errors.length > 0 || linksData.errors.length > 0) {
      console.error('CSV parsing errors:', { 
        nodes: nodesData.errors, 
        links: linksData.errors 
      })
    }

    // Process and validate data
    const nodes = processNodes(nodesData.data)
    const links = processLinks(linksData.data, nodes)

    return { nodes, links }
  } catch (error) {
    console.error('Error loading data:', error)
    throw new Error(`Failed to load visualization data: ${error.message}`)
  }
}

/**
 * Process and validate node data
 */
function processNodes(rawNodes) {
  return rawNodes
    .filter(node => node.id && node.node_class && node.label_short)
    .map(node => ({
      id: node.id.trim(),
      node_class: node.node_class.trim(),
      label_short: node.label_short.trim(),
      label_long: node.label_long?.trim() || node.label_short.trim(),
      category: node.category?.trim() || 'Uncategorized',
      authors: node.authors?.trim() || '',
      year: node.year || null,
      url: node.url?.trim() || '',
      url_page: node.url_page?.trim() || '',
      url_video: node.url_video?.trim() || '',
      description: node.description?.trim() || '',
      // Additional computed properties
      totalWeight: 0, // Will be calculated from links
      isOrphan: true  // Will be updated based on connections
    }))
}

/**
 * Process and validate link data
 */
function processLinks(rawLinks, nodes) {
  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  
  return rawLinks
    .filter(link => {
      // Validate that source and target exist
      return link.source && 
             link.target && 
             nodeMap.has(link.source.trim()) && 
             nodeMap.has(link.target.trim()) &&
             typeof link.weight === 'number'
    })
    .map(link => {
      const source = link.source.trim()
      const target = link.target.trim()
      const weight = Math.max(0, Math.min(4, link.weight)) // Clamp between 0-4
      
      // Update node properties
      const sourceNode = nodeMap.get(source)
      const targetNode = nodeMap.get(target)
      
      sourceNode.totalWeight += weight
      targetNode.totalWeight += weight
      sourceNode.isOrphan = false
      targetNode.isOrphan = false
      
      return {
        source,
        target,
        weight,
        value: weight // D3 sankey uses 'value' property
      }
    })
}

/**
 * Get unique categories for each node class
 */
export function getCategories(nodes) {
  const categories = {
    Theory: new Set(),
    Theme: new Set(),
    Study: new Set()
  }
  
  nodes.forEach(node => {
    if (categories[node.node_class]) {
      categories[node.node_class].add(node.category)
    }
  })
  
  return {
    Theory: Array.from(categories.Theory).sort(),
    Theme: Array.from(categories.Theme).sort(),
    Study: Array.from(categories.Study).sort()
  }
}

/**
 * Calculate statistics about the data
 */
export function getDataStats(data) {
  const { nodes, links } = data
  
  const stats = {
    totalNodes: nodes.length,
    nodesByClass: {
      Theory: nodes.filter(n => n.node_class === 'Theory').length,
      Theme: nodes.filter(n => n.node_class === 'Theme').length,
      Study: nodes.filter(n => n.node_class === 'Study').length
    },
    totalLinks: links.length,
    linksByWeight: {
      0: links.filter(l => l.weight === 0).length,
      1: links.filter(l => l.weight === 1).length,
      2: links.filter(l => l.weight === 2).length,
      3: links.filter(l => l.weight === 3).length,
      4: links.filter(l => l.weight === 4).length
    },
    orphanNodes: nodes.filter(n => n.isOrphan).length,
    avgConnectionsPerNode: (links.length * 2) / nodes.length
  }
  
  return stats
}