import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { HomePage } from './components/HomePage'
import { usePageTracking } from './hooks/usePageTracking'

// Lazy load heavy components for code splitting
const PuzzleWorkspace = lazy(() => import('./components/PuzzleWorkspace').then(module => ({ default: module.PuzzleWorkspace })))
const ProfilePage = lazy(() => import('./components/ProfilePage').then(module => ({ default: module.ProfilePage })))
const SupabaseTest = lazy(() => import('./components/SupabaseTest').then(module => ({ default: module.SupabaseTest })))
const AuthCallback = lazy(() => import('./components/auth/AuthCallback').then(module => ({ default: module.AuthCallback })))
const ResetPasswordPage = lazy(() => import('./components/auth/ResetPasswordPage').then(module => ({ default: module.ResetPasswordPage })))

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-white to-blue-50/20 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-text-secondary">Loading...</p>
    </div>
  </div>
)

function AppContent() {
  usePageTracking()

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/workspace" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <PuzzleWorkspace />
            </Suspense>
          } 
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <ProfilePage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/test-supabase" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <SupabaseTest />
            </Suspense>
          } 
        />
        <Route 
          path="/auth/callback" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AuthCallback />
            </Suspense>
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ResetPasswordPage />
            </Suspense>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

