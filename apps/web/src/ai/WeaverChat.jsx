import React, { useState, useRef, useEffect } from 'react'
import MemoryPanel from './MemoryPanel.jsx'
import { API_URL } from '../config.js'

const API = API_URL

export default function WeaverChat({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'I am the Weaver. I remember our past conversations and have full awareness of your workspace. Ask me anything.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [showMemory, setShowMemory] = useState(false)
  const [weaverOnline, setWeaverOnline] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  useEffect(() => {
    inputRef.current?.focus()
    // Check weaver status
    fetch(`${API}/weaver/status`)
      .then(r => r.json())
      .then(d => setWeaverOnline(d.online))
      .catch(() => setWeaverOnline(false))
  }, [])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    const history = [...messages]
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setStreamingText('')

    try {
      const response = await fetch(`${API}/weaver/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history })
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.word) { full += data.word; setStreamingText(full) }
            if (data.done) {
              setMessages(prev => [...prev, { role: 'assistant', content: full }])
              setStreamingText('')
              setLoading(false)
            }
          } catch {}
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection error. Is the API running?'
      }])
      setLoading(false)
      setStreamingText('')
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const suggestions = [
    'What do you remember about me?',
    'What patterns do you see?',
    'Summarize my workspace',
    'What tasks are outstanding?',
    'What risks have been identified?',
  ]

  const allMessages = streamingText
    ? [...messages, { role: 'assistant', content: streamingText, streaming: true }]
    : messages

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
        padding: 20, pointerEvents: 'none'
      }}>
        <div className="fade-in" style={{
          width: 420, height: '70vh',
          background: 'var(--surface)',
          border: '1px solid var(--accent)',
          borderRadius: 16,
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(124,106,247,0.25)',
          overflow: 'hidden', pointerEvents: 'all'
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(124,106,247,0.05)'
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(124,106,247,0.2)',
              border: '1px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: 'var(--accent)'
            }}>✦</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>
                The Weaver
              </div>
              <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
                color: weaverOnline === false ? 'var(--coral)' : 'var(--accent)'
              }}>
                {loading ? '⟳ thinking...'
                  : weaverOnline === false ? '● offline on demo — run locally for AI'
                  : weaverOnline === true  ? '● online · remembers everything'
                  : '● checking...'}
              </div>
            </div>

            <button onClick={() => setShowMemory(true)} style={{
              background: 'none', border: '1px solid var(--border)',
              borderRadius: 6, color: 'var(--dim)',
              cursor: 'pointer', fontSize: 11,
              padding: '3px 8px', fontFamily: 'Syne, sans-serif',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--dim)' }}
            >✦ memory</button>

            <button onClick={onClose} style={{
              background: 'none', border: 'none',
              color: 'var(--dim)', cursor: 'pointer',
              fontSize: 16, padding: '2px 6px', transition: 'color 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--dim)'}
            >✕</button>
          </div>

          {/* Offline banner */}
          {weaverOnline === false && (
            <div style={{
              padding: '8px 14px',
              background: 'rgba(248,113,113,0.08)',
              borderBottom: '1px solid rgba(248,113,113,0.2)',
              fontSize: 11, color: 'var(--coral)', lineHeight: 1.5
            }}>
              AI is offline on the live demo. Canvas, graph, timeline, map and all other features work fully.
              <a href="https://github.com/Geoffrey-Karanja/loom" target="_blank"
                style={{ color: 'var(--accent)', marginLeft: 4 }}>
                Run locally for full AI →
              </a>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
            {allMessages.map((msg, i) => (
              <div key={i} style={{
                marginBottom: 14, display: 'flex', flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                {msg.role === 'assistant' && (
                  <div style={{
                    fontSize: 10, color: 'var(--accent)',
                    fontFamily: 'JetBrains Mono, monospace',
                    marginBottom: 4, paddingLeft: 2
                  }}>✦ Weaver</div>
                )}
                <div style={{
                  maxWidth: '88%', padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  background: msg.role === 'user' ? 'rgba(124,106,247,0.2)' : 'var(--muted)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(124,106,247,0.3)' : 'var(--border)'}`,
                  fontSize: 13, color: 'var(--text)',
                  lineHeight: 1.6, fontFamily: 'Syne, sans-serif',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.content}
                  {msg.streaming && (
                    <span style={{
                      display: 'inline-block', width: 2, height: 14,
                      background: 'var(--accent)', marginLeft: 2,
                      animation: 'pulse-glow 0.8s ease-in-out infinite',
                      verticalAlign: 'middle'
                    }} />
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div style={{ padding: '0 12px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => setInput(s)} style={{
                  padding: '4px 10px', background: 'var(--muted)',
                  border: '1px solid var(--border)', borderRadius: 20,
                  color: 'var(--dim)', cursor: 'pointer', fontSize: 11,
                  fontFamily: 'Syne, sans-serif', transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--dim)' }}
                >{s}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid var(--border)',
            display: 'flex', gap: 8, alignItems: 'flex-end'
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask the Weaver anything... (Enter to send)"
              rows={1}
              style={{
                flex: 1, background: 'var(--muted)',
                border: '1px solid var(--border)',
                borderRadius: 8, padding: '8px 12px',
                color: 'var(--text)', fontSize: 13,
                fontFamily: 'Syne, sans-serif',
                outline: 'none', resize: 'none',
                lineHeight: 1.5, maxHeight: 80,
                transition: 'border-color 0.15s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button onClick={send} disabled={loading || !input.trim()} style={{
              width: 36, height: 36, borderRadius: 8,
              background: input.trim() && !loading ? 'var(--accent)' : 'var(--muted)',
              border: 'none', color: 'white',
              cursor: input.trim() && !loading ? 'pointer' : 'default',
              fontSize: 16, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>↑</button>
          </div>
        </div>
      </div>

      {showMemory && <MemoryPanel onClose={() => setShowMemory(false)} />}
    </>
  )
}
