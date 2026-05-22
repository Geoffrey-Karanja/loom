import React, { useEffect, useRef, useState } from 'react'
import { useLoomStore } from '../store/index.js'

const TYPE_COLORS = {
  document: '#7c6af7',
  task:     '#2dd4bf',
  idea:     '#fbbf24',
  data:     '#f87171',
}

const TYPE_ICONS = {
  document: '▤',
  task:     '◻',
  idea:     '◈',
  data:     '⊞',
}

export default function TimelineView() {
  const { nodes, setSelectedNode, setActiveView } = useLoomStore()
  const [zoom, setZoom] = useState(1)
  const [filter, setFilter] = useState('all')
  const [hoveredNode, setHoveredNode] = useState(null)

  const sorted = [...nodes]
    .filter(n => filter === 'all' || n.type === filter)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  const handleNodeClick = (node) => {
    setSelectedNode(node)
    setActiveView('canvas')
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const formatRelative = (iso) => {
    const diff = Date.now() - new Date(iso)
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {/* Controls */}
      <div style={{
        padding: '12px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <span style={{ color: 'var(--dim)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
          ⊶ Timeline
        </span>

        <div style={{ flex: 1 }} />

        {/* Filter */}
        <div style={{ display: 'flex', gap: 4 }}>
          {['all', 'document', 'task', 'idea', 'data'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '3px 10px', borderRadius: 6, border: 'none',
              background: filter === f ? (TYPE_COLORS[f] || 'var(--accent)') : 'var(--muted)',
              color: filter === f ? 'white' : 'var(--dim)',
              cursor: 'pointer', fontSize: 11,
              fontFamily: 'Syne, sans-serif', fontWeight: 500,
              transition: 'all 0.15s'
            }}>{f}</button>
          ))}
        </div>

        {/* Zoom */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} style={{
            width: 24, height: 24, background: 'var(--muted)', border: 'none',
            borderRadius: 4, color: 'var(--text)', cursor: 'pointer', fontSize: 14
          }}>−</button>
          <span style={{ fontSize: 11, color: 'var(--dim)', fontFamily: 'JetBrains Mono, monospace', minWidth: 36, textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} style={{
            width: 24, height: 24, background: 'var(--muted)', border: 'none',
            borderRadius: 4, color: 'var(--text)', cursor: 'pointer', fontSize: 14
          }}>+</button>
        </div>

        <span style={{ color: 'var(--dim)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
          {sorted.length} nodes
        </span>
      </div>

      {/* Timeline body */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '32px 0' }}>
        {sorted.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: 80, color: 'var(--dim)', fontSize: 14 }}>
            <div style={{ fontSize: 40, opacity: 0.15, marginBottom: 12 }}>⊶</div>
            No nodes yet — create some on the Canvas
          </div>
        )}

        {/* Central axis */}
        <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto', padding: '0 48px' }}>

          {/* Vertical line */}
          {sorted.length > 0 && (
            <div style={{
              position: 'absolute', left: '50%', top: 0, bottom: 0,
              width: 1, background: 'linear-gradient(to bottom, transparent, var(--border) 5%, var(--border) 95%, transparent)',
              transform: 'translateX(-50%)'
            }} />
          )}

          {sorted.map((node, i) => {
            const isLeft = i % 2 === 0
            const color = TYPE_COLORS[node.type] || 'var(--accent)'

            return (
              <div key={node.id} style={{
                display: 'flex',
                justifyContent: isLeft ? 'flex-end' : 'flex-start',
                marginBottom: `${48 * zoom}px`,
                position: 'relative'
              }}>
                {/* Dot on axis */}
                <div style={{
                  position: 'absolute', left: '50%',
                  top: 20, transform: 'translateX(-50%)',
                  width: 10, height: 10, borderRadius: '50%',
                  background: color,
                  border: `2px solid var(--bg)`,
                  boxShadow: `0 0 8px ${color}`,
                  zIndex: 2, cursor: 'pointer'
                }} onClick={() => handleNodeClick(node)} />

                {/* Connector line */}
                <div style={{
                  position: 'absolute', left: '50%', top: 24,
                  width: 32, height: 1,
                  background: color, opacity: 0.4,
                  transform: isLeft ? 'translateX(-100%)' : 'none'
                }} />

                {/* Card */}
                <div
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{
                    width: `calc(50% - 48px)`,
                    background: 'var(--surface)',
                    border: `1px solid ${hoveredNode === node.id ? color : 'var(--border)'}`,
                    borderRadius: 10,
                    padding: 14,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: hoveredNode === node.id ? `0 4px 20px ${color}22` : 'none',
                    marginLeft: isLeft ? 0 : 48,
                    marginRight: isLeft ? 48 : 0,
                  }}
                >
                  {/* Card header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ color, fontSize: 14 }}>{TYPE_ICONS[node.type] || '▤'}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', flex: 1 }}>
                      {node.title}
                    </span>
                    <span style={{
                      fontSize: 9, color, textTransform: 'uppercase',
                      letterSpacing: '0.06em', fontFamily: 'JetBrains Mono, monospace'
                    }}>{node.type}</span>
                  </div>

                  {/* Content preview */}
                  {node.content && (
                    <div style={{
                      fontSize: 11, color: 'var(--dim)', lineHeight: 1.6,
                      marginBottom: 8, overflow: 'hidden',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      maxHeight: 40
                    }}
                    dangerouslySetInnerHTML={{
                      __html: node.content.replace(/<[^>]*>/g, ' ').slice(0, 120)
                    }}
                    />
                  )}

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: 10, color: 'var(--dim)',
                      fontFamily: 'JetBrains Mono, monospace'
                    }}>{formatDate(node.createdAt)}</span>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {node.objects?.length > 0 && (
                        <span style={{
                          fontSize: 10, color: 'var(--accent)',
                          fontFamily: 'JetBrains Mono, monospace'
                        }}>✦ {node.objects.length}</span>
                      )}
                      <span style={{
                        fontSize: 10, color: 'var(--dim)',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}>{formatRelative(node.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
