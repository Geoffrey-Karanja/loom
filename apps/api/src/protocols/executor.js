import { randomUUID } from 'crypto'
import { getDB } from '../db/index.js'

export const PROTOCOL_DEFINITIONS = {
  'project-launch': {
    name: 'Project Launch',
    steps: [
      { type: 'document', title: 'Vision',      content: '## Project Vision\n\nWhat are we building and why?' },
      { type: 'document', title: 'Goals',        content: '## Goals & OKRs\n\n- Goal 1\n- Goal 2' },
      { type: 'data',     title: 'Risks',        content: '## Risk Register\n\n| Risk | Severity | Mitigation |\n|------|----------|------------|' },
      { type: 'task',     title: 'Kickoff Tasks', content: '## Tasks\n\n- [ ] Define scope\n- [ ] Assign owners\n- [ ] Set timeline' },
      { type: 'document', title: 'Comms Plan',   content: '## Communications\n\nStakeholders:\nCadence:\nChannels:' },
    ]
  },
  'weekly-review': {
    name: 'Weekly Review',
    steps: [
      { type: 'idea',     title: 'Wins',         content: '## Wins This Week\n\n- ' },
      { type: 'data',     title: 'Blockers',     content: '## Blockers\n\n- ' },
      { type: 'task',     title: 'Next Week',    content: '## Next Week\n\n- [ ] ' },
      { type: 'idea',     title: 'Insights',     content: '## Key Insights\n\n- ' },
    ]
  },
  'crisis-response': {
    name: 'Crisis Response',
    steps: [
      { type: 'document', title: 'Incident',     content: '## Incident\n\nWhat:\nSeverity:\nAffected:' },
      { type: 'task',     title: 'Immediate',    content: '## Immediate Actions\n\n- [ ] Triage\n- [ ] Notify\n- [ ] Assign lead' },
      { type: 'data',     title: 'Root Cause',   content: '## Root Cause\n\nWhy:\nContributing factors:' },
      { type: 'task',     title: 'Resolution',   content: '## Resolution\n\n- [ ] Fix\n- [ ] Test\n- [ ] Deploy\n- [ ] Post-mortem' },
    ]
  }
}

export async function executeProtocol(protocolId, options = {}) {
  const protocol = PROTOCOL_DEFINITIONS[protocolId]
  if (!protocol) throw new Error(`Unknown protocol: ${protocolId}`)

  const db = getDB()
  const created = []
  const spacing = 360
  const startX = options.startX || 100
  const startY = options.startY || 100

  for (let i = 0; i < protocol.steps.length; i++) {
    const step = protocol.steps[i]
    const node = {
      id: randomUUID(),
      type: step.type,
      title: `[${protocol.name}] ${step.title}`,
      content: step.content,
      position: {
        x: startX + (i % 3) * spacing,
        y: startY + Math.floor(i / 3) * 300
      },
      size: { w: 320, h: 200 },
      objects: [], tags: ['protocol', protocolId],
      geo: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    db.data.nodes.push(node)
    created.push(node)
  }

  // Auto-link protocol nodes sequentially
  for (let i = 0; i < created.length - 1; i++) {
    db.data.edges.push({
      id: randomUUID(),
      source: created[i].id,
      target: created[i + 1].id,
      label: 'next step',
      weight: 2, sentiment: 'neutral',
      autoLinked: true,
      createdAt: new Date().toISOString()
    })
  }

  await db.write()
  return { protocol: protocol.name, created, nodeCount: created.length }
}
