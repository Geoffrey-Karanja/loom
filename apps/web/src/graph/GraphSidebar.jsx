import React from 'react'
import { NODE_COLORS } from './graphUtils.js'

const INSIGHT_COLORS = {
  connection:  'var(--teal)',
  pattern:     'var(--accent)',
  risk:        'var(--coral)',
  opportunity: 'var(--amber)',
}

export default function GraphSidebar({ selectedEl, nodes, edges, insights, onJumpToCanvas }) {
  const hasContent = selectedEl || insights?.length > 0

  if (!hasContent) return (
    <div style={{
      width: 220, borderLeft: '1px solid var(--border)',
      background: 'var(--surface)', padding: 16,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 8
    }}>
      <div style={{ fontSize: 24, opacity: 0.15 }}>◈</div>
      <div style={{ color: 'var(--dim)', fontSize: 11, textAlign: 'center', lineHeight: 1.6 }}>
        Click a node to inspect.<br/>Hit Resonate for insights.
      </div>
    </div>
  )

  const fullNode = selectedEl?.type === 'node'
    ? nodes.find(n => n.id === selectedEl.data.id)
    : null

  const connectedEdges = selectedEl?.type === 'node'
    ? edges.filter(e => e.source === selectedEl.data.id || e.target === selectedEl.data.id)
    : []

  return (
    <div style={{
      width: 240,
      borderLeft: '1px solid var(--border)',
      background: 'var(--surface)',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto'
    }}>

      {/* Selected node panel */}
      {selectedEl?.type === 'node' && (
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: NODE_COLORS[selectedEl.data.type] || 'var(--accent)',
              flexShrink: 0
            }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
              {selectedEl.data.label}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {[
              { label: 'Type', value: selectedEl.data.type },
              { label: 'Objects', value: selectedEl.data.objectCount },
              { label: 'Connections', value: connectedEdges.length },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'var(--dim)' }}>{label}</span>
                <span style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Connected nodes */}
          {connectedEdges.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--dim)', letterSpacing: '0.08em', marginBottom: 6, textTransform: 'uppercase' }}>
                Connected to
              </div>
              {connectedEdges.map(edge => {
                const otherId = edge.source === selectedEl.data.id ? edge.target : edge.source
                const other = nodes.find(n => n.id === otherId)
                return other ? (
                  <div key={edge.id} style={{
                    fontSize: 11, color: 'var(--text)',
                    padding: '3px 0',
                    display: 'flex', alignItems: 'center', gap: 6
                  }}>
                    <span style={{ color: NODE_COLORS[other.type], fontSize: 8 }}>●</span>
                    {other.title}
                  </div>
                ) : null
              })}
            </div>
          )}

          {/* Weaver objects */}
          {fullNode?.objects?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.08em', marginBottom: 6, textTransform: 'uppercase' }}>
                ✦ Weaver Objects
              </div>
              {fullNode.objects.slice(0, 4).map((obj, i) => (
                <div key={i} style={{
                  fontSize: 11, color: 'var(--dim)', padding: '2px 0',
                  display: 'flex', gap: 6
                }}>
                  <span style={{ color: 'var(--accent)', flexShrink: 0 }}>{obj.type}:</span>
                  <span style={{ color: 'var(--text)' }}>{(obj.content || '').slice(0, 30)}</span>
                </div>
              ))}
            </div>
          )}

          <button onClick={onJumpToCanvas} style={{
            width: '100%', padding: '7px 0',
            background: 'rgba(124,106,247,0.1)',
            border: '1px solid var(--accent)',
            borderRadius: 6,
            color: 'var(--glow)', cursor: 'pointer',
            fontSize: 12, fontFamily: 'Syne, sans-serif',
            fontWeight: 600, transition: 'all 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,106,247,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,106,247,0.1)'}
          >→ Go to Canvas</button>
        </div>
      )}

      {/* Selected edge panel */}
      {selectedEl?.type === 'edge' && (
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Connection
          </div>
          <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 6 }}>
            {selectedEl.data.label || 'relates to'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--dim)' }}>
            Weight: {selectedEl.data.weight}
          </div>
        </div>
      )}

      {/* Resonance insights */}
      {insights?.length > 0 && (
        <div style={{ padding: 16 }}>
          <div style={{
            fontSize: 10, color: 'var(--accent)',
            letterSpacing: '0.08em', marginBottom: 10,
            textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 4
          }}>
            <span>✦</span> Resonance
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {insights.map((insight, i) => (
              <div key={i} style={{
                padding: '8px 10px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 6,
                borderLeft: `2px solid ${INSIGHT_COLORS[insight.type] || 'var(--accent)'}`,
              }}>
                <div style={{ fontSize: 11, color: 'var(--text)', lineHeight: 1.5, marginBottom: 4 }}>
                  {insight.message}
                </div>
                {insight.relatedTitles?.length > 0 && (
                  <div style={{ fontSize: 10, color: 'var(--dim)' }}>
                    {insight.relatedTitles.join(' · ')}
                  </div>
                )}
                <div style={{
                  fontSize: 9, marginTop: 4,
                  color: INSIGHT_COLORS[insight.type] || 'var(--accent)',
                  textTransform: 'uppercase', letterSpacing: '0.06em'
                }}>{insight.type}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
