import React from 'react'

function DisplayOptions({ options, onChange }) {
  const scalingModes = [
    { value: 'linear', label: 'Linear', description: 'Direct proportional scaling' },
    { value: 'logarithmic', label: 'Logarithmic', description: 'Better for mixed strengths' },
    { value: 'square-root', label: 'Square Root', description: 'Balanced visibility' }
  ]

  return (
    <div className="space-y-6">
      {/* Link Scaling Mode */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Link Width Scaling
        </h3>
        <div className="space-y-2">
          {scalingModes.map(mode => (
            <label
              key={mode.value}
              className="flex items-start cursor-pointer p-2 rounded hover:bg-gray-50"
            >
              <input
                type="radio"
                name="scalingMode"
                value={mode.value}
                checked={options.scalingMode === mode.value}
                onChange={(e) => onChange({ scalingMode: e.target.value })}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">{mode.label}</div>
                <div className="text-xs text-gray-500">{mode.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Collapse Groups Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label htmlFor="collapse-groups" className="text-sm font-medium text-gray-900">
            Collapse Categories
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Group nodes by category when chart is complex
          </p>
        </div>
        <button
          id="collapse-groups"
          onClick={() => onChange({ groupsCollapsed: !options.groupsCollapsed })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            options.groupsCollapsed ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              options.groupsCollapsed ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Show Labels Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label htmlFor="show-labels" className="text-sm font-medium text-gray-900">
            Show Node Labels
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Display text labels next to nodes
          </p>
        </div>
        <button
          id="show-labels"
          onClick={() => onChange({ showLabels: !options.showLabels })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            options.showLabels ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              options.showLabels ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Color Scheme Preview */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Color Legend
        </h3>
        <div className="flex gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-theory rounded mr-2"></div>
            <span className="text-sm text-gray-700">Theory</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-theme rounded mr-2"></div>
            <span className="text-sm text-gray-700">Theme</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-study rounded mr-2"></div>
            <span className="text-sm text-gray-700">Study</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DisplayOptions