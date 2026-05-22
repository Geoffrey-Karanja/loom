import React, { useState, useEffect, useRef } from 'react'
import { useLoomStore } from '../store/index.js'

export default function SearchBar() {
  const { searchNodes, setSelectedNode, setActiveView, nodes } = useLoomStore()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ nodes: [], objects: [] })
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  // Open with Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setResults({ nodes: [], objects: [] })
      setSelected(0)
    }
  }, [open])

  useEffect(() => {
    if (!query.trim()) {
      setResults({ nodes: [], objects: [] })
      return
    }
    clearTimeout(debounceRef.current)
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchNodes(query)
        setResults(res)
        setSelected(0)
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [query])

  const allResults = [
    ...(results.nodes || []).map(n => ({ ...n, _kind: 'node' })),
    ...(results.objects || []).map(o => ({ ...o, _kind: 'object' }))
  ]

  const handleSelect = (item) => {
    if (item._kind === 'node') {
      const node = nodes.find(n => n.id === item.id)
      if (node) { setSelectedNode(node); setActiveView('canvas') }
    } else {
      const node = nodes.find(n => n.id === item.nodeId)
      if (node) { setSelectedNode(node); setActiveView('canvas') }
    }
    setOpen(false)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, allResults.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && allResults[selected]) handleSelect(allResults[selected])
    if (e.key === 'Escape') setOpen(false)
  }

  const TYPE_COLORS = {
    document: '#7c6af7', task: '#2dd4bf',
    idea: '#fbbf24', data: '#f87171'
  }

  const TYPE_ICONS = {
    document: '▤', task: '◻', idea: '◈', data: '⊞'
  }

  if (!open) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '12vh',
      backdropFilter: 'blur(4px)'
    }} onClick={() => setOpen(false)}>
      <div className="fade-in" onClick={e => e.stopPropagation()} style={{
        width: 580, background: 'var(--surface)',
        border: '1px solid var(--accent)',
        borderRadius: 14,
        boxShadow: '0 24px 80px rgba(124,106,247,0.3)',
        overflow: 'hidden'
      }}>
        {/* Input */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '14px 16px', gap: 12,
          borderBottom: query ? '1px solid var(--border)' : 'none'
        }}>
          <span style={{ fontSize: 16, color: 'var(--dim)' }}>⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search nodes, content, objects..."
            style={{
              flex: 1, background: 'none', border: 'none',
              outline: 'none', color: 'var(--text)',
              fontSize: 15, fontFamily: 'Syne, sans-serif'
            }}
          />
          {loading && (
            <span style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>
              searching...
            </span>
          )}
          <kbd style={{
            fontSize: 10, color: 'var(--dim)',
            background: 'var(--muted)', border: '1px solid var(--border)',
            borderRadius: 4, padding: '2px 6px',
            fontFamily: 'JetBrains Mono, monospace'
          }}>ESC</kbd>
        </div>

        {/* Results */}
        {allResults.length > 0 && (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {results.nodes?.length > 0 && (
              <div style={{
                padding: '8px 16px 4px',
                fontSize: 10, color: 'var(--dim)',
                fontWeight: 600, letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}>Nodes</div>
            )}
            {(results.nodes || []).map((item, i) => (
              <div key={item.id}
                onClick={() => handleSelect({ ...item, _kind: 'node' })}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  background: selected === i ? 'var(--muted)' : 'transparent',
                  display: 'flex', alignItems: 'center', gap: 12,
                  transition: 'background 0.1s'
                }}
                onMouseEnter={() => setSelected(i)}
              >
                <span style={{ color: TYPE_COLORS[item.type] || 'var(--accent)', fontSize: 16 }}>
                  {TYPE_ICONS[item.type] || '▤'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                    {item.title}
                  </div>
                  {item.excerpt && (
                    <div style={{
                      fontSize: 11, color: 'var(--dim)',
                      whiteSpace: 'nowrap', overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>{item.excerpt}</div>
                  )}
                </div>
                <span style={{
                  fontSize: 10, color: TYPE_COLORS[item.type] || 'var(--accent)',
                  fontFamily: 'JetBrains Mono, monospace',
                  textTransform: 'uppercase'
                }}>{item.type}</span>
              </div>
            ))}

            {results.objects?.length > 0 && (
              <div style={{
                padding: '8px 16px 4px',
                fontSize: 10, color: 'var(--dim)',
                fontWeight: 600, letterSpacing: '0.08em',
                textTransform: 'uppercase',
                borderTop: results.nodes?.length ? '1px solid var(--border)' : 'none',
                marginTop: results.nodes?.length ? 4 : 0
              }}>Weaver Objects</div>
            )}
            {(results.objects || []).map((item, i) => {
              const idx = (results.nodes?.length || 0) + i
              return (
                <div key={item.id}
                  onClick={() => handleSelect({ ...item, _kind: 'object' })}
                  style={{
                    padding: '10px 16px', cursor: 'pointer',
                    background: selected === idx ? 'var(--muted)' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={() => setSelected(idx)}
                >
                  <span style={{ color: 'var(--accent)', fontSize: 12 }}>✦</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>
                      {item.content}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--dim)' }}>
                      in {item.nodeTitle}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, color: 'var(--accent)',
                    fontFamily: 'JetBrains Mono, monospace',
                    textTransform: 'uppercase'
                  }}>{item.type}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {query && !loading && allResults.length === 0 && (
          <div style={{
            padding: '32px 16px', textAlign: 'center',
            color: 'var(--dim)', fontSize: 13
          }}>
            <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>⌕</div>
            No results for "{query}"
          </div>
        )}

        {/* Footer hints */}
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: 16, alignItems: 'center'
        }}>
          {[
            { key: '↑↓', label: 'navigate' },
            { key: '↵', label: 'open' },
            { key: 'esc', label: 'close' },
            { key: 'ctrl+k', label: 'toggle' },
          ].map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <kbd style={{
                fontSize: 10, color: 'var(--dim)',
                background: 'var(--muted)',
                border: '1px solid var(--border)',
                borderRadius: 4, padding: '1px 5px',
                fontFamily: 'JetBrains Mono, monospace'
              }}>{key}</kbd>
              <span style={{ fontSize: 10, color: 'var(--dim)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
