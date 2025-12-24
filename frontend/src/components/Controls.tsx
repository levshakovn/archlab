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
    <div className="border-t border-gray-200 p-4 bg-gradient-to-r from-white to-blue-50/30 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
          <span className="w-2 h-2 bg-primary rounded-full"></span>
          <span className="text-sm font-semibold text-primary">{nodeCount}</span>
          <span className="text-xs text-text-secondary">nodes</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-full border border-secondary/20">
          <span className="w-2 h-2 bg-secondary rounded-full"></span>
          <span className="text-sm font-semibold text-secondary">{edgeCount}</span>
          <span className="text-xs text-text-secondary">connections</span>
        </div>
      </div>
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

