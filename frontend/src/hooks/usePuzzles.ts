import { useState, useEffect } from 'react'
import { Puzzle } from '../types'
import { analytics } from '../services/analytics'

// Lazy load puzzles data for code splitting
async function loadPuzzlesData() {
  // Dynamic import for code splitting - puzzles.json is large
  const module = await import('../data/puzzles.json')
  return module.default
}

export function usePuzzles() {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([])
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Lazy load puzzles data
    loadPuzzlesData()
      .then((data) => {
        // Type assertion: puzzles.json has correct structure but TypeScript is strict about optional props
        setPuzzles(data.puzzles as unknown as Puzzle[])
        const initialPuzzle = (data.puzzles[0] || null) as Puzzle | null
        setCurrentPuzzle(initialPuzzle)
        // Track initial puzzle load
        if (initialPuzzle) {
          analytics.trackPuzzleSelected(initialPuzzle.id, initialPuzzle.title)
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error('Failed to load puzzles:', error)
        setLoading(false)
      })
  }, [])

  const selectPuzzle = (puzzleId: string) => {
    const puzzle = puzzles.find((p) => p.id === puzzleId)
    if (puzzle) {
      setCurrentPuzzle(puzzle)
      // Track puzzle selection
      analytics.trackPuzzleSelected(puzzle.id, puzzle.title)
    }
  }

  return {
    puzzles,
    currentPuzzle,
    loading,
    selectPuzzle,
  }
}

