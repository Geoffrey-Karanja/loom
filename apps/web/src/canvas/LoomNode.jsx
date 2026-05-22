import React, { useRef, useState, useCallback } from 'react'
import { useLoomStore } from '../store/index.js'
import NodeEditor from '../editor/NodeEditor.jsx'
import ContextMenu from './ContextMenu.jsx'

const TYPE_META = {
  document: { icon: '▤', color: 'var(--accent)' },
  task:     { icon: '◻', color: 'var(--teal)' },
  idea:     { icon: '◈', color: 'var(--amber)' },
  data:     { icon: '⊞', color: 'var(--coral)' },
}

export default function LoomNode({ node, selected, scale, connectMode, isConnectSource, onConnectClick, onAskWeaver }) {
  const { setSelectedNode, updateNode, deleteNode, createNode } = useLoomStore()
  const nodeRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [pos, setPos] = useState(node.position || { x: 0, y: 0 })
  const [contextMenu, setContextMenu] = useState(null)
  const meta = TYPE_META[node.type] || TYPE_META.document

  const onMouseDown = useCallback((e) => {
    if (e.target.closest('.node-editor')) return
    if (connectMode) { onConnectClick(node.id); return }
    e.stopPropagation()
    setSelectedNode(node)
    setDragging(true)
    setDragStart({ mx: e.clientX, my: e.clientY, nx: pos.x, ny: pos.y })
  }, [pos, node, setSelectedNode, connectMode, onConnectClick])

  const onMouseMove = useCallback((e) => {
    if (!dragging || !dragStart) return
    const dx = (e.clientX - dragStart.mx) / scale
    const dy = (e.clientY - dragStart.my) / scale
    setPos({ x: dragStart.nx + dx, y: dragStart.ny + dy })
  }, [dragging, dragStart, scale])

  const onMouseUp = useCallback(() => {
    if (dragging) {
      updateNode(node.id, { position: pos })
      setDragging(false)
      setDragStart(null)
    }
  }, [dragging, pos, node.id, updateNode])

  const onContextMenu = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  const handleDuplicate = async () => {
    await createNode({
      type: node.type,
      title: `${node.title} (copy)`,
      content: node.content,
      position: { x: pos.x + 40, y: pos.y + 40 }
    })
  }

  const tagBg = {
    task:     { bg: 'rgba(124,106,247,0.15)', color: 'var(--glow)',  border: 'rgba(124,106,247,0.3)' },
    decision: { bg: 'rgba(45,212,191,0.15)',  color: 'var(--teal)',  border: 'rgba(45,212,191,0.3)' },
    question: { bg: 'rgba(251,191,36,0.15)',  color: 'var(--amber)', border: 'rgba(251,191,36,0.3)' },
    insight:  { bg: 'rgba(248,113,113,0.15)', color: 'var(--coral)', border: 'rgba(248,113,113,0.3)' },
    risk:     { bg: 'rgba(248,113,113,0.2)',  color: 'var(--coral)', border: 'rgba(248,113,113,0.4)' },
    person:   { bg: 'rgba(45,212,191,0.1)',   color: 'var(--teal)',  border: 'rgba(45,212,191,0.2)' },
  }

  return (
    <>
      <div
        ref={nodeRef}
        className={`loom-node${selected ? ' selected' : ''}${isConnectSource ? ' weaving' : ''}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onContextMenu={onContextMenu}
        style={{
          left: pos.x, top: pos.y,
          width: node.size?.w || 320,
          minHeight: node.size?.h || 200,
          cursor: connectMode ? 'crosshair' : dragging ? 'grabbing' : 'grab',
          zIndex: selected ? 10 : 1,
          position: 'absolute'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '10px 12px 8px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(0,0,0,0.2)'
        }}>
          <span style={{ color: meta.color, fontSize: 14 }}>{meta.icon}</span>
          <input
            defaultValue={node.title}
            onBlur={e => updateNode(node.id, { title: e.target.value })}
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: 13, fontWeight: 600,
              fontFamily: 'Syne, sans-serif', cursor: 'text'
            }}
          />
          <span style={{
            fontSize: 9, color: meta.color, opacity: 0.7,
            fontFamily: 'JetBrains Mono, monospace',
            textTransform: 'uppercase', letterSpacing: '0.06em'
          }}>{node.type}</span>
          <button
            onClick={(e) => { e.stopPropagation(); deleteNode(node.id) }}
            onMouseDown={e => e.stopPropagation()}
            title="Delete node"
            style={{
              background: 'none', border: 'none', color: 'var(--dim)',
              cursor: 'pointer', fontSize: 13, padding: '0 2px',
              opacity: 0.4, transition: 'all 0.15s', borderRadius: 3
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = 'var(--coral)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = 0.4; e.currentTarget.style.color = 'var(--dim)' }}
          >✕</button>
        </div>

        {/* Editor */}
        <div className="node-editor" onMouseDown={e => e.stopPropagation()}>
          <NodeEditor node={node} />
        </div>

        {/* Weaver objects */}
        {node.objects?.length > 0 && (
          <div style={{
            padding: '6px 10px 8px',
            borderTop: '1px solid var(--border)',
            display: 'flex', flexWrap: 'wrap', gap: 4,
            background: 'rgba(0,0,0,0.15)'
          }}>
            <div style={{
              width: '100%', fontSize: 10, color: 'var(--accent)',
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: 4, letterSpacing: '0.06em'
            }}>✦ weaver extracted</div>
            {node.objects.slice(0, 6).map((obj, i) => {
              const tc = tagBg[obj.type] || tagBg.insight
              return (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '2px 8px', borderRadius: 20,
                  fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                  background: tc.bg, color: tc.color,
                  border: `1px solid ${tc.border}`
                }}>
                  {obj.type}: {(obj.content || '').slice(0, 24)}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          node={node}
          onClose={() => setContextMenu(null)}
          onDelete={() => deleteNode(node.id)}
          onDuplicate={handleDuplicate}
          onOpenChat={() => onAskWeaver && onAskWeaver(node)}
        />
      )}
    </>
  )
}
