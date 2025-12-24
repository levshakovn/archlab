import { useState, useCallback } from 'react'
import { Puzzle, GraphJSON, GradingResult } from '../types'
import { gradingService } from '../services/gradingService'

export function useGrading() {
  const [result, setResult] = useState<GradingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const grade = useCallback(async (puzzle: Puzzle, graph: GraphJSON) => {
    setLoading(true)
    setError(null)
    try {
      const gradeResult = await gradingService.gradeLocally(puzzle, graph)
      setResult(gradeResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Grading failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResult = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return {
    result,
    loading,
    error,
    grade,
    clearResult,
  }
}

