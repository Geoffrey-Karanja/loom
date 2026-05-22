import { useRef, useCallback } from 'react'

export function useTouch({ onPan, onZoom, onTap, onDoubleTap }) {
  const state = useRef({
    lastTap: 0,
    lastDist: null,
    lastCenter: null,
    panStart: null,
    touching: false
  })

  const getDistance = (t1, t2) => {
    const dx = t1.clientX - t2.clientX
    const dy = t1.clientY - t2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getCenter = (t1, t2) => ({
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2
  })

  const onTouchStart = useCallback((e) => {
    state.current.touching = true

    if (e.touches.length === 1) {
      const touch = e.touches[0]
      state.current.panStart = { x: touch.clientX, y: touch.clientY }

      // Double tap detection
      const now = Date.now()
      if (now - state.current.lastTap < 300) {
        onDoubleTap?.({ x: touch.clientX, y: touch.clientY, target: e.target })
      }
      state.current.lastTap = now
    }

    if (e.touches.length === 2) {
      state.current.lastDist = getDistance(e.touches[0], e.touches[1])
      state.current.lastCenter = getCenter(e.touches[0], e.touches[1])
      state.current.panStart = null
    }
  }, [onDoubleTap])

  const onTouchMove = useCallback((e) => {
    e.preventDefault()

    if (e.touches.length === 1 && state.current.panStart) {
      const touch = e.touches[0]
      const dx = touch.clientX - state.current.panStart.x
      const dy = touch.clientY - state.current.panStart.y
      state.current.panStart = { x: touch.clientX, y: touch.clientY }
      onPan?.({ dx, dy })
    }

    if (e.touches.length === 2) {
      const dist = getDistance(e.touches[0], e.touches[1])
      const center = getCenter(e.touches[0], e.touches[1])

      if (state.current.lastDist) {
        const scale = dist / state.current.lastDist
        onZoom?.({ scale, center })
      }

      if (state.current.lastCenter) {
        const dx = center.x - state.current.lastCenter.x
        const dy = center.y - state.current.lastCenter.y
        onPan?.({ dx, dy })
      }

      state.current.lastDist = dist
      state.current.lastCenter = center
    }
  }, [onPan, onZoom])

  const onTouchEnd = useCallback((e) => {
    if (e.touches.length === 0) {
      state.current.lastDist = null
      state.current.lastCenter = null
      state.current.touching = false

      if (state.current.panStart) {
        onTap?.({ target: e.target })
        state.current.panStart = null
      }
    }
  }, [onTap])

  return { onTouchStart, onTouchMove, onTouchEnd }
}
