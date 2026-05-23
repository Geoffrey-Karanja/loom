import { useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { API_URL } from '../config.js'

const API = API_URL

export function useReminders(onFire) {
  const permissionRef = useRef('default')

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
        tag: reminder.id,
        requireInteraction: reminder.priority === 'high'
      })
      n.onclick = () => { window.focus(); n.close() }
    }
    onFire?.(reminder)
  }, [onFire])

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
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [fireNotification])
}
