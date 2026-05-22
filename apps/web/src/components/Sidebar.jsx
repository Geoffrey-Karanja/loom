import React, { useState } from 'react'
import { useLoomStore } from '../store/index.js'

const NODE_TYPES = [
  { type: 'document', icon: '▤', label: 'Document' },
  { type: 'task',     icon: '◻', label: 'Task' },
  { type: 'idea',     icon: '◈', label: 'Idea' },
  { type: 'data',     icon: '⊞', label: 'Database' },
]

export default function Sidebar() {
  const { nodes, createNode, setSelectedNode, setActiveView, selectedNode } = useLoomStore()
  const [collapsed, setCollapsed] = useState(false)

  const handleCreate = async (type) => {
    const node = await createNode({
      type,
      title: `New ${type}`,
      content: '',
      position: {
        x: 120 + Math.random() * 300,
        y: 80 + Math.random() * 200
      }
    })
    setSelectedNode(node)
  }

  if (collapsed) return (
    <div style={{
      width: 36, background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: 8
    }}>
      <button onClick={() => setCollapsed(false)} style={{
        background: 'none', border: 'none', color: 'var(--dim)',
        cursor: 'pointer', fontSize: 16, padding: 8
      }}>›</button>
    </div>
  )

  return (
    <aside style={{
      width: 220,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Nodes
        </span>
        <button onClick={() => setCollapsed(true)} style={{
          background: 'none', border: 'none', color: 'var(--dim)',
          cursor: 'pointer', fontSize: 14
        }}>‹</button>
      </div>

      {/* Create buttons */}
      <div style={{ padding: '10px 10px 6px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {NODE_TYPES.map(({ type, icon, label }) => (
          <button key={type} onClick={() => handleCreate(type)} style={{
            flex: '1 1 calc(50% - 4px)',
            padding: '6px 4px',
            background: 'var(--muted)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--dim)',
            cursor: 'pointer',
            fontSize: 11,
            fontFamily: 'Syne, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--dim)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <span>{icon}</span> {label}
          </button>
        ))}
      </div>

      {/* Node list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
        {nodes.length === 0 && (
          <div style={{ color: 'var(--dim)', fontSize: 12, textAlign: 'center', marginTop: 24, lineHeight: 1.6 }}>
            No nodes yet.<br/>Create one above.
          </div>
        )}
        {nodes.map(node => (
          <div key={node.id}
            onClick={() => { setSelectedNode(node); setActiveView('canvas') }}
            style={{
              padding: '7px 8px',
              borderRadius: 6,
              cursor: 'pointer',
              background: selectedNode?.id === node.id ? 'var(--muted)' : 'transparent',
              border: '1px solid transparent',
              marginBottom: 2,
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { if (selectedNode?.id !== node.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
            onMouseLeave={e => { if (selectedNode?.id !== node.id) e.currentTarget.style.background = 'transparent' }}
          >
            <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {node.title || 'Untitled'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2 }}>
              {node.type} · {node.objects?.length || 0} objects
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
