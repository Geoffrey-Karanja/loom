import { useState, useCallback } from 'react'

export function useCanvas(initial = { x: 0, y: 0, scale: 1 }) {
  const [offset, setOffset] = useState({ x: initial.x, y: initial.y })
  const [scale, setScale] = useState(initial.scale)

  const zoom = useCallback((delta, origin = null) => {
    setScale(s => {
      const next = Math.min(Math.max(s * delta, 0.2), 4)
      return next
    })
  }, [])

  const pan = useCallback((dx, dy) => {
    setOffset(o => ({ x: o.x + dx, y: o.y + dy }))
  }, [])

  const reset = useCallback(() => {
    setOffset({ x: 0, y: 0 })
    setScale(1)
  }, [])

  const toWorld = useCallback((screenX, screenY, rect) => ({
    x: (screenX - rect.left - offset.x) / scale,
    y: (screenY - rect.top  - offset.y) / scale
  }), [offset, scale])

  return { offset, scale, zoom, pan, reset, toWorld, setOffset, setScale }
}
