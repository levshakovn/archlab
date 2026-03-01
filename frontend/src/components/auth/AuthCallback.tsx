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
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        if (errorParam) {
          console.error('OAuth error:', errorParam, errorDescription)
          navigate(`/?error=oauth_${errorParam}`)
          return
        }

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
          const user = data.session.user
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single()

          if (!profileData && (profileError as { code?: string }).code === 'PGRST116') {
            const metadata = user.user_metadata || {}
            const fullName = typeof metadata.full_name === 'string' ? metadata.full_name.trim() : ''
            const [firstName, ...rest] = fullName ? fullName.split(' ') : []
            const lastName = rest.length > 0 ? rest.join(' ') : ''

            await supabase.from('profiles').insert({
              id: user.id,
              email: user.email || '',
              first_name: metadata.first_name || firstName || null,
              last_name: metadata.last_name || lastName || null,
              profile_photo_url: metadata.avatar_url || metadata.picture || null,
            })
          }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-white dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-text-secondary">Completing sign in...</p>
      </div>
    </div>
  )
}
