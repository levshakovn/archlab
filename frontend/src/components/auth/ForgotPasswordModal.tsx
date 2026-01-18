import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

export function ForgotPasswordModal({ isOpen, onClose, onSwitchToLogin }: ForgotPasswordModalProps) {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await resetPassword(email)
      setSuccess(true)
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose()
        setEmail('')
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border-4 border-success/20 p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Check Your Email</h2>
            <p className="text-text-secondary mb-4">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-text-secondary mb-6">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border-4 border-primary/20">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-text-primary">Reset Password</h2>
          <button
            onClick={onClose}
            className="text-2xl text-text-secondary hover:text-error transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-text-secondary mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="resetEmail" className="block text-sm font-medium text-text-primary mb-1">
                Email
              </label>
              <input
                id="resetEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 text-center text-sm">
            <span className="text-text-secondary">Remember your password? </span>
            <button
              onClick={onSwitchToLogin}
              className="text-primary hover:text-primary-hover font-semibold"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
