// Centralized prompt builder — keeps all AI prompts consistent and tunable

export function buildAnalyzePrompt(text) {
  return `Extract structured objects from this text. Return ONLY JSON:
Text: "${text.slice(0, 600)}"
{"objects":[{"type":"task|decision|question|insight|person|risk","content":"extracted text"}],"connections":["topic"],"summary":"one sentence"}`
}

export function buildResonancePrompt(nodes) {
  const context = nodes
    .map(n => `"${n.title}": ${n.content?.replace(/<[^>]*>/g, '').slice(0, 150)}`)
    .join('\n')
  return `Find 2-3 hidden connections between these notes. Return ONLY JSON:
${context}
{"insights":[{"type":"connection|pattern|risk|opportunity","message":"insight sentence","relatedTitles":["t1","t2"]}]}`
}

export function buildAutolinkPrompt(nodes) {
  const context = nodes.map(n => ({
    id: n.id, title: n.title,
    summary: n.content?.replace(/<[^>]*>/g, '').slice(0, 150)
  }))
  return `Find max 3 meaningful connections. Return ONLY JSON:
${JSON.stringify(context)}
{"links":[{"sourceId":"id","targetId":"id","label":"relationship","strength":3}]}`
}

export function buildChatSystemPrompt(nodes, edges) {
  const workspaceContext = nodes.length > 0
    ? nodes.map(n => {
        const content = n.content?.replace(/<[^>]*>/g, '').slice(0, 200)
        const objs = n.objects?.slice(0, 3).map(o => `${o.type}:${o.content}`).join(', ')
        return `- "${n.title}" (${n.type})${content ? ': ' + content : ''}${objs ? ' [' + objs + ']' : ''}`
      }).join('\n')
    : 'No nodes yet.'

  const edgeContext = edges.length > 0
    ? edges.slice(0, 8).map(e => {
        const src = nodes.find(n => n.id === e.source)?.title || '?'
        const tgt = nodes.find(n => n.id === e.target)?.title || '?'
        return `${src} → ${tgt} (${e.label})`
      }).join(', ')
    : 'none'

  return `You are the Weaver, Loom's AI. Be concise and insightful.
WORKSPACE NODES:
${workspaceContext}
CONNECTIONS: ${edgeContext}
Answer in 2-4 sentences unless detail is needed. Reference node titles exactly.`
}
