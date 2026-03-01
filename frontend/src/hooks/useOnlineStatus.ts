import { useState, useEffect } from 'react'
import { isOnline } from '../utils/errorHandling'

/**
 * Hook to detect online/offline status
 * @returns boolean indicating if the browser is online
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    return isOnline()
  })

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return online
}
