const clients = new Map()

export function handleWebSocket(connection, req) {
  const clientId = Math.random().toString(36).slice(2)
  clients.set(clientId, { ws: connection.socket, joinedAt: Date.now() })

  console.log(`🔌 Client connected: ${clientId} (${clients.size} total)`)

  // Send welcome
  connection.socket.send(JSON.stringify({
    type: 'welcome',
    clientId,
    peers: clients.size - 1
  }))

  // Broadcast presence to others
  broadcast(clientId, { type: 'peer:joined', clientId, peers: clients.size })

  connection.socket.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString())

      switch (msg.type) {
        case 'node:created':
        case 'node:updated':
        case 'node:deleted':
        case 'edge:created':
        case 'edge:deleted':
          broadcast(clientId, { ...msg, fromClient: clientId })
          break

        case 'cursor:move':
          broadcast(clientId, { ...msg, fromClient: clientId })
          break

        case 'ping':
          connection.socket.send(JSON.stringify({ type: 'pong' }))
          break
      }
    } catch (err) {
      console.error('WS parse error:', err.message)
    }
  })

  connection.socket.on('close', () => {
    clients.delete(clientId)
    broadcast(clientId, { type: 'peer:left', clientId, peers: clients.size })
    console.log(`🔌 Client disconnected: ${clientId} (${clients.size} total)`)
  })
}

function broadcast(fromClientId, message) {
  const data = JSON.stringify(message)
  for (const [id, client] of clients.entries()) {
    if (id !== fromClientId && client.ws.readyState === 1) {
      try { client.ws.send(data) } catch {}
    }
  }
}

export function getConnectedCount() {
  return clients.size
}
