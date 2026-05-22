import { getDB } from '../db/index.js'

// Find shortest path between two nodes (BFS)
export function shortestPath(sourceId, targetId) {
  const db = getDB()
  const edges = db.data.edges
  const nodes = db.data.nodes

  const adj = {}
  nodes.forEach(n => adj[n.id] = [])
  edges.forEach(e => {
    if (adj[e.source]) adj[e.source].push(e.target)
    if (adj[e.target]) adj[e.target].push(e.source)
  })

  const visited = new Set()
  const queue = [[sourceId, [sourceId]]]

  while (queue.length) {
    const [current, path] = queue.shift()
    if (current === targetId) return path
    if (visited.has(current)) continue
    visited.add(current)
    for (const neighbor of (adj[current] || [])) {
      if (!visited.has(neighbor)) queue.push([neighbor, [...path, neighbor]])
    }
  }
  return null
}

// Find clusters of connected nodes
export function detectClusters() {
  const db = getDB()
  const nodes = db.data.nodes
  const edges = db.data.edges

  const adj = {}
  nodes.forEach(n => adj[n.id] = new Set())
  edges.forEach(e => {
    adj[e.source]?.add(e.target)
    adj[e.target]?.add(e.source)
  })

  const visited = new Set()
  const clusters = []

  const dfs = (nodeId, cluster) => {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    cluster.push(nodeId)
    for (const neighbor of (adj[nodeId] || [])) dfs(neighbor, cluster)
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      const cluster = []
      dfs(node.id, cluster)
      clusters.push(cluster)
    }
  }

  return clusters.map(cluster => ({
    size: cluster.length,
    nodes: cluster.map(id => nodes.find(n => n.id === id)).filter(Boolean),
    density: cluster.length > 1
      ? edges.filter(e => cluster.includes(e.source) && cluster.includes(e.target)).length /
        (cluster.length * (cluster.length - 1) / 2)
      : 0
  }))
}

// Get most connected nodes (hubs)
export function getHubs(limit = 5) {
  const db = getDB()
  const degree = {}
  db.data.nodes.forEach(n => degree[n.id] = 0)
  db.data.edges.forEach(e => {
    if (degree[e.source] !== undefined) degree[e.source]++
    if (degree[e.target] !== undefined) degree[e.target]++
  })

  return db.data.nodes
    .map(n => ({ ...n, degree: degree[n.id] || 0 }))
    .sort((a, b) => b.degree - a.degree)
    .slice(0, limit)
}

// Get isolated nodes (no connections)
export function getIsolatedNodes() {
  const db = getDB()
  const connected = new Set()
  db.data.edges.forEach(e => { connected.add(e.source); connected.add(e.target) })
  return db.data.nodes.filter(n => !connected.has(n.id))
}

// Graph stats
export function getGraphStats() {
  const db = getDB()
  const nodes = db.data.nodes
  const edges = db.data.edges
  const clusters = detectClusters()
  const hubs = getHubs(3)
  const isolated = getIsolatedNodes()

  return {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    clusterCount: clusters.length,
    largestCluster: Math.max(...clusters.map(c => c.size), 0),
    isolatedCount: isolated.length,
    density: nodes.length > 1
      ? edges.length / (nodes.length * (nodes.length - 1) / 2)
      : 0,
    hubs: hubs.map(h => ({ id: h.id, title: h.title, degree: h.degree })),
    avgDegree: nodes.length > 0
      ? (edges.length * 2) / nodes.length
      : 0
  }
}
