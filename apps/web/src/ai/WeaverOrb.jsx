import React, { useState, useEffect } from 'react'
import WeaverChat from './WeaverChat.jsx'

const WHISPERS = [
  'I am watching your canvas...',
  'I found a pattern across your nodes.',
  'Something connects here...',
  'Ask me anything about your workspace.',
  'I have been reading your thoughts.',
  'New connections detected.',
  'Your knowledge graph is growing.',
  'I sense a risk in your notes.',
  'Ready to weave.',
  'Type anything. I am listening.',
]

export default function WeaverOrb() {
  const [showChat, setShowChat] = useState(false)
  const [whisper, setWhisper] = useState(WHISPERS[0])
  const [showWhisper, setShowWhisper] = useState(false)
  const [pulse, setPulse] = useState(false)
  const [hovered, setHovered] = useState(false)

  // Rotate whispers periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const next = WHISPERS[Math.floor(Math.random() * WHISPERS.length)]
      setWhisper(next)
      setShowWhisper(true)
      setPulse(true)
      setTimeout(() => setShowWhisper(false), 4000)
      setTimeout(() => setPulse(false), 1000)
    }, 12000)

    // Show first whisper after 3s
    const first = setTimeout(() => {
      setShowWhisper(true)
      setPulse(true)
      setTimeout(() => setShowWhisper(false), 4000)
      setTimeout(() => setPulse(false), 1000)
    }, 3000)

    return () => { clearInterval(interval); clearTimeout(first) }
  }, [])

  return (
    <>
      {/* Whisper bubble */}
      {showWhisper && !showChat && (
        <div
          onClick={() => setShowChat(true)}
          style={{
            position: 'fixed',
            bottom: 88, right: 24,
            background: 'var(--surface)',
            border: '1px solid var(--accent)',
            borderRadius: '12px 12px 4px 12px',
            padding: '8px 14px',
            fontSize: 12,
            color: 'var(--text)',
            fontFamily: 'Syne, sans-serif',
            maxWidth: 220,
            lineHeight: 1.5,
            cursor: 'pointer',
            zIndex: 998,
            boxShadow: '0 4px 24px rgba(124,106,247,0.2)',
            animation: 'fadeSlideIn 0.3s ease forwards',
          }}
        >
          <span style={{ color: 'var(--accent)', marginRight: 6 }}>✦</span>
          {whisper}
          <div style={{
            fontSize: 10, color: 'var(--dim)',
            marginTop: 4, textAlign: 'right'
          }}>click to chat</div>
        </div>
      )}

      {/* The Orb */}
      <div
        onClick={() => setShowChat(s => !s)}
        onMouseEnter={() => { setHovered(true); setShowWhisper(true) }}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'fixed',
          bottom: 24, right: 24,
          width: 52, height: 52,
          borderRadius: '50%',
          background: showChat
            ? 'var(--accent)'
            : 'radial-gradient(circle at 35% 35%, rgba(167,139,250,0.9), rgba(124,106,247,0.6))',
          border: `2px solid ${showChat ? 'var(--glow)' : 'rgba(124,106,247,0.5)'}`,
          cursor: 'pointer',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: pulse || hovered
            ? '0 0 0 8px rgba(124,106,247,0.15), 0 0 32px rgba(124,106,247,0.4)'
            : '0 0 0 4px rgba(124,106,247,0.08), 0 4px 20px rgba(124,106,247,0.2)',
          transition: 'all 0.3s ease',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
          animation: pulse ? 'orbPulse 0.6s ease' : 'orbFloat 4s ease-in-out infinite',
        }}
      >
        {/* Inner symbol */}
        <span style={{
          fontSize: showChat ? 20 : 18,
          color: 'white',
          transition: 'all 0.3s',
          userSelect: 'none',
          lineHeight: 1
        }}>
          {showChat ? '✕' : '✦'}
        </span>

        {/* Ripple ring */}
        {!showChat && (
          <div style={{
            position: 'absolute',
            width: '100%', height: '100%',
            borderRadius: '50%',
            border: '2px solid rgba(124,106,247,0.3)',
            animation: 'orbRipple 2.5s ease-out infinite',
            pointerEvents: 'none'
          }} />
        )}
      </div>

      {/* Orb label */}
      {!showChat && hovered && (
        <div style={{
          position: 'fixed',
          bottom: 30, right: 84,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: '4px 10px',
          fontSize: 11,
          color: 'var(--text)',
          fontFamily: 'Syne, sans-serif',
          fontWeight: 600,
          zIndex: 999,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          animation: 'fadeSlideIn 0.15s ease forwards'
        }}>
          The Weaver · AI
        </div>
      )}

      {/* Chat */}
      {showChat && <WeaverChat onClose={() => setShowChat(false)} />}

      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-4px); }
        }
        @keyframes orbPulse {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes orbRipple {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </>
  )
}
