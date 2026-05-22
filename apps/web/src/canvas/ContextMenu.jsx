import React, { useEffect, useRef } from 'react'

export default function ContextMenu({ x, y, node, onClose, onDelete, onDuplicate, onOpenChat }) {

  const menuRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (!menuRef.current?.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const items = [
    { icon: '⊹', label: 'Ask Weaver about this', action: onOpenChat, color: 'var(--accent)' },
    { icon: '⧉', label: 'Duplicate node', action: onDuplicate, color: 'var(--text)' },
    { divider: true },
    { icon: '✕', label: 'Delete node', action: onDelete, color: 'var(--coral)' },
  ]

  return (
    <div ref={menuRef} className="fade-in" style={{
      position: 'fixed',
      left: x, top: y,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: 6,
      zIndex: 9999,
      minWidth: 200,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
    }}>
      {/* Node label */}
      <div style={{
        padding: '6px 10px 8px',
        fontSize: 11, color: 'var(--dim)',
        fontFamily: 'JetBrains Mono, monospace',
        borderBottom: '1px solid var(--border)',
        marginBottom: 4,
        whiteSpace: 'nowrap', overflow: 'hidden',
        textOverflow: 'ellipsis', maxWidth: 180
      }}>
        {node.title}
      </div>

      {items.map((item, i) => {
        if (item.divider) return (
          <div key={i} style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
        )
        return (
          <button key={i} onClick={() => { item.action(); onClose() }} style={{
            width: '100%', padding: '7px 10px',
            background: 'none', border: 'none',
            borderRadius: 6, color: item.color || 'var(--text)',
            cursor: 'pointer', fontSize: 12,
            fontFamily: 'Syne, sans-serif',
            display: 'flex', alignItems: 'center', gap: 8,
            textAlign: 'left', transition: 'background 0.1s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <span style={{ fontSize: 14, width: 16 }}>{item.icon}</span>
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
