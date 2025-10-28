import React, { useState } from 'react'

function StageSelector({ currentOrder, onChange }) {
  const [localOrder, setLocalOrder] = useState(currentOrder)
  const [numStages, setNumStages] = useState(currentOrder.length)
  
  const availableStages = ['Theory', 'Theme', 'Study']
  
  const presetOrders = {
    3: [
      { name: 'Theory → Theme → Study', order: ['Theory', 'Theme', 'Study'] },
      { name: 'Study → Theme → Theory', order: ['Study', 'Theme', 'Theory'] },
      { name: 'Theme → Theory → Study', order: ['Theme', 'Theory', 'Study'] }
    ],
    2: [
      { name: 'Theory → Theme', order: ['Theory', 'Theme'] },
      { name: 'Theory → Study', order: ['Theory', 'Study'] },
      { name: 'Theme → Study', order: ['Theme', 'Study'] },
      { name: 'Study → Theory', order: ['Study', 'Theory'] }
    ]
  }

  const handleStageChange = (position, newStage) => {
    const newOrder = [...localOrder]
    
    // Remove the stage if it already exists elsewhere within current stages
    const currentStages = newOrder.slice(0, numStages)
    const existingIndex = currentStages.indexOf(newStage)
    if (existingIndex !== -1 && existingIndex !== position) {
      // Find a stage not in current order to replace it with
      const usedStages = new Set(currentStages)
      usedStages.delete(currentStages[existingIndex])
      usedStages.add(newStage)
      const unusedStage = availableStages.find(s => !usedStages.has(s))
      if (unusedStage) {
        newOrder[existingIndex] = unusedStage
      }
    }
    
    newOrder[position] = newStage
    setLocalOrder(newOrder)
    onChange(newOrder.slice(0, numStages))
  }
  
  const handleNumStagesChange = (num) => {
    setNumStages(num)
    const newOrder = num === 2 
      ? ['Theory', 'Theme'] 
      : ['Theory', 'Theme', 'Study']
    setLocalOrder(newOrder)
    onChange(newOrder)
  }

  const handlePresetSelect = (preset) => {
    const fullOrder = [...preset.order]
    // Pad with unused stages if needed
    while (fullOrder.length < 3) {
      const unusedStage = availableStages.find(s => !fullOrder.includes(s))
      if (unusedStage) fullOrder.push(unusedStage)
    }
    setLocalOrder(fullOrder)
    setNumStages(preset.order.length)
    onChange(preset.order)
  }

  return (
    <div className="space-y-4">
      {/* Number of Stages Toggle */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Number of stages:</span>
        <div className="flex gap-2">
          <button
            onClick={() => handleNumStagesChange(2)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              numStages === 2
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            2 Stages
          </button>
          <button
            onClick={() => handleNumStagesChange(3)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              numStages === 3
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            3 Stages
          </button>
        </div>
      </div>

      {/* Custom Order Selectors */}
      <div className="flex items-center gap-2">
        {localOrder.slice(0, numStages).map((stage, index) => (
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
          {presetOrders[numStages].map(preset => (
            <button
              key={preset.name}
              onClick={() => handlePresetSelect(preset)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                JSON.stringify(preset.order) === JSON.stringify(localOrder.slice(0, numStages))
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