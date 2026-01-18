/**
 * Error handling utilities for better user-facing error messages
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  OFFLINE = 'OFFLINE',
  API = 'API',
  VALIDATION = 'VALIDATION',
  STORAGE = 'STORAGE',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType
  message: string
  userMessage: string
  originalError?: Error
}

/**
 * Check if the browser is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine
}

/**
 * Create a user-friendly error message from an error
 */
export function createAppError(error: unknown, defaultMessage?: string): AppError {
  // Handle string errors
  if (typeof error === 'string') {
    return {
      type: ErrorType.UNKNOWN,
      message: error,
      userMessage: error,
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return {
        type: isOnline() ? ErrorType.NETWORK : ErrorType.OFFLINE,
        message: error.message,
        userMessage: isOnline()
          ? 'Unable to connect to the server. Please check your internet connection and try again.'
          : 'You appear to be offline. Please check your internet connection and try again.',
        originalError: error,
      }
    }

    // API errors
    if (message.includes('api') || message.includes('failed') || message.includes('error')) {
      return {
        type: ErrorType.API,
        message: error.message,
        userMessage: defaultMessage || 'An error occurred while processing your request. Please try again.',
        originalError: error,
      }
    }

    // Storage errors
    if (message.includes('storage') || message.includes('quota') || message.includes('localstorage')) {
      return {
        type: ErrorType.STORAGE,
        message: error.message,
        userMessage: 'Unable to save data locally. Your browser may have storage restrictions enabled.',
        originalError: error,
      }
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return {
        type: ErrorType.VALIDATION,
        message: error.message,
        userMessage: error.message,
        originalError: error,
      }
    }

    // Generic error
    return {
      type: ErrorType.UNKNOWN,
      message: error.message,
      userMessage: defaultMessage || error.message || 'An unexpected error occurred. Please try again.',
      originalError: error,
    }
  }

  // Unknown error type
  return {
    type: ErrorType.UNKNOWN,
    message: String(error),
    userMessage: defaultMessage || 'An unexpected error occurred. Please try again.',
  }
}

/**
 * Get a user-friendly error message for common error scenarios
 */
export function getErrorMessage(error: unknown, context?: string): string {
  const appError = createAppError(error)
  
  if (context) {
    return `${context}: ${appError.userMessage}`
  }
  
  return appError.userMessage
}

/**
 * Hook for detecting online/offline status (returns boolean)
 * Note: This is a utility function, not a React hook (use with useState + useEffect)
 */
export function createOnlineStatusDetector(
  onStatusChange: (isOnline: boolean) => void
): () => void {
  const handleOnline = () => onStatusChange(true)
  const handleOffline = () => onStatusChange(false)

  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }

  return () => {}
}
