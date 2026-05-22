import { getDB } from '../db/index.js'

export function exportAsJSON() {
  const db = getDB()
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    nodes: db.data.nodes,
    edges: db.data.edges,
    objects: db.data.objects
  }
}

export function exportAsMarkdown() {
  const db = getDB()
  const nodes = [...db.data.nodes].sort((a, b) =>
    new Date(a.createdAt) - new Date(b.createdAt)
  )

  const lines = [
    '# Loom Workspace Export',
    `> Exported ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
    `> ${nodes.length} nodes · ${db.data.edges.length} connections`,
    ''
  ]

  const typeIcons = { document: '▤', task: '◻', idea: '◈', data: '⊞' }

  for (const node of nodes) {
    lines.push(`---`)
    lines.push(`## ${typeIcons[node.type] || '▤'} ${node.title}`)
    lines.push(`*Type: ${node.type} · Created: ${new Date(node.createdAt).toLocaleDateString()}*`)
    lines.push('')

    if (node.content) {
      const text = node.content
        .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, (_, t) => `### ${t}\n`)
        .replace(/<li[^>]*>(.*?)<\/li>/gi, (_, t) => `- ${t}\n`)
        .replace(/<p[^>]*>(.*?)<\/p>/gi, (_, t) => `${t}\n`)
        .replace(/<strong[^>]*>(.*?)<\/strong>/gi, (_, t) => `**${t}**`)
        .replace(/<em[^>]*>(.*?)<\/em>/gi, (_, t) => `*${t}*`)
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim()
      if (text) lines.push(text)
    }

    if (node.objects?.length) {
      lines.push('')
      lines.push('**Weaver Extracted:**')
      for (const obj of node.objects) {
        lines.push(`- \`${obj.type}\`: ${obj.content}`)
      }
    }

    const connections = db.data.edges.filter(
      e => e.source === node.id || e.target === node.id
    )
    if (connections.length) {
      lines.push('')
      lines.push('**Connections:**')
      for (const edge of connections) {
        const otherId = edge.source === node.id ? edge.target : edge.source
        const other = nodes.find(n => n.id === otherId)
        if (other) lines.push(`- → ${other.title} *(${edge.label})*`)
      }
    }

    lines.push('')
  }

  return lines.join('\n')
}

export function exportAsCSV() {
  const db = getDB()
  const rows = [
    ['ID', 'Title', 'Type', 'Content', 'Objects', 'Connections', 'Created', 'Updated']
  ]

  for (const node of db.data.nodes) {
    const content = node.content?.replace(/<[^>]*>/g, '').replace(/"/g, '""').slice(0, 200) || ''
    const objects = node.objects?.map(o => `${o.type}:${o.content}`).join('; ') || ''
    const connections = db.data.edges
      .filter(e => e.source === node.id || e.target === node.id)
      .length
    rows.push([
      node.id,
      `"${(node.title || '').replace(/"/g, '""')}"`,
      node.type,
      `"${content}"`,
      `"${objects}"`,
      connections,
      node.createdAt,
      node.updatedAt
    ])
  }

  return rows.map(r => r.join(',')).join('\n')
}
