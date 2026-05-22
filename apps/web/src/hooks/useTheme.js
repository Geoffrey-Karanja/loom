import { useState, useEffect } from 'react'

const THEMES = {
  dark: {
    '--bg':      '#0a0a0f',
    '--surface': '#111118',
    '--border':  '#1e1e2e',
    '--muted':   '#2a2a3d',
    '--text':    '#e2e2f0',
    '--dim':     '#6b6b8a',
    '--accent':  '#7c6af7',
    '--glow':    '#a78bfa',
    '--teal':    '#2dd4bf',
    '--coral':   '#f87171',
    '--amber':   '#fbbf24',
  },
  light: {
    '--bg':      '#f4f4f8',
    '--surface': '#ffffff',
    '--border':  '#e2e2ec',
    '--muted':   '#f0f0f6',
    '--text':    '#1a1a2e',
    '--dim':     '#8888a8',
    '--accent':  '#6254e8',
    '--glow':    '#7c6af7',
    '--teal':    '#0d9488',
    '--coral':   '#dc2626',
    '--amber':   '#d97706',
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('loom-theme') || 'dark'
  )

  useEffect(() => {
    const root = document.documentElement
    const vars = THEMES[theme] || THEMES.dark
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
    localStorage.setItem('loom-theme', theme)
    document.body.style.background = vars['--bg']
  }, [theme])

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return { theme, toggle }
}
