import { getDB } from '../db/index.js'
import { randomUUID } from 'crypto'

export async function graphRouter(app) {

  // Get full graph
  app.get('/', async () => {
    const db = getDB()
    return {
      nodes: db.data.nodes.map(n => ({
        id: n.id,
        label: n.title,
        type: n.type,
        weight: n.objects?.length || 0
      })),
      edges: db.data.edges
    }
  })

  // Create edge between nodes
  app.post('/edge', async (req, reply) => {
    const db = getDB()
    const edge = {
      id: randomUUID(),
      source: req.body.source,
      target: req.body.target,
      label: req.body.label || '',
      weight: req.body.weight || 1,
      sentiment: req.body.sentiment || 'neutral',
      createdAt: new Date().toISOString()
    }
    db.data.edges.push(edge)
    await db.write()
    return reply.code(201).send(edge)
  })

  // Delete edge
  app.delete('/edge/:id', async (req, reply) => {
    const db = getDB()
    db.data.edges = db.data.edges.filter(e => e.id !== req.params.id)
    await db.write()
    return reply.code(204).send()
  })
}
