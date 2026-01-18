import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getSupabaseClient } from '../../lib/supabase'
import { analytics } from '../../services/analytics'

export function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if this is a password reset callback
        const type = searchParams.get('type')
        if (type === 'recovery') {
          // This is a password reset link - redirect to reset password page
          // Preserve the hash and query params for the reset page
          navigate(`/reset-password${window.location.hash}${window.location.search}`)
          return
        }

        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          navigate('/?error=auth_failed')
          return
        }

        if (data.session) {
          // Successfully authenticated - track Google sign in
          analytics.trackUserSignedIn('google')
          navigate('/profile')
        } else {
          // No session found
          navigate('/?error=no_session')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/?error=auth_failed')
      }
    }

    handleAuthCallback()
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-text-secondary">Completing sign in...</p>
      </div>
    </div>
  )
}
