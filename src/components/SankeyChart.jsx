import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { sankey, sankeyLinkHorizontal, sankeyLeft } from 'd3-sankey'
import { scaleLinkWidth } from '../utils/dataFilter'
import Tooltip from './Tooltip'

function SankeyChart({ data, displayOptions, stageOrder }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [tooltipData, setTooltipData] = useState(null)
  const [focusedNode, setFocusedNode] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: width,
          height: Math.min(600, window.innerHeight * 0.6)
        })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Render Sankey diagram
  useEffect(() => {
    if (!data.nodes.length || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 40, right: 120, bottom: 20, left: 120 }
    const width = dimensions.width - margin.left - margin.right
    const height = dimensions.height - margin.top - margin.bottom

    // Create Sankey generator
    const sankeyGenerator = sankey()
      .nodeId(d => d.id)
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[margin.left, margin.top], [width, height]])
      .nodeAlign(sankeyLeft)
      .nodeSort(null) // Disable sorting to maintain our order

    // Prepare data for D3 Sankey with focus filtering
    let filteredNodes = data.nodes.map(d => ({ ...d }))
    let filteredLinks = data.links.map(d => ({ ...d }))
    
    // Determine the effective stage order (reorder if node is focused)
    let effectiveStageOrder = [...stageOrder]
    
    if (focusedNode) {
      const focusedStage = focusedNode.node_class
      const allStages = ['Theory', 'Theme', 'Study']
      
      if (stageOrder.length === 3) {
        // For 3 stages: Put focused stage in center
        const focusedIndex = stageOrder.indexOf(focusedStage)
        
        if (focusedIndex === 0) {
          // If first stage is focused, rotate right: [A,B,C] -> [C,A,B]
          effectiveStageOrder = [stageOrder[2], stageOrder[0], stageOrder[1]]
        } else if (focusedIndex === 2) {
          // If last stage is focused, rotate left: [A,B,C] -> [B,C,A]
          effectiveStageOrder = [stageOrder[1], stageOrder[2], stageOrder[0]]
        }
        // If middle stage is focused (index === 1), keep original order
      } else if (stageOrder.length === 2) {
        // For 2 stages in focus mode: Show all 3 stages with focused in center
        const otherStages = allStages.filter(s => s !== focusedStage)
        
        // Determine which stage was originally adjacent
        const originalAdjacentStage = stageOrder.find(s => s !== focusedStage)
        const hiddenStage = otherStages.find(s => s !== originalAdjacentStage)
        
        // Place focused stage in center, keep original adjacent on same side
        const originalIndex = stageOrder.indexOf(focusedStage)
        if (originalIndex === 0) {
          // Focused was on left, keep adjacent on right
          effectiveStageOrder = [hiddenStage, focusedStage, originalAdjacentStage]
        } else {
          // Focused was on right, keep adjacent on left
          effectiveStageOrder = [originalAdjacentStage, focusedStage, hiddenStage]
        }
      }
    }
    
    // Sort and organize nodes by effective stage order
    let organizedNodes = []
    const nodesByStage = {}
    effectiveStageOrder.forEach((stage, index) => {
      nodesByStage[stage] = filteredNodes.filter(n => n.node_class === stage)
        .map(node => ({ 
          ...node,
          layer: index,
          x0: undefined,
          x1: undefined,
          y0: undefined,
          y1: undefined
        }))
      organizedNodes.push(...nodesByStage[stage])
    })
    
    // THEN apply focus filter if a node is selected
    if (focusedNode) {
      // Get connected nodes using the filtered links (which may include virtual links)
      const connectedNodeIds = new Set([focusedNode.id])
      
      // Find all connected nodes from the filtered links
      filteredLinks.forEach(link => {
        // links at this point still have string IDs for source/target
        if (link.source === focusedNode.id) {
          connectedNodeIds.add(link.target)
        }
        if (link.target === focusedNode.id) {
          connectedNodeIds.add(link.source)
        }
      })
      
      // Filter nodes: keep focused node and all connected nodes
      const filteredOrganizedNodes = organizedNodes.filter(node => {
        // Always keep the focused node
        if (node.id === focusedNode.id) {
          return true
        }
        // Keep connected nodes from other stages
        if (connectedNodeIds.has(node.id)) {
          return true
        }
        // Hide everything else
        return false
      })
      
      // Only proceed if we have nodes to display
      if (filteredOrganizedNodes.length > 0) {
        organizedNodes = filteredOrganizedNodes
        
        // Filter links to only show those connected to focused node
        filteredLinks = filteredLinks.filter(link => 
          link.source === focusedNode.id || link.target === focusedNode.id
        )
      }
    }
    
    filteredNodes = organizedNodes
    
    const sankeyData = {
      nodes: filteredNodes,
      links: filteredLinks
    }

    // Generate Sankey layout
    const sankeyResult = sankeyGenerator(sankeyData)
    const { nodes, links } = sankeyResult
    
    // Force proper x-positions based on effective stage order
    const columnWidth = (width - margin.left - margin.right) / effectiveStageOrder.length
    nodes.forEach(node => {
      const stageIndex = effectiveStageOrder.indexOf(node.node_class)
      if (stageIndex >= 0) {
        const x = margin.left + (stageIndex * columnWidth) + (columnWidth - 15) / 2
        node.x0 = x
        node.x1 = x + 15 // nodeWidth
      }
    })

    // Create main group
    const g = svg.append('g')

    // Define gradients for links
    const defs = svg.append('defs')
    
    links.forEach((link, i) => {
      const gradient = defs.append('linearGradient')
        .attr('id', `gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', link.source.x1)
        .attr('y1', link.source.y0)
        .attr('x2', link.target.x0)
        .attr('y2', link.target.y0)

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', getNodeColor(link.source))
        .attr('stop-opacity', 0.5)

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', getNodeColor(link.target))
        .attr('stop-opacity', 0.5)
    })

    // Draw links
    const link = g.append('g')
      .attr('fill', 'none')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('class', 'sankey-link')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', (d, i) => `url(#gradient-${i})`)
      .attr('stroke-width', d => scaleLinkWidth(d.weight, displayOptions.scalingMode))
      .style('opacity', focusedNode ? 0.8 : 1)
      .on('mouseenter', (event, d) => handleLinkHover(event, d))
      .on('mouseleave', () => setTooltipData(null))

    // Calculate node sizing based on total weight
    const nodeScale = d3.scaleLinear()
      .domain([0, d3.max(nodes, d => d.totalWeight) || 1])
      .range([10, 60]) // Min and max node height in pixels
    
    // Draw nodes with scaled height
    const node = g.append('g')
      .selectAll('rect')
      .data(nodes)
      .join('rect')
      .attr('class', 'sankey-node')
      .attr('x', d => d.x0)
      .attr('y', d => {
        // Center the scaled node within the allocated space
        const allocatedHeight = d.y1 - d.y0
        const scaledHeight = scaleNodeHeight(d.totalWeight || 0, displayOptions.scalingMode)
        return d.y0 + (allocatedHeight - scaledHeight) / 2
      })
      .attr('height', d => scaleNodeHeight(d.totalWeight || 0, displayOptions.scalingMode))
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', d => getNodeColor(d))
      .attr('stroke', d => focusedNode && d.id === focusedNode.id ? '#1e40af' : '#000')
      .attr('stroke-width', d => focusedNode && d.id === focusedNode.id ? 3 : 1)
      .attr('stroke-opacity', d => focusedNode && d.id === focusedNode.id ? 1 : 0.1)
      .style('cursor', 'pointer')
      .style('filter', d => focusedNode && d.id === focusedNode.id ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'none')
      .on('mouseenter', (event, d) => handleNodeHover(event, d))
      .on('mouseleave', () => setTooltipData(null))
      .on('click', (event, d) => handleNodeClick(d))
    
    // Add title tooltips to nodes
    node.append('title')
      .text(d => `${d.label_short}\nClick to focus on connections`)

    // Draw labels if enabled or in focus mode
    if (displayOptions.showLabels || focusedNode) {
      const labels = g.append('g')
        .selectAll('text')
        .data(nodes)
        .join('text')
        .attr('class', 'sankey-label')
        .attr('x', d => d.x0 < width / 2 ? d.x0 - 6 : d.x1 + 6)
        .attr('y', d => {
          // Align label with centered node
          const allocatedHeight = d.y1 - d.y0
          const scaledHeight = scaleNodeHeight(d.totalWeight || 0, displayOptions.scalingMode)
          return d.y0 + allocatedHeight / 2
        })
        .attr('dy', '0.35em')
        .attr('text-anchor', d => d.x0 < width / 2 ? 'end' : 'start')
        .attr('font-size', focusedNode ? '14px' : '12px')
        .attr('font-weight', d => focusedNode && d.id === focusedNode.id ? 'bold' : 'normal')
        .attr('fill', '#374151')
        .style('opacity', d => focusedNode && d.id !== focusedNode.id && d.node_class === focusedNode.node_class ? 0 : 1)
        .text(d => getNodeLabel(d, focusedNode ? 200 : d.x1 - d.x0))
    }
    
    // Add stage labels at the top
    const stageLabels = g.append('g')
      .selectAll('text')
      .data(effectiveStageOrder)
      .join('text')
      .attr('x', (d, i) => {
        const columnWidth = (width - margin.left - margin.right) / effectiveStageOrder.length
        return margin.left + (i * columnWidth) + columnWidth / 2
      })
      .attr('y', margin.top - 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#374151')
      .text(d => d)
      .style('opacity', focusedNode ? 1 : 0.7)

  }, [data, dimensions, displayOptions, focusedNode])

  // Helper functions
  function getNodeColor(node) {
    const colors = {
      'Theory': '#3B82F6',
      'Theme': '#10B981',
      'Study': '#F59E0B'
    }
    return colors[node.node_class] || '#6B7280'
  }

  function getNodeLabel(node, availableWidth) {
    if (!displayOptions.showLabels) return ''
    
    // Simple heuristic for text length
    const charWidth = 7 // Approximate pixels per character
    const maxChars = Math.floor(availableWidth / charWidth)
    
    if (node.label_short.length <= maxChars) {
      return node.label_short
    } else if (maxChars > 5) {
      return node.label_short.substring(0, maxChars - 3) + '...'
    }
    return '' // Too small to show any text
  }

  function handleNodeHover(event, node) {
    const rect = event.target.getBoundingClientRect()
    setTooltipPosition({
      x: rect.right + 10,
      y: rect.top + rect.height / 2
    })
    setTooltipData({
      type: 'node',
      data: node
    })
  }

  function handleLinkHover(event, link) {
    const mouse = d3.pointer(event)
    setTooltipPosition({
      x: event.pageX + 10,
      y: event.pageY
    })
    setTooltipData({
      type: 'link',
      data: link
    })
  }

  function handleNodeClick(node) {
    // Toggle focus on the clicked node
    // Extract just the essential data to avoid circular references
    const nodeData = {
      id: typeof node === 'object' ? node.id : node,
      node_class: node.node_class || data.nodes.find(n => n.id === (node.id || node))?.node_class,
      label_short: node.label_short || data.nodes.find(n => n.id === (node.id || node))?.label_short,
      label_long: node.label_long || data.nodes.find(n => n.id === (node.id || node))?.label_long
    }
    
    if (focusedNode && focusedNode.id === nodeData.id) {
      setFocusedNode(null) // Clear focus if clicking the same node
    } else {
      // Store only essential node data to avoid D3's circular references
      setFocusedNode(nodeData)
    }
  }

  // Add node height scaling function
  function scaleNodeHeight(totalWeight, mode = 'linear') {
    const MIN_HEIGHT = 20
    const MAX_HEIGHT = 80
    const maxWeight = Math.max(...data.nodes.map(n => n.totalWeight || 0), 1)
    const normalizedWeight = totalWeight / maxWeight
    
    switch (mode) {
      case 'logarithmic':
        // Logarithmic scaling for better visibility of nodes with low weights
        return MIN_HEIGHT + Math.log(normalizedWeight * 4 + 1) * 
               (MAX_HEIGHT - MIN_HEIGHT) / Math.log(5)
      
      case 'square-root':
        // Square root scaling for balanced approach
        return MIN_HEIGHT + Math.sqrt(normalizedWeight) * 
               (MAX_HEIGHT - MIN_HEIGHT)
      
      case 'linear':
      default:
        // Linear scaling
        return MIN_HEIGHT + normalizedWeight * (MAX_HEIGHT - MIN_HEIGHT)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Focus mode indicator */}
      {focusedNode && (
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-lg shadow-lg flex flex-col gap-1 z-10">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              Focus: {focusedNode.label_short}
            </span>
            <button
              onClick={() => setFocusedNode(null)}
              className="ml-2 text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-0.5 rounded"
            >
              ✕ Clear
            </button>
          </div>
          <div className="text-xs opacity-90">
            {focusedNode.node_class} centered
          </div>
        </div>
      )}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full"
      />
      {tooltipData && (
        <Tooltip
          data={tooltipData}
          position={tooltipPosition}
        />
      )}
    </div>
  )
}

export default SankeyChart