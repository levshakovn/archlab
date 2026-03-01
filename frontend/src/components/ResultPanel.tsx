
import { useState, useEffect } from 'react'
import { GradingResult, Puzzle } from '../types'
import { useAuth } from '../hooks/useAuth'
import { LoginModal } from './auth/LoginModal'
import { SignUpModal } from './auth/SignUpModal'
import { AIDiscussionModal } from './AIDiscussionModal'

interface Props {
  result: GradingResult | null
  puzzle?: Puzzle | null
  solutionSummary?: string
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

export function ResultPanel({ result, puzzle, solutionSummary = '', onClose }: Props) {
  const { user } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [showAIDiscussion, setShowAIDiscussion] = useState(false)
  const [celebrationMessage, setCelebrationMessage] = useState<string>('')
  const [showCopySuccess, setShowCopySuccess] = useState(false)

  // Calculate percentage score (total is out of 10, convert to percentage)
  const percentageScore = result ? Math.round((result.scores.total / 10) * 100) : 0

  // Social sharing templates with fun, engaging text
  const getShareUrl = () => {
    return window.location.origin
  }

  const getLinkedInTemplate = () => {
    const puzzleTitle = puzzle?.title || 'AWS Architecture Puzzle'
    const url = getShareUrl()

    if (percentageScore === 100) {
      const templates = [
        `🎉 Just achieved a perfect score on "${puzzleTitle}" with ArchLab! 

Mastering AWS architecture one puzzle at a time. This interactive tool is perfect for anyone preparing for AWS certifications or looking to level up their cloud architecture skills.

Check it out and see if you can beat my score! 🏗️☁️

#AWS #CloudArchitecture #AWSCertification #CloudComputing #TechLearning`,

        `🚀 Perfect 100% on "${puzzleTitle}"! 

ArchLab is an amazing free tool for practicing AWS architecture design. Drag-and-drop services, get intelligent feedback, and master the Well-Architected Framework.

Highly recommend for anyone serious about cloud architecture! 💪☁️

#AWS #CloudArchitecture #AWSCertification #DevOps #CloudComputing`,

        `Just crushed "${puzzleTitle}" with a perfect score! 🎯

ArchLab makes learning AWS architecture actually fun. Interactive puzzles, real-time feedback, and it's completely free. Perfect for certification prep!

Who else is leveling up their cloud skills? 🏗️

#AWS #CloudArchitecture #AWSCertification #TechLearning #CloudComputing`
      ]
      return templates[Math.floor(Math.random() * templates.length)] + `\n\n${url}`
    } else if (percentageScore >= 80) {
      return `Great progress on "${puzzleTitle}" - scored ${percentageScore}%! 🎯

ArchLab is helping me master AWS architecture through interactive practice. Each puzzle teaches real-world design patterns and best practices.

Still learning, but getting better every day! 💪☁️

#AWS #CloudArchitecture #AWSCertification #CloudComputing #TechLearning

${url}`
    } else {
      return `Working on "${puzzleTitle}" with ArchLab - scored ${percentageScore}%. 

This free tool is perfect for practicing AWS architecture design. Interactive puzzles, intelligent feedback, and great for certification prep!

Practice makes perfect! 🏗️☁️

#AWS #CloudArchitecture #AWSCertification #CloudComputing #TechLearning

${url}`
    }
  }

  const getXTemplate = () => {
    const puzzleTitle = puzzle?.title || 'AWS Architecture Puzzle'
    const url = getShareUrl()

    if (percentageScore === 100) {
      const templates = [
        `🎉 Perfect score on "${puzzleTitle}"! Just crushed this AWS architecture puzzle on ArchLab. Who's next? 🏗️☁️

#AWS #CloudArchitecture #AWSCertification

${url}`,

        `🚀 100% on "${puzzleTitle}"! ArchLab is the best free tool for practicing AWS architecture. Try it and see if you can beat my score! 💪

#AWS #CloudArchitecture #AWSCertification

${url}`,

        `Just aced "${puzzleTitle}" with a perfect score! 🎯 ArchLab makes learning AWS architecture actually fun. Highly recommend! ☁️

#AWS #CloudArchitecture #AWSCertification

${url}`
      ]
      return templates[Math.floor(Math.random() * templates.length)]
    } else if (percentageScore >= 80) {
      return `Scored ${percentageScore}% on "${puzzleTitle}"! 🎯 Getting better at AWS architecture with ArchLab. Practice makes perfect! 💪☁️

#AWS #CloudArchitecture #AWSCertification

${url}`
    } else {
      return `Working on "${puzzleTitle}" - scored ${percentageScore}%. ArchLab is a great free tool for practicing AWS architecture! 🏗️☁️

#AWS #CloudArchitecture #AWSCertification

${url}`
    }
  }

  const getFacebookTemplate = () => {
    const puzzleTitle = puzzle?.title || 'AWS Architecture Puzzle'
    const url = getShareUrl()

    if (percentageScore === 100) {
      const templates = [
        `🎉 Just achieved a perfect score on "${puzzleTitle}" using ArchLab! 

This is such a cool free tool for practicing AWS architecture design. Interactive puzzles, real-time feedback, and perfect for certification prep!

Check it out and see if you can beat my score! 🏗️☁️`,

        `🚀 Perfect 100% on "${puzzleTitle}"! 

ArchLab makes learning AWS architecture actually fun. Drag-and-drop services, get intelligent feedback, and master cloud design patterns.

Highly recommend for anyone interested in cloud computing! 💪☁️`,

        `Just crushed "${puzzleTitle}" with a perfect score! 🎯

ArchLab is helping me level up my AWS architecture skills. Each puzzle teaches real-world design patterns and best practices.

Who else is working on their cloud skills? 🏗️☁️`
      ]
      return templates[Math.floor(Math.random() * templates.length)] + `\n\n${url}`
    } else if (percentageScore >= 80) {
      return `Great progress on "${puzzleTitle}" - scored ${percentageScore}%! 🎯

ArchLab is an amazing free tool for practicing AWS architecture. Interactive puzzles, intelligent feedback, and great for certification prep!

Still learning, but getting better every day! 💪☁️

${url}`
    } else {
      return `Working on "${puzzleTitle}" with ArchLab - scored ${percentageScore}%. 

This free tool is perfect for practicing AWS architecture design. Interactive puzzles, real-time feedback, and great for learning!

Practice makes perfect! 🏗️☁️

${url}`
    }
  }

  const handleShareLinkedIn = async () => {
    const text = getLinkedInTemplate()
    const url = getShareUrl()

    // LinkedIn's share-offsite endpoint doesn't support pre-filled text
    // So we copy the text to clipboard and open LinkedIn with just the URL
    try {
      await navigator.clipboard.writeText(text)
      setShowCopySuccess(true)
      setTimeout(() => setShowCopySuccess(false), 3000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setShowCopySuccess(true)
        setTimeout(() => setShowCopySuccess(false), 3000)
      } catch (fallbackErr) {
        console.error('Failed to copy text:', fallbackErr)
      }
      document.body.removeChild(textArea)
    }

    // Open LinkedIn share dialog (URL only - user can paste the text)
    const encodedUrl = encodeURIComponent(url)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank', 'width=600,height=400')
  }

  const handleShareX = () => {
    const text = getXTemplate()
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400')
  }

  const handleShareFacebook = () => {
    const text = getFacebookTemplate()
    const url = encodeURIComponent(getShareUrl())
    // Facebook doesn't support pre-filled text, but we can use quote parameter
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400')
  }

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
    if (!puzzle || !result) return
    setShowAIDiscussion(true)
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
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl border-4 border-primary/20">
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
            className={`bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 p-8 rounded-xl border-2 border-primary/30 shadow-lg text-center relative z-0 ${percentageScore === 100
                ? 'animate-celebration-pulse border-green-500'
                : ''
              }`}
          >
            <div className="text-text-secondary text-sm mb-3 font-semibold uppercase tracking-wide">
              SCORE
            </div>
            <div
              className={`text-6xl font-bold mb-2 ${scoreColor(percentageScore)} ${percentageScore === 100 ? 'animate-celebration-bounce' : ''
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
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border-2 transition ${req.met
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

          {/* Social Sharing Section */}
          <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
            <h3 className="font-semibold mb-3 text-text-primary flex items-center gap-2">
              <span>📤</span>
              Share Your Achievement
            </h3>
            <div className="flex gap-3 mb-4">
              <button
                onClick={handleShareLinkedIn}
                className="flex-1 px-4 py-2.5 bg-[#0077b5] hover:bg-[#006399] text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                aria-label="Share on LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .771 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .771 23.2 0 22.222 0h.003z" />
                </svg>
                <span>LinkedIn</span>
              </button>
              <button
                onClick={handleShareX}
                className="flex-1 px-4 py-2.5 bg-black hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                aria-label="Share on X (Twitter)"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X</span>
              </button>
              <button
                onClick={handleShareFacebook}
                className="flex-1 px-4 py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                aria-label="Share on Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
                <span>Facebook</span>
              </button>
            </div>
            {showCopySuccess && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-500/30 rounded-lg flex items-center gap-2 animate-slide-in">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                  Text copied to clipboard! Paste it into LinkedIn when the share dialog opens.
                </p>
              </div>
            )}
          </div>

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

      {/* AI Discussion Modal */}
      {puzzle && result && (
        <AIDiscussionModal
          isOpen={showAIDiscussion}
          onClose={() => setShowAIDiscussion(false)}
          puzzle={puzzle}
          result={result}
          solutionSummary={solutionSummary}
        />
      )}
    </div>
  )
}

