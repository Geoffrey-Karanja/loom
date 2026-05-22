import React, { useState } from 'react'
import { useLoomStore }  from '../store/index.js'
import PresenceAvatars   from '../collab/PresenceAvatars.jsx'
import ProtocolLauncher  from '../protocols/ProtocolLauncher.jsx'
import InboxAlchemy      from '../ai/InboxAlchemy.jsx'
import TemplatePicker    from '../protocols/TemplatePicker.jsx'
import ExportPanel       from './ExportPanel.jsx'
import ThemeToggle       from './ThemeToggle.jsx'
import ReminderManager   from './ReminderManager.jsx'

const views = [
  { id: 'canvas',   label: '⬡ Canvas' },
  { id: 'graph',    label: '◈ Graph' },
  { id: 'timeline', label: '⊶ Timeline' },
  { id: 'map',      label: '⊕ Map' },
]

export default function TopBar() {
  const { activeView, setActiveView, weaverLoading, getInsights, autoLink, nodes } = useLoomStore()
  const [showProtocols,  setShowProtocols]  = useState(false)
  const [showInbox,      setShowInbox]      = useState(false)
  const [showTemplates,  setShowTemplates]  = useState(false)
  const [showExport,     setShowExport]     = useState(false)
  const [showReminders,  setShowReminders]  = useState(false)

  const triggerSearch = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
  }

  return (
    <>
      <header style={{
        height: 48,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 6,
        flexShrink: 0, zIndex: 100
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 700,
          fontSize: 18, color: 'var(--accent)',
          letterSpacing: '-0.02em', marginRight: 12,
          display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0
        }}>
          <span style={{ fontSize: 20 }}>⌬</span> Loom
        </div>

        {/* Views */}
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          {views.map(v => (
            <button key={v.id} onClick={() => setActiveView(v.id)} style={{
              padding: '4px 10px', borderRadius: 6, border: 'none',
              background: activeView === v.id ? 'var(--muted)' : 'transparent',
              color: activeView === v.id ? 'var(--text)' : 'var(--dim)',
              cursor: 'pointer', fontSize: 12,
              fontFamily: 'Syne, sans-serif',
              fontWeight: activeView === v.id ? 600 : 400,
              transition: 'all 0.15s', whiteSpace: 'nowrap'
            }}>{v.label}</button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Search */}
        <button onClick={triggerSearch} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 12px', background: 'var(--muted)',
          border: '1px solid var(--border)', borderRadius: 8,
          cursor: 'pointer', color: 'var(--dim)', fontSize: 12,
          fontFamily: 'Syne, sans-serif', transition: 'all 0.15s',
          minWidth: 150, flexShrink: 0
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--dim)' }}
        >
          <span>⌕</span>
          <span style={{ flex: 1, textAlign: 'left' }}>Search...</span>
          <kbd style={{
            fontSize: 10, background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: 4,
            padding: '1px 5px', fontFamily: 'JetBrains Mono, monospace'
          }}>⌃K</kbd>
        </button>

        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 2px' }} />
        <PresenceAvatars roomId="loom-workspace" />
        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 2px' }} />

        <span style={{
          fontSize: 11, color: 'var(--dim)',
          fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap'
        }}>{nodes.length} nodes</span>

        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 2px' }} />

        {/* Action buttons */}
        {[
          { label: '⊹ Inbox',     onClick: () => setShowInbox(true),     color: 'var(--teal)' },
          { label: '⊞ Templates', onClick: () => setShowTemplates(true), color: 'var(--amber)' },
          { label: '⌬ Protocols', onClick: () => setShowProtocols(true), color: 'var(--amber)' },
          { label: '🔔 Remind',   onClick: () => setShowReminders(true), color: 'var(--coral)' },
          { label: '⌀ AutoLink',  onClick: autoLink,                     color: 'var(--teal)', disabled: weaverLoading },
          { label: '↓ Export',    onClick: () => setShowExport(true),    color: 'var(--teal)' },
        ].map(({ label, onClick, color, disabled }) => (
          <button key={label} onClick={onClick} disabled={disabled} style={{
            padding: '5px 10px', borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--dim)',
            cursor: disabled ? 'wait' : 'pointer',
            fontSize: 11, fontFamily: 'Syne, sans-serif',
            fontWeight: 600, transition: 'all 0.15s', whiteSpace: 'nowrap'
          }}
          onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color }}}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--dim)' }}
          >{label}</button>
        ))}

        {/* Resonate */}
        <button onClick={getInsights} disabled={weaverLoading} style={{
          padding: '5px 12px', borderRadius: 6,
          border: '1px solid var(--accent)',
          background: weaverLoading ? 'var(--muted)' : 'rgba(124,106,247,0.1)',
          color: 'var(--glow)', cursor: weaverLoading ? 'wait' : 'pointer',
          fontSize: 11, fontFamily: 'Syne, sans-serif', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 5,
          transition: 'all 0.15s', whiteSpace: 'nowrap', flexShrink: 0
        }}>
          <span>{weaverLoading ? '⟳' : '✦'}</span>
          {weaverLoading ? 'Weaving...' : 'Resonate'}
        </button>

        <ThemeToggle />
      </header>

      {showProtocols && <ProtocolLauncher onClose={() => setShowProtocols(false)} />}
      {showInbox     && <InboxAlchemy    onClose={() => setShowInbox(false)} />}
      {showTemplates && <TemplatePicker  onClose={() => setShowTemplates(false)} />}
      {showExport    && <ExportPanel     onClose={() => setShowExport(false)} />}
      {showReminders && <ReminderManager onClose={() => setShowReminders(false)} />}
    </>
  )
}
