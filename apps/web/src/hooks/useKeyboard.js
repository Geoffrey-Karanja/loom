import { useEffect } from 'react'

export function useKeyboard(keyMap) {
  useEffect(() => {
    const handler = (e) => {
      const key = [
        e.ctrlKey && 'ctrl',
        e.metaKey && 'meta',
        e.shiftKey && 'shift',
        e.altKey && 'alt',
        e.key.toLowerCase()
      ].filter(Boolean).join('+')

      if (keyMap[key]) {
        e.preventDefault()
        keyMap[key](e)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [keyMap])
}
