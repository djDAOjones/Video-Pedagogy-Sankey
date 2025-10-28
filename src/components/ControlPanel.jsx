import React, { useState } from 'react'
import RangeSlider from './controls/RangeSlider'
import StageSelector from './controls/StageSelector'
import DisplayOptions from './controls/DisplayOptions'
import ExportOptions from './controls/ExportOptions'

function ControlPanel({
  filters,
  stageOrder,
  displayOptions,
  onFilterChange,
  onStageOrderChange,
  onDisplayOptionsChange,
  data
}) {
  const [activeTab, setActiveTab] = useState('filters')

  const tabs = [
    { id: 'filters', label: 'Filters', icon: '🔍' },
    { id: 'display', label: 'Display', icon: '🎨' },
    { id: 'export', label: 'Export', icon: '💾' }
  ]

  return (
    <div className="control-panel">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'filters' && (
          <div className="space-y-6">
            {/* Stage Order Selector */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Flow Direction
              </h3>
              <StageSelector
                currentOrder={stageOrder}
                onChange={onStageOrderChange}
              />
            </div>

            {/* Link Strength Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Link Strength Range
              </h3>
              <RangeSlider
                min={0}
                max={4}
                value={filters.strengthRange}
                onChange={(range) => onFilterChange({ strengthRange: range })}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Weak (0)</span>
                <span>Strong (4)</span>
              </div>
            </div>

            {/* Complexity Slider */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Visualization Complexity
              </h3>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.complexity * 100}
                onChange={(e) => onFilterChange({ complexity: e.target.value / 100 })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Simple</span>
                <span>{Math.round(filters.complexity * 100)}%</span>
                <span>Detailed</span>
              </div>
            </div>

            {/* Omit Orphans Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="omit-orphans"
                checked={filters.omitOrphans}
                onChange={(e) => onFilterChange({ omitOrphans: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="omit-orphans" className="ml-2 text-sm text-gray-700">
                Hide unconnected nodes
              </label>
            </div>

            {/* Data Statistics */}
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Current View</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>Nodes: {data.nodes.length}</div>
                <div>Links: {data.links.length}</div>
                <div>Theories: {data.nodes.filter(n => n.node_class === 'Theory').length}</div>
                <div>Themes: {data.nodes.filter(n => n.node_class === 'Theme').length}</div>
                <div>Studies: {data.nodes.filter(n => n.node_class === 'Study').length}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'display' && (
          <DisplayOptions
            options={displayOptions}
            onChange={onDisplayOptionsChange}
          />
        )}

        {activeTab === 'export' && (
          <ExportOptions
            data={data}
            filters={filters}
            stageOrder={stageOrder}
            displayOptions={displayOptions}
          />
        )}
      </div>
    </div>
  )
}

export default ControlPanel