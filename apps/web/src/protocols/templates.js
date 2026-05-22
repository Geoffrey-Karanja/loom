export const TEMPLATES = [
  {
    id: 'meeting-notes',
    icon: '📝',
    label: 'Meeting Notes',
    type: 'document',
    color: '#7c6af7',
    title: 'Meeting Notes — {date}',
    content: `<h2>Meeting Notes</h2><p><strong>Date:</strong> {date}</p><p><strong>Attendees:</strong> </p><p><strong>Agenda:</strong></p><ul><li></li></ul><h3>Decisions</h3><ul><li></li></ul><h3>Action Items</h3><ul><li>[ ] </li></ul><h3>Next Steps</h3><ul><li></li></ul>`
  },
  {
    id: 'bug-report',
    icon: '🐛',
    label: 'Bug Report',
    type: 'data',
    color: '#f87171',
    title: 'Bug — ',
    content: `<h2>Bug Report</h2><p><strong>Severity:</strong> </p><p><strong>Steps to reproduce:</strong></p><ol><li></li></ol><p><strong>Expected:</strong> </p><p><strong>Actual:</strong> </p><p><strong>Environment:</strong> </p>`
  },
  {
    id: 'feature-request',
    icon: '✨',
    label: 'Feature Request',
    type: 'idea',
    color: '#fbbf24',
    title: 'Feature — ',
    content: `<h2>Feature Request</h2><p><strong>Problem it solves:</strong> </p><p><strong>Proposed solution:</strong> </p><p><strong>Acceptance criteria:</strong></p><ul><li></li></ul><p><strong>Priority:</strong> </p>`
  },
  {
    id: 'task-list',
    icon: '✅',
    label: 'Task List',
    type: 'task',
    color: '#2dd4bf',
    title: 'Tasks — ',
    content: `<h2>Task List</h2><ul><li>[ ] Task 1</li><li>[ ] Task 2</li><li>[ ] Task 3</li></ul>`
  },
  {
    id: 'decision',
    icon: '⚖️',
    label: 'Decision Record',
    type: 'document',
    color: '#7c6af7',
    title: 'Decision — ',
    content: `<h2>Decision Record</h2><p><strong>Context:</strong> </p><p><strong>Options considered:</strong></p><ul><li>Option A: </li><li>Option B: </li></ul><p><strong>Decision:</strong> </p><p><strong>Rationale:</strong> </p>`
  },
  {
    id: 'user-research',
    icon: '🔬',
    label: 'User Research',
    type: 'document',
    color: '#a78bfa',
    title: 'Research — ',
    content: `<h2>User Research</h2><p><strong>Participant:</strong> </p><p><strong>Date:</strong> {date}</p><h3>Key Quotes</h3><ul><li></li></ul><h3>Pain Points</h3><ul><li></li></ul><h3>Insights</h3><ul><li></li></ul>`
  },
  {
    id: 'weekly-plan',
    icon: '📅',
    label: 'Weekly Plan',
    type: 'task',
    color: '#2dd4bf',
    title: 'Week of {date}',
    content: `<h2>Weekly Plan</h2><h3>Monday</h3><ul><li>[ ] </li></ul><h3>Tuesday</h3><ul><li>[ ] </li></ul><h3>Wednesday</h3><ul><li>[ ] </li></ul><h3>Thursday</h3><ul><li>[ ] </li></ul><h3>Friday</h3><ul><li>[ ] </li></ul>`
  },
  {
    id: 'brainstorm',
    icon: '🧠',
    label: 'Brainstorm',
    type: 'idea',
    color: '#fbbf24',
    title: 'Brainstorm — ',
    content: `<h2>Brainstorm</h2><p><strong>Topic:</strong> </p><h3>Ideas</h3><ul><li></li><li></li><li></li></ul><h3>Wild Ideas</h3><ul><li></li></ul><h3>Next Steps</h3><ul><li></li></ul>`
  }
]

export function applyTemplate(template) {
  const date = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
  return {
    type: template.type,
    title: template.title.replace('{date}', date),
    content: template.content.replace(/\{date\}/g, date)
  }
}
