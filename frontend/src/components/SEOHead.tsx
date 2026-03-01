import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  type?: string
}

/**
 * SEO Head component for managing meta tags and page titles
 * Updates document head based on current route
 */
export function SEOHead({
  title,
  description,
  keywords,
  image = '/favicon.svg',
  type = 'website',
}: SEOHeadProps) {
  const location = useLocation()
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const currentUrl = `${baseUrl}${location.pathname}`

  // Default values
  const defaultTitle = 'ArchLab - Free AWS Architecture Practice Tool'
  const defaultDescription =
    'Master AWS architecture through interactive practice puzzles. Drag-and-drop AWS services, receive intelligent feedback, and learn the trade-offs between different design patterns. Perfect for certification prep and interview preparation.'
  const defaultKeywords =
    'AWS, architecture, practice, certification, cloud computing, Amazon Web Services, Solutions Architect, DevOps, system design, interview preparation'

  const pageTitle = title || defaultTitle
  const pageDescription = description || defaultDescription
  const pageKeywords = keywords || defaultKeywords
  const pageImage = image.startsWith('http') ? image : `${baseUrl}${image}`

  useEffect(() => {
    // Update document title
    document.title = pageTitle

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    // Basic meta tags
    updateMetaTag('description', pageDescription)
    updateMetaTag('keywords', pageKeywords)
    updateMetaTag('author', 'ArchLab')

    // Open Graph tags
    updateMetaTag('og:title', pageTitle, 'property')
    updateMetaTag('og:description', pageDescription, 'property')
    updateMetaTag('og:image', pageImage, 'property')
    updateMetaTag('og:url', currentUrl, 'property')
    updateMetaTag('og:type', type, 'property')
    updateMetaTag('og:site_name', 'ArchLab', 'property')

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', pageTitle)
    updateMetaTag('twitter:description', pageDescription)
    updateMetaTag('twitter:image', pageImage)

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', currentUrl)

    // Structured data (JSON-LD)
    let structuredData = document.querySelector('script[type="application/ld+json"]')
    if (!structuredData) {
      structuredData = document.createElement('script')
      structuredData.setAttribute('type', 'application/ld+json')
      document.head.appendChild(structuredData)
    }

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': type === 'article' ? 'Article' : 'WebApplication',
      name: 'ArchLab',
      description: pageDescription,
      url: baseUrl,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      softwareVersion: '1.0',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '1',
      },
      featureList: [
        'Interactive AWS architecture practice',
        'Drag-and-drop service placement',
        'Intelligent feedback and scoring',
        'Progress tracking',
        'Multiple real-world scenarios',
      ],
      ...(type === 'article' && {
        headline: pageTitle,
        image: pageImage,
      }),
    }

    structuredData.textContent = JSON.stringify(jsonLd)
  }, [pageTitle, pageDescription, pageKeywords, pageImage, currentUrl, type, baseUrl])

  return null
}
