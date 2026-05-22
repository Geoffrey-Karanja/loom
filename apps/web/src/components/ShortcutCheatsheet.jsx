import React, { useEffect } from 'react'

const SECTIONS = [
  {
    title: 'Navigation',
    color: 'var(--accent)',
    shortcuts: [
      { keys: ['1'], description: 'Canvas view' },
      { keys: ['2'], description: 'Graph view' },
      { keys: ['3'], description: 'Timeline view' },
      { keys: ['4'], description: 'Map view' },
      { keys: ['⌃', 'K'], description: 'Open search' },
      { keys: ['?'], description: 'This cheatsheet' },
    ]
  },
  {
    title: 'Canvas',
    color: 'var(--teal)',
    shortcuts: [
      { keys: ['Double-click'], description: 'Create new node' },
      { keys: ['Alt', 'Drag'], description: 'Pan canvas' },
      { keys: ['Scroll'], description: 'Zoom in / out' },
      { keys: ['Right-click node'], description: 'Context menu' },
      { keys: ['⌀ button'], description: 'Connect mode' },
      { keys: ['Drag node'], description: 'Move node' },
    ]
  },
  {
    title: 'Nodes',
    color: 'var(--amber)',
    shortcuts: [
      { keys: ['Click title'], description: 'Edit title' },
      { keys: ['Type in body'], description: 'Edit content' },
      { keys: ['✕ button'], description: 'Delete node' },
      { keys: ['Right-click', '→ Duplicate'], description: 'Duplicate node' },
      { keys: ['Right-click', '→ Ask Weaver'], description: 'Ask AI about node' },
    ]
  },
  {
    title: 'AI Weaver',
    color: 'var(--glow)',
    shortcuts: [
      { keys: ['✦ orb'], description: 'Open Weaver chat' },
      { keys: ['✦ Resonate'], description: 'Find patterns across nodes' },
      { keys: ['⌀ AutoLink'], description: 'AI draws connections' },
      { keys: ['⊹ Inbox'], description: 'Parse raw text into nodes' },
      { keys: ['3s after typing'], description: 'Auto-analyze node content' },
    ]
  },
  {
    title: 'Workspace',
    color: 'var(--coral)',
    shortcuts: [
      { keys: ['⊞ Templates'], description: 'Create from template' },
      { keys: ['⌬ Protocols'], description: 'Launch AI playbook' },
      { keys: ['↓ Export'], description: 'Export JSON / MD / CSV' },
      { keys: ['◈ Stats'], description: 'Graph intelligence dashboard' },
      { keys: ['ESC'], description: 'Close any panel' },
    ]
  }
]

export default function ShortcutCheatsheet({ onClose }) {

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div className="fade-in" onClick={e => e.stopPropagation()} style={{
        width: 680, maxHeight: '85vh',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column'
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              fontSize: 17, fontWeight: 700, color: 'var(--text)',
              fontFamily: 'Syne, sans-serif', marginBottom: 4,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <span style={{ color: 'var(--accent)' }}>⌨</span> Keyboard Shortcuts
            </div>
            <div style={{ fontSize: 12, color: 'var(--dim)' }}>
              Everything you can do in Loom, at a glance.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <kbd style={{
              fontSize: 11, color: 'var(--dim)',
              background: 'var(--muted)',
              border: '1px solid var(--border)',
              borderRadius: 5, padding: '3px 8px',
              fontFamily: 'JetBrains Mono, monospace'
            }}>? to toggle</kbd>
            <button onClick={onClose} style={{
              background: 'none', border: 'none',
              color: 'var(--dim)', cursor: 'pointer',
              fontSize: 18, padding: '2px 6px',
              transition: 'color 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--dim)'}
            >✕</button>
          </div>
        </div>

        {/* Grid */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: 20,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          alignContent: 'start'
        }}>
          {SECTIONS.map(section => (
            <div key={section.title} style={{
              background: 'var(--muted)',
              border: '1px solid var(--border)',
              borderRadius: 10, overflow: 'hidden'
            }}>
              {/* Section header */}
              <div style={{
                padding: '10px 14px',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 8,
                background: `${section.color}0a`
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: section.color, flexShrink: 0
                }} />
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: section.color,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontFamily: 'Syne, sans-serif'
                }}>{section.title}</span>
              </div>

              {/* Shortcuts */}
              <div style={{ padding: '6px 0' }}>
                {section.shortcuts.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 14px',
                    gap: 12
                  }}>
                    <span style={{
                      fontSize: 12, color: 'var(--dim)',
                      flex: 1, lineHeight: 1.4
                    }}>{s.description}</span>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      {s.keys.map((k, j) => (
                        <kbd key={j} style={{
                          fontSize: 10,
                          color: 'var(--text)',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderBottom: '2px solid var(--muted)',
                          borderRadius: 4,
                          padding: '2px 6px',
                          fontFamily: 'JetBrains Mono, monospace',
                          whiteSpace: 'nowrap'
                        }}>{k}</kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 24px',
          borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontSize: 11, color: 'var(--dim)' }}>
            Press <kbd style={{
              fontSize: 10, background: 'var(--muted)',
              border: '1px solid var(--border)', borderRadius: 4,
              padding: '1px 5px', fontFamily: 'JetBrains Mono, monospace',
              color: 'var(--dim)'
            }}>?</kbd> anytime to open this
          </span>
          <button onClick={onClose} style={{
            padding: '6px 16px',
            background: 'var(--muted)',
            border: '1px solid var(--border)',
            borderRadius: 6, color: 'var(--dim)',
            cursor: 'pointer', fontSize: 12,
            fontFamily: 'Syne, sans-serif'
          }}>Got it</button>
        </div>
      </div>
    </div>
  )
}
