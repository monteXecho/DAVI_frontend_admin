'use client'
import { useState, useMemo } from 'react'

export const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = useState(config)

  const sortedItems = useMemo(() => {
    if (!items) return []
    
    const sortableItems = [...items]
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const getNestedValue = (obj, path) => {
          return path.split('.').reduce((acc, part) => acc && acc[part], obj)
        }

        const aValue = getNestedValue(a, sortConfig.key)
        const bValue = getNestedValue(b, sortConfig.key)

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' 
            ? aValue.localeCompare(bValue, 'nl', { sensitivity: 'base' })
            : bValue.localeCompare(aValue, 'nl', { sensitivity: 'base' })
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' 
            ? aValue - bValue 
            : bValue - aValue
        }

        if (aValue instanceof Date && bValue instanceof Date) {
          return sortConfig.direction === 'ascending' 
            ? aValue - bValue 
            : bValue - aValue
        }

        if (aValue == null) return sortConfig.direction === 'ascending' ? -1 : 1
        if (bValue == null) return sortConfig.direction === 'ascending' ? 1 : -1

        return 0
      })
    }
    return sortableItems
  }, [items, sortConfig])

  const requestSort = (key) => {
    let direction = 'ascending'
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
      setSortConfig(null)
      return
    }
    
    setSortConfig({ key, direction })
  }

  const getSortDirection = (key) => {
    if (!sortConfig || sortConfig.key !== key) return null
    return sortConfig.direction
  }

  return { 
    items: sortedItems, 
    requestSort, 
    sortConfig,
    getSortDirection,
    resetSort: () => setSortConfig(null)
  }
}