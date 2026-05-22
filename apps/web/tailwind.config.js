export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        loom: {
          bg:      '#0a0a0f',
          surface: '#111118',
          border:  '#1e1e2e',
          muted:   '#2a2a3d',
          text:    '#e2e2f0',
          dim:     '#6b6b8a',
          accent:  '#7c6af7',
          glow:    '#a78bfa',
          teal:    '#2dd4bf',
          coral:   '#f87171',
          amber:   '#fbbf24'
        }
      },
      fontFamily: {
        sans:    ['Syne', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: []
}
