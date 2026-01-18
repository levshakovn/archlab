
import { useState, useEffect } from 'react'
import { GradingResult } from '../types'
import { useAuth } from '../hooks/useAuth'
import { LoginModal } from './auth/LoginModal'
import { SignUpModal } from './auth/SignUpModal'

interface Props {
  result: GradingResult | null
  onClose: () => void
}

// Fun celebration messages for 100% score
const CELEBRATION_MESSAGES = [
  "You're the cloud architect Jeff Bezos wishes he hired! ☁️",
  "Even Lambda functions are celebrating your perfection! ⚡",
  "Your architecture is so good, it could survive a zombie apocalypse! 🧟☁️",
  "You've achieved 100% - time to update your LinkedIn! 💼",
  "This solution is so optimal, it just solved global warming! 🌍",
  "Your architecture is tighter than an S3 bucket's permissions! 🔒",
  "CloudFormation templates bow before your greatness! 📜",
  "Even the S3 buckets are clapping! Well, they're objects, so... 👏",
  "You've achieved AWS Certified God status! 🏛️",
  "Your solution is so perfect, it's got 11 nines of availability! 9️⃣",
]

export function ResultPanel({ result, onClose }: Props) {
  const { user } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [celebrationMessage, setCelebrationMessage] = useState<string>('')

  // Calculate percentage score (total is out of 10, convert to percentage)
  const percentageScore = result ? Math.round((result.scores.total / 10) * 100) : 0

  // Set celebration message when score is 100%
  useEffect(() => {
    if (percentageScore === 100) {
      // Randomly select a celebration message
      const randomMessage = CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)]
      setCelebrationMessage(randomMessage)
    } else {
      setCelebrationMessage('')
    }
  }, [percentageScore])

  if (!result) return null

  const handleAIDiscuss = () => {
    // TODO: Implement AI discussion feature
    // For now, show a placeholder message
    alert('AI discussion feature coming soon! This will allow you to discuss your solution and get personalized feedback from AI.')
  }

  const handleSwitchToSignUp = () => {
    setShowLoginModal(false)
    setShowSignUpModal(true)
  }

  const handleSwitchToLogin = () => {
    setShowSignUpModal(false)
    setShowLoginModal(true)
  }

  const scoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl border-4 border-primary/20">
        <div className="p-6 border-b-2 border-primary/20 flex justify-between items-center sticky top-0 bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <h2 className="text-2xl font-bold text-primary">Evaluation Results</h2>
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-text-secondary hover:text-error hover:bg-error/10 rounded-full w-8 h-8 flex items-center justify-center transition"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6 relative overflow-hidden">
          {/* Celebration confetti/emojis for 100% */}
          {percentageScore === 100 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
              {[...Array(12)].map((_, i) => (
                <span
                  key={i}
                  className="absolute text-2xl animate-celebration-emoji"
                  style={{
                    left: `${(i * 100) / 12}%`,
                    animationDelay: `${i * 0.1}s`,
                    fontSize: '24px',
                  }}
                >
                  {['🎉', '🎊', '⭐', '✨', '🏆', '👏'][i % 6]}
                </span>
              ))}
            </div>
          )}

          {/* Overall Score as Percentage */}
          <div
            className={`bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 p-8 rounded-xl border-2 border-primary/30 shadow-lg text-center relative z-0 ${
              percentageScore === 100
                ? 'animate-celebration-pulse border-green-500'
                : ''
            }`}
          >
            <div className="text-text-secondary text-sm mb-3 font-semibold uppercase tracking-wide">
              SCORE
            </div>
            <div
              className={`text-6xl font-bold mb-2 ${scoreColor(percentageScore)} ${
                percentageScore === 100 ? 'animate-celebration-bounce' : ''
              }`}
            >
              {percentageScore}%
            </div>
            <div className="text-sm text-text-secondary">
              {percentageScore === 100 && celebrationMessage && (
                <div className="mt-2">
                  <span className="text-xl font-semibold text-green-600 animate-celebration-bounce inline-block">
                    {celebrationMessage}
                  </span>
                </div>
              )}
              {percentageScore >= 80 && percentageScore < 100 && 'Excellent! 🎉'}
              {percentageScore >= 60 && percentageScore < 80 && 'Good work! 👍'}
              {percentageScore < 60 && 'Keep practicing! 💪'}
            </div>
          </div>

          {/* Architecture Validation */}
          <div>
            <h3 className="font-semibold mb-3 text-text-primary flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full"></span>
              Architecture Validation
            </h3>
            <div className="space-y-2">
              {result.requirements.map((req, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border-2 transition ${
                  req.met 
                    ? 'bg-success/10 border-success/30 hover:bg-success/15' 
                    : 'bg-error/10 border-error/30 hover:bg-error/15'
                }`}>
                  <div className={`text-xl flex-shrink-0 ${req.met ? 'text-success' : 'text-error'}`}>
                    {req.met ? '✓' : '✗'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-text-primary">{req.requirement}</div>
                    <div className="text-xs text-text-secondary mt-1">{req.comment}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg border-l-4 border-primary shadow-sm">
            <h3 className="font-semibold mb-2 text-primary flex items-center gap-2">
              <span>💡</span>
              Feedback
            </h3>
            <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line space-y-2">
              {result.summaryFeedback.split('\n\n').map((paragraph, i) => {
                // Parse markdown-style links [text](url)
                const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
                const parts: (string | JSX.Element)[] = []
                let lastIndex = 0
                let match
                
                while ((match = linkRegex.exec(paragraph)) !== null) {
                  // Add text before link
                  if (match.index > lastIndex) {
                    parts.push(paragraph.substring(lastIndex, match.index))
                  }
                  // Add link
                  parts.push(
                    <a
                      key={match.index}
                      href={match[2]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover underline"
                    >
                      {match[1]}
                    </a>
                  )
                  lastIndex = match.index + match[0].length
                }
                // Add remaining text
                if (lastIndex < paragraph.length) {
                  parts.push(paragraph.substring(lastIndex))
                }
                
                // If no links found, just return the paragraph
                if (parts.length === 0) {
                  return <p key={i}>{paragraph}</p>
                }
                
                return <p key={i}>{parts}</p>
              })}
            </div>
          </div>

          {/* Hard Constraints */}
          {result.hardConstraintViolations.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-error">
              <h3 className="font-semibold mb-2 text-red-900">Issues</h3>
              <ul className="text-sm space-y-1">
                {result.hardConstraintViolations.map((violation, i) => (
                  <li key={i} className="text-red-800">
                    • {violation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Discussion / Sign Up Section */}
          <div className="pt-4 border-t border-gray-200">
            {user ? (
              // Authenticated users see AI discussion button
              <>
                <button
                  onClick={handleAIDiscuss}
                  className="w-full px-6 py-3 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span className="text-xl">🤖</span>
                  <span>Discuss Solution with AI</span>
                </button>
                <p className="text-xs text-text-secondary mt-2 text-center">
                  Get personalized feedback and suggestions for improvement
                </p>
              </>
            ) : (
              // Non-authenticated users see sign up prompt
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border-2 border-primary/20">
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">🤖</div>
                  <h3 className="font-semibold text-text-primary mb-1">Unlock AI Discussion</h3>
                  <p className="text-sm text-text-secondary">
                    Sign up for free to discuss your solution with AI and get personalized feedback
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSignUpModal(true)}
                    className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                  >
                    Sign Up Free
                  </button>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="flex-1 px-4 py-2.5 border-2 border-primary text-primary hover:bg-primary/10 font-semibold rounded-lg transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignUp={handleSwitchToSignUp}
        onSwitchToForgotPassword={() => setShowLoginModal(false)}
      />
      <SignUpModal
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  )
}

