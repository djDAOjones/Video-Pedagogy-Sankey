/**
 * Filter data based on current filter settings
 */
export function filterData(rawData, filters, stageOrder, searchFilter = { term: '', mode: 'loose' }) {
  const { nodes, links } = rawData
  const { strengthRange, complexity, omitOrphans } = filters
  
  // Step 1: Apply search filter if present
  let filteredNodes = searchFilter.term 
    ? searchNodes(nodes, searchFilter.term, searchFilter.mode)
    : [...nodes]
  
  // Step 2: Filter links by strength
  let filteredLinks = links.filter(link => 
    link.weight >= strengthRange[0] && link.weight <= strengthRange[1]
  )
  
  // Step 3: Identify nodes that have connections after link filtering
  const connectedNodeIds = new Set()
  filteredLinks.forEach(link => {
    connectedNodeIds.add(link.source)
    connectedNodeIds.add(link.target)
  })
  
  // Step 4: Filter nodes based on connection and orphan settings
  filteredNodes = filteredNodes.filter(node => {
    const isConnected = connectedNodeIds.has(node.id)
    if (omitOrphans && !isConnected) {
      return false
    }
    return true
  })
  
  // Step 5: Apply complexity filter independently per stage
  // Step 4: Apply complexity filter independently per stage
  if (complexity < 1.0) {
    // Group nodes by stage/class
    const nodesByClass = {
      'Theory': filteredNodes.filter(n => n.node_class === 'Theory'),
      'Theme': filteredNodes.filter(n => n.node_class === 'Theme'),
      'Study': filteredNodes.filter(n => n.node_class === 'Study')
    }
    
    const keptNodes = []
    
    // Apply complexity threshold independently for each stage
    Object.entries(nodesByClass).forEach(([className, classNodes]) => {
      if (classNodes.length > 0) {
        const weights = classNodes.map(n => n.totalWeight).filter(w => w > 0)
        if (weights.length > 0) {
          weights.sort((a, b) => a - b)
          const threshold = weights[Math.floor(weights.length * (1 - complexity))]
          
          const keptClassNodes = classNodes.filter(node => 
            node.totalWeight >= threshold || node.totalWeight === 0
          )
          keptNodes.push(...keptClassNodes)
        } else {
          // If no nodes with weights, keep all nodes of this class
          keptNodes.push(...classNodes)
        }
      }
    })
    
    filteredNodes = keptNodes
    
    // Update links to only include those between filtered nodes
    const nodeIdSet = new Set(filteredNodes.map(n => n.id))
    filteredLinks = filteredLinks.filter(link =>
      nodeIdSet.has(link.source) && nodeIdSet.has(link.target)
    )
  }
  
  // Step 5: Organize nodes by stage order (may filter out stages)
  const organizedNodes = organizeNodesByStage(filteredNodes, stageOrder)
  
  // Step 6: Handle links based on stage configuration
  let finalLinks = []
  const organizedNodeIds = new Set(organizedNodes.map(n => n.id))
  const nodeClassMap = new Map(organizedNodes.map(n => [n.id, n.node_class]))
  
  // Check if we need to create virtual links (when Theme is excluded)
  if (stageOrder.length === 2 && !stageOrder.includes('Theme')) {
    // Need to create virtual links between Theory and Study
    const theoryToTheme = new Map() // Theory -> [Themes]
    const themeToStudy = new Map() // Theme -> [Studies]
    
    // Build connection maps from original links
    filteredLinks.forEach(link => {
      const sourceClass = nodes.find(n => n.id === link.source)?.node_class
      const targetClass = nodes.find(n => n.id === link.target)?.node_class
      
      if (sourceClass === 'Theory' && targetClass === 'Theme') {
        if (!theoryToTheme.has(link.source)) theoryToTheme.set(link.source, [])
        theoryToTheme.get(link.source).push({ theme: link.target, weight: link.weight })
      } else if (sourceClass === 'Theme' && targetClass === 'Study') {
        if (!themeToStudy.has(link.source)) themeToStudy.set(link.source, [])
        themeToStudy.get(link.source).push({ study: link.target, weight: link.weight })
      }
    })
    
    // Create virtual direct links
    theoryToTheme.forEach((themes, theoryId) => {
      themes.forEach(({ theme, weight: weight1 }) => {
        const studies = themeToStudy.get(theme) || []
        studies.forEach(({ study, weight: weight2 }) => {
          if (organizedNodeIds.has(theoryId) && organizedNodeIds.has(study)) {
            // Average the weights for the virtual link
            const virtualWeight = Math.round((weight1 + weight2) / 2)
            finalLinks.push({
              source: theoryId,
              target: study,
              weight: virtualWeight,
              value: virtualWeight,
              virtual: true // Mark as virtual for debugging
            })
          }
        })
      })
    })
  } else {
    // Normal filtering - only include links between organized nodes
    finalLinks = filteredLinks.filter(link =>
      organizedNodeIds.has(link.source) && organizedNodeIds.has(link.target)
    )
  }
  
  return {
    nodes: organizedNodes,
    links: finalLinks
  }
}

