import React, { useState } from 'react'
import { useLoomStore } from '../store/index.js'
import { getAllProtocols } from './protocolEngine.js'

export default function ProtocolLauncher({ onClose }) {
  const { createNode, analyzeText } = useLoomStore()
  const [launching, setLaunching] = useState(null)
  const [done, setDone] = useState(false)
  const protocols = getAllProtocols()

  const handleLaunch = async (protocol) => {
    setLaunching(protocol.id)

    const spacing = 360
    const startX = 100
    const startY = 100

    for (let i = 0; i < protocol.steps.length; i++) {
      const step = protocol.steps[i]
      const node = await createNode({
        type: step.type,
        title: `[${protocol.name}] ${step.label}`,
        content: step.content,
        position: {
          x: startX + (i % 3) * spacing,
          y: startY + Math.floor(i / 3) * 300
        }
      })
      // Let the Weaver analyze each node
      if (step.content.length > 20) {
        analyzeText(step.content, node.id)
      }
      // Small delay between node creation
      await new Promise(r => setTimeout(r, 200))
    }

    setLaunching(null)
    setDone(true)
    setTimeout(onClose, 1500)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div className="fade-in" onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16, padding: 28,
        width: 560, maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 18, fontWeight: 700, color: 'var(--text)',
            fontFamily: 'Syne, sans-serif', marginBottom: 6,
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span style={{ color: 'var(--accent)' }}>⌬</span> Protocol Engine
          </div>
          <div style={{ fontSize: 12, color: 'var(--dim)', lineHeight: 1.6 }}>
            Launch an adaptive playbook. Loom creates all nodes and activates the Weaver on each one.
          </div>
        </div>

        {done && (
          <div className="fade-in" style={{
            padding: 16, background: 'rgba(45,212,191,0.1)',
            border: '1px solid var(--teal)', borderRadius: 8,
            color: 'var(--teal)', fontSize: 13, fontWeight: 600,
            textAlign: 'center', marginBottom: 16
          }}>
            ✓ Protocol launched — check your canvas
          </div>
        )}

        {/* Protocol grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {protocols.map(protocol => (
            <div key={protocol.id} style={{
              padding: 16, background: 'var(--muted)',
              border: '1px solid var(--border)',
              borderRadius: 10, cursor: 'pointer',
              transition: 'all 0.2s',
              opacity: launching && launching !== protocol.id ? 0.5 : 1
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.background = 'rgba(124,106,247,0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.background = 'var(--muted)'
            }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>{protocol.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                {protocol.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--dim)', lineHeight: 1.5, marginBottom: 12 }}>
                {protocol.description}
              </div>
              <div style={{ fontSize: 10, color: 'var(--dim)', marginBottom: 12, fontFamily: 'JetBrains Mono, monospace' }}>
                {protocol.steps.length} nodes · {protocol.steps.map(s => s.type).join(', ')}
              </div>
              <button
                onClick={() => handleLaunch(protocol)}
                disabled={!!launching}
                style={{
                  width: '100%', padding: '7px 0',
                  background: launching === protocol.id ? 'var(--accent)' : 'rgba(124,106,247,0.1)',
                  border: '1px solid var(--accent)',
                  borderRadius: 6, color: 'var(--glow)',
                  cursor: launching ? 'wait' : 'pointer',
                  fontSize: 12, fontFamily: 'Syne, sans-serif', fontWeight: 600
                }}
              >
                {launching === protocol.id ? '⟳ Launching...' : '→ Launch'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
