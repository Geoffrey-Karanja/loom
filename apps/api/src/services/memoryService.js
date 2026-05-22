import { getDB } from '../db/index.js'

// Save a memory entry
export async function saveMemory(type, content, metadata = {}) {
  const db = getDB()
  if (!db.data.memories) db.data.memories = []

  const memory = {
    id: Math.random().toString(36).slice(2),
    type,        // 'conversation' | 'insight' | 'preference' | 'fact'
    content,
    metadata,
    createdAt: new Date().toISOString()
  }

  db.data.memories.push(memory)

  // Keep only last 200 memories
  if (db.data.memories.length > 200) {
    db.data.memories = db.data.memories.slice(-200)
  }

  await db.write()
  return memory
}

// Get recent memories
export function getMemories(limit = 20, type = null) {
  const db = getDB()
  const memories = db.data.memories || []
  return memories
    .filter(m => !type || m.type === type)
    .slice(-limit)
    .reverse()
}

// Get memory context string for AI prompts
export function getMemoryContext(limit = 10) {
  const memories = getMemories(limit)
  if (!memories.length) return 'No previous context.'
  return memories
    .map(m => `[${m.type}] ${m.content}`)
    .join('\n')
}

// Clear all memories
export async function clearMemories() {
  const db = getDB()
  db.data.memories = []
  await db.write()
}

// Save conversation turn
export async function saveConversationTurn(userMsg, assistantMsg) {
  await saveMemory('conversation',
    `User: ${userMsg}\nWeaver: ${assistantMsg}`,
    { userMsg, assistantMsg }
  )
}

// Extract and save facts from conversation
export async function extractFacts(text) {
  const db = getDB()
  if (!db.data.memories) db.data.memories = []

  // Simple pattern matching for facts
  const patterns = [
    { regex: /my name is ([^.!?]+)/i,          template: 'User name: $1' },
    { regex: /i (?:work|am working) (?:at|for|on) ([^.!?]+)/i, template: 'User works on: $1' },
    { regex: /i (?:like|prefer|love|enjoy) ([^.!?]+)/i,        template: 'User preference: $1' },
    { regex: /i (?:hate|dislike|don\'t like) ([^.!?]+)/i,      template: 'User dislikes: $1' },
    { regex: /(?:we|our team) (?:use|using|built) ([^.!?]+)/i, template: 'Tech/tool: $1' },
    { regex: /the project is (?:called|named) ([^.!?]+)/i,     template: 'Project name: $1' },
  ]

  for (const { regex, template } of patterns) {
    const match = text.match(regex)
    if (match) {
      const fact = template.replace('$1', match[1].trim())
      // Avoid duplicate facts
      const exists = (db.data.memories || []).some(m =>
        m.type === 'fact' && m.content === fact
      )
      if (!exists) {
        await saveMemory('fact', fact, { source: text.slice(0, 100) })
      }
    }
  }
}
