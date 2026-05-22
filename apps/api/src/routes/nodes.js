import { randomUUID } from 'crypto'
import { getDB } from '../db/index.js'

export async function nodesRouter(app) {

  // Get all nodes
  app.get('/', async () => {
    const db = getDB()
    return db.data.nodes
  })

  // Get single node
  app.get('/:id', async (req, reply) => {
    const db = getDB()
    const node = db.data.nodes.find(n => n.id === req.params.id)
    if (!node) return reply.code(404).send({ error: 'Node not found' })
    return node
  })

  // Create node
  app.post('/', async (req, reply) => {
    const db = getDB()
    const node = {
      id: randomUUID(),
      type: req.body.type || 'document',
      title: req.body.title || 'Untitled',
      content: req.body.content || '',
      position: req.body.position || { x: 0, y: 0 },
      size: req.body.size || { w: 320, h: 240 },
      objects: [],
      tags: [],
      geo: req.body.geo || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    db.data.nodes.push(node)
    await db.write()
    return reply.code(201).send(node)
  })

  // Update node
  app.patch('/:id', async (req, reply) => {
    const db = getDB()
    const idx = db.data.nodes.findIndex(n => n.id === req.params.id)
    if (idx === -1) return reply.code(404).send({ error: 'Node not found' })
    db.data.nodes[idx] = {
      ...db.data.nodes[idx],
      ...req.body,
      updatedAt: new Date().toISOString()
    }
    await db.write()
    return db.data.nodes[idx]
  })

  // Delete node
  app.delete('/:id', async (req, reply) => {
    const db = getDB()
    db.data.nodes = db.data.nodes.filter(n => n.id !== req.params.id)
    db.data.edges = db.data.edges.filter(
      e => e.source !== req.params.id && e.target !== req.params.id
    )
    await db.write()
    return reply.code(204).send()
  })
}
