/**
 * Analytics service using Brick (privacy-friendly analytics)
 * https://brickmetrics.com
 */

// Initialize Brick on page load if script URL is provided
declare global {
  interface Window {
    brick?: {
      event: (name: string, properties?: Record<string, unknown>) => void
      page: (url: string) => void
    }
  }
}

const BRICK_SCRIPT_URL = import.meta.env.VITE_BRICK_SCRIPT_URL || ''
const ENABLED = !!BRICK_SCRIPT_URL && typeof window !== 'undefined'

// Load Brick script if enabled
if (ENABLED && !document.querySelector('script[data-brick-script]')) {
  const script = document.createElement('script')
  script.src = BRICK_SCRIPT_URL
  script.async = true
  script.setAttribute('data-brick-script', 'true')
  document.head.appendChild(script)
}

/**
 * Track a custom event
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  if (!ENABLED) return

  try {
    // Wait a bit for Brick to load if not yet available
    if (window.brick) {
      window.brick.event(eventName, properties)
    } else {
      // Retry after a short delay if Brick isn't loaded yet
      setTimeout(() => {
        if (window.brick) {
          window.brick.event(eventName, properties)
        }
      }, 100)
    }
  } catch (error) {
    // Silently fail - analytics should never break the app
    console.warn('Analytics tracking failed:', error)
  }
}

/**
 * Track a page view
 */
export function trackPageView(path: string): void {
  if (!ENABLED) return

  try {
    if (window.brick) {
      window.brick.page(path)
    } else {
      setTimeout(() => {
        if (window.brick) {
          window.brick.page(path)
        }
      }, 100)
    }
  } catch (error) {
    console.warn('Page view tracking failed:', error)
  }
}

/**
 * Analytics event names (consistent naming)
 */
export const AnalyticsEvents = {
  // Puzzle events
  PUZZLE_SELECTED: 'puzzle_selected',
  PUZZLE_GRADED: 'puzzle_graded',
  PUZZLE_COMPLETED: 'puzzle_completed',
  
  // User events
  USER_SIGNED_UP: 'user_signed_up',
  USER_SIGNED_IN: 'user_signed_in',
  USER_SIGNED_OUT: 'user_signed_out',
  
  // Canvas events
  CANVAS_CLEARED: 'canvas_cleared',
  SERVICE_ADDED: 'service_added',
  CONNECTION_CREATED: 'connection_created',
  
  // Page views
  PAGE_VIEW: 'page_view',
} as const

/**
 * Helper functions for common events
 */
export const analytics = {
  // Puzzle tracking
  trackPuzzleSelected: (puzzleId: string, puzzleTitle: string) => {
    trackEvent(AnalyticsEvents.PUZZLE_SELECTED, {
      puzzle_id: puzzleId,
      puzzle_title: puzzleTitle,
    })
  },

  trackPuzzleGraded: (puzzleId: string, score: number) => {
    trackEvent(AnalyticsEvents.PUZZLE_GRADED, {
      puzzle_id: puzzleId,
      score,
      score_category: getScoreCategory(score),
    })
  },

  trackPuzzleCompleted: (puzzleId: string, score: number) => {
    trackEvent(AnalyticsEvents.PUZZLE_COMPLETED, {
      puzzle_id: puzzleId,
      score,
      score_category: getScoreCategory(score),
    })
  },

  // User tracking
  trackUserSignedUp: (method: 'email' | 'google') => {
    trackEvent(AnalyticsEvents.USER_SIGNED_UP, {
      method,
    })
  },

  trackUserSignedIn: (method: 'email' | 'google') => {
    trackEvent(AnalyticsEvents.USER_SIGNED_IN, {
      method,
    })
  },

  trackUserSignedOut: () => {
    trackEvent(AnalyticsEvents.USER_SIGNED_OUT)
  },

  // Canvas tracking
  trackCanvasCleared: (puzzleId: string) => {
    trackEvent(AnalyticsEvents.CANVAS_CLEARED, {
      puzzle_id: puzzleId,
    })
  },

  trackServiceAdded: (puzzleId: string, serviceType: string) => {
    trackEvent(AnalyticsEvents.SERVICE_ADDED, {
      puzzle_id: puzzleId,
      service_type: serviceType,
    })
  },

  trackConnectionCreated: (puzzleId: string) => {
    trackEvent(AnalyticsEvents.CONNECTION_CREATED, {
      puzzle_id: puzzleId,
    })
  },

  // Page tracking
  trackPageView: (path: string, title?: string) => {
    trackPageView(path)
    trackEvent(AnalyticsEvents.PAGE_VIEW, {
      path,
      title,
    })
  },
}

/**
 * Helper to categorize scores
 */
function getScoreCategory(score: number): string {
  if (score === 100) return 'perfect'
  if (score >= 80) return 'good'
  if (score >= 60) return 'fair'
  return 'needs_improvement'
}
