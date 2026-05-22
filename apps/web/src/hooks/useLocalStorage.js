import { useState } from 'react'

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initial
    } catch { return initial }
  })

  const set = (val) => {
    try {
      localStorage.setItem(key, JSON.stringify(val))
      setValue(val)
    } catch {}
  }

  const clear = () => {
    localStorage.removeItem(key)
    setValue(initial)
  }

  return [value, set, clear]
}
