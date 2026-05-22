import React, { useState, useEffect } from 'react'
import axios from 'axios'

import { API_URL } from '../config.js'
const API = API_URL

const PRIORITY_META = {
  low:    { color: '#2dd4bf', label: 'Low',    icon: '🟢' },
  medium: { color: '#fbbf24', label: 'Medium', icon: '🟡' },
  high:   { color: '#f87171', label: 'High',   icon: '🔴' },
}

const REPEAT_OPTIONS = [
  { value: 'none',   label: 'No repeat' },
  { value: 'daily',  label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
]

function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function ReminderManager({ onClose, defaultNodeId, defaultTitle }) {
  const [reminders, setReminders] = useState([])
  const [tab, setTab] = useState('list')
  const [form, setForm] = useState({
    title:    defaultTitle || '',
    note:     '',
    dueAt:    toLocalInput(new Date(Date.now() + 3600000).toISOString()),
    repeat:   'none',
    priority: 'medium',
    nodeId:   defaultNodeId || null
  })
  const [saving, setSaving] = useState(false)
  const [showDone, setShowDone] = useState(false)

  const load = async () => {
    const res = await axios.get(`${API}/reminders?all=${showDone}`)
    setReminders(res.data)
  }

  useEffect(() => { load() }, [showDone])

  const handleSave = async () => {
    if (!form.title.trim() || !form.dueAt) return
    setSaving(true)
    try {
      await axios.post(`${API}/reminders`, {
        ...form,
        dueAt: new Date(form.dueAt).toISOString()
      })
      await load()
      setTab('list')
      setForm(f => ({ ...f, title: '', note: '' }))
    } finally {
      setSaving(false)
    }
  }

  const handleDone = async (id) => {
    await axios.post(`${API}/reminders/${id}/done`)
    await load()
  }

  const handleDelete = async (id) => {
    await axios.delete(`${API}/reminders/${id}`)
    await load()
  }

  const formatDue = (iso) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = d - now
    const mins = Math.round(diff / 60000)

    if (mins < 0)    return { text: 'Overdue',            color: 'var(--coral)' }
    if (mins < 60)   return { text: `In ${mins}m`,        color: 'var(--amber)' }
    if (mins < 1440) return { text: `In ${Math.round(mins/60)}h`, color: 'var(--teal)' }
    return { text: d.toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }), color: 'var(--dim)' }
  }

  const active = reminders.filter(r => !r.done)
  const done   = reminders.filter(r => r.done)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div className="fade-in" onClick={e => e.stopPropagation()} style={{
        width: 500, maxHeight: '85vh',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column'
      }}>

        {/* Header */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{
            fontSize: 16, fontWeight: 700, color: 'var(--text)',
            fontFamily: 'Syne, sans-serif', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span style={{ fontSize: 18 }}>🔔</span> Task Reminders
            {active.length > 0 && (
              <span style={{
                fontSize: 11, background: 'var(--coral)',
                color: 'white', borderRadius: 10,
                padding: '1px 7px', fontFamily: 'JetBrains Mono, monospace'
              }}>{active.length}</span>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { id: 'list',   label: `Active (${active.length})` },
              { id: 'new',    label: '+ New reminder' },
              { id: 'done',   label: `Done (${done.length})` },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '4px 12px', borderRadius: 6, border: 'none',
                background: tab === t.id ? 'var(--accent)' : 'var(--muted)',
                color: tab === t.id ? 'white' : 'var(--dim)',
                cursor: 'pointer', fontSize: 11,
                fontFamily: 'Syne, sans-serif', fontWeight: 600,
                transition: 'all 0.15s'
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>

          {/* New reminder form */}
          {tab === 'new' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--dim)', display: 'block', marginBottom: 5 }}>
                  Title *
                </label>
                <input
                  autoFocus
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="What do you need to do?"
                  style={{
                    width: '100%', padding: '9px 12px',
                    background: 'var(--muted)', border: '1px solid var(--border)',
                    borderRadius: 8, color: 'var(--text)', fontSize: 13,
                    fontFamily: 'Syne, sans-serif', outline: 'none',
                    boxSizing: 'border-box', transition: 'border-color 0.15s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, color: 'var(--dim)', display: 'block', marginBottom: 5 }}>
                  Note (optional)
                </label>
                <textarea
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Additional context..."
                  rows={2}
                  style={{
                    width: '100%', padding: '9px 12px',
                    background: 'var(--muted)', border: '1px solid var(--border)',
                    borderRadius: 8, color: 'var(--text)', fontSize: 13,
                    fontFamily: 'Syne, sans-serif', outline: 'none',
                    resize: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.15s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--dim)', display: 'block', marginBottom: 5 }}>
                    Due date & time *
                  </label>
                  <input
                    type="datetime-local"
                    value={form.dueAt}
                    onChange={e => setForm(f => ({ ...f, dueAt: e.target.value }))}
                    style={{
                      width: '100%', padding: '9px 12px',
                      background: 'var(--muted)', border: '1px solid var(--border)',
                      borderRadius: 8, color: 'var(--text)', fontSize: 12,
                      fontFamily: 'Syne, sans-serif', outline: 'none',
                      boxSizing: 'border-box', colorScheme: 'dark'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, color: 'var(--dim)', display: 'block', marginBottom: 5 }}>
                    Repeat
                  </label>
                  <select
                    value={form.repeat}
                    onChange={e => setForm(f => ({ ...f, repeat: e.target.value }))}
                    style={{
                      width: '100%', padding: '9px 12px',
                      background: 'var(--muted)', border: '1px solid var(--border)',
                      borderRadius: 8, color: 'var(--text)', fontSize: 12,
                      fontFamily: 'Syne, sans-serif', outline: 'none',
                      boxSizing: 'border-box', cursor: 'pointer'
                    }}
                  >
                    {REPEAT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label style={{ fontSize: 11, color: 'var(--dim)', display: 'block', marginBottom: 8 }}>
                  Priority
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {Object.entries(PRIORITY_META).map(([key, meta]) => (
                    <button key={key} onClick={() => setForm(f => ({ ...f, priority: key }))} style={{
                      flex: 1, padding: '8px 0',
                      background: form.priority === key ? `${meta.color}22` : 'var(--muted)',
                      border: `1px solid ${form.priority === key ? meta.color : 'var(--border)'}`,
                      borderRadius: 8, color: form.priority === key ? meta.color : 'var(--dim)',
                      cursor: 'pointer', fontSize: 12,
                      fontFamily: 'Syne, sans-serif', fontWeight: 600,
                      transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 6
                    }}>
                      {meta.icon} {meta.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleSave} disabled={saving || !form.title.trim() || !form.dueAt} style={{
                width: '100%', padding: '12px 0',
                background: 'rgba(124,106,247,0.15)',
                border: '1px solid var(--accent)',
                borderRadius: 8, color: 'var(--glow)',
                cursor: saving ? 'wait' : 'pointer',
                fontSize: 13, fontFamily: 'Syne, sans-serif',
                fontWeight: 700, transition: 'all 0.15s',
                marginTop: 4
              }}>
                {saving ? '⟳ Saving...' : '🔔 Set Reminder'}
              </button>
            </div>
          )}

          {/* Active reminders list */}
          {tab === 'list' && (
            <div>
              {active.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: 32, opacity: 0.2, marginBottom: 12 }}>🔔</div>
                  <div style={{ color: 'var(--dim)', fontSize: 13, marginBottom: 16 }}>
                    No active reminders
                  </div>
                  <button onClick={() => setTab('new')} style={{
                    padding: '8px 20px',
                    background: 'rgba(124,106,247,0.1)',
                    border: '1px solid var(--accent)',
                    borderRadius: 8, color: 'var(--glow)',
                    cursor: 'pointer', fontSize: 12,
                    fontFamily: 'Syne, sans-serif', fontWeight: 600
                  }}>+ Create reminder</button>
                </div>
              )}

              {active.map(r => {
                const due = formatDue(r.dueAt)
                const pm  = PRIORITY_META[r.priority] || PRIORITY_META.medium
                return (
                  <div key={r.id} style={{
                    padding: '12px 14px', marginBottom: 10,
                    background: 'var(--muted)',
                    border: `1px solid var(--border)`,
                    borderLeft: `3px solid ${pm.color}`,
                    borderRadius: 10,
                    display: 'flex', gap: 12, alignItems: 'flex-start'
                  }}>
                    {/* Done checkbox */}
                    <button onClick={() => handleDone(r.id)} style={{
                      width: 20, height: 20, borderRadius: '50%',
                      border: `2px solid ${pm.color}`,
                      background: 'none', cursor: 'pointer',
                      flexShrink: 0, marginTop: 1,
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = `${pm.color}33`}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 600, color: 'var(--text)',
                        marginBottom: 3, fontFamily: 'Syne, sans-serif'
                      }}>{r.title}</div>
                      {r.note && (
                        <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 6 }}>
                          {r.note}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          fontSize: 11, color: due.color,
                          fontFamily: 'JetBrains Mono, monospace', fontWeight: 600
                        }}>{due.text}</span>
                        {r.repeat !== 'none' && (
                          <span style={{
                            fontSize: 10, color: 'var(--dim)',
                            background: 'var(--bg)', borderRadius: 4,
                            padding: '1px 6px', border: '1px solid var(--border)'
                          }}>↻ {r.repeat}</span>
                        )}
                        <span style={{ fontSize: 10 }}>{pm.icon}</span>
                      </div>
                    </div>

                    <button onClick={() => handleDelete(r.id)} style={{
                      background: 'none', border: 'none',
                      color: 'var(--dim)', cursor: 'pointer',
                      fontSize: 13, opacity: 0.4,
                      transition: 'opacity 0.15s', padding: '2px 4px'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = 'var(--coral)' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = 0.4; e.currentTarget.style.color = 'var(--dim)' }}
                    >✕</button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Done reminders */}
          {tab === 'done' && (
            <div>
              {done.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--dim)', fontSize: 13 }}>
                  No completed reminders yet.
                </div>
              )}
              {done.map(r => (
                <div key={r.id} style={{
                  padding: '10px 14px', marginBottom: 8,
                  background: 'var(--muted)',
                  border: '1px solid var(--border)',
                  borderRadius: 8, opacity: 0.5,
                  display: 'flex', alignItems: 'center', gap: 10
                }}>
                  <span style={{ fontSize: 14 }}>✓</span>
                  <span style={{
                    flex: 1, fontSize: 12, color: 'var(--dim)',
                    textDecoration: 'line-through'
                  }}>{r.title}</span>
                  <button onClick={() => handleDelete(r.id)} style={{
                    background: 'none', border: 'none',
                    color: 'var(--dim)', cursor: 'pointer', fontSize: 12
                  }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
