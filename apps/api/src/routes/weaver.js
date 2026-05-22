import { Ollama } from 'ollama'
import { getDB } from '../db/index.js'
import { randomUUID } from 'crypto'
import {
  saveMemory, getMemories, getMemoryContext,
  saveConversationTurn, extractFacts, clearMemories
} from '../services/memoryService.js'

const ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434' })
const MODEL  = process.env.OLLAMA_MODEL || 'llama3.2'

export async function weaverRouter(app) {

  // Analyze text
  app.post('/analyze', async (req, reply) => {
    const { text, nodeId } = req.body
    if (!text) return reply.code(400).send({ error: 'text required' })

    const prompt = `Extract structured objects from this text. Return ONLY JSON:
Text: "${text.slice(0, 600)}"
{"objects":[{"type":"task|decision|question|insight|person|risk","content":"text"}],"connections":["topic"],"summary":"one sentence"}`

    try {
      const response = await ollama.chat({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        options: { temperature: 0.1, num_predict: 300 }
      })
      const raw = response.message.content.trim()
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return { objects: [], connections: [], summary: '' }
      const result = JSON.parse(jsonMatch[0])

      if (nodeId && result.objects?.length) {
        const db = getDB()
        const node = db.data.nodes.find(n => n.id === nodeId)
        if (node) {
          const newObjects = result.objects.map(o => ({
            id: randomUUID(), nodeId, ...o,
            createdAt: new Date().toISOString()
          }))
          db.data.objects.push(...newObjects)
          node.objects = [...(node.objects || []), ...newObjects]
          node.updatedAt = new Date().toISOString()
          await db.write()
          result.savedObjects = newObjects

          // Save insight to memory
          if (result.summary) {
            await saveMemory('insight',
              `Node "${node.title}": ${result.summary}`,
              { nodeId, objectCount: newObjects.length }
            )
          }
        }
      }
      return result
    } catch (err) {
      app.log.error(err)
      return { objects: [], connections: [], summary: 'Weaver offline', error: err.message }
    }
  })

  // Resonate
  app.post('/resonate', async (req, reply) => {
    const db = getDB()
    const nodes = db.data.nodes.slice(-6)
    if (nodes.length < 2) return { insights: [] }
    const context = nodes.map(n =>
      `"${n.title}": ${n.content?.replace(/<[^>]*>/g, '').slice(0, 150)}`
    ).join('\n')

    const prompt = `Find 2-3 hidden connections between these notes. Return ONLY JSON:
${context}
{"insights":[{"type":"connection|pattern|risk|opportunity","message":"insight","relatedTitles":["t1","t2"]}]}`

    try {
      const response = await ollama.chat({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        options: { temperature: 0.3, num_predict: 300 }
      })
      const raw = response.message.content.trim()
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return { insights: [] }
      const result = JSON.parse(jsonMatch[0])

      // Save insights to memory
      for (const insight of result.insights || []) {
        await saveMemory('insight', insight.message, { type: insight.type })
      }

      return result
    } catch (err) {
      return { insights: [], error: err.message }
    }
  })

  // Autolink
  app.post('/autolink', async (req, reply) => {
    const db = getDB()
    const nodes = db.data.nodes
    if (nodes.length < 2) return { linked: [] }
    const context = nodes.map(n => ({
      id: n.id, title: n.title,
      summary: n.content?.replace(/<[^>]*>/g, '').slice(0, 150)
    }))

    const prompt = `Find max 3 meaningful connections. Return ONLY JSON:
${JSON.stringify(context)}
{"links":[{"sourceId":"id","targetId":"id","label":"relationship","strength":3}]}`

    try {
      const response = await ollama.chat({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        options: { temperature: 0.2, num_predict: 200 }
      })
      const raw = response.message.content.trim()
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return { linked: [] }
      const result = JSON.parse(jsonMatch[0])
      const linked = []
      for (const link of result.links || []) {
        const exists = db.data.edges.find(
          e => (e.source === link.sourceId && e.target === link.targetId) ||
               (e.source === link.targetId && e.target === link.sourceId)
        )
        if (!exists && link.sourceId && link.targetId) {
          const edge = {
            id: randomUUID(), source: link.sourceId, target: link.targetId,
            label: link.label || 'relates to', weight: link.strength || 1,
            sentiment: 'neutral', autoLinked: true,
            createdAt: new Date().toISOString()
          }
          db.data.edges.push(edge)
          linked.push(edge)
        }
      }
      if (linked.length) await db.write()
      return { linked }
    } catch (err) {
      return { linked: [], error: err.message }
    }
  })

  // ── Chat with memory ─────────────────────────────────────────────────────
  app.post('/chat', async (req, reply) => {
    const { message, history = [] } = req.body
    if (!message) return reply.code(400).send({ error: 'message required' })

    const db = getDB()
    const nodes = db.data.nodes
    const edges = db.data.edges

    // Workspace context
    const workspaceContext = nodes.length > 0
      ? nodes.map(n => {
          const content = n.content?.replace(/<[^>]*>/g, '').slice(0, 200)
          const objs = n.objects?.slice(0, 3).map(o => `${o.type}:${o.content}`).join(', ')
          return `- "${n.title}" (${n.type})${content ? ': ' + content : ''}${objs ? ' [' + objs + ']' : ''}`
        }).join('\n')
      : 'No nodes yet.'

    const edgeContext = edges.length > 0
      ? edges.slice(0, 8).map(e => {
          const src = nodes.find(n => n.id === e.source)?.title || '?'
          const tgt = nodes.find(n => n.id === e.target)?.title || '?'
          return `${src} → ${tgt} (${e.label})`
        }).join(', ')
      : 'none'

    // Memory context
    const memoryContext = getMemoryContext(12)

    const systemPrompt = `You are the Weaver, Loom's AI. You have a persistent memory of past conversations and insights.

MEMORY (what you remember from before):
${memoryContext}

CURRENT WORKSPACE:
${workspaceContext}

CONNECTIONS: ${edgeContext}

Use your memory to give personalized, contextual responses. Reference past conversations when relevant. Be concise — 2-4 sentences unless more is needed.`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-4).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ]

    // Extract facts from user message
    await extractFacts(message)

    reply.raw.setHeader('Content-Type', 'text/event-stream')
    reply.raw.setHeader('Cache-Control', 'no-cache')
    reply.raw.setHeader('Connection', 'keep-alive')
    reply.raw.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')

    try {
      const stream = await ollama.chat({
        model: MODEL,
        messages,
        stream: true,
        options: { temperature: 0.7, num_predict: 400 }
      })

      let fullReply = ''

      for await (const chunk of stream) {
        const word = chunk.message?.content || ''
        if (word) {
          fullReply += word
          reply.raw.write(`data: ${JSON.stringify({ word })}\n\n`)
        }
      }

      // Save conversation to memory
      await saveConversationTurn(message, fullReply)

      reply.raw.write(`data: ${JSON.stringify({ done: true })}\n\n`)
      reply.raw.end()
    } catch (err) {
      reply.raw.write(`data: ${JSON.stringify({ word: 'Weaver error: ' + err.message, done: true })}\n\n`)
      reply.raw.end()
    }
  })

  // ── Memory endpoints ─────────────────────────────────────────────────────
  app.get('/memory', async () => {
    return {
      memories: getMemories(30),
      total: getMemories(1000).length
    }
  })

  app.delete('/memory', async () => {
    await clearMemories()
    return { cleared: true }
  })
}
