import { useState, useEffect } from 'react'
import { Puzzle } from '../types'
import puzzlesData from '../data/puzzles.json'

export function usePuzzles() {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([])
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load puzzles from JSON
    setPuzzles(puzzlesData.puzzles)
    setCurrentPuzzle(puzzlesData.puzzles[0])
    setLoading(false)
  }, [])

  const selectPuzzle = (puzzleId: string) => {
    const puzzle = puzzles.find((p) => p.id === puzzleId)
    if (puzzle) setCurrentPuzzle(puzzle)
  }

  return {
    puzzles,
    currentPuzzle,
    loading,
    selectPuzzle,
  }
}

