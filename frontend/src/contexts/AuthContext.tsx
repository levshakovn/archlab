import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { getSupabaseClient } from '../lib/supabase'
import { analytics } from '../services/analytics'

interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  profile_photo_url: string | null
  created_at?: string
  updated_at?: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = getSupabaseClient()

  const buildProfileInsert = (user: User) => {
    const metadata = user.user_metadata || {}
    const fullName = typeof metadata.full_name === 'string' ? metadata.full_name.trim() : ''
    const [firstName, ...rest] = fullName ? fullName.split(' ') : []
    const lastName = rest.length > 0 ? rest.join(' ') : ''

    return {
      id: user.id,
      email: user.email || '',
      first_name: metadata.first_name || firstName || null,
      last_name: metadata.last_name || lastName || null,
      profile_photo_url: metadata.avatar_url || metadata.picture || null,
    }
  }

  // Load user and profile
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if ((error as { code?: string }).code === 'PGRST116') {
          const { data: userData } = await supabase.auth.getUser()
          if (userData?.user) {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert(buildProfileInsert(userData.user))
            if (!insertError) {
              await loadProfile(userId)
              return
            }
          }
        }

        console.warn('Profile not found, will be created on next auth event:', error.message)
        setProfile(null)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    // Track successful sign in
    analytics.trackUserSignedIn('email')
  }

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName || '',
          last_name: lastName || '',
        },
      },
    })
    if (error) throw error
    // Track successful sign up
    analytics.trackUserSignedUp('email')
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        scopes: 'email profile',
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    // Track sign out
    analytics.trackUserSignedOut()
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
  }

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) throw new Error('Not authenticated')
    
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)

    if (error) throw error
    await loadProfile(user.id) // Reload profile
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
