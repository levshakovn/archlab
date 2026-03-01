/**
 * AI Discussion Service
 * Handles communication with the backend AI discussion endpoint
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export interface AIDiscussionRequest {
  puzzle_id: string
  puzzle_title: string
  puzzle_scenario: string
  question: string
  solution_summary: string
  score: number
  requirements_met: string[]
  requirements_missed: string[]
  feedback: string
  conversation_history?: Array<{ role: string; content: string }>
}

export interface AIDiscussionResponse {
  response: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  estimated_cost: number
}

export const aiService = {
  /**
   * Discuss a solution with AI
   */
  async discuss(request: AIDiscussionRequest): Promise<AIDiscussionResponse> {
    try {
      const response = await fetch(`${API_BASE}/v1/discuss`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to get AI response')
    }
  },
}
