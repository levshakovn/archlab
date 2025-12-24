import React from 'react'

interface Props {
  onClick?: () => void
}

export function UserAvatar({ onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-white/50 cursor-pointer hover:border-primary/80 transition-all hover:scale-105 flex items-center justify-center shadow-md hover:shadow-lg"
      title="User profile (coming soon)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 text-primary"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  )
}

