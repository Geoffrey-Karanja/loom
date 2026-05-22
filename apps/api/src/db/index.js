import { JSONFilePreset } from 'lowdb/node'
import { join, dirname }  from 'path'
import { fileURLToPath }  from 'url'
import { mkdirSync }      from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir   = join(__dirname, '../../../../data/sqlite')
mkdirSync(dataDir, { recursive: true })

const defaultData = {
  nodes: [], edges: [], objects: [],
  snapshots: [], memories: [], reminders: []
}

let db

export async function initDB() {
  db = await JSONFilePreset(join(dataDir, 'loom.json'), defaultData)
  if (!db.data.memories)  { db.data.memories  = []; await db.write() }
  if (!db.data.reminders) { db.data.reminders = []; await db.write() }
  console.log('🗄️  Database initialized')
  return db
}

export function getDB() { return db }
