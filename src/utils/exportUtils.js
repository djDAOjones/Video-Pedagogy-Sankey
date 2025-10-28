import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { saveAs } from 'file-saver'

/**
 * Export the SVG visualization as PNG
 */
export async function exportToPNG(elementId) {
  try {
    const svgElement = document.getElementById(elementId)
    if (!svgElement) throw new Error('SVG element not found')

    // Create a clone for export
    const clone = svgElement.cloneNode(true)
    clone.style.backgroundColor = 'white'
    
    // Create temporary container
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.appendChild(clone)
    document.body.appendChild(container)

    // Convert to canvas
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      logging: false
    })

    // Clean up
    document.body.removeChild(container)

    // Convert to blob and save
    canvas.toBlob((blob) => {
      const fileName = `video-pedagogy-sankey-${Date.now()}.png`
      saveAs(blob, fileName)
    })
  } catch (error) {
    console.error('PNG export error:', error)
    throw error
  }
}

/**
 * Export the SVG visualization as PDF
 */
export async function exportToPDF(elementId) {
  try {
    const svgElement = document.getElementById(elementId)
    if (!svgElement) throw new Error('SVG element not found')

    // Create a clone for export
    const clone = svgElement.cloneNode(true)
    clone.style.backgroundColor = 'white'
    
    // Create temporary container
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.appendChild(clone)
    document.body.appendChild(container)

    // Convert to canvas
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false
    })

    // Clean up
    document.body.removeChild(container)

    // Create PDF
    const imgWidth = 297 // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)

    // Add metadata
    pdf.setProperties({
      title: 'Video Pedagogy Sankey Diagram',
      subject: 'Visualization of theories, themes, and studies in video pedagogy',
      author: 'Video Pedagogy Research Explorer',
      creator: 'djDAOjones'
    })

    // Save PDF
    const fileName = `video-pedagogy-sankey-${Date.now()}.pdf`
    pdf.save(fileName)
  } catch (error) {
    console.error('PDF export error:', error)
    throw error
  }
}

/**
 * Export current settings as JSON
 */
export function exportSettings(settings) {
  const blob = new Blob(
    [JSON.stringify(settings, null, 2)],
    { type: 'application/json' }
  )
  const fileName = `sankey-settings-${Date.now()}.json`
  saveAs(blob, fileName)
}

/**
 * Import settings from JSON file
 */
export function importSettings(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target.result)
        
        // Validate settings structure
        if (!settings.version || !settings.filters || !settings.stageOrder) {
          throw new Error('Invalid settings file format')
        }
        
        resolve(settings)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

/**
 * Export data as CSV (for external analysis)
 */
export function exportDataAsCSV(data) {
  const { nodes, links } = data
  
  // Export nodes
  const nodeHeaders = ['id', 'node_class', 'label_short', 'label_long', 'category', 'authors', 'year', 'totalWeight']
  const nodeRows = nodes.map(node => 
    nodeHeaders.map(header => node[header] || '').join(',')
  )
  const nodesCSV = [nodeHeaders.join(','), ...nodeRows].join('\n')
  
  // Export links
  const linkHeaders = ['source', 'target', 'weight']
  const linkRows = links.map(link =>
    linkHeaders.map(header => link[header] || '').join(',')
  )
  const linksCSV = [linkHeaders.join(','), ...linkRows].join('\n')
  
  // Save both files
  const nodesBlob = new Blob([nodesCSV], { type: 'text/csv' })
  const linksBlob = new Blob([linksCSV], { type: 'text/csv' })
  
  saveAs(nodesBlob, `nodes-export-${Date.now()}.csv`)
  saveAs(linksBlob, `links-export-${Date.now()}.csv`)
}

/**
 * Generate shareable URL with current settings
 */
export function generateShareableURL(settings) {
  const baseURL = window.location.origin + window.location.pathname
  const params = new URLSearchParams({
    settings: btoa(JSON.stringify(settings))
  })
  return `${baseURL}?${params.toString()}`
}

/**
 * Parse settings from URL
 */
export function parseSettingsFromURL() {
  const params = new URLSearchParams(window.location.search)
  const settingsParam = params.get('settings')
  
  if (settingsParam) {
    try {
      return JSON.parse(atob(settingsParam))
    } catch (error) {
      console.error('Failed to parse URL settings:', error)
    }
  }
  
  return null
}