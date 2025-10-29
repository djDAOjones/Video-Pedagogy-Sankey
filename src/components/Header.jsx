import React, { useState } from 'react'

function Header({ onSearchChange }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchMode, setSearchMode] = useState('loose') // 'loose' or 'strict'
  
  const handleSearchChange = (term) => {
    setSearchTerm(term)
    onSearchChange({ term, mode: searchMode })
  }
  
  const handleModeToggle = () => {
    const newMode = searchMode === 'loose' ? 'strict' : 'loose'
    setSearchMode(newMode)
    onSearchChange({ term: searchTerm, mode: newMode })
  }
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Video Pedagogy Research Explorer
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Visualizing connections between theories, themes, and studies in video-based education
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="flex items-center gap-2 flex-1 max-w-md mx-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search nodes..."
                className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
            <button
              onClick={handleModeToggle}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                searchMode === 'strict' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title={searchMode === 'strict' ? 'Strict search: exact match' : 'Loose search: contains text'}
            >
              {searchMode === 'strict' ? 'Strict' : 'Loose'}
            </button>
            {searchTerm && (
              <button
                onClick={() => handleSearchChange('')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.open('https://github.com/djDAOjones/Video-Pedagogy-Sankey', '_blank')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="View on GitHub"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </button>
            
            <button
              onClick={() => document.getElementById('help-modal').showModal()}
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Help"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header