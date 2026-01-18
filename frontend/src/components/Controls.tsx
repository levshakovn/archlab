import React from 'react'

interface Props {
  nodeCount: number
  edgeCount: number
  onGrade: () => void
  onClear: () => void
  loading: boolean
}

export function Controls({ nodeCount, edgeCount, onGrade, onClear, loading }: Props) {
  return (
    <div className="p-4 flex items-center justify-center">
      <div className="flex gap-3">
        <button
          onClick={onGrade}
          disabled={loading || nodeCount === 0}
          className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-hover text-white rounded-lg hover:from-primary-hover hover:to-primary shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all font-medium flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Grading...
            </>
          ) : (
            <>
              <span>✓</span>
              Grade Solution
            </>
          )}
        </button>
        <button
          onClick={onClear}
          className="px-4 py-2.5 border-2 border-gray-300 text-text-primary rounded-lg hover:bg-error/10 hover:border-error/50 hover:text-error transition-all font-medium"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

