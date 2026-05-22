import React, { useState } from 'react'
import { useLoomStore } from '../store/index.js'

const API = 'http://localhost:4000/api'

const FORMATS = [
  {
    id: 'json',
    icon: '{ }',
    label: 'JSON',
    description: 'Full export — all nodes, edges, objects. Use to back up or import into another Loom.',
    color: '#7c6af7',
    ext: 'json'
  },
  {
    id: 'markdown',
    icon: '# ↓',
    label: 'Markdown',
    description: 'Human-readable export. Every node becomes a section. Perfect for Obsidian, Notion, or docs.',
    color: '#2dd4bf',
    ext: 'md'
  },
  {
    id: 'csv',
    icon: '⊞',
    label: 'CSV',
    description: 'Spreadsheet-friendly. One row per node with content, type, objects, and connection count.',
    color: '#fbbf24',
    ext: 'csv'
  }
]

export default function ExportPanel({ onClose }) {
  const { nodes, edges } = useLoomStore()
  const [downloading, setDownloading] = useState(null)
  const [done, setDone] = useState(null)

  const handleDownload = async (format) => {
    setDownloading(format.id)
    try {
      const res = await fetch(`${API}/export/${format.id}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `loom-export-${new Date().toISOString().slice(0,10)}.${format.ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setDone(format.id)
      setTimeout(() => setDone(null), 2000)
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div className="fade-in" onClick={e => e.stopPropagation()} style={{
        width: 520,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{
            fontSize: 17, fontWeight: 700,
            color: 'var(--text)', fontFamily: 'Syne, sans-serif',
            marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span style={{ color: 'var(--teal)' }}>↓</span> Export Workspace
          </div>
          <div style={{ fontSize: 12, color: 'var(--dim)' }}>
            {nodes.length} nodes · {edges.length} connections · {
              nodes.reduce((acc, n) => acc + (n.objects?.length || 0), 0)
            } weaver objects
          </div>
        </div>

        {/* Format options */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FORMATS.map(format => (
            <div key={format.id} style={{
              padding: 16,
              background: 'var(--muted)',
              border: `1px solid ${done === format.id ? format.color : 'var(--border)'}`,
              borderRadius: 10,
              display: 'flex', alignItems: 'center', gap: 16,
              transition: 'all 0.2s'
            }}>
              {/* Icon */}
              <div style={{
                width: 44, height: 44, borderRadius: 8,
                background: `${format.color}18`,
                border: `1px solid ${format.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, color: format.color,
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700, flexShrink: 0
              }}>{format.icon}</div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 600,
                  color: 'var(--text)', fontFamily: 'Syne, sans-serif',
                  marginBottom: 3
                }}>{format.label}</div>
                <div style={{
                  fontSize: 11, color: 'var(--dim)', lineHeight: 1.5
                }}>{format.description}</div>
              </div>

              {/* Download button */}
              <button
                onClick={() => handleDownload(format)}
                disabled={!!downloading}
                style={{
                  padding: '8px 16px',
                  background: done === format.id
                    ? `${format.color}22`
                    : downloading === format.id
                    ? 'var(--muted)'
                    : `${format.color}11`,
                  border: `1px solid ${format.color}`,
                  borderRadius: 7,
                  color: format.color,
                  cursor: downloading ? 'wait' : 'pointer',
                  fontSize: 12,
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 600,
                  flexShrink: 0,
                  transition: 'all 0.15s',
                  minWidth: 90, textAlign: 'center'
                }}
                onMouseEnter={e => !downloading && (e.currentTarget.style.background = `${format.color}22`)}
                onMouseLeave={e => !downloading && (e.currentTarget.style.background = `${format.color}11`)}
              >
                {done === format.id
                  ? '✓ Saved'
                  : downloading === format.id
                  ? '⟳ ...'
                  : `↓ .${format.ext}`}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ fontSize: 11, color: 'var(--dim)' }}>
            Data is stored locally at ~/loom/data/sqlite/loom.json
          </div>
          <button onClick={onClose} style={{
            padding: '6px 14px',
            background: 'var(--muted)',
            border: '1px solid var(--border)',
            borderRadius: 6, color: 'var(--dim)',
            cursor: 'pointer', fontSize: 12,
            fontFamily: 'Syne, sans-serif'
          }}>Close</button>
        </div>
      </div>
    </div>
  )
}
