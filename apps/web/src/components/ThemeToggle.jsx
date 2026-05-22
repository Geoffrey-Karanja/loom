import React from 'react'
import { useTheme } from '../hooks/useTheme.js'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        width: 32, height: 32,
        borderRadius: 6,
        border: '1px solid var(--border)',
        background: 'var(--muted)',
        color: 'var(--dim)',
        cursor: 'pointer',
        fontSize: 15,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
        flexShrink: 0
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--accent)'
        e.currentTarget.style.color = 'var(--text)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.color = 'var(--dim)'
      }}
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  )
}
