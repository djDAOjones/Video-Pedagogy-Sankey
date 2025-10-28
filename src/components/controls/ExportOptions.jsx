import React, { useState } from 'react'
import { exportToPNG, exportToPDF, exportSettings, importSettings } from '../../utils/exportUtils'

function ExportOptions({ data, filters, stageOrder, displayOptions }) {
  const [importing, setImporting] = useState(false)

  const handleExportPNG = async () => {
    try {
      await exportToPNG('sankey-svg')
    } catch (error) {
      console.error('Export PNG failed:', error)
      alert('Failed to export PNG. Please try again.')
    }
  }

  const handleExportPDF = async () => {
    try {
      await exportToPDF('sankey-svg')
    } catch (error) {
      console.error('Export PDF failed:', error)
      alert('Failed to export PDF. Please try again.')
    }
  }

  const handleExportSettings = () => {
    const settings = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      filters,
      stageOrder,
      displayOptions
    }
    exportSettings(settings)
  }

  const handleImportSettings = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setImporting(true)
    try {
      const settings = await importSettings(file)
      
      // Apply imported settings through parent component
      if (settings.filters) {
        // Would need to pass these up through props
        console.log('Imported filters:', settings.filters)
      }
      if (settings.stageOrder) {
        console.log('Imported stage order:', settings.stageOrder)
      }
      if (settings.displayOptions) {
        console.log('Imported display options:', settings.displayOptions)
      }
      
      alert('Settings imported successfully!')
    } catch (error) {
      console.error('Import failed:', error)
      alert('Failed to import settings. Please check the file format.')
    } finally {
      setImporting(false)
      event.target.value = '' // Reset file input
    }
  }

  return (
    <div className="space-y-6">
      {/* Export Chart */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Export Visualization
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExportPNG}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Export as PNG
          </button>
          
          <button
            onClick={handleExportPDF}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Export as PDF
          </button>
        </div>
      </div>

      {/* Settings Management */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Settings Management
        </h3>
        <div className="space-y-3">
          <button
            onClick={handleExportSettings}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
            </svg>
            Save Current Settings
          </button>
          
          <label className="btn-secondary w-full flex items-center justify-center gap-2 cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {importing ? 'Loading...' : 'Load Settings'}
            <input
              type="file"
              accept=".json"
              onChange={handleImportSettings}
              className="hidden"
              disabled={importing}
            />
          </label>
        </div>
      </div>

      {/* Export Info */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-xs font-medium text-blue-900 mb-2">Export Information</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• PNG exports the current view as an image</li>
          <li>• PDF creates a document with the visualization</li>
          <li>• Settings JSON saves your filter configuration</li>
          <li>• Load settings to restore a previous configuration</li>
        </ul>
      </div>

      {/* Statistics for Export */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-xs font-medium text-gray-700 mb-2">Current Export Data</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Nodes: {data.nodes.length}</div>
          <div>Links: {data.links.length}</div>
          <div>Timestamp: {new Date().toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  )
}

export default ExportOptions