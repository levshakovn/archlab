import { getSupabaseClient } from '../lib/supabase'
import { PuzzleCompletion } from '../types'

/**
 * Save or update a puzzle completion for a user
 * Updates best_score if the new score is higher
 * @param userId - The user's ID
 * @param puzzleId - The puzzle ID
 * @param score - The percentage score (0-100)
 */
export async function saveCompletion(
  userId: string,
  puzzleId: string,
  score: number
): Promise<void> {
  const supabase = getSupabaseClient()

  // Round score to integer
  const roundedScore = Math.round(score)

  // Check if completion already exists
  const { data: existing, error: fetchError } = await supabase
    .from('puzzle_completions')
    .select('best_score')
    .eq('user_id', userId)
    .eq('puzzle_id', puzzleId)
    .single()

  // Determine best score
  let bestScore = roundedScore
  if (!fetchError && existing) {
    // If completion exists, use the higher of existing best_score or new score
    bestScore = Math.max(existing.best_score, roundedScore)
  }

  // Upsert completion (insert or update)
  const { error: upsertError } = await supabase
    .from('puzzle_completions')
    .upsert(
      {
        user_id: userId,
        puzzle_id: puzzleId,
        score: roundedScore,
        best_score: bestScore,
        completed_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,puzzle_id',
      }
    )

  if (upsertError) {
    throw new Error(`Failed to save completion: ${upsertError.message}`)
  }
}

/**
 * Get all puzzle completions for a user
 * @param userId - The user's ID
 * @returns Array of puzzle completions sorted by completed_at (newest first)
 */
export async function getCompletions(userId: string): Promise<PuzzleCompletion[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('puzzle_completions')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch completions: ${error.message}`)
  }

  return data || []
}

/**
 * Get a specific puzzle completion for a user
 * @param userId - The user's ID
 * @param puzzleId - The puzzle ID
 * @returns Puzzle completion or null if not found
 */
export async function getCompletion(
  userId: string,
  puzzleId: string
): Promise<PuzzleCompletion | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('puzzle_completions')
    .select('*')
    .eq('user_id', userId)
    .eq('puzzle_id', puzzleId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw new Error(`Failed to fetch completion: ${error.message}`)
  }

  return data
}

/**
 * Get best scores for all puzzles a user has attempted
 * @param userId - The user's ID
 * @returns Map of puzzleId -> bestScore
 */
export async function getBestScores(userId: string): Promise<Record<string, number>> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('puzzle_completions')
    .select('puzzle_id, best_score')
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to fetch best scores: ${error.message}`)
  }

  // Convert array to map
  const bestScores: Record<string, number> = {}
  if (data) {
    for (const completion of data) {
      bestScores[completion.puzzle_id] = completion.best_score
    }
  }

  return bestScores
}
