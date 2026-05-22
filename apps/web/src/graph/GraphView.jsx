import React, { useEffect, useRef, useState, useCallback } from 'react'
import cytoscape from 'cytoscape'
import { useLoomStore } from '../store/index.js'
import { toCytoscapeElements, NODE_COLORS, edgeColor } from './graphUtils.js'
import GraphControls from './GraphControls.jsx'
import GraphSidebar from './GraphSidebar.jsx'

export default function GraphView() {
  const { nodes, edges, selectedNode, setSelectedNode, setActiveView, weaverInsights, getInsights } = useLoomStore()
  const containerRef = useRef(null)
  const cyRef = useRef(null)
  const [selectedEl, setSelectedEl] = useState(null)
  const [layout, setLayout] = useState('cose')
  const [hoveredNode, setHoveredNode] = useState(null)

  // Build cytoscape instance
  useEffect(() => {
    if (!containerRef.current) return

    const elements = toCytoscapeElements(nodes, edges)

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        // Base node style
        {
          selector: 'node',
          style: {
            'background-color': 'ele => ele.data("color")',
            'label': 'data(label)',
            'color': '#e2e2f0',
            'font-size': '11px',
            'font-family': 'Syne, sans-serif',
            'font-weight': '600',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': '6px',
            'text-outline-width': '2px',
            'text-outline-color': '#0a0a0f',
            'width': 'mapData(weight, 1, 10, 28, 64)',
            'height': 'mapData(weight, 1, 10, 28, 64)',
            'border-width': '2px',
            'border-color': 'ele => ele.data("color")',
            'border-opacity': '0.6',
            'background-opacity': '0.85',
            'transition-property': 'background-color, border-color, width, height',
            'transition-duration': '0.2s',
            'shadow-blur': '12',
            'shadow-color': 'ele => ele.data("color")',
            'shadow-opacity': '0.3',
            'shadow-offset-x': '0',
            'shadow-offset-y': '0',
          }
        },
        // Selected node
        {
          selector: 'node:selected',
          style: {
            'border-width': '3px',
            'border-opacity': '1',
            'background-opacity': '1',
          }
        },
        // Hovered node
        {
          selector: 'node.hovered',
          style: {
            'border-width': '3px',
            'border-opacity': '1',
          }
        },
        // Edges
        {
          selector: 'edge',
          style: {
            'width': 'mapData(weight, 1, 5, 1, 4)',
            'line-color': 'rgba(124,106,247,0.3)',
            'target-arrow-color': 'rgba(124,106,247,0.5)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '9px',
            'color': '#6b6b8a',
            'font-family': 'JetBrains Mono, monospace',
            'text-background-color': '#0a0a0f',
            'text-background-opacity': '0.8',
            'text-background-padding': '2px',
            'opacity': '0.7',
            'transition-property': 'opacity, line-color',
            'transition-duration': '0.2s',
          }
        },
        // Selected edge
        {
          selector: 'edge:selected',
          style: {
            'line-color': 'rgba(124,106,247,0.8)',
            'opacity': '1',
          }
        },
        // Dimmed (when something is selected)
        {
          selector: 'node.dimmed, edge.dimmed',
          style: { 'opacity': '0.15' }
        }
      ],
      layout: {
        name: layout,
        animate: true,
        animationDuration: 500,
        padding: 60,
        nodeRepulsion: 8000,
        idealEdgeLength: 120,
        edgeElasticity: 0.45,
        gravity: 0.25,
        numIter: 1000,
        randomize: false,
      },
      wheelSensitivity: 0.3,
      minZoom: 0.2,
      maxZoom: 4,
    })

    // Fix: set node colors after init since cytoscape doesn't eval functions in style
    cy.nodes().forEach(n => {
      const color = NODE_COLORS[n.data('type')] || NODE_COLORS.default
      n.style({ 'background-color': color, 'border-color': color, 'shadow-color': color })
    })

    // Node click
    cy.on('tap', 'node', (e) => {
      const node = e.target
      setSelectedEl({ type: 'node', data: node.data() })

      // Dim everything else
      cy.elements().addClass('dimmed')
      node.removeClass('dimmed')
      node.connectedEdges().removeClass('dimmed')
      node.connectedEdges().connectedNodes().removeClass('dimmed')
    })

    // Edge click
    cy.on('tap', 'edge', (e) => {
      setSelectedEl({ type: 'edge', data: e.target.data() })
    })

    // Background click — reset
    cy.on('tap', (e) => {
      if (e.target === cy) {
        cy.elements().removeClass('dimmed')
        setSelectedEl(null)
      }
    })

    // Hover
    cy.on('mouseover', 'node', (e) => {
      e.target.addClass('hovered')
      setHoveredNode(e.target.data())
      containerRef.current.style.cursor = 'pointer'
    })

    cy.on('mouseout', 'node', (e) => {
      e.target.removeClass('hovered')
      setHoveredNode(null)
      containerRef.current.style.cursor = 'default'
    })

    cyRef.current = cy

    return () => {
      cy.destroy()
      cyRef.current = null
    }
  }, [nodes, edges])

  // Re-run layout when layout changes
  useEffect(() => {
    if (!cyRef.current) return
    cyRef.current.layout({
      name: layout,
      animate: true,
      animationDuration: 600,
      padding: 60,
      nodeRepulsion: 8000,
      idealEdgeLength: 120,
      gravity: 0.25,
    }).run()
  }, [layout])

  // Jump to canvas node
  const handleJumpToCanvas = useCallback(() => {
    if (!selectedEl || selectedEl.type !== 'node') return
    const node = nodes.find(n => n.id === selectedEl.data.id)
    if (node) {
      setSelectedNode(node)
      setActiveView('canvas')
    }
  }, [selectedEl, nodes, setSelectedNode, setActiveView])

  // Fit graph
  const handleFit = () => cyRef.current?.fit(undefined, 60)

  // Center on selected
  const handleCenter = () => {
    if (!selectedEl) return
    cyRef.current?.getElementById(selectedEl.data.id).select()
    cyRef.current?.center(cyRef.current.getElementById(selectedEl.data.id))
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: 'var(--bg)' }}>

      {/* Graph canvas */}
      <div ref={containerRef} style={{ flex: 1, height: '100%' }} />

      {/* Controls */}
      <GraphControls
        layout={layout}
        setLayout={setLayout}
        onFit={handleFit}
        onResonate={getInsights}
        nodeCount={nodes.length}
        edgeCount={edges.length}
      />

      {/* Sidebar - selected element info */}
      <GraphSidebar
        selectedEl={selectedEl}
        nodes={nodes}
        edges={edges}
        insights={weaverInsights}
        onJumpToCanvas={handleJumpToCanvas}
      />

      {/* Hover tooltip */}
      {hoveredNode && (
        <div style={{
          position: 'absolute', bottom: 24, left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8, padding: '6px 14px',
          fontSize: 12, color: 'var(--text)',
          fontFamily: 'Syne, sans-serif',
          pointerEvents: 'none',
          display: 'flex', gap: 10, alignItems: 'center'
        }}>
          <span style={{ color: NODE_COLORS[hoveredNode.type] }}>●</span>
          <strong>{hoveredNode.label}</strong>
          <span style={{ color: 'var(--dim)' }}>{hoveredNode.type}</span>
          <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
            {hoveredNode.objectCount} objects
          </span>
        </div>
      )}

      {/* Empty state */}
      {nodes.length === 0 && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          textAlign: 'center', pointerEvents: 'none'
        }}>
          <div style={{ fontSize: 48, opacity: 0.15, marginBottom: 12 }}>◈</div>
          <div style={{ color: 'var(--dim)', fontSize: 14 }}>No nodes yet — create some on the Canvas</div>
        </div>
      )}
    </div>
  )
}
