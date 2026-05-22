import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useLoomStore } from '../store/index.js'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const TYPE_COLORS = {
  document: '#7c6af7',
  task:     '#2dd4bf',
  idea:     '#fbbf24',
  data:     '#f87171',
}

function createIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 16px; height: 16px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 0 8px ${color};
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

function AddGeoPanel({ onAdd }) {
  const map = useMap()
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!adding) return
    const handler = (e) => {
      onAdd(e.latlng)
      setAdding(false)
    }
    map.once('click', handler)
    return () => map.off('click', handler)
  }, [adding, map, onAdd])

  return (
    <div style={{
      position: 'absolute', top: 12, right: 12, zIndex: 1000,
      display: 'flex', flexDirection: 'column', gap: 6
    }}>
      <button onClick={() => setAdding(a => !a)} style={{
        padding: '6px 14px',
        background: adding ? 'var(--accent)' : 'var(--surface)',
        border: `1px solid ${adding ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 6, color: adding ? 'white' : 'var(--dim)',
        cursor: 'pointer', fontSize: 12,
        fontFamily: 'Syne, sans-serif', fontWeight: 600,
      }}>
        {adding ? '📍 Click map to place' : '+ Add node to map'}
      </button>
    </div>
  )
}

export default function MapView() {
  const { nodes, updateNode, setSelectedNode, setActiveView, createNode } = useLoomStore()
  const [newNodePos, setNewNodePos] = useState(null)
  const [newNodeTitle, setNewNodeTitle] = useState('')
  const [newNodeType, setNewNodeType] = useState('task')

  const geoNodes = nodes.filter(n => n.geo?.lat && n.geo?.lng)
  const ungeoNodes = nodes.filter(n => !n.geo?.lat)

  const handleMapClick = (latlng) => {
    setNewNodePos(latlng)
    setNewNodeTitle('')
  }

  const handleCreateGeoNode = async () => {
    if (!newNodePos || !newNodeTitle.trim()) return
    await createNode({
      type: newNodeType,
      title: newNodeTitle,
      content: '',
      geo: { lat: newNodePos.lat, lng: newNodePos.lng },
      position: { x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 }
    })
    setNewNodePos(null)
    setNewNodeTitle('')
  }

  const handleAddGeoToExisting = async (node, latlng) => {
    await updateNode(node.id, { geo: { lat: latlng.lat, lng: latlng.lng } })
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative' }}>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={[0, 20]}
          zoom={2}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />

          <AddGeoPanel onAdd={handleMapClick} />

          {geoNodes.map(node => (
            <Marker
              key={node.id}
              position={[node.geo.lat, node.geo.lng]}
              icon={createIcon(TYPE_COLORS[node.type] || '#7c6af7')}
            >
              <Popup>
                <div style={{
                  background: 'var(--surface)', color: 'var(--text)',
                  padding: 12, borderRadius: 8, minWidth: 160,
                  fontFamily: 'Syne, sans-serif'
                }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: TYPE_COLORS[node.type] }}>
                    {node.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b6b8a', marginBottom: 8 }}>
                    {node.type} · {node.objects?.length || 0} objects
                  </div>
                  <div style={{ fontSize: 10, color: '#6b6b8a', marginBottom: 8, fontFamily: 'JetBrains Mono, monospace' }}>
                    {node.geo.lat.toFixed(4)}, {node.geo.lng.toFixed(4)}
                  </div>
                  <button
                    onClick={() => { setSelectedNode(node); setActiveView('canvas') }}
                    style={{
                      width: '100%', padding: '5px 0',
                      background: 'rgba(124,106,247,0.15)',
                      border: '1px solid rgba(124,106,247,0.4)',
                      borderRadius: 5, color: '#a78bfa',
                      cursor: 'pointer', fontSize: 11,
                      fontFamily: 'Syne, sans-serif', fontWeight: 600
                    }}
                  >→ Open in Canvas</button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* New node form */}
        {newNodePos && (
          <div className="fade-in" style={{
            position: 'absolute', bottom: 24, left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--surface)',
            border: '1px solid var(--accent)',
            borderRadius: 12, padding: 16, zIndex: 1000,
            width: 300,
            boxShadow: '0 8px 40px rgba(124,106,247,0.2)'
          }}>
            <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 10 }}>
              📍 Place node at {newNodePos.lat.toFixed(3)}, {newNodePos.lng.toFixed(3)}
            </div>
            <input
              autoFocus
              placeholder="Node title..."
              value={newNodeTitle}
              onChange={e => setNewNodeTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateGeoNode()}
              style={{
                width: '100%', padding: '7px 10px',
                background: 'var(--muted)', border: '1px solid var(--border)',
                borderRadius: 6, color: 'var(--text)', fontSize: 13,
                fontFamily: 'Syne, sans-serif', outline: 'none',
                marginBottom: 8, boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {['task', 'document', 'idea', 'data'].map(t => (
                <button key={t} onClick={() => setNewNodeType(t)} style={{
                  flex: 1, padding: '4px 0',
                  background: newNodeType === t ? (TYPE_COLORS[t] || 'var(--accent)') : 'var(--muted)',
                  border: 'none', borderRadius: 5,
                  color: newNodeType === t ? 'white' : 'var(--dim)',
                  cursor: 'pointer', fontSize: 10,
                  fontFamily: 'Syne, sans-serif', fontWeight: 500
                }}>{t}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setNewNodePos(null)} style={{
                flex: 1, padding: '7px 0',
                background: 'var(--muted)', border: 'none',
                borderRadius: 6, color: 'var(--dim)',
                cursor: 'pointer', fontSize: 12,
                fontFamily: 'Syne, sans-serif'
              }}>Cancel</button>
              <button onClick={handleCreateGeoNode} style={{
                flex: 2, padding: '7px 0',
                background: 'rgba(124,106,247,0.2)',
                border: '1px solid var(--accent)',
                borderRadius: 6, color: 'var(--glow)',
                cursor: 'pointer', fontSize: 12,
                fontFamily: 'Syne, sans-serif', fontWeight: 600
              }}>Create Node</button>
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar — unplaced nodes */}
      <div style={{
        width: 220, borderLeft: '1px solid var(--border)',
        background: 'var(--surface)', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{
          padding: '12px 14px', borderBottom: '1px solid var(--border)',
          fontSize: 11, color: 'var(--dim)', fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase'
        }}>
          Unplaced nodes ({ungeoNodes.length})
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {ungeoNodes.length === 0 && (
            <div style={{ color: 'var(--dim)', fontSize: 11, textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
              All nodes are placed on the map!
            </div>
          )}
          {ungeoNodes.map(node => (
            <div key={node.id} style={{
              padding: '8px 10px', marginBottom: 4,
              background: 'var(--muted)', borderRadius: 6,
              border: '1px solid var(--border)', cursor: 'default'
            }}>
              <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500, marginBottom: 4 }}>
                {node.title}
              </div>
              <div style={{ fontSize: 10, color: 'var(--dim)' }}>{node.type}</div>
              <div style={{ fontSize: 10, color: 'var(--dim)', marginTop: 4, fontStyle: 'italic' }}>
                Click "+ Add node to map" then click map to place
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{
          padding: 14, borderTop: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: 6
        }}>
          {[
            { label: 'Total nodes', value: nodes.length },
            { label: 'On map', value: geoNodes.length },
            { label: 'Unplaced', value: ungeoNodes.length },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: 'var(--dim)' }}>{label}</span>
              <span style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
