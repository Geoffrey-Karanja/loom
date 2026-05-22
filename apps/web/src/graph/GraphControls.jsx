import React, { useState } from 'react'
import GraphStats from './GraphStats.jsx'

const LAYOUTS = [
  { id: 'cose',        label: 'Force'  },
  { id: 'circle',      label: 'Circle' },
  { id: 'grid',        label: 'Grid'   },
  { id: 'breadthfirst',label: 'Tree'   },
  { id: 'concentric',  label: 'Radial' },
]

export default function GraphControls({ layout, setLayout, onFit, onResonate, nodeCount, edgeCount }) {
  const [showStats, setShowStats] = useState(false)

  return (
    <>
      <div style={{
        position: 'absolute', top: 16, left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10, padding: '6px 10px',
        zIndex: 10
      }}>
        {/* Stats */}
        <div style={{
          fontSize: 11, color: 'var(--dim)',
          fontFamily: 'JetBrains Mono, monospace',
          paddingRight: 10,
          borderRight: '1px solid var(--border)',
          cursor: 'pointer', transition: 'color 0.15s'
        }}
        onClick={() => setShowStats(true)}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--dim)'}
        title="View graph stats"
        >
          {nodeCount}n · {edgeCount}e ↗
        </div>

        {/* Layout switcher */}
        <div style={{ display: 'flex', gap: 2 }}>
          {LAYOUTS.map(l => (
            <button key={l.id} onClick={() => setLayout(l.id)} style={{
              padding: '3px 10px', borderRadius: 6, border: 'none',
              background: layout === l.id ? 'var(--accent)' : 'transparent',
              color: layout === l.id ? 'white' : 'var(--dim)',
              cursor: 'pointer', fontSize: 11,
              fontFamily: 'Syne, sans-serif', fontWeight: 500,
              transition: 'all 0.15s'
            }}>{l.label}</button>
          ))}
        </div>

        <div style={{ width: 1, height: 16, background: 'var(--border)' }} />

        <button onClick={onFit} style={{
          padding: '3px 10px', borderRadius: 6, border: 'none',
          background: 'transparent', color: 'var(--dim)',
          cursor: 'pointer', fontSize: 11,
          fontFamily: 'Syne, sans-serif', transition: 'color 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--dim)'}
        >⊙ Fit</button>

        <button onClick={() => setShowStats(true)} style={{
          padding: '3px 10px', borderRadius: 6, border: 'none',
          background: 'transparent', color: 'var(--dim)',
          cursor: 'pointer', fontSize: 11,
          fontFamily: 'Syne, sans-serif', transition: 'color 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--amber)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--dim)'}
        >◈ Stats</button>

        <button onClick={onResonate} style={{
          padding: '3px 12px', borderRadius: 6,
          border: '1px solid var(--accent)',
          background: 'rgba(124,106,247,0.1)',
          color: 'var(--glow)', cursor: 'pointer',
          fontSize: 11, fontFamily: 'Syne, sans-serif',
          fontWeight: 600, transition: 'all 0.15s'
        }}>✦ Resonate</button>
      </div>

      {showStats && <GraphStats onClose={() => setShowStats(false)} />}
    </>
  )
}
