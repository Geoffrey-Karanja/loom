import Fastify from 'fastify'
import cors from '@fastify/cors'
import websocket from '@fastify/websocket'
import { config } from 'dotenv'
import { nodesRouter }     from './routes/nodes.js'
import { weaverRouter }    from './routes/weaver.js'
import { graphRouter }     from './routes/graph.js'
import { exportRouter }    from './routes/export.js'
import { remindersRouter } from './routes/reminders.js'
import { initDB }          from './db/index.js'
import { handleWebSocket, getConnectedCount } from './ws/syncHandler.js'
import { getGraphStats }   from './graph/algorithms.js'
import { fullTextSearch }  from './services/searchService.js'
import { executeProtocol, PROTOCOL_DEFINITIONS } from './protocols/executor.js'

config()

const app = Fastify({
  logger: true,
  connectionTimeout: 120000,
  requestTimeout:    120000
})

// Wildcard CORS — fixes all origin issues
await app.register(cors, {
  origin: '*',
  methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
})

await app.register(websocket)

app.addHook('onRequest', async (req, reply) => {
  reply.raw.setTimeout(120000)
})

await initDB()

app.register(nodesRouter,     { prefix: '/api/nodes' })
app.register(weaverRouter,    { prefix: '/api/weaver' })
app.register(graphRouter,     { prefix: '/api/graph' })
app.register(exportRouter,    { prefix: '/api/export' })
app.register(remindersRouter, { prefix: '/api/reminders' })

app.register(async (app) => {
  app.get('/ws/sync', { websocket: true }, handleWebSocket)
})

app.get('/api/graph/stats', async () => getGraphStats())
app.get('/api/search',      async (req) => fullTextSearch(req.query.q || ''))
app.get('/api/protocols',   async () => Object.values(PROTOCOL_DEFINITIONS))

app.post('/api/protocols/:id/execute', async (req, reply) => {
  try {
    const result = await executeProtocol(req.params.id, req.body || {})
    return reply.code(201).send(result)
  } catch (err) {
    return reply.code(400).send({ error: err.message })
  }
})

app.get('/health', async () => ({
  status: 'ok', service: 'loom-api',
  peers: getConnectedCount(),
  uptime: process.uptime()
}))

const port = parseInt(process.env.PORT || '4000')

try {
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`🌿 Loom API running on port ${port}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
