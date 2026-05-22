import { getDB } from '../db/index.js'

export function fullTextSearch(query) {
  if (!query?.trim()) return { nodes: [], objects: [] }
  const q = query.toLowerCase()
  const db = getDB()

  const nodes = db.data.nodes
    .filter(n =>
      n.title?.toLowerCase().includes(q) ||
      n.content?.replace(/<[^>]*>/g, '').toLowerCase().includes(q)
    )
    .map(n => ({
      id: n.id, title: n.title, type: n.type,
      excerpt: n.content?.replace(/<[^>]*>/g, '').slice(0, 120),
      score: n.title?.toLowerCase().includes(q) ? 2 : 1
    }))
    .sort((a, b) => b.score - a.score)

  const objects = db.data.objects
    .filter(o => o.content?.toLowerCase().includes(q))
    .map(o => ({
      ...o,
      nodeTitle: db.data.nodes.find(n => n.id === o.nodeId)?.title || 'Unknown'
    }))

  return { nodes, objects }
}
