'use client'
import { useState, useEffect } from 'react'

/**
 * Persisted state hook using localStorage.
 * @param {string} key - Storage key
 * @param {any} defaultValue - Initial value if none found in storage
 */
export function usePersistentState(key, defaultValue) {
  const [state, setState] = useState(defaultValue)

  // Load from localStorage on mount
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

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch (err) {
      console.error(`usePersistentState: Error writing key "${key}" to localStorage`, err)
    }
  }, [key, state])

  return [state, setState]
}
