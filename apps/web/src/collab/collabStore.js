import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'

let ydoc = null
let provider = null
let awareness = null

const COLORS = [
  '#7c6af7', '#2dd4bf', '#fbbf24', '#f87171',
  '#a78bfa', '#34d399', '#fb923c', '#60a5fa'
]

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}

function randomName() {
  const names = ['Weaver', 'Loom', 'Thread', 'Node', 'Spark', 'Flux', 'Arc', 'Drift']
  return names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 99)
}

export function initCollab(roomId = 'loom-default') {
  if (ydoc) return { ydoc, provider, awareness }

  ydoc = new Y.Doc()

  try {
    provider = new WebrtcProvider(roomId, ydoc, {
      signaling: [
        'wss://signaling.yjs.dev',
        'wss://y-webrtc-signaling-eu.herokuapp.com',
        'wss://y-webrtc-signaling-us.herokuapp.com'
      ]
    })

    awareness = provider.awareness
    awareness.setLocalStateField('user', {
      name: randomName(),
      color: randomColor(),
      cursor: null
    })

    console.log('🤝 Collab initialized — room:', roomId)
  } catch (err) {
    console.warn('WebRTC collab unavailable (offline mode):', err.message)
  }

  return { ydoc, provider, awareness }
}

export function getCollab() {
  return { ydoc, provider, awareness }
}

export function getAwarenessStates() {
  if (!awareness) return []
  return Array.from(awareness.getStates().entries())
    .filter(([clientId]) => clientId !== awareness.clientID)
    .map(([clientId, state]) => ({ clientId, ...state.user }))
}

export function updateCursorPosition(x, y, nodeId = null) {
  if (!awareness) return
  const current = awareness.getLocalState()
  awareness.setLocalStateField('user', {
    ...current?.user,
    cursor: { x, y, nodeId, updatedAt: Date.now() }
  })
}

export function destroyCollab() {
  provider?.destroy()
  ydoc?.destroy()
  ydoc = null
  provider = null
  awareness = null
}
