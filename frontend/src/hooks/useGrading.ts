import { useState, useCallback } from 'react'
import { Puzzle, GraphJSON, GradingResult } from '../types'
import { gradingService } from '../services/gradingService'
import { useAuth } from './useAuth'
import { saveCompletion } from '../services/completionService'
import { getErrorMessage } from '../utils/errorHandling'
import { analytics } from '../services/analytics'

export function useGrading() {
  const { user } = useAuth()
  const [result, setResult] = useState<GradingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const grade = useCallback(async (puzzle: Puzzle, graph: GraphJSON) => {
    setLoading(true)
    setError(null)
    
    // Validate input
    if (!puzzle) {
      setError('No puzzle selected')
      setLoading(false)
      return
    }
    
    if (!graph || Object.keys(graph.nodes).length === 0) {
      setError('Please add at least one service to the canvas before grading')
      setLoading(false)
      return
    }

    try {
      const gradeResult = await gradingService.gradeLocally(puzzle, graph)
      setResult(gradeResult)

      // Calculate percentage score for tracking
      const percentageScore = (gradeResult.scores.total / 10) * 100

      // Track grading event
      analytics.trackPuzzleGraded(puzzle.id, percentageScore)

      // Save completion if user is authenticated
      if (user) {
        try {
          await saveCompletion(user.id, puzzle.id, percentageScore)
          // Track completion event (only when successfully saved)
          analytics.trackPuzzleCompleted(puzzle.id, percentageScore)
        } catch (completionError) {
          // Log error but don't fail the grading - use friendly error message
          console.error('Failed to save completion:', completionError)
          // Optionally show a non-blocking warning, but don't fail grading
        }
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Grading failed')
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user])

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

