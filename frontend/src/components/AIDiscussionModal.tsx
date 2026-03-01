import { useState, useRef, useEffect } from 'react'
import { Puzzle, GradingResult } from '../types'
import { aiService, AIDiscussionRequest } from '../services/aiService'

interface Props {
  isOpen: boolean
  onClose: () => void
  puzzle: Puzzle
  result: GradingResult
  solutionSummary: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function AIDiscussionModal({ isOpen, onClose, puzzle, result, solutionSummary }: Props) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const percentageScore = Math.round((result.scores.total / 10) * 100)
  const requirementsMet = result.requirements.filter(r => r.met).map(r => r.requirement)
  const requirementsMissed = result.requirements.filter(r => !r.met).map(r => r.requirement)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!question.trim() || question.length < 10) {
      setError('Please ask a question (at least 10 characters)')
      return
    }

    if (question.length > 500) {
      setError('Question is too long (maximum 500 characters)')
      return
    }

    setError(null)
    setLoading(true)

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: question,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setQuestion('')

    try {
      // Build conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }))

      const request: AIDiscussionRequest = {
        puzzle_id: puzzle.id,
        puzzle_title: puzzle.title,
        puzzle_scenario: puzzle.scenario,
        question: userMessage.content,
        solution_summary: solutionSummary,
        score: percentageScore,
        requirements_met: requirementsMet,
        requirements_missed: requirementsMissed,
        feedback: result.summaryFeedback,
        conversation_history: conversationHistory.length > 0 ? conversationHistory : undefined,
      }

      const response = await aiService.discuss(request)

      // Add AI response
      const aiMessage: Message = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI response'
      setError(errorMessage)
      
      // Remove the user message if request failed
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setMessages([])
    setQuestion('')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border-4 border-primary/20">
        {/* Header */}
        <div className="p-6 border-b-2 border-primary/20 flex justify-between items-center bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary">AI Discussion</h2>
              <p className="text-sm text-text-secondary">{puzzle.title}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-2xl text-text-secondary hover:text-error hover:bg-error/10 rounded-full w-8 h-8 flex items-center justify-center transition"
            aria-label="Close AI discussion"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 opacity-50">💬</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Start a Discussion
              </h3>
              <p className="text-text-secondary max-w-md mx-auto">
                Ask questions about your solution, get feedback on improvements, or learn more about AWS architecture best practices.
              </p>
              <div className="mt-6 text-sm text-text-secondary">
                <p className="mb-2">Example questions:</p>
                <ul className="space-y-1 text-left max-w-md mx-auto">
                  <li>• "How can I improve my security score?"</li>
                  <li>• "What are the trade-offs of using S3 vs EBS?"</li>
                  <li>• "Why did I miss the HTTPS requirement?"</li>
                </ul>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-text-primary'
                  }`}
                >
                  <div className="text-sm font-medium mb-1 opacity-80">
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                  <div className="text-xs opacity-60 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-text-secondary">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 pb-2">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-6 border-t border-gray-200 dark:border-slate-700">
          <div className="flex gap-3">
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value)
                setError(null)
              }}
              placeholder="Ask a question about your solution..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={2}
              maxLength={500}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !question.trim() || question.length < 10}
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              aria-label="Send question"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Send'
              )}
            </button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-text-secondary">
              {question.length}/500 characters
            </p>
            <p className="text-xs text-text-secondary">
              {messages.length === 0 ? '10 questions/hour limit' : `${messages.filter(m => m.role === 'user').length} questions asked`}
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
