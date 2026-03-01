import { useState } from 'react'
import { GraphJSON, Puzzle } from '../types'

// Lazy load html2canvas only when needed (it's a large library)
const loadHtml2Canvas = () => import('html2canvas')

import { CanvasRef } from './Canvas'

interface ShareMenuProps {
  puzzle: Puzzle | null
  graph: GraphJSON | null
  canvasRef: React.RefObject<CanvasRef>
  onShareLinkGenerated?: (link: string) => void
}

export function ShareMenu({ puzzle, graph, canvasRef, onShareLinkGenerated }: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleExportJSON = () => {
    if (!graph || !puzzle) return

    const dataStr = JSON.stringify(graph, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `archlab-${puzzle.id}-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setIsOpen(false)
  }

  const handleExportImage = async () => {
    if (!canvasRef.current || !puzzle) return

    const canvasElement = canvasRef.current.getCanvasElement()
    if (!canvasElement) return

    setIsExporting(true)
    try {
      // Lazy load html2canvas only when exporting
      const html2canvas = (await loadHtml2Canvas()).default

      // Hide UI elements that shouldn't be in the export
      const canvas = canvasElement
      const buttons = canvas.querySelectorAll('button')
      const originalDisplay: string[] = []
      buttons.forEach((btn) => {
        originalDisplay.push(btn.style.display)
        btn.style.display = 'none'
      })

      const canvasImage = await html2canvas(canvas, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
      })

      // Restore buttons
      buttons.forEach((btn, i) => {
        btn.style.display = originalDisplay[i]
      })

      // Convert to blob and download
      canvasImage.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `archlab-${puzzle.id}-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 'image/png')
    } catch (error) {
      console.error('Failed to export image:', error)
      alert('Failed to export image. Please try again.')
    } finally {
      setIsExporting(false)
      setIsOpen(false)
    }
  }

  const handleGenerateShareLink = () => {
    if (!graph || !puzzle) return

    // Encode the solution data in the URL
    const encoded = btoa(JSON.stringify(graph))
    const shareUrl = `${window.location.origin}/share/${puzzle.id}?data=${encoded}`
    setShareLink(shareUrl)
    if (onShareLinkGenerated) {
      onShareLinkGenerated(shareUrl)
    }
  }

  const handleCopyLink = async () => {
    if (!shareLink) return

    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
      alert('Failed to copy link. Please copy it manually.')
    }
  }

  if (!puzzle || !graph || Object.keys(graph.nodes).length === 0) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-all font-medium flex items-center gap-2"
        aria-label="Share solution"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>📤</span>
        <span>Share</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-50 p-2">
            <div className="space-y-1">
              <button
                onClick={handleExportJSON}
                className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors flex items-center gap-2"
                aria-label="Export solution as JSON"
              >
                <span>📄</span>
                <span>Export as JSON</span>
              </button>

              <button
                onClick={handleExportImage}
                disabled={isExporting}
                className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Export solution as image"
              >
                {isExporting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <span>🖼️</span>
                    <span>Export as Image</span>
                  </>
                )}
              </button>

              <div className="border-t border-gray-200 dark:border-slate-700 my-1"></div>

              <button
                onClick={handleGenerateShareLink}
                className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors flex items-center gap-2"
                aria-label="Generate shareable link"
              >
                <span>🔗</span>
                <span>Generate Share Link</span>
              </button>

              {shareLink && (
                <div className="px-4 py-2 bg-gray-50 dark:bg-slate-900 rounded border border-gray-200 dark:border-slate-700">
                  <p className="text-xs text-text-secondary mb-2">Share this link:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-text-primary"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-1 bg-primary text-white text-xs rounded hover:bg-primary-hover transition-colors"
                      aria-label={copied ? 'Link copied' : 'Copy link'}
                    >
                      {copied ? '✓' : '📋'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
