'use client'
import { useState, useEffect } from 'react'

export function usePersistentState(key, defaultValue) {
  const [state, setState] = useState(defaultValue)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) {
        setState(JSON.parse(stored))
      }
    } catch (err) {
      console.error(`usePersistentState: Error reading key "${key}" from localStorage`, err)
    }
  }, [key])

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch (err) {
      console.error(`usePersistentState: Error writing key "${key}" to localStorage`, err)
    }
  }, [key, state])

  return [state, setState]
}
