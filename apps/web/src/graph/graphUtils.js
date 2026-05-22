// Map node types to colors
export const NODE_COLORS = {
  document: '#7c6af7',
  task:     '#2dd4bf',
  idea:     '#fbbf24',
  data:     '#f87171',
  default:  '#6b6b8a'
}

export const NODE_ICONS = {
  document: '▤',
  task:     '◻',
  idea:     '◈',
  data:     '⊞'
}

// Convert loom nodes+edges to cytoscape elements
export function toCytoscapeElements(nodes, edges) {
  const cyNodes = nodes.map(n => ({
    data: {
      id: n.id,
      label: n.title || 'Untitled',
      type: n.type || 'document',
      weight: (n.objects?.length || 0) + 1,
      objectCount: n.objects?.length || 0,
      color: NODE_COLORS[n.type] || NODE_COLORS.default,
      createdAt: n.createdAt
    }
  }))

  const cyEdges = edges.map(e => ({
    data: {
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label || '',
      weight: e.weight || 1,
      sentiment: e.sentiment || 'neutral'
    }
  }))

  return [...cyNodes, ...cyEdges]
}

// Sentiment to edge color
export function edgeColor(sentiment) {
  switch (sentiment) {
    case 'positive': return '#2dd4bf'
    case 'negative': return '#f87171'
    default:         return 'rgba(124,106,247,0.4)'
  }
}
