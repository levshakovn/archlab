import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { analytics } from '../services/analytics'

/**
 * Hook to track page views using React Router location
 */
export function usePageTracking(): void {
  const location = useLocation()

  useEffect(() => {
    // Track page view on route change
    const path = location.pathname + location.search
    analytics.trackPageView(path, document.title)
  }, [location])
}
