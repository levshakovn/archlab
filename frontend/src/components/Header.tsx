import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { UserAvatar } from './UserAvatar'
import { LoginModal } from './auth/LoginModal'
import { SignUpModal } from './auth/SignUpModal'
import { ForgotPasswordModal } from './auth/ForgotPasswordModal'

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname
  const { user, loading } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)

  // Navigation items
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/workspace', label: 'Tasks' },
  ]

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile')
    } else {
      setShowLoginModal(true)
    }
  }

  const handleSwitchToSignUp = () => {
    setShowLoginModal(false)
    setShowSignUpModal(true)
  }

  const handleSwitchToLogin = () => {
    setShowSignUpModal(false)
    setShowForgotPasswordModal(false)
    setShowLoginModal(true)
  }

  const handleSwitchToForgotPassword = () => {
    setShowLoginModal(false)
    setShowForgotPasswordModal(true)
  }

  return (
    <header className="bg-gradient-to-r from-primary via-primary/95 to-secondary border-b-4 border-primary/20 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">🏗️</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">ArchLab</div>
              <p className="text-white/90 text-xs">AWS Architecture Practice</p>
            </div>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-white/30 text-white border-b-2 border-white'
                      : 'text-white/90 hover:bg-white/20 hover:text-white border-b-2 border-transparent'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Right: User Section */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="px-4 py-2 text-white/70">Loading...</div>
            ) : user ? (
              <button
                onClick={handleProfileClick}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  currentPath === '/profile'
                    ? 'bg-white/30 text-white border-b-2 border-white'
                    : 'text-white/90 hover:bg-white/20 hover:text-white border-b-2 border-transparent'
                }`}
              >
                <UserAvatar />
                <span>Profile</span>
              </button>
            ) : (
              <button
                onClick={handleProfileClick}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors backdrop-blur-sm border border-white/30"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignUp={handleSwitchToSignUp}
        onSwitchToForgotPassword={handleSwitchToForgotPassword}
      />
      <SignUpModal
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </header>
  )
}
