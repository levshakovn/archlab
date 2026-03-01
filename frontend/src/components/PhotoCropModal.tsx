import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'

interface Props {
  isOpen: boolean
  imageSrc: string
  onClose: () => void
  onCropComplete: (croppedImageFile: File) => void
}

/**
 * Create a cropped image file from the crop area
 * @param imageSrc - Source image URL
 * @param crop - Crop area in pixels
 * @param quality - JPEG quality (0.0 to 1.0), defaults to 0.85
 */
async function createCroppedImage(
  imageSrc: string,
  crop: Area,
  quality: number = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.src = imageSrc

    image.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      // Calculate canvas size based on crop area
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      canvas.width = crop.width * scaleX
      canvas.height = crop.height * scaleY

      // Draw the cropped image
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      )

      // Convert canvas to blob and then to File
      // Use configurable quality to ensure file size is reasonable
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'))
            return
          }
          const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' })
          resolve(file)
        },
        'image/jpeg',
        quality // Quality parameter (0.0 to 1.0)
      )
    }

    image.onerror = () => {
      reject(new Error('Failed to load image'))
    }
  })
}

export function PhotoCropModal({ isOpen, imageSrc, onClose, onCropComplete }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop)
  }, [])

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom)
  }, [])

  const onCropCompleteCallback = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    if (!croppedAreaPixels) return

    setProcessing(true)
    try {
      let croppedFile = await createCroppedImage(imageSrc, croppedAreaPixels)
      
      // If cropped file is still too large, reduce quality further
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (croppedFile.size > maxSize) {
        // Re-crop with lower quality
        croppedFile = await createCroppedImage(imageSrc, croppedAreaPixels, 0.7)
        
        // If still too large, try even lower quality
        if (croppedFile.size > maxSize) {
          croppedFile = await createCroppedImage(imageSrc, croppedAreaPixels, 0.6)
        }
      }
      
      onCropComplete(croppedFile)
      onClose()
    } catch (error) {
      // Error is logged to console for debugging
      // In production, this could be sent to an error tracking service
      console.error('Error cropping image:', error)
      alert('Failed to crop image. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl border-4 border-primary/20">
        {/* Header */}
        <div className="p-6 border-b-2 border-primary/20 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-primary">Crop Your Photo</h2>
          <button
            onClick={onClose}
            className="text-2xl text-text-secondary hover:text-error hover:bg-error/10 rounded-full w-8 h-8 flex items-center justify-center transition"
          >
            ×
          </button>
        </div>

        {/* Cropper */}
        <div className="p-6">
          <div className="relative w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1} // Square crop for profile photos
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropCompleteCallback}
              cropShape="round" // Round crop for profile photos
              showGrid={false}
            />
          </div>

          {/* Controls */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Zoom: {Math.round(zoom * 100)}%
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                disabled={processing}
                className="flex-1 px-6 py-2 border-2 border-gray-300 text-text-primary rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={processing || !croppedAreaPixels}
                className="flex-1 px-6 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : 'Save Photo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
