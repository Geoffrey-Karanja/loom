// Protocol definitions — adaptive AI playbooks
export const PROTOCOLS = {
  'project-launch': {
    id: 'project-launch',
    name: 'Project Launch',
    icon: '🚀',
    description: 'Full project kickoff — goals, tasks, risks, comms',
    steps: [
      { id: 'vision',      label: 'Vision Node',       type: 'document', content: '## Project Vision\n\nWhat are we building and why?' },
      { id: 'goals',       label: 'Goals & OKRs',      type: 'document', content: '## Goals\n\n- Goal 1\n- Goal 2' },
      { id: 'risks',       label: 'Risk Register',     type: 'data',     content: '## Risks\n\n- Risk: \n- Mitigation: ' },
      { id: 'kickoff',     label: 'Kickoff Tasks',     type: 'task',     content: '## Tasks\n\n- [ ] Define scope\n- [ ] Assign owners\n- [ ] Set timeline' },
      { id: 'comms',       label: 'Comms Plan',        type: 'document', content: '## Communications\n\nStakeholders:\nCadence:\nChannels:' },
    ]
  },
  'weekly-review': {
    id: 'weekly-review',
    name: 'Weekly Review',
    icon: '📋',
    description: 'Structured weekly retrospective and planning',
    steps: [
      { id: 'wins',        label: 'Wins This Week',    type: 'idea',     content: '## Wins\n\n- ' },
      { id: 'blockers',    label: 'Blockers',          type: 'data',     content: '## Blockers\n\n- ' },
      { id: 'next-week',   label: 'Next Week Plan',    type: 'task',     content: '## Next Week\n\n- [ ] ' },
      { id: 'insights',    label: 'Key Insights',      type: 'idea',     content: '## Insights\n\n- ' },
    ]
  },
  'crisis-response': {
    id: 'crisis-response',
    name: 'Crisis Response',
    icon: '⚡',
    description: 'Rapid structured response to critical issues',
    steps: [
      { id: 'incident',    label: 'Incident Report',   type: 'document', content: '## Incident\n\nWhat happened:\nSeverity:\nAffected:' },
      { id: 'immediate',   label: 'Immediate Actions', type: 'task',     content: '## Immediate\n\n- [ ] Triage\n- [ ] Notify stakeholders\n- [ ] Assign lead' },
      { id: 'root-cause',  label: 'Root Cause',        type: 'data',     content: '## Root Cause Analysis\n\nWhy:\nContributing factors:' },
      { id: 'resolution',  label: 'Resolution Plan',   type: 'task',     content: '## Resolution\n\n- [ ] Fix\n- [ ] Test\n- [ ] Deploy\n- [ ] Post-mortem' },
    ]
  },
  'research-sprint': {
    id: 'research-sprint',
    name: 'Research Sprint',
    icon: '🔬',
    description: 'Structured research and synthesis workflow',
    steps: [
      { id: 'question',    label: 'Research Question', type: 'document', content: '## Question\n\nWhat are we trying to learn?' },
      { id: 'sources',     label: 'Sources',           type: 'data',     content: '## Sources\n\n- Source 1:\n- Source 2:' },
      { id: 'findings',    label: 'Findings',          type: 'idea',     content: '## Findings\n\n- ' },
      { id: 'synthesis',   label: 'Synthesis',         type: 'document', content: '## Synthesis\n\nKey takeaways:\nImplications:\nNext steps:' },
    ]
  },
  'decision-record': {
    id: 'decision-record',
    name: 'Decision Record',
    icon: '⚖️',
    description: 'Capture and document important decisions',
    steps: [
      { id: 'context',     label: 'Context',           type: 'document', content: '## Context\n\nWhat is the situation?' },
      { id: 'options',     label: 'Options',           type: 'data',     content: '## Options\n\nOption A:\nOption B:\nOption C:' },
      { id: 'decision',    label: 'Decision',          type: 'idea',     content: '## Decision\n\nWe will:\nBecause:' },
      { id: 'consequences',label: 'Consequences',      type: 'document', content: '## Consequences\n\nPositive:\nNegative:\nRisks:' },
    ]
  }
}

export function getProtocol(id) {
  return PROTOCOLS[id] || null
}

export function getAllProtocols() {
  return Object.values(PROTOCOLS)
}
