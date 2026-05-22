import { randomUUID } from 'crypto'
import { getDB } from '../db/index.js'

export function getAllNodes() {
  return getDB().data.nodes
}

export function getNodeById(id) {
  return getDB().data.nodes.find(n => n.id === id) || null
}

export async function createNode(data) {
  const db = getDB()
  const node = {
    id: randomUUID(),
    type: data.type || 'document',
    title: data.title || 'Untitled',
    content: data.content || '',
    position: data.position || { x: 0, y: 0 },
    size: data.size || { w: 320, h: 200 },
    objects: [],
    tags: data.tags || [],
    geo: data.geo || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  db.data.nodes.push(node)
  await db.write()
  return node
}

export async function updateNode(id, data) {
  const db = getDB()
  const idx = db.data.nodes.findIndex(n => n.id === id)
  if (idx === -1) return null
  db.data.nodes[idx] = { ...db.data.nodes[idx], ...data, updatedAt: new Date().toISOString() }
  await db.write()
  return db.data.nodes[idx]
}

export async function deleteNode(id) {
  const db = getDB()
  db.data.nodes  = db.data.nodes.filter(n => n.id !== id)
  db.data.edges  = db.data.edges.filter(e => e.source !== id && e.target !== id)
  db.data.objects = db.data.objects.filter(o => o.nodeId !== id)
  await db.write()
  return true
}

export function searchNodes(query) {
  const q = query.toLowerCase()
  return getDB().data.nodes.filter(n =>
    n.title?.toLowerCase().includes(q) ||
    n.content?.replace(/<[^>]*>/g, '').toLowerCase().includes(q) ||
    n.objects?.some(o => o.content?.toLowerCase().includes(q))
  )
}

export function getNodesByType(type) {
  return getDB().data.nodes.filter(n => n.type === type)
}

export function getRecentNodes(limit = 10) {
  return [...getDB().data.nodes]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, limit)
}
