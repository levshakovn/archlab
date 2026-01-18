import React, { useEffect } from 'react'

interface Props {
  message: string
  onClose: () => void
  duration?: number
}

export function ErrorToast({ message, onClose, duration = 5000 }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-error text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-error/50 flex items-center gap-4 min-w-[300px] max-w-[500px]">
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-semibold mb-1">Error</p>
          <p className="text-sm text-white/90">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-white/80 hover:text-white transition"
          aria-label="Close error message"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
