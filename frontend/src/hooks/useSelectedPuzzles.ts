import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'archlab-selected-puzzles'

export function useSelectedPuzzles() {
  const [selectedPuzzleIds, setSelectedPuzzleIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedPuzzleIds))
  }, [selectedPuzzleIds])

  const addPuzzle = useCallback((puzzleId: string) => {
    setSelectedPuzzleIds((prev) => {
      if (prev.includes(puzzleId)) return prev
      return [...prev, puzzleId]
    })
  }, [])

  const removePuzzle = useCallback((puzzleId: string) => {
    setSelectedPuzzleIds((prev) => prev.filter((id) => id !== puzzleId))
  }, [])

  const togglePuzzle = useCallback((puzzleId: string) => {
    setSelectedPuzzleIds((prev) => {
      if (prev.includes(puzzleId)) {
        return prev.filter((id) => id !== puzzleId)
      }
      return [...prev, puzzleId]
    })
  }, [])

  const isSelected = useCallback(
    (puzzleId: string) => selectedPuzzleIds.includes(puzzleId),
    [selectedPuzzleIds]
  )

  const clearSelected = useCallback(() => {
    setSelectedPuzzleIds([])
  }, [])

  return {
    selectedPuzzleIds,
    addPuzzle,
    removePuzzle,
    togglePuzzle,
    isSelected,
    clearSelected,
  }
}
