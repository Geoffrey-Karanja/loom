import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:4000/api'

const TYPE_META = {
  conversation: { color: 'var(--accent)', icon: '💬', label: 'Conversation' },
  insight:      { color: 'var(--teal)',   icon: '✦',  label: 'Insight' },
  fact:         { color: 'var(--amber)',  icon: '◈',  label: 'Fact' },
  preference:   { color: 'var(--glow)',   icon: '♡',  label: 'Preference' },
}

export default function MemoryPanel({ onClose }) {
  const [memories, setMemories] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [filter, setFilter] = useState('all')

  const load = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/weaver/memory`)
      setMemories(res.data.memories || [])
      setTotal(res.data.total || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleClear = async () => {
    if (!confirm('Clear all Weaver memory? This cannot be undone.')) return
    setClearing(true)
    await axios.delete(`${API}/weaver/memory`)
    setMemories([])
    setTotal(0)
    setClearing(false)
  }

  const filtered = filter === 'all'
    ? memories
    : memories.filter(m => m.type === filter)

  const formatTime = (iso) => {
    const d = new Date(iso)
    const diff = Date.now() - d
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div className="fade-in" onClick={e => e.stopPropagation()} style={{
        width: 540, maxHeight: '82vh',
        background: 'var(--surface)',
        border: '1px solid var(--accent)',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(124,106,247,0.25)',
        display: 'flex', flexDirection: 'column'
      }}>

        {/* Header */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(124,106,247,0.05)'
        }}>
          <div style={{
            fontSize: 16, fontWeight: 700, color: 'var(--text)',
            fontFamily: 'Syne, sans-serif', marginBottom: 4,
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span style={{ color: 'var(--accent)' }}>✦</span> Weaver Memory
          </div>
          <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 12 }}>
            {total} memories stored — the Weaver remembers every conversation, insight, and fact.
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'conversation', 'insight', 'fact'].map(f => {
              const meta = TYPE_META[f] || { color: 'var(--accent)', label: 'All' }
              return (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '3px 10px', borderRadius: 20,
                  border: `1px solid ${filter === f ? meta.color : 'var(--border)'}`,
                  background: filter === f ? `${meta.color}18` : 'transparent',
                  color: filter === f ? meta.color : 'var(--dim)',
                  cursor: 'pointer', fontSize: 11,
                  fontFamily: 'Syne, sans-serif', fontWeight: 500,
                  transition: 'all 0.15s'
                }}>{f}</button>
              )
            })}
          </div>
        </div>

        {/* Memory list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {loading && (
            <div style={{ textAlign: 'center', color: 'var(--dim)', padding: 32, fontSize: 13 }}>
              ⟳ Loading memories...
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 32, opacity: 0.2, marginBottom: 12 }}>✦</div>
              <div style={{ color: 'var(--dim)', fontSize: 13 }}>
                No memories yet. Start chatting with the Weaver.
              </div>
            </div>
          )}

          {filtered.map((memory, i) => {
            const meta = TYPE_META[memory.type] || TYPE_META.insight
            return (
              <div key={memory.id || i} style={{
                padding: '10px 12px', marginBottom: 8,
                background: 'var(--muted)',
                border: `1px solid var(--border)`,
                borderLeft: `2px solid ${meta.color}`,
                borderRadius: 8
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: 8, marginBottom: 6
                }}>
                  <span style={{ fontSize: 12 }}>{meta.icon}</span>
                  <span style={{
                    fontSize: 10, color: meta.color,
                    fontFamily: 'JetBrains Mono, monospace',
                    textTransform: 'uppercase', letterSpacing: '0.06em'
                  }}>{meta.label}</span>
                  <span style={{
                    fontSize: 10, color: 'var(--dim)',
                    marginLeft: 'auto',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}>{formatTime(memory.createdAt)}</span>
                </div>
                <div style={{
                  fontSize: 12, color: 'var(--text)',
                  lineHeight: 1.6, whiteSpace: 'pre-wrap'
                }}>
                  {memory.content.slice(0, 200)}
                  {memory.content.length > 200 && (
                    <span style={{ color: 'var(--dim)' }}> ...</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <button onClick={handleClear} disabled={clearing || total === 0} style={{
            padding: '6px 14px',
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: 6, color: 'var(--coral)',
            cursor: total === 0 ? 'default' : 'pointer',
            fontSize: 11, fontFamily: 'Syne, sans-serif',
            opacity: total === 0 ? 0.4 : 1
          }}>
            {clearing ? '⟳ Clearing...' : '✕ Clear memory'}
          </button>
          <button onClick={onClose} style={{
            padding: '6px 16px',
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
