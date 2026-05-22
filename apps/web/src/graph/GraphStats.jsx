import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:4000/api'

const TYPE_COLORS = {
  document: '#7c6af7', task: '#2dd4bf',
  idea: '#fbbf24', data: '#f87171'
}

export default function GraphStats({ onClose }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API}/graph/stats`)
      .then(res => setStats(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div style={{ color: 'var(--accent)', fontSize: 13, fontFamily: 'Syne, sans-serif' }}>
        ⟳ Analyzing graph...
      </div>
    </div>
  )

  if (!stats) return null

  const metrics = [
    { label: 'Total Nodes',     value: stats.nodeCount,                    color: 'var(--accent)', icon: '◈' },
    { label: 'Connections',     value: stats.edgeCount,                    color: 'var(--teal)',   icon: '⌀' },
    { label: 'Clusters',        value: stats.clusterCount,                 color: 'var(--amber)',  icon: '⬡' },
    { label: 'Isolated Nodes',  value: stats.isolatedCount,                color: 'var(--coral)',  icon: '◻' },
    { label: 'Largest Cluster', value: stats.largestCluster,               color: 'var(--glow)',   icon: '⊞' },
    { label: 'Avg Connections', value: stats.avgDegree?.toFixed(1) || '0', color: 'var(--teal)',   icon: '~' },
    { label: 'Graph Density',   value: `${((stats.density || 0) * 100).toFixed(1)}%`, color: 'var(--accent)', icon: '◈' },
  ]

  const densityPct = Math.min((stats.density || 0) * 100, 100)
  const healthScore = Math.round(
    (stats.nodeCount > 0 ? 20 : 0) +
    (stats.edgeCount > 0 ? 20 : 0) +
    (stats.clusterCount > 1 ? 20 : 0) +
    (stats.isolatedCount === 0 ? 20 : 10) +
    (densityPct > 10 ? 20 : densityPct)
  )

  const healthColor = healthScore >= 80 ? 'var(--teal)'
    : healthScore >= 50 ? 'var(--amber)'
    : 'var(--coral)'

  const healthLabel = healthScore >= 80 ? 'Thriving'
    : healthScore >= 50 ? 'Growing'
    : 'Sparse'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div className="fade-in" onClick={e => e.stopPropagation()} style={{
        width: 560, maxHeight: '85vh',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column'
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              fontSize: 17, fontWeight: 700, color: 'var(--text)',
              fontFamily: 'Syne, sans-serif', marginBottom: 4,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <span style={{ color: 'var(--accent)' }}>◈</span> Graph Intelligence
            </div>
            <div style={{ fontSize: 12, color: 'var(--dim)' }}>
              Live analysis of your knowledge structure
            </div>
          </div>

          {/* Health score */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: `conic-gradient(${healthColor} ${healthScore * 3.6}deg, var(--muted) 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: 46, height: 46, borderRadius: '50%',
                background: 'var(--surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: healthColor,
                fontFamily: 'JetBrains Mono, monospace'
              }}>{healthScore}</div>
            </div>
            <div style={{ fontSize: 10, color: healthColor, marginTop: 4, fontWeight: 600 }}>
              {healthLabel}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>

          {/* Metrics grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10, marginBottom: 20
          }}>
            {metrics.map(m => (
              <div key={m.label} style={{
                padding: '14px 16px',
                background: 'var(--muted)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                borderTop: `2px solid ${m.color}`
              }}>
                <div style={{
                  fontSize: 22, fontWeight: 700,
                  color: m.color, fontFamily: 'JetBrains Mono, monospace',
                  marginBottom: 4
                }}>{m.value}</div>
                <div style={{ fontSize: 11, color: 'var(--dim)' }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Density bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginBottom: 6
            }}>
              <span style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 600 }}>
                Graph Density
              </span>
              <span style={{
                fontSize: 11, color: 'var(--accent)',
                fontFamily: 'JetBrains Mono, monospace'
              }}>{densityPct.toFixed(1)}%</span>
            </div>
            <div style={{
              height: 6, background: 'var(--muted)',
              borderRadius: 3, overflow: 'hidden'
            }}>
              <div style={{
                height: '100%', borderRadius: 3,
                width: `${Math.max(densityPct, 2)}%`,
                background: `linear-gradient(90deg, var(--accent), var(--glow))`,
                transition: 'width 0.8s ease'
              }} />
            </div>
            <div style={{
              fontSize: 10, color: 'var(--dim)', marginTop: 4
            }}>
              {densityPct < 10
                ? 'Sparse — add more connections between nodes'
                : densityPct < 40
                ? 'Growing — good structure emerging'
                : 'Dense — rich knowledge web'}
            </div>
          </div>

          {/* Hub nodes */}
          {stats.hubs?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 11, color: 'var(--dim)', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                marginBottom: 10
              }}>Hub Nodes — most connected</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {stats.hubs.map((hub, i) => (
                  <div key={hub.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '8px 12px',
                    background: 'var(--muted)',
                    borderRadius: 8,
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: `rgba(124,106,247,${0.4 - i * 0.1})`,
                      border: '1px solid var(--accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: 'var(--accent)', fontWeight: 700,
                      flexShrink: 0
                    }}>#{i + 1}</div>
                    <div style={{ flex: 1, fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
                      {hub.title}
                    </div>
                    <div style={{
                      fontSize: 11, color: 'var(--accent)',
                      fontFamily: 'JetBrains Mono, monospace'
                    }}>{hub.degree} links</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {stats.isolatedCount > 0 && (
            <div style={{
              padding: '12px 14px',
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 8, marginBottom: 12
            }}>
              <div style={{
                fontSize: 12, color: 'var(--coral)',
                fontWeight: 600, marginBottom: 4
              }}>
                ⚠ {stats.isolatedCount} isolated node{stats.isolatedCount > 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: 11, color: 'var(--dim)', lineHeight: 1.5 }}>
                These nodes have no connections. Use AutoLink or manually connect them to strengthen your graph.
              </div>
            </div>
          )}

          {stats.nodeCount === 0 && (
            <div style={{
              padding: '12px 14px',
              background: 'rgba(124,106,247,0.08)',
              border: '1px solid rgba(124,106,247,0.2)',
              borderRadius: 8
            }}>
              <div style={{ fontSize: 12, color: 'var(--accent)', lineHeight: 1.6 }}>
                Your graph is empty. Create nodes on the Canvas and use AutoLink to start building your knowledge web.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'flex-end'
        }}>
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
