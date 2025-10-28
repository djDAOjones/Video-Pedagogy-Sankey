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

    const margin = { top: 20, right: 120, bottom: 20, left: 120 }
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
    
    // Apply focus filter if a node is selected
    if (focusedNode) {
      // Get connected nodes - use the original string IDs
      const connectedNodeIds = new Set([focusedNode.id])
      
      // Find all connected nodes from the original links data
      data.links.forEach(link => {
        // links at this point still have string IDs for source/target
        if (link.source === focusedNode.id) {
          connectedNodeIds.add(link.target)
        }
        if (link.target === focusedNode.id) {
          connectedNodeIds.add(link.source)
        }
      })
      
      // Filter nodes: keep focused node, connected nodes, but hide others in same stage
      filteredNodes = filteredNodes.filter(node => {
        if (node.id === focusedNode.id) return true
        if (node.node_class !== focusedNode.node_class) {
          return connectedNodeIds.has(node.id)
        }
        return false // Hide other nodes in the same stage
      })
      
      // Filter links to only show those connected to focused node
      filteredLinks = filteredLinks.filter(link => 
        link.source === focusedNode.id || link.target === focusedNode.id
      )
    }
    
    // Sort and organize nodes by stage order
    const nodesByStage = {}
    stageOrder.forEach((stage, index) => {
      nodesByStage[stage] = filteredNodes.filter(n => n.node_class === stage)
        .map(node => ({ 
          ...node,
          layer: index,
          x0: undefined,
          x1: undefined,
          y0: undefined,
          y1: undefined
        }))
    })
    
    // Rebuild nodes array in stage order
    filteredNodes = []
    stageOrder.forEach(stage => {
      if (nodesByStage[stage]) {
        filteredNodes.push(...nodesByStage[stage])
      }
    })
    
    const sankeyData = {
      nodes: filteredNodes,
      links: filteredLinks
    }

    // Generate Sankey layout
    const sankeyResult = sankeyGenerator(sankeyData)
    const { nodes, links } = sankeyResult
    
    // Force proper x-positions based on stage order
    const columnWidth = (width - margin.left - margin.right) / stageOrder.length
    nodes.forEach(node => {
      const stageIndex = stageOrder.indexOf(node.node_class)
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
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.1)
      .style('cursor', 'pointer')
      .style('opacity', d => focusedNode && d.id !== focusedNode.id && d.node_class === focusedNode.node_class ? 0.2 : 1)
      .on('mouseenter', (event, d) => handleNodeHover(event, d))
      .on('mouseleave', () => setTooltipData(null))
      .on('click', (event, d) => handleNodeClick(d))

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
        .attr('font-weight', focusedNode && d.id === focusedNode.id ? 'bold' : 'normal')
        .attr('fill', '#374151')
        .style('opacity', d => focusedNode && d.id !== focusedNode.id && d.node_class === focusedNode.node_class ? 0 : 1)
        .text(d => getNodeLabel(d, focusedNode ? 200 : d.x1 - d.x0))
    }

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
    if (focusedNode && focusedNode.id === node.id) {
      setFocusedNode(null) // Clear focus if clicking the same node
    } else {
      // Store only essential node data to avoid D3's circular references
      setFocusedNode({
        id: node.id,
        node_class: node.node_class,
        label_short: node.label_short,
        label_long: node.label_long
      })
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
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-lg shadow-lg flex items-center gap-2 z-10">
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