/**
 * Organize nodes according to the stage order
 */
function organizeNodesByStage(nodes, stageOrder) {
  // Filter out nodes that aren't in the current stage order
  const filteredNodes = nodes.filter(node => 
    stageOrder.includes(node.node_class)
  )
  
  // Assign stage/column index to each remaining node
  filteredNodes.forEach(node => {
    const stageIndex = stageOrder.indexOf(node.node_class)
    node.column = stageIndex >= 0 ? stageIndex : 0
  })
  
  return filteredNodes
}

/**
 * Apply category collapse/expand
 */
export function applyCategoryGrouping(data, collapsedCategories) {
  const { nodes, links } = data
  
  if (!collapsedCategories || Object.keys(collapsedCategories).length === 0) {
    return data
  }
  
  const groupedNodes = []
  const nodeMapping = new Map() // Original ID -> Group ID mapping
  
  nodes.forEach(node => {
    const categoryKey = `${node.node_class}-${node.category}`
    
    if (collapsedCategories[categoryKey]) {
      // This category is collapsed, create or find group node
      const groupId = `GROUP-${categoryKey}`
      
      if (!nodeMapping.has(groupId)) {
        // Create new group node
        groupedNodes.push({
          id: groupId,
          node_class: node.node_class,
          label_short: `${node.category} (${collapsedCategories[categoryKey].count})`,
          label_long: `${node.category} - ${collapsedCategories[categoryKey].count} items`,
          category: node.category,
          isGroup: true,
          column: node.column,
          totalWeight: 0
        })
        nodeMapping.set(groupId, groupId)
      }
      
      // Map original node to group
      nodeMapping.set(node.id, groupId)
      
      // Add weight to group
      const groupNode = groupedNodes.find(n => n.id === groupId)
      groupNode.totalWeight += node.totalWeight
    } else {
      // Category not collapsed, keep original node
      groupedNodes.push(node)
      nodeMapping.set(node.id, node.id)
    }
  })
  
  // Update links to use grouped nodes
  const groupedLinks = []
  const linkMap = new Map() // Track unique links after grouping
  
  links.forEach(link => {
    const newSource = nodeMapping.get(link.source)
    const newTarget = nodeMapping.get(link.target)
    
    if (newSource && newTarget) {
      const linkKey = `${newSource}-${newTarget}`
      
      if (linkMap.has(linkKey)) {
        // Aggregate weight for duplicate links
        linkMap.get(linkKey).weight += link.weight
        linkMap.get(linkKey).value += link.value
      } else {
        const newLink = {
          source: newSource,
          target: newTarget,
          weight: link.weight,
          value: link.value
        }
        linkMap.set(linkKey, newLink)
        groupedLinks.push(newLink)
      }
    }
  })
  
  return {
    nodes: groupedNodes,
    links: groupedLinks
  }
}

/**
 * Search nodes by text with strict or loose matching
 */
export function searchNodes(nodes, searchTerm, mode = 'loose') {
  if (!searchTerm || searchTerm.trim() === '') {
    return nodes
  }
  
  const term = searchTerm.toLowerCase().trim()
  
  return nodes.filter(node => {
    const searchableFields = [
      node.id,
      node.label_short,
      node.label_long,
      node.category,
      node.authors,
      node.description,
      node.year?.toString()
    ].filter(field => field) // Remove null/undefined values
    
    if (mode === 'strict') {
      // Strict mode: exact match in any field
      return searchableFields.some(field => 
        field.toLowerCase().trim() === term
      )
    } else {
      // Loose mode: contains the search term
      const searchableText = searchableFields.join(' ').toLowerCase()
      return searchableText.includes(term)
    }
  })
}

/**
 * Get connected nodes for a given node
 */
export function getConnectedNodes(nodeId, links) {
  const connected = {
    sources: [], // Nodes that connect TO this node
    targets: []  // Nodes that this node connects TO
  }
  
  links.forEach(link => {
    if (link.target === nodeId) {
      connected.sources.push(link.source)
    }
    if (link.source === nodeId) {
      connected.targets.push(link.target)
    }
  })
  
  return connected
}

/**
 * Calculate link scaling based on mode
 */
export function scaleLinkWidth(weight, mode = 'linear') {
  const MIN_WIDTH = 2
  const MAX_WIDTH = 30
  
  switch (mode) {
    case 'logarithmic':
      // Logarithmic scaling for better visibility of weak links
      return MIN_WIDTH + Math.log(weight + 1) * 
             (MAX_WIDTH - MIN_WIDTH) / Math.log(5)
    
    case 'square-root':
      // Square root scaling for balanced approach
      return MIN_WIDTH + Math.sqrt(weight) * 
             (MAX_WIDTH - MIN_WIDTH) / 2
    
    case 'linear':
    default:
      // Linear scaling
      return MIN_WIDTH + (weight / 4) * (MAX_WIDTH - MIN_WIDTH)
  }
}