import { getDB } from '../db/index.js'
import { randomUUID } from 'crypto'

export async function createReminder(data) {
  const db = getDB()
  if (!db.data.reminders) db.data.reminders = []

  const reminder = {
    id: randomUUID(),
    nodeId:    data.nodeId || null,
    title:     data.title || 'Reminder',
    note:      data.note || '',
    dueAt:     data.dueAt,
    repeat:    data.repeat || 'none', // none | daily | weekly
    priority:  data.priority || 'medium', // low | medium | high
    done:      false,
    fired:     false,
    createdAt: new Date().toISOString()
  }

  db.data.reminders.push(reminder)
  await db.write()
  return reminder
}

export function getReminders(includesDone = false) {
  const db = getDB()
  const reminders = db.data.reminders || []
  return includesDone
    ? reminders
    : reminders.filter(r => !r.done)
}

export function getDueReminders() {
  const now = Date.now()
  return getReminders().filter(r =>
    !r.fired && new Date(r.dueAt).getTime() <= now
  )
}

export async function markDone(id) {
  const db = getDB()
  if (!db.data.reminders) return null
  const r = db.data.reminders.find(r => r.id === id)
  if (!r) return null
  r.done = true
  await db.write()
  return r
}

export async function markFired(id) {
  const db = getDB()
  if (!db.data.reminders) return null
  const r = db.data.reminders.find(r => r.id === id)
  if (!r) return null
  r.fired = true

  // Handle repeat
  if (r.repeat === 'daily') {
    const next = new Date(r.dueAt)
    next.setDate(next.getDate() + 1)
    r.dueAt  = next.toISOString()
    r.fired  = false
  } else if (r.repeat === 'weekly') {
    const next = new Date(r.dueAt)
    next.setDate(next.getDate() + 7)
    r.dueAt  = next.toISOString()
    r.fired  = false
  }

  await db.write()
  return r
}

export async function deleteReminder(id) {
  const db = getDB()
  if (!db.data.reminders) return
  db.data.reminders = db.data.reminders.filter(r => r.id !== id)
  await db.write()
}

export async function updateReminder(id, data) {
  const db = getDB()
  if (!db.data.reminders) return null
  const idx = db.data.reminders.findIndex(r => r.id === id)
  if (idx === -1) return null
  db.data.reminders[idx] = { ...db.data.reminders[idx], ...data }
  await db.write()
  return db.data.reminders[idx]
}
