import React from 'react'
import { useAuth } from '../hooks/useAuth'

interface Props {
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function UserAvatar({ onClick, size = 'md' }: Props) {
  const { profile } = useAuth()

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-2xl',
  }

  // Get user initials
  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    }
    if (profile?.first_name) {
      return profile.first_name[0].toUpperCase()
    }
    if (profile?.email) {
      return profile.email[0].toUpperCase()
    }
    return 'U'
  }

  // If user has a profile photo, show it
  if (profile?.profile_photo_url) {
    return (
      <div
        onClick={onClick}
        className={`${sizeClasses[size]} rounded-full border-2 border-white/50 cursor-pointer hover:border-primary/80 transition-all hover:scale-105 overflow-hidden shadow-md hover:shadow-lg ${
          onClick ? '' : 'cursor-default'
        }`}
        title={profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : 'Profile'}
      >
        <img
          src={profile.profile_photo_url}
          alt={profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : 'Profile'}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const parent = target.parentElement
            if (parent) {
              parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 text-primary ${textSizes[size]} font-semibold">${getInitials()}</div>`
            }
          }}
        />
      </div>
    )
  }

  // Default: show initials or icon
  return (
    <div
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-white/50 cursor-pointer hover:border-primary/80 transition-all hover:scale-105 flex items-center justify-center shadow-md hover:shadow-lg ${
        onClick ? '' : 'cursor-default'
      }`}
      title={profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : 'Profile'}
    >
      {profile?.first_name || profile?.last_name ? (
        <span className={`${textSizes[size]} font-semibold text-primary`}>
          {getInitials()}
        </span>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${iconSizes[size]} text-primary`}
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )}
    </div>
  )
}

