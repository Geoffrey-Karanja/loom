import { create } from 'zustand'
import axios from 'axios'
import { API_URL } from '../config.js'

const API = API_URL

export const useLoomStore = create((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  activeView: 'canvas',
  weaverInsights: [],
  weaverLoading: false,

  setActiveView:   (view) => set({ activeView: view }),
  setSelectedNode: (node) => set({ selectedNode: node }),

  fetchNodes: async () => {
    const res = await axios.get(`${API}/nodes`)
    set({ nodes: res.data })
  },

  createNode: async (data) => {
    const res = await axios.post(`${API}/nodes`, data)
    set(state => ({ nodes: [...state.nodes, res.data] }))
    return res.data
  },

  updateNode: async (id, data) => {
    const res = await axios.patch(`${API}/nodes/${id}`, data)
    set(state => ({
      nodes: state.nodes.map(n => n.id === id ? res.data : n),
      selectedNode: state.selectedNode?.id === id ? res.data : state.selectedNode
    }))
    return res.data
  },

  deleteNode: async (id) => {
    await axios.delete(`${API}/nodes/${id}`)
    set(state => ({
      nodes: state.nodes.filter(n => n.id !== id),
      selectedNode: state.selectedNode?.id === id ? null : state.selectedNode
    }))
  },

  fetchGraph: async () => {
    const res = await axios.get(`${API}/graph`)
    set({ edges: res.data.edges })
  },

  createEdge: async (source, target, label = '') => {
    const res = await axios.post(`${API}/graph/edge`, { source, target, label })
    set(state => ({ edges: [...state.edges, res.data] }))
    return res.data
  },

  analyzeText: async (text, nodeId) => {
    set({ weaverLoading: true })
    try {
      const res = await axios.post(`${API}/weaver/analyze`, { text, nodeId })
      if (res.data.savedObjects?.length) await get().fetchNodes()
      return res.data
    } finally {
      set({ weaverLoading: false })
    }
  },

  getInsights: async () => {
    set({ weaverLoading: true })
    try {
      const res = await axios.post(`${API}/weaver/resonate`, {})
      set({ weaverInsights: res.data.insights || [] })
    } finally {
      set({ weaverLoading: false })
    }
  },

  autoLink: async () => {
    set({ weaverLoading: true })
    try {
      const res = await axios.post(`${API}/weaver/autolink`, {})
      if (res.data.linked?.length) await get().fetchGraph()
      return res.data
    } finally {
      set({ weaverLoading: false })
    }
  },

  searchNodes: async (query) => {
    const res = await axios.get(`${API}/search?q=${encodeURIComponent(query)}`)
    return res.data
  }
}))
