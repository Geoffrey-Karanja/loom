import React from 'react'

export default function EdgeLayer({ nodes, edges }) {
  if (!edges?.length) return null

  const getCenter = (node) => ({
    x: (node.position?.x || 0) + (node.size?.w || 320) / 2,
    y: (node.position?.y || 0) + (node.size?.h || 200) / 2
  })

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        overflow: 'visible'
      }}
    >
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6"
          refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6"
            fill="rgba(124,106,247,0.5)" />
        </marker>
      </defs>
      {edges.map(edge => {
        const source = nodes.find(n => n.id === edge.source)
        const target = nodes.find(n => n.id === edge.target)
        if (!source || !target) return null

        const s = getCenter(source)
        const t = getCenter(target)

        // Curved bezier
        const mx = (s.x + t.x) / 2
        const my = (s.y + t.y) / 2 - 60

        return (
          <g key={edge.id}>
            <path
              d={`M ${s.x} ${s.y} Q ${mx} ${my} ${t.x} ${t.y}`}
              fill="none"
              stroke="rgba(124,106,247,0.25)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              markerEnd="url(#arrowhead)"
            />
            {edge.label && (
              <text
                x={mx} y={my - 8}
                fill="rgba(124,106,247,0.6)"
                fontSize="10"
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
              >
                {edge.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
