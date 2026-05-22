import React, { useState } from 'react'
import { useLoomStore } from '../store/index.js'
import { TEMPLATES, applyTemplate } from './templates.js'

export default function TemplatePicker({ onClose }) {
  const { createNode, setSelectedNode, setActiveView } = useLoomStore()
  const [creating, setCreating] = useState(null)
  const [filter, setFilter] = useState('all')

  const types = ['all', 'document', 'task', 'idea', 'data']

  const filtered = TEMPLATES.filter(t =>
    filter === 'all' || t.type === filter
  )

  const handleCreate = async (template) => {
    setCreating(template.id)
    const data = applyTemplate(template)
    const node = await createNode({
      ...data,
      position: {
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200
      }
    })
    setSelectedNode(node)
    setActiveView('canvas')
    setCreating(null)
    onClose()
  }

  const TYPE_COLORS = {
    document: '#7c6af7', task: '#2dd4bf',
    idea: '#fbbf24', data: '#f87171'
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div className="fade-in" onClick={e => e.stopPropagation()} style={{
        width: 620, maxHeight: '80vh',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{
            fontSize: 17, fontWeight: 700,
            color: 'var(--text)', fontFamily: 'Syne, sans-serif',
            marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span style={{ color: 'var(--amber)' }}>⊞</span> Node Templates
          </div>
          <div style={{ fontSize: 12, color: 'var(--dim)' }}>
            Pre-filled nodes ready to use. Weaver will analyze them automatically.
          </div>

          {/* Type filter */}
          <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
            {types.map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{
                padding: '4px 12px', borderRadius: 20,
                border: 'none', cursor: 'pointer',
                fontSize: 11, fontFamily: 'Syne, sans-serif', fontWeight: 500,
                background: filter === t
                  ? (TYPE_COLORS[t] || 'var(--accent)')
                  : 'var(--muted)',
                color: filter === t ? 'white' : 'var(--dim)',
                transition: 'all 0.15s'
              }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Template grid */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: 20,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          alignContent: 'start'
        }}>
          {filtered.map(template => (
            <div key={template.id}
              onClick={() => handleCreate(template)}
              style={{
                padding: 16,
                background: 'var(--muted)',
                border: '1px solid var(--border)',
                borderRadius: 10, cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: creating && creating !== template.id ? 0.5 : 1
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = template.color
                e.currentTarget.style.background = `${template.color}11`
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.background = 'var(--muted)'
                e.currentTarget.style.transform = 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{template.icon}</span>
                <div>
                  <div style={{
                    fontSize: 13, fontWeight: 600,
                    color: 'var(--text)', fontFamily: 'Syne, sans-serif'
                  }}>{template.label}</div>
                  <div style={{
                    fontSize: 10, color: template.color,
                    fontFamily: 'JetBrains Mono, monospace',
                    textTransform: 'uppercase', letterSpacing: '0.06em'
                  }}>{template.type}</div>
                </div>
              </div>

              {/* Content preview */}
              <div style={{
                fontSize: 11, color: 'var(--dim)',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                marginBottom: 10
              }}>
                {template.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80)}
              </div>

              <div style={{
                fontSize: 11, color: template.color,
                fontWeight: 600, fontFamily: 'Syne, sans-serif'
              }}>
                {creating === template.id ? '⟳ Creating...' : '+ Use template'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
