# ⌬ Loom

> An Intelligent Thought Environment. Not a better Notion — a different category of tool.

**[🚀 Live Demo](https://loom-web-chi.vercel.app)** · **[API](https://loom-api-dabe.onrender.com/health)** · **[GitHub](https://github.com/Geoffrey-Karanja/loom)**

> ⚠️ AI features (Weaver) are offline on the live demo — Ollama requires more RAM than free hosting allows. Clone and run locally for the full experience.

![Loom Canvas](https://img.shields.io/badge/status-live-brightgreen)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Node.js%20%2B%20Ollama-purple)
![License](https://img.shields.io/badge/license-MIT-blue)
![Cost](https://img.shields.io/badge/cost-100%25%20free-teal)
![Demo](https://img.shields.io/badge/demo-live-brightgreen)

---

## What makes Loom different

| Feature | Notion | Loom |
|---|---|---|
| Infinite spatial canvas | ❌ | ✅ |
| Living knowledge graph | ❌ | ✅ |
| AI that knows your workspace | ❌ | ✅ |
| AI memory across sessions | ❌ | ✅ |
| Geospatial map view | ❌ | ✅ |
| Timeline scrubbing | ❌ | ✅ |
| Inbox alchemy (paste → structure) | ❌ | ✅ |
| Protocol engine (AI playbooks) | ❌ | ✅ |
| Graph intelligence dashboard | ❌ | ✅ |
| P2P real-time collaboration | ❌ | ✅ |
| Runs 100% offline | ❌ | ✅ |
| Zero subscription cost | ❌ | ✅ |

---

## Features

### ⬡ Infinite Canvas
Pan, zoom, and spatially arrange nodes. Every node is anything — a document, task, idea, or database. Double-click to create. Right-click for options. Connect nodes with curved edges.

### ◈ Knowledge Graph
A live, force-directed graph of everything you have created. 5 layout modes. Click any node to inspect its connections, Weaver objects, and stats. AI auto-detects meaningful links between nodes.

### ⊶ Timeline
Every node time-anchored on a zoomable vertical timeline. Filter by type. Click to jump to canvas.

### ⊕ Geospatial Map
Place nodes on a world map. Tasks as pins. Click the map to create geo-tagged nodes. OpenStreetMap tiles — no API key needed.

### ✦ The Weaver (AI)
A persistent, workspace-aware AI that:
- **Analyzes** your notes and extracts tasks, decisions, questions, risks, and insights automatically
- **Resonates** — finds hidden patterns across all your nodes
- **Auto-links** — draws meaningful connections between nodes
- **Chats** — answers questions about your workspace with full context
- **Remembers** — maintains memory of past conversations and facts across sessions
- Runs on **Ollama** (local, free, offline — no API key ever)

### ⌬ Protocol Engine
Launch adaptive AI playbooks: Project Launch, Weekly Review, Crisis Response, Research Sprint, Decision Record. One click spawns all nodes pre-filled and Weaver-analyzed.

### ⊹ Inbox Alchemy
Paste any raw text — email, Slack message, meeting notes. The Weaver extracts structure instantly. One click saves tasks, decisions, risks, and insights as separate nodes.

### 🔔 Task Reminders
Set reminders with due dates, repeat schedules, and priority levels. Browser notifications fire even when the tab is in the background.

### ⊞ Node Templates
8 pre-filled templates: Meeting Notes, Bug Report, Feature Request, Task List, Decision Record, User Research, Weekly Plan, Brainstorm.

### ↓ Export
Export your entire workspace as JSON (full backup), Markdown (Obsidian-compatible), or CSV (spreadsheet-ready).

### Real-time Collaboration
P2P sync via Yjs + WebRTC. No server needed. Open two browser tabs to see it work.

---

## Quick Start (Full AI experience)

```bash
# 1. Clone
git clone https://github.com/Geoffrey-Karanja/loom.git
cd loom

# 2. Install dependencies
npm install

# 3. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 4. Pull the model (fast, 1B params)
ollama pull llama3.2:1b

# 5. Start everything
bash scripts/start.sh

# 6. Open browser
# http://localhost:3000
```

---

## Stack

**All free. All local. All yours.**

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TipTap, Cytoscape.js, Leaflet.js |
| Backend | Fastify, Node.js |
| Database | LowDB (local JSON, zero setup) |
| AI | Ollama + llama3.2:1b (local, offline, free) |
| Graph | Cytoscape.js + custom algorithms |
| Collab | Yjs + WebRTC (P2P, no server) |
| Map | Leaflet + OpenStreetMap (free tiles) |
| Hosting | Vercel (frontend) + Render (API) |

---

## Requirements

- Node.js 18+
- npm 9+
- [Ollama](https://ollama.com) (for AI features)
- WSL2 Ubuntu / Linux / macOS

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `1` | Canvas view |
| `2` | Graph view |
| `3` | Timeline view |
| `4` | Map view |
| `Ctrl+K` | Search |
| `?` | Shortcut cheatsheet |
| `Double-click` | Create node |
| `Right-click node` | Context menu |
| `Scroll` | Zoom |
| `Alt+Drag` | Pan |
| `Pinch` | Zoom (touch) |

---

## Project Structureloom/
├── apps/
│   ├── api/                  # Fastify backend
│   │   └── src/
│   │       ├── ai/           # Ollama client + prompt builder
│   │       ├── db/           # LowDB database
│   │       ├── graph/        # Graph algorithms
│   │       ├── protocols/    # Protocol executor
│   │       ├── routes/       # API routes
│   │       ├── services/     # Business logic
│   │       └── ws/           # WebSocket sync
│   └── web/                  # React frontend
│       └── src/
│           ├── ai/           # Weaver chat, orb, inbox, memory
│           ├── canvas/       # Infinite canvas + nodes
│           ├── collab/       # P2P collaboration
│           ├── components/   # Shared UI components
│           ├── editor/       # TipTap node editor
│           ├── graph/        # Knowledge graph views
│           ├── hooks/        # Custom React hooks
│           ├── map/          # Geospatial map
│           ├── protocols/    # Protocol + template UI
│           ├── store/        # Zustand global state
│           ├── styles/       # Global CSS
│           └── timeline/     # Timeline view
├── data/                     # Local database (gitignored)
├── docs/                     # Documentation
└── packages/                 # Shared packages
---

## Roadmap

- [ ] Node versioning (edit history)
- [ ] Database view (spreadsheet inside a node)
- [ ] Relation fields between nodes
- [ ] Public sharing (read-only links)
- [ ] Electron desktop app
- [ ] Mobile app
- [ ] Plugin system
- [ ] Hosted Ollama (so AI works on the live demo)

---

## Philosophy

> Notion is a brilliant file cabinet. Loom is an intelligent environment where the tool bends to the shape of thought.

Loom is built on the belief that your tools should understand context, build connections, and adapt to how you actually think — not force you into flat documents and isolated databases.

The AI is not a chatbot bolted on. It is the nervous system.

---

## Self-hosting

Loom is designed to run on your machine. Your data never leaves your computer. The live demo uses a shared database — for real use, clone and run locally.

---

## License

MIT — free forever, for everyone.

---

## Contributing

Pull requests welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Built with zero budget. Maximum ambition.
