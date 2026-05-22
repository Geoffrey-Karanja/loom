const isDev = import.meta.env.DEV

export const API_URL = isDev
  ? 'http://localhost:4000/api'
  : 'https://loom-api-dabe.onrender.com/api'

export const WS_URL = isDev
  ? 'ws://localhost:4000'
  : 'wss://loom-api-dabe.onrender.com'
