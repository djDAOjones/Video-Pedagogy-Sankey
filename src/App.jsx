import { useState, useEffect } from 'react'
import Header from './components/Header'
import SankeyChart from './components/SankeyChart'
import ControlPanel from './components/ControlPanel'
import { loadData } from './utils/dataLoader'
import { filterData } from './utils/dataFilter'
import './App.css'

function App() {
  // Data state
  const [rawData, setRawData] = useState({ nodes: [], links: [] })
  const [filteredData, setFilteredData] = useState({ nodes: [], links: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Configuration state
  const [stageOrder, setStageOrder] = useState(['Theory', 'Theme', 'Study'])
  const [searchFilter, setSearchFilter] = useState({ term: '', mode: 'loose' })
  const [filters, setFilters] = useState({
    strengthRange: [2, 4],
    complexity: 0.5,
    omitOrphans: true
  })
  const [displayOptions, setDisplayOptions] = useState({
    scalingMode: 'logarithmic',
    groupsCollapsed: true,
    showLabels: true
  })

  // Load data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const data = await loadData()
        setRawData(data)
        setFilteredData(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Apply filters when data or filters change
  useEffect(() => {
    if (rawData.nodes.length > 0) {
      const filtered = filterData(rawData, filters, stageOrder, searchFilter)
      setFilteredData(filtered)
    }
  }, [rawData, filters, stageOrder, searchFilter])

  // Filter update handlers
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleStageOrderChange = (newOrder) => {
    setStageOrder(newOrder)
  }

  const handleDisplayOptionsChange = (newOptions) => {
    setDisplayOptions(prev => ({ ...prev, ...newOptions }))
  }

  const handleSearchChange = (search) => {
    setSearchFilter(search)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading visualization data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onSearchChange={handleSearchChange} />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {searchFilter.term && (
          <div className="mb-4 px-2">
            <p className="text-sm text-gray-600">
              Search results for <span className="font-semibold">"{searchFilter.term}"</span> 
              ({searchFilter.mode} mode): 
              <span className="font-bold text-blue-600 ml-1">
                {filteredData.nodes.length} nodes, {filteredData.links.length} links
              </span>
            </p>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <SankeyChart
            data={filteredData}
            displayOptions={displayOptions}
            stageOrder={stageOrder}
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <ControlPanel
            filters={filters}
            stageOrder={stageOrder}
            displayOptions={displayOptions}
            onFilterChange={handleFilterChange}
            onStageOrderChange={handleStageOrderChange}
            onDisplayOptionsChange={handleDisplayOptionsChange}
            data={filteredData}
          />
        </div>
      </main>
    </div>
  )
}

export default App