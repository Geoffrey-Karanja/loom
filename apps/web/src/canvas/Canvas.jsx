import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useLoomStore } from '../store/index.js'
import { useTouch } from '../hooks/useTouch.js'
import LoomNode from './LoomNode.jsx'
import EdgeLayer from './EdgeLayer.jsx'

export default function Canvas() {
  const { nodes, edges, createNode, setSelectedNode, selectedNode, createEdge } = useLoomStore()
  const canvasRef = useRef(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState(null)
  const [connectMode, setConnectMode] = useState(false)
  const [connectSource, setConnectSource] = useState(null)

  // Mouse pan
  const onMouseDown = useCallback((e) => {
    if (e.target !== canvasRef.current && !e.target.classList.contains('canvas-bg')) return
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
      e.preventDefault()
    }
    if (e.button === 0 && !e.altKey) setSelectedNode(null)
  }, [offset, setSelectedNode])

  const onMouseMove = useCallback((e) => {
    if (!isPanning || !panStart) return
    setOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
  }, [isPanning, panStart])

  const onMouseUp = useCallback(() => {
    setIsPanning(false)
    setPanStart(null)
  }, [])

  // Scroll zoom
  const onWheel = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale(s => Math.min(Math.max(s * delta, 0.2), 4))
  }, [])

  // Double click to create
  const onDoubleClick = useCallback(async (e) => {
    if (e.target !== canvasRef.current && !e.target.classList.contains('canvas-bg')) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - offset.x) / scale
    const y = (e.clientY - rect.top  - offset.y) / scale
    await createNode({ type: 'document', title: 'New Node', content: '', position: { x, y } })
  }, [offset, scale, createNode])

  // Touch handlers
  const { onTouchStart, onTouchMove, onTouchEnd } = useTouch({
    onPan: ({ dx, dy }) => {
      setOffset(o => ({ x: o.x + dx, y: o.y + dy }))
    },
    onZoom: ({ scale: delta }) => {
      setScale(s => Math.min(Math.max(s * delta, 0.2), 4))
    },
    onDoubleTap: async ({ x, y, target }) => {
      if (target !== canvasRef.current && !target.classList.contains('canvas-bg')) return
      const rect = canvasRef.current.getBoundingClientRect()
      const wx = (x - rect.left - offset.x) / scale
      const wy = (y - rect.top  - offset.y) / scale
      await createNode({ type: 'document', title: 'New Node', content: '', position: { x: wx, y: wy } })
    },
    onTap: ({ target }) => {
      if (target === canvasRef.current || target.classList.contains('canvas-bg')) {
        setSelectedNode(null)
      }
    }
  })

  // Connect mode
  const handleNodeConnectClick = useCallback(async (nodeId) => {
    if (!connectMode) return
    if (!connectSource) {
      setConnectSource(nodeId)
    } else {
      if (connectSource !== nodeId) await createEdge(connectSource, nodeId, 'relates to')
      setConnectSource(null)
      setConnectMode(false)
    }
  }, [connectMode, connectSource, createEdge])

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchmove', onTouchMove)
    }
  }, [onWheel, onTouchMove])

  return (
    <div
      ref={canvasRef}
      className="canvas-bg"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onDoubleClick={onDoubleClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        width: '100%', height: '100%',
        position: 'relative', overflow: 'hidden',
        cursor: isPanning ? 'grabbing' : connectMode ? 'crosshair' : 'default',
        background: 'var(--bg)',
        backgroundImage: `radial-gradient(circle, var(--muted) 1px, transparent 1px)`,
        backgroundSize: `${28 * scale}px ${28 * scale}px`,
        backgroundPosition: `${offset.x}px ${offset.y}px`,
        userSelect: 'none',
        touchAction: 'none'
      }}
    >
      {/* Edges */}
      <div style={{
        position: 'absolute',
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        transformOrigin: '0 0', width: 0, height: 0
      }}>
        <EdgeLayer nodes={nodes} edges={edges} />
      </div>

      {/* Nodes */}
      <div style={{
        position: 'absolute',
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        transformOrigin: '0 0', width: 0, height: 0
      }}>
        {nodes.map(node => (
          <LoomNode
            key={node.id}
            node={node}
            selected={selectedNode?.id === node.id}
            scale={scale}
            connectMode={connectMode}
            isConnectSource={connectSource === node.id}
            onConnectClick={handleNodeConnectClick}
          />
        ))}
      </div>

      {/* Toolbar */}
      <div style={{
        position: 'absolute', bottom: 20, right: 88,
        display: 'flex', flexDirection: 'column', gap: 6
      }}>
        {[
          { label: '+', action: () => setScale(s => Math.min(s * 1.2, 4)),  title: 'Zoom in' },
          { label: '−', action: () => setScale(s => Math.max(s * 0.8, 0.2)), title: 'Zoom out' },
          { label: '⊙', action: () => { setScale(1); setOffset({ x: 0, y: 0 }) }, title: 'Reset' },
        ].map(({ label, action, title }) => (
          <button key={label} onClick={action} title={title} style={{
            width: 36, height: 36,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--text)',
            cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>{label}</button>
        ))}

        <button
          onClick={() => { setConnectMode(m => !m); setConnectSource(null) }}
          title="Connect nodes"
          style={{
            width: 36, height: 36,
            background: connectMode ? 'var(--accent)' : 'var(--surface)',
            border: `1px solid ${connectMode ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 8,
            color: connectMode ? 'white' : 'var(--dim)',
            cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>⌀</button>
      </div>

      {/* Connect mode banner */}
      {connectMode && (
        <div className="fade-in" style={{
          position: 'absolute', top: 16, left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--accent)', color: 'white',
          padding: '6px 16px', borderRadius: 20,
          fontSize: 12, fontWeight: 600,
          fontFamily: 'Syne, sans-serif', pointerEvents: 'none'
        }}>
          {connectSource ? '✦ Now tap the target node' : '⌀ Tap source node to connect'}
        </div>
      )}

      {/* Empty hint */}
      {nodes.length === 0 && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center', pointerEvents: 'none', padding: '0 24px'
        }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>⌬</div>
          <div style={{ color: 'var(--dim)', fontSize: 14 }}>
            Double-click or double-tap to create a node
          </div>
          <div style={{ color: 'var(--dim)', fontSize: 12, marginTop: 6, opacity: 0.6 }}>
            Pinch to zoom · Drag to pan · Right-click for options
          </div>
        </div>
      )}

      {/* Scale indicator */}
      <div style={{
        position: 'absolute', bottom: 20, left: 20,
        color: 'var(--dim)', fontSize: 11,
        fontFamily: 'JetBrains Mono, monospace'
      }}>{Math.round(scale * 100)}%</div>
    </div>
  )
}
