import React, { useEffect, useState } from 'react'
import { initCollab, getAwarenessStates } from './collabStore.js'

export default function PresenceAvatars({ roomId }) {
  const [peers, setPeers] = useState([])
  const [connected, setConnected] = useState(false)
  const [localUser, setLocalUser] = useState(null)

  useEffect(() => {
    const { awareness } = initCollab(roomId)
    if (!awareness) return

    const local = awareness.getLocalState()?.user
    setLocalUser(local)
    setConnected(true)

    const update = () => {
      setPeers(getAwarenessStates())
    }

    awareness.on('change', update)
    update()

    return () => awareness.off('change', update)
  }, [roomId])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {/* Connection status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: connected ? 'var(--teal)' : 'var(--dim)',
          boxShadow: connected ? '0 0 6px var(--teal)' : 'none'
        }} />
        <span style={{ fontSize: 10, color: 'var(--dim)', fontFamily: 'JetBrains Mono, monospace' }}>
          {connected ? 'live' : 'local'}
        </span>
      </div>

      {/* Local user */}
      {localUser && (
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: localUser.color,
          border: '2px solid var(--bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, color: 'white', fontWeight: 700,
          title: localUser.name,
          boxShadow: `0 0 8px ${localUser.color}44`
        }} title={localUser.name}>
          {localUser.name?.[0]}
        </div>
      )}

      {/* Peer avatars */}
      {peers.slice(0, 5).map((peer, i) => (
        <div key={peer.clientId} style={{
          width: 24, height: 24, borderRadius: '50%',
          background: peer.color || 'var(--muted)',
          border: '2px solid var(--bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, color: 'white', fontWeight: 700,
          marginLeft: -6, zIndex: peers.length - i,
          boxShadow: `0 0 8px ${peer.color}44`,
          transition: 'transform 0.2s'
        }} title={peer.name}>
          {peer.name?.[0] || '?'}
        </div>
      ))}

      {peers.length > 0 && (
        <span style={{ fontSize: 10, color: 'var(--dim)', fontFamily: 'JetBrains Mono, monospace', marginLeft: 2 }}>
          +{peers.length}
        </span>
      )}
    </div>
  )
}
