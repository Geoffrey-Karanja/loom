import React, { useEffect, useState } from 'react'
import { useLoomStore } from './store/index.js'
import { useKeyboard }  from './hooks/useKeyboard.js'
import { useTheme }     from './hooks/useTheme.js'
import { useReminders } from './hooks/useReminders.js'
import TopBar              from './components/TopBar.jsx'
import Sidebar             from './components/Sidebar.jsx'
import Canvas              from './canvas/Canvas.jsx'
import GraphView           from './graph/GraphView.jsx'
import TimelineView        from './timeline/TimelineView.jsx'
import MapView             from './map/MapView.jsx'
import WeaverOrb           from './ai/WeaverOrb.jsx'
import SearchBar           from './components/SearchBar.jsx'
import ShortcutCheatsheet  from './components/ShortcutCheatsheet.jsx'
import ShortcutHint        from './components/ShortcutHint.jsx'
import ReminderAlert       from './components/ReminderAlert.jsx'
import axios               from 'axios'

import { API_URL } from './config.js'
const API = API_URL

export default function App() {
  const { activeView, setActiveView, fetchNodes, fetchGraph } = useLoomStore()
  const [showCheatsheet, setShowCheatsheet] = useState(false)
  const [firedReminders, setFiredReminders] = useState([])
  const { theme } = useTheme()

  useEffect(() => {
    fetchNodes()
    fetchGraph()
  }, [])

  useKeyboard({
    '1': () => setActiveView('canvas'),
    '2': () => setActiveView('graph'),
    '3': () => setActiveView('timeline'),
    '4': () => setActiveView('map'),
    '?': () => setShowCheatsheet(s => !s),
  })

  // Reminder engine
  useReminders((reminder) => {
    setFiredReminders(prev => [...prev, reminder])
    // Auto-dismiss after 10s
    setTimeout(() => {
      setFiredReminders(prev => prev.filter(r => r.id !== reminder.id))
    }, 10000)
  })

  const handleReminderDone = async (r) => {
    await axios.post(`${API}/reminders/${r.id}/done`)
    setFiredReminders(prev => prev.filter(x => x.id !== r.id))
  }

  const handleReminderDismiss = (r) => {
    setFiredReminders(prev => prev.filter(x => x.id !== r.id))
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg)'
    }}>
      <TopBar />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <Sidebar />
        <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {activeView === 'canvas'   && <Canvas />}
          {activeView === 'graph'    && <GraphView />}
          {activeView === 'timeline' && <TimelineView />}
          {activeView === 'map'      && <MapView />}
        </main>
      </div>

      <WeaverOrb />
      <SearchBar />
      <ShortcutHint />

      {showCheatsheet && <ShortcutCheatsheet onClose={() => setShowCheatsheet(false)} />}

      {/* Reminder alerts — stack from top right */}
      {firedReminders.map((r, i) => (
        <div key={r.id} style={{ transform: `translateY(${i * 10}px)` }}>
          <ReminderAlert
            reminders={[r]}
            onDone={handleReminderDone}
            onDismiss={handleReminderDismiss}
          />
        </div>
      ))}
    </div>
  )
}
