import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = '/' }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to home if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} replace />
  }

  // User is authenticated, render the protected content
  return <>{children}</>
}
