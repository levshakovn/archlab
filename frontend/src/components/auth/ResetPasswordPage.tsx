import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getSupabaseClient } from '../../lib/supabase'
import { Header } from '../Header'
import { validatePassword } from '../../utils/passwordValidation'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { updatePassword, user } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  // Check if we have a valid session (from password reset link)
  useEffect(() => {
    const supabase = getSupabaseClient()
    
    const checkSession = async () => {
      try {
        // Get session - Supabase should have set it from the reset link
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          setError('Invalid or expired reset link. Please request a new password reset.')
        }
      } catch (err) {
        setError('Failed to verify reset link. Please request a new password reset.')
      } finally {
        setCheckingSession(false)
      }
    }

    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors.join('. '))
      return
    }

    setLoading(true)

    try {
      await updatePassword(password)
      setSuccess(true)
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Verifying reset link...</p>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border-4 border-success/20 p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Password Reset Successful!</h2>
            <p className="text-text-secondary mb-6">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] px-6 py-12">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border-4 border-error/20 p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Invalid Reset Link</h2>
            <p className="text-text-secondary mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-white">
      <Header />
      <div className="flex items-center justify-center min-h-[60vh] px-6 py-12">
        <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border-4 border-primary/20 p-8">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Reset Your Password</h2>
          <p className="text-text-secondary mb-6">
            Enter your new password below.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-text-primary mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50"
                placeholder="••••••••"
              />
              <p className="text-xs text-text-secondary mt-1">
                Must include: 8+ chars, lowercase, uppercase, digit, symbol
              </p>
            </div>

            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-text-primary mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmNewPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <button
              onClick={() => navigate('/')}
              className="text-primary hover:text-primary-hover font-semibold"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
