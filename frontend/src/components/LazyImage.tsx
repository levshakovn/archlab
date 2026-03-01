import { useState, useEffect, useRef, memo } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  onLoad?: () => void
  onError?: () => void
  loading?: 'lazy' | 'eager'
  placeholder?: string
}

/**
 * LazyImage component that only loads images when they're about to enter the viewport
 * Uses Intersection Observer API for efficient lazy loading
 */
export const LazyImage = memo(function LazyImage({
  src,
  alt,
  className = '',
  onLoad,
  onError,
  loading = 'lazy',
  placeholder,
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(loading === 'eager' ? src : null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // If eager loading or already loaded, skip intersection observer
    if (loading === 'eager' || imageSrc) {
      return
    }

    const imgElement = imgRef.current
    if (!imgElement) return

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start loading the image
            setImageSrc(src)
            // Disconnect observer once image starts loading
            if (observerRef.current && imgElement) {
              observerRef.current.unobserve(imgElement)
            }
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    )

    observerRef.current.observe(imgElement)

    return () => {
      if (observerRef.current && imgElement) {
        observerRef.current.unobserve(imgElement)
      }
    }
  }, [src, loading, imageSrc])

  const handleLoad = () => {
    setIsLoaded(true)
    if (onLoad) {
      onLoad()
    }
  }

  const handleError = () => {
    setHasError(true)
    if (onError) {
      onError()
    }
  }

  // Show placeholder while loading
  if (!imageSrc && placeholder) {
    return (
      <div className={className} ref={imgRef}>
        <img src={placeholder} alt={alt} className={className} />
      </div>
    )
  }

  // Show nothing while waiting for intersection (if lazy loading)
  if (!imageSrc) {
    return <div className={className} ref={imgRef} aria-label={alt} />
  }

  // Show error state
  if (hasError) {
    return (
      <div className={className} aria-label={alt}>
        <div className="w-full h-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-xs text-gray-400">
          {alt}
        </div>
      </div>
    )
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
      onLoad={handleLoad}
      onError={handleError}
      loading={loading}
    />
  )
})
