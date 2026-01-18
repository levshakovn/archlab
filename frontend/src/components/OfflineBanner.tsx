

interface Props {
  isOnline: boolean
}

export function OfflineBanner({ isOnline }: Props) {
  if (isOnline) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-slide-in md:left-auto md:right-4 md:w-auto md:max-w-md">
      <div className="bg-warning/95 text-white px-6 py-3 rounded-lg shadow-2xl border-2 border-warning/50 flex items-center gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">You're offline</p>
          <p className="text-xs text-white/90">Some features may be limited. Your work is saved locally.</p>
        </div>
      </div>
    </div>
  )
}
