import React from 'react'
import { useLoomStore } from '../store/index.js'

export default function WeaverPanel() {
  const { weaverInsights, weaverLoading } = useLoomStore()

  if (weaverInsights.length === 0) return null

  const typeColors = {
    connection:  'var(--teal)',
    pattern:     'var(--accent)',
    risk:        'var(--coral)',
    opportunity: 'var(--amber)',
  }

  return (
    <div className="fade-in" style={{
      position: 'absolute',
      bottom: 24, left: '50%',
      transform: 'translateX(-50%)',
      width: 480,
      background: 'var(--surface)',
      border: '1px solid var(--accent)',
      borderRadius: 12,
      padding: 16,
      zIndex: 200,
      boxShadow: '0 8px 40px rgba(124,106,247,0.2)'
    }}>
      <div style={{
        fontSize: 11, color: 'var(--accent)',
        fontWeight: 600, letterSpacing: '0.1em',
        textTransform: 'uppercase', marginBottom: 10,
        display: 'flex', alignItems: 'center', gap: 6
      }}>
        <span>✦</span> Weaver Resonance
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {weaverInsights.map((insight, i) => (
          <div key={i} style={{
            padding: '8px 10px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 8,
            borderLeft: `2px solid ${typeColors[insight.type] || 'var(--accent)'}`,
          }}>
            <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.5 }}>
              {insight.message}
            </div>
            {insight.relatedTitles?.length > 0 && (
              <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4 }}>
                {insight.relatedTitles.join(' · ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
