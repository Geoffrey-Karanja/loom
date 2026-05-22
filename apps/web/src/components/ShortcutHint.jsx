import React, { useState } from 'react'
import ShortcutCheatsheet from './ShortcutCheatsheet.jsx'

export default function ShortcutHint() {
  const [show, setShow] = useState(false)
  return (
    <>
      <div className="shortcut-hint" onClick={() => setShow(true)}>
        <kbd style={{
          fontSize: 10, background: 'var(--muted)',
          border: '1px solid var(--border)',
          borderRadius: 4, padding: '1px 5px',
          fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--dim)'
        }}>?</kbd>
        shortcuts
      </div>
      {show && <ShortcutCheatsheet onClose={() => setShow(false)} />}
    </>
  )
}
