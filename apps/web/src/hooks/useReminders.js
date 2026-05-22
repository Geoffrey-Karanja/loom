import { useEffect, useRef, useCallback } from 'react'
import axios from 'axios'

const API = 'http://localhost:4000/api'

export function useReminders(onFire) {
  const permissionRef = useRef('default')

  // Request notification permission once
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(p => {
        permissionRef.current = p
      })
    }
  }, [])

  const fireNotification = useCallback((reminder) => {
    const priority = reminder.priority === 'high' ? '🔴' :
                     reminder.priority === 'medium' ? '🟡' : '🟢'

    if (permissionRef.current === 'granted') {
      const n = new Notification(`${priority} ${reminder.title}`, {
        body: reminder.note || 'Task reminder from Loom',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: reminder.id,
        requireInteraction: reminder.priority === 'high'
      })
      n.onclick = () => { window.focus(); n.close() }
    }

    // Also trigger in-app alert
    onFire?.(reminder)
  }, [onFire])

  // Poll every 30 seconds for due reminders
  useEffect(() => {
    const check = async () => {
      try {
        const res = await axios.get(`${API}/reminders/due`)
        for (const reminder of res.data) {
          fireNotification(reminder)
          await axios.post(`${API}/reminders/${reminder.id}/fired`)
        }
      } catch {}
    }

    check() // check immediately on mount
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [fireNotification])
}
