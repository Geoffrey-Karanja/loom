import React, { useState, useEffect } from 'react'

export default function ReminderAlert({ reminders, onDismiss, onDone }) {
  const [visible, setVisible] = useState(true)

  if (!visible || !reminders?.length) return null

  const r = reminders[0]
  const pm = {
    high:   { color: '#f87171', icon: '🔴' },
    medium: { color: '#fbbf24', icon: '🟡' },
    low:    { color: '#2dd4bf', icon: '🟢' },
  }[r.priority] || { color: '#fbbf24', icon: '🟡' }

  return (
    <div className="fade-in" style={{
      position: 'fixed', top: 20, right: 20,
      zIndex: 9999, width: 320,
      background: 'var(--surface)',
      border: `1px solid ${pm.color}`,
      borderRadius: 12,
      boxShadow: `0 8px 40px ${pm.color}33`,
      overflow: 'hidden'
    }}>
      {/* Top bar */}
      <div style={{
        height: 3, background: pm.color,
        animation: 'reminderBar 10s linear forwards'
      }} />

      <div style={{ padding: '14px 16px' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 10
        }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>{pm.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: 'var(--text)',
              fontFamily: 'Syne, sans-serif', marginBottom: 3
            }}>🔔 {r.title}</div>
            {r.note && (
              <div style={{ fontSize: 11, color: 'var(--dim)', lineHeight: 1.5 }}>
                {r.note}
              </div>
            )}
          </div>
          <button onClick={() => { setVisible(false); onDismiss?.(r) }} style={{
            background: 'none', border: 'none',
            color: 'var(--dim)', cursor: 'pointer', fontSize: 14,
            flexShrink: 0
          }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={() => { setVisible(false); onDone?.(r) }} style={{
            flex: 1, padding: '7px 0',
            background: `${pm.color}18`,
            border: `1px solid ${pm.color}`,
            borderRadius: 7, color: pm.color,
            cursor: 'pointer', fontSize: 12,
            fontFamily: 'Syne, sans-serif', fontWeight: 600
          }}>✓ Mark done</button>
          <button onClick={() => { setVisible(false); onDismiss?.(r) }} style={{
            flex: 1, padding: '7px 0',
            background: 'var(--muted)',
            border: '1px solid var(--border)',
            borderRadius: 7, color: 'var(--dim)',
            cursor: 'pointer', fontSize: 12,
            fontFamily: 'Syne, sans-serif'
          }}>Dismiss</button>
        </div>
      </div>

      <style>{`
        @keyframes reminderBar {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  )
}
