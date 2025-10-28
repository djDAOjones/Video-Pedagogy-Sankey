import React, { useState } from 'react'

function StageSelector({ currentOrder, onChange }) {
  const [localOrder, setLocalOrder] = useState(currentOrder)
  
  const availableStages = ['Theory', 'Theme', 'Study']
  
  const presetOrders = [
    { name: 'Default', order: ['Theory', 'Theme', 'Study'] },
    { name: 'Reverse', order: ['Study', 'Theme', 'Theory'] },
    { name: 'Theme-Centered', order: ['Theme', 'Theory', 'Study'] },
    { name: 'Study-First', order: ['Study', 'Theory', 'Theme'] }
  ]

  const handleStageChange = (position, newStage) => {
    const newOrder = [...localOrder]
    
    // Remove the stage if it already exists elsewhere
    const existingIndex = newOrder.indexOf(newStage)
    if (existingIndex !== -1) {
      newOrder[existingIndex] = newOrder[position]
    }
    
    newOrder[position] = newStage
    setLocalOrder(newOrder)
    onChange(newOrder)
  }

  const handlePresetSelect = (preset) => {
    setLocalOrder(preset.order)
    onChange(preset.order)
  }

  return (
    <div className="space-y-4">
      {/* Custom Order Selectors */}
      <div className="flex items-center gap-2">
        {localOrder.map((stage, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="text-gray-400 font-bold">→</span>
            )}
            <select
              value={stage}
              onChange={(e) => handleStageChange(index, e.target.value)}
              className="control-input py-1 px-2 text-sm"
            >
              {availableStages.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </React.Fragment>
        ))}
      </div>

      {/* Preset Buttons */}
      <div>
        <p className="text-xs text-gray-600 mb-2">Quick presets:</p>
        <div className="flex flex-wrap gap-2">
          {presetOrders.map(preset => (
            <button
              key={preset.name}
              onClick={() => handlePresetSelect(preset)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                JSON.stringify(preset.order) === JSON.stringify(localOrder)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StageSelector