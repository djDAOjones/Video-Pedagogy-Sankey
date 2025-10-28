import React from 'react'

function Tooltip({ data, position }) {
  if (!data) return null

  const { type, data: itemData } = data

  const getContent = () => {
    if (type === 'node') {
      return (
        <div className="space-y-1">
          <div className="font-semibold">{itemData.label_long}</div>
          <div className="text-xs text-gray-300">
            Type: {itemData.node_class}
          </div>
          {itemData.category && (
            <div className="text-xs text-gray-300">
              Category: {itemData.category}
            </div>
          )}
          {itemData.authors && (
            <div className="text-xs text-gray-300">
              Authors: {itemData.authors}
            </div>
          )}
          {itemData.year && (
            <div className="text-xs text-gray-300">
              Year: {itemData.year}
            </div>
          )}
          {itemData.description && (
            <div className="text-xs text-gray-300 mt-2 max-w-xs">
              {itemData.description}
            </div>
          )}
          <div className="text-xs text-gray-300 mt-1">
            Connections: {Math.round(itemData.totalWeight)}
          </div>
        </div>
      )
    } else if (type === 'link') {
      return (
        <div className="space-y-1">
          <div className="font-semibold text-sm">Connection</div>
          <div className="text-xs text-gray-300">
            From: {itemData.source.label_short || itemData.source.id}
          </div>
          <div className="text-xs text-gray-300">
            To: {itemData.target.label_short || itemData.target.id}
          </div>
          <div className="text-xs text-gray-300">
            Strength: {itemData.weight}/4
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div
      className="tooltip visible"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateY(-50%)'
      }}
    >
      {getContent()}
    </div>
  )
}

export default Tooltip