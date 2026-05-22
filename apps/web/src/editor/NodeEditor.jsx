import React, { useCallback, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useLoomStore } from '../store/index.js'

export default function NodeEditor({ node }) {
  const { updateNode, analyzeText, weaverLoading } = useLoomStore()
  const debounceRef = useRef(null)
  const analyzeDebounce = useRef(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Write anything — the Weaver is watching...' })
    ],
    content: node.content || '',
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      const html = editor.getHTML()

      // Save debounce
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        updateNode(node.id, { content: html })
      }, 800)

      // Weaver analyze debounce — triggers after 3 seconds of no typing
      clearTimeout(analyzeDebounce.current)
      if (text.length > 40) {
        analyzeDebounce.current = setTimeout(() => {
          analyzeText(text, node.id)
        }, 3000)
      }
    }
  })

  return (
    <div style={{ position: 'relative' }}>
      <EditorContent
        editor={editor}
        style={{
          padding: '10px 12px',
          minHeight: 120,
          fontSize: 13,
          lineHeight: 1.7,
          color: 'var(--text)',
          fontFamily: 'Syne, sans-serif'
        }}
      />
      {weaverLoading && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          fontSize: 10,
          color: 'var(--accent)',
          fontFamily: 'JetBrains Mono, monospace',
          animation: 'pulse-glow 1.5s infinite'
        }}>
          ✦ weaving
        </div>
      )}
    </div>
  )
}
