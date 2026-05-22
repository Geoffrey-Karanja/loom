import { useState, useMemo } from 'react'

export function useSearch(items, keys = ['title', 'content']) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter(item =>
      keys.some(key => {
        const val = item[key]
        if (!val) return false
        return val.replace(/<[^>]*>/g, '').toLowerCase().includes(q)
      })
    )
  }, [items, query, keys])

  return { query, setQuery, results }
}
