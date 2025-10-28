import React, { useEffect, useRef } from 'react'

function RangeSlider({ min, max, value, onChange }) {
  const sliderRef = useRef(null)
  const [minValue, maxValue] = value

  useEffect(() => {
    // Update visual track fill
    if (sliderRef.current) {
      const percent1 = ((minValue - min) / (max - min)) * 100
      const percent2 = ((maxValue - min) / (max - min)) * 100
      sliderRef.current.style.background = `linear-gradient(to right, 
        #E5E7EB 0%, 
        #E5E7EB ${percent1}%, 
        #3B82F6 ${percent1}%, 
        #3B82F6 ${percent2}%, 
        #E5E7EB ${percent2}%, 
        #E5E7EB 100%)`
    }
  }, [minValue, maxValue, min, max])

  const handleMinChange = (e) => {
    const newMin = Math.min(Number(e.target.value), maxValue)
    onChange([newMin, maxValue])
  }

  const handleMaxChange = (e) => {
    const newMax = Math.max(Number(e.target.value), minValue)
    onChange([minValue, newMax])
  }

  return (
    <div className="relative">
      <div ref={sliderRef} className="h-2 bg-gray-200 rounded-lg relative">
        {/* Min slider */}
        <input
          type="range"
          min={min}
          max={max}
          value={minValue}
          onChange={handleMinChange}
          className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none 
                     [&::-webkit-slider-thumb]:appearance-none 
                     [&::-webkit-slider-thumb]:h-4 
                     [&::-webkit-slider-thumb]:w-4 
                     [&::-webkit-slider-thumb]:rounded-full 
                     [&::-webkit-slider-thumb]:bg-blue-600 
                     [&::-webkit-slider-thumb]:pointer-events-auto
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:shadow-md"
          style={{ zIndex: minValue === max ? 2 : 1 }}
        />
        
        {/* Max slider */}
        <input
          type="range"
          min={min}
          max={max}
          value={maxValue}
          onChange={handleMaxChange}
          className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none 
                     [&::-webkit-slider-thumb]:appearance-none 
                     [&::-webkit-slider-thumb]:h-4 
                     [&::-webkit-slider-thumb]:w-4 
                     [&::-webkit-slider-thumb]:rounded-full 
                     [&::-webkit-slider-thumb]:bg-blue-600 
                     [&::-webkit-slider-thumb]:pointer-events-auto
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:shadow-md"
          style={{ zIndex: 1 }}
        />
      </div>
      
      {/* Value display */}
      <div className="flex justify-between mt-2">
        <span className="text-sm bg-gray-100 px-2 py-1 rounded">
          Min: {minValue}
        </span>
        <span className="text-sm bg-gray-100 px-2 py-1 rounded">
          Max: {maxValue}
        </span>
      </div>
    </div>
  )
}

export default RangeSlider