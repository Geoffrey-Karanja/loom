import React, { useState } from 'react'
import { useLoomStore } from '../store/index.js'
import axios from 'axios'

const API = 'http://localhost:4000/api'

export default function InboxAlchemy({ onClose }) {
  const { createNode, fetchNodes } = useLoomStore()
  const [input, setInput] = useState('')
  const [parsed, setParsed] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleParse = async () => {
    if (!input.trim()) return
    setLoading(true)
    setParsed(null)
    try {
      const res = await axios.post(`${API}/weaver/analyze`, {
        text: input,
        nodeId: null
      })
      // Build structured preview
      const result = {
        summary: res.data.summary || '',
        objects: res.data.objects || [],
        connections: res.data.connections || [],
        raw: input
      }
      setParsed(result)
    } catch (err) {
      setParsed({ error: 'Weaver offline — is Ollama running?' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!parsed) return
    setLoading(true)

    // Group objects by type and create nodes
    const tasks     = parsed.objects.filter(o => o.type === 'task')
    const decisions = parsed.objects.filter(o => o.type === 'decision')
    const risks     = parsed.objects.filter(o => o.type === 'risk')
    const insights  = parsed.objects.filter(o => ['insight', 'question', 'person'].includes(o.type))

    const baseX = 100, baseY = 100
    let col = 0

    if (tasks.length) {
      await createNode({
        type: 'task', title: `Tasks (${tasks.length})`,
        content: tasks.map(t => `- [ ] ${t.content}`).join('\n'),
        position: { x: baseX + col++ * 360, y: baseY }
      })
    }
    if (decisions.length) {
      await createNode({
        type: 'document', title: `Decisions (${decisions.length})`,
        content: decisions.map(d => `## ${d.content}`).join('\n\n'),
        position: { x: baseX + col++ * 360, y: baseY }
      })
    }
    if (risks.length) {
      await createNode({
        type: 'data', title: `Risks (${risks.length})`,
        content: risks.map(r => `- ⚠️ ${r.content}`).join('\n'),
        position: { x: baseX + col++ * 360, y: baseY }
      })
    }
    if (insights.length) {
      await createNode({
        type: 'idea', title: `Insights (${insights.length})`,
        content: insights.map(i => `- ${i.content}`).join('\n'),
        position: { x: baseX + col++ * 360, y: baseY }
      })
    }

    // Always save the raw note too
    await createNode({
      type: 'document', title: parsed.summary || 'Inbox Note',
      content: `<p>${input.replace(/\n/g, '</p><p>')}</p>`,
      position: { x: baseX, y: baseY + 320 }
    })

    await fetchNodes()
    setSaved(true)
    setLoading(false)
    setTimeout(onClose, 1500)
  }

  const TYPE_COLORS = {
    task: 'var(--glow)', decision: 'var(--teal)',
    risk: 'var(--coral)', insight: 'var(--amber)',
    question: 'var(--amber)', person: 'var(--teal)'
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
        width: 600, maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 18, fontWeight: 700, color: 'var(--text)',
            fontFamily: 'Syne, sans-serif', marginBottom: 6,
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span style={{ color: 'var(--teal)' }}>⊹</span> Inbox Alchemy
          </div>
          <div style={{ fontSize: 12, color: 'var(--dim)', lineHeight: 1.6 }}>
            Paste any raw text — email, Slack message, meeting notes, anything. The Weaver extracts structure instantly.
          </div>
        </div>

        {/* Input */}
        <textarea
          placeholder="Paste email, Slack message, meeting notes, anything..."
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{
            width: '100%', height: 160,
            background: 'var(--muted)',
            border: '1px solid var(--border)',
            borderRadius: 8, padding: 12,
            color: 'var(--text)', fontSize: 13,
            fontFamily: 'Syne, sans-serif',
            resize: 'vertical', outline: 'none',
            lineHeight: 1.6, boxSizing: 'border-box',
            marginBottom: 12
          }}
        />

        <button onClick={handleParse} disabled={loading || !input.trim()} style={{
          width: '100%', padding: '10px 0',
          background: 'rgba(45,212,191,0.1)',
          border: '1px solid var(--teal)',
          borderRadius: 8, color: 'var(--teal)',
          cursor: loading ? 'wait' : 'pointer',
          fontSize: 13, fontFamily: 'Syne, sans-serif',
          fontWeight: 600, marginBottom: 20,
          transition: 'all 0.15s'
        }}>
          {loading ? '⟳ Weaving...' : '✦ Parse with Weaver'}
        </button>

        {/* Parsed result */}
        {parsed && !parsed.error && (
          <div className="fade-in">
            {parsed.summary && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(124,106,247,0.08)',
                border: '1px solid rgba(124,106,247,0.2)',
                borderRadius: 8, marginBottom: 16,
                fontSize: 13, color: 'var(--text)', lineHeight: 1.5
              }}>
                <span style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 600 }}>SUMMARY  </span>
                {parsed.summary}
              </div>
            )}

            {parsed.objects.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  fontSize: 11, color: 'var(--dim)', letterSpacing: '0.08em',
                  textTransform: 'uppercase', marginBottom: 10, fontWeight: 600
                }}>
                  ✦ Extracted {parsed.objects.length} objects
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {parsed.objects.map((obj, i) => (
                    <div key={i} style={{
                      padding: '8px 12px',
                      background: 'var(--muted)',
                      borderRadius: 6,
                      borderLeft: `2px solid ${TYPE_COLORS[obj.type] || 'var(--accent)'}`,
                      display: 'flex', alignItems: 'center', gap: 10
                    }}>
                      <span style={{
                        fontSize: 10, color: TYPE_COLORS[obj.type] || 'var(--accent)',
                        fontFamily: 'JetBrains Mono, monospace',
                        textTransform: 'uppercase', minWidth: 60
                      }}>{obj.type}</span>
                      <span style={{ fontSize: 12, color: 'var(--text)' }}>{obj.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {parsed.connections?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  fontSize: 11, color: 'var(--dim)', letterSpacing: '0.08em',
                  textTransform: 'uppercase', marginBottom: 8, fontWeight: 600
                }}>Topics detected</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {parsed.connections.map((c, i) => (
                    <span key={i} style={{
                      padding: '3px 10px', borderRadius: 20,
                      background: 'rgba(124,106,247,0.1)',
                      border: '1px solid rgba(124,106,247,0.2)',
                      fontSize: 11, color: 'var(--glow)',
                      fontFamily: 'JetBrains Mono, monospace'
                    }}>{c}</span>
                  ))}
                </div>
              </div>
            )}

            {saved ? (
              <div style={{
                padding: 14, background: 'rgba(45,212,191,0.1)',
                border: '1px solid var(--teal)', borderRadius: 8,
                color: 'var(--teal)', fontSize: 13, fontWeight: 600,
                textAlign: 'center'
              }}>✓ Saved to canvas</div>
            ) : (
              <button onClick={handleSave} disabled={loading} style={{
                width: '100%', padding: '12px 0',
                background: 'rgba(124,106,247,0.15)',
                border: '1px solid var(--accent)',
                borderRadius: 8, color: 'var(--glow)',
                cursor: 'pointer', fontSize: 13,
                fontFamily: 'Syne, sans-serif', fontWeight: 700,
                transition: 'all 0.15s'
              }}>
                → Save {parsed.objects.length} objects to Canvas
              </button>
            )}
          </div>
        )}

        {parsed?.error && (
          <div style={{
            padding: 14, background: 'rgba(248,113,113,0.1)',
            border: '1px solid var(--coral)', borderRadius: 8,
            color: 'var(--coral)', fontSize: 13
          }}>{parsed.error}</div>
        )}
      </div>
    </div>
  )
}
