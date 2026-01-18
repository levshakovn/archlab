import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { PuzzleCompletion } from '../types'
import { getCompletions, getBestScores } from '../services/completionService'

export function useCompletions() {
  const { user } = useAuth()
  const [completions, setCompletions] = useState<PuzzleCompletion[]>([])
  const [bestScores, setBestScores] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCompletions = useCallback(async () => {
    if (!user) {
      setCompletions([])
      setBestScores({})
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [completionsData, bestScoresData] = await Promise.all([
        getCompletions(user.id),
        getBestScores(user.id),
      ])

      setCompletions(completionsData)
      setBestScores(bestScoresData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch completions'
      setError(errorMessage)
      console.error('Error fetching completions:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchCompletions()
  }, [fetchCompletions])

  // Create a map of puzzleId -> PuzzleCompletion for easy lookup
  const completionsMap = completions.reduce((acc, completion) => {
    acc[completion.puzzle_id] = completion
    return acc
  }, {} as Record<string, PuzzleCompletion>)

  return {
    completions,
    completionsMap,
    bestScores,
    loading,
    error,
    refresh: fetchCompletions,
  }
}
