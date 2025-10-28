import React, { useState, useEffect } from 'react'

function StageSelector({ currentOrder, onChange }) {
  const [numStages, setNumStages] = useState(currentOrder.length)
  const [selectedPreset, setSelectedPreset] = useState(null)
  
  const presetOrders = {
    3: [
      { name: 'Theory → Theme → Study', order: ['Theory', 'Theme', 'Study'] },
      { name: 'Study → Theme → Theory', order: ['Study', 'Theme', 'Theory'] },
      { name: 'Theme → Theory → Study', order: ['Theme', 'Theory', 'Study'] },
      { name: 'Theory → Study → Theme', order: ['Theory', 'Study', 'Theme'] },
      { name: 'Theme → Study → Theory', order: ['Theme', 'Study', 'Theory'] },
      { name: 'Study → Theory → Theme', order: ['Study', 'Theory', 'Theme'] }
    ],
    2: [
      { name: 'Theory → Theme', order: ['Theory', 'Theme'] },
      { name: 'Theory → Study', order: ['Theory', 'Study'] },
      { name: 'Theme → Study', order: ['Theme', 'Study'] },
      { name: 'Theme → Theory', order: ['Theme', 'Theory'] },
      { name: 'Study → Theory', order: ['Study', 'Theory'] },
      { name: 'Study → Theme', order: ['Study', 'Theme'] }
    ]
  }

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.name)
    onChange([...preset.order]) // Create new array to ensure React detects change
  }
  
  const handleNumStagesChange = (num) => {
    setNumStages(num)
    setSelectedPreset(null)
    // Set default preset for the new number of stages
    const defaultPreset = presetOrders[num][0]
    onChange(defaultPreset.order)
    setSelectedPreset(defaultPreset.name)
  }

  return (
    <div className="space-y-4">
      {/* Number of Stages Toggle */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Stages:</span>
        <div className="flex gap-2">
          <button
            onClick={() => handleNumStagesChange(2)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              numStages === 2
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            2 Stages
          </button>
          <button
            onClick={() => handleNumStagesChange(3)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              numStages === 3
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            3 Stages
          </button>
        </div>
      </div>

      {/* Flow Direction Presets */}
      <div>
        <p className="text-xs text-gray-600 mb-2">Flow direction:</p>
        <div className="grid grid-cols-2 gap-2">
          {presetOrders[numStages].map(preset => (
            <button
              key={preset.name}
              onClick={() => handlePresetSelect(preset)}
              className={`px-3 py-2 text-xs rounded-lg transition-all ${
                selectedPreset === preset.name
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
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