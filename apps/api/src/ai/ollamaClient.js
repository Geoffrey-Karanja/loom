import { Ollama } from 'ollama'

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434'
})

const MODEL = process.env.OLLAMA_MODEL || 'llama3.2'

export async function chat(messages, options = {}) {
  return ollama.chat({
    model: MODEL,
    messages,
    options: {
      temperature: 0.3,
      num_predict: 400,
      ...options
    }
  })
}

export async function chatStream(messages, options = {}) {
  return ollama.chat({
    model: MODEL,
    messages,
    stream: true,
    options: {
      temperature: 0.7,
      num_predict: 400,
      ...options
    }
  })
}

export async function isOnline() {
  try {
    await ollama.list()
    return true
  } catch {
    return false
  }
}

export { MODEL }
