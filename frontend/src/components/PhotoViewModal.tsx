interface Props {
  isOpen: boolean
  imageSrc: string
  onClose: () => void
}

export function PhotoViewModal({ isOpen, imageSrc, onClose }: Props) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 text-3xl font-bold transition-colors"
          aria-label="Close"
        >
          ×
        </button>

        {/* Image */}
        <img
          src={imageSrc}
          alt="Profile photo"
          className="w-full h-auto rounded-lg shadow-2xl max-h-[90vh] object-contain"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on image
        />
      </div>
    </div>
  )
}
