import { useState, memo } from 'react'
import { getServiceLogoPath, normalizeServiceName } from '../utils/serviceLogo'
import { LazyImage } from './LazyImage'

interface Props {
  serviceType: string
  className?: string
  variant?: 'horizontal' | 'vertical' // horizontal for sidebar, vertical for canvas
}

/**
 * ServiceNode displays an AWS service with its logo (if available) and text fallback
 * 
 * Logo images should be in: public/aws-logos/
 * Format: SVG files
 * Naming: kebab-case (e.g., "API Gateway" -> "api-gateway.svg")
 * 
 * If a specific service logo is not found, falls back to default AWS logo.
 */
const DEFAULT_AWS_LOGO = '/aws-logos/aws-default.svg'

/**
 * Format service name for better display, especially for text wrapping
 * Converts "Lambda@Edge" -> "Lambda @Edge" to prevent awkward single-letter wrapping
 */
function formatServiceNameForDisplay(serviceType: string): string {
  // Replace "@" with " @" for better wrapping (e.g., "Lambda@Edge" -> "Lambda @Edge")
  return serviceType.replace(/@(\w+)/, (_match, p1) => ` @${p1}`)
}

export const ServiceNode = memo(function ServiceNode({ serviceType, className = '', variant = 'horizontal' }: Props) {
  const [, setLogoError] = useState(false)
  const [, setLogoLoaded] = useState(false)
  const [useDefaultLogo, setUseDefaultLogo] = useState(false)
  
  const normalizedName = normalizeServiceName(serviceType)
  const logoPath = getServiceLogoPath(normalizedName)
  const currentLogoPath = useDefaultLogo ? DEFAULT_AWS_LOGO : logoPath
  const displayName = formatServiceNameForDisplay(serviceType)

  const isVertical = variant === 'vertical'
  const logoSize = isVertical ? 'w-10 h-10' : 'w-6 h-6'

  return (
    <div className={`flex ${isVertical ? 'flex-col items-center justify-center' : 'flex-row items-center'} justify-center ${isVertical ? 'gap-3' : 'gap-2'} ${className}`}>
      {/* Logo container - always takes up space to maintain consistent box size */}
      <div className={`${logoSize} flex-shrink-0 flex items-center justify-center`}>
        <LazyImage
          src={currentLogoPath}
          alt={`${serviceType} AWS service logo`}
          className={`${logoSize} object-contain`}
          loading={variant === 'vertical' ? 'lazy' : 'eager'} // Eager load for sidebar, lazy for canvas
          onLoad={() => setLogoLoaded(true)}
          onError={() => {
            if (!useDefaultLogo) {
              // First error: try default AWS logo
              setUseDefaultLogo(true)
              setLogoLoaded(false)
            } else {
              // Default logo also failed, mark as error
              setLogoError(true)
              setLogoLoaded(false)
            }
          }}
        />
      </div>
      
      {/* Service name text - always visible as fallback */}
      <span className={`font-semibold text-xs text-primary text-center ${isVertical ? 'leading-snug' : 'leading-tight'} ${
        isVertical ? 'w-full' : 'flex-1'
      } ${isVertical ? 'break-words hyphens-auto overflow-wrap-anywhere line-clamp-2' : 'truncate'}`}>
        {displayName}
      </span>
    </div>
  )
})
