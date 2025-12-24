import React from 'react'
import { GradingResult } from '../types'

interface Props {
  result: GradingResult | null
  onClose: () => void
}

export function ResultPanel({ result, onClose }: Props) {
  if (!result) return null

  const scoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-900'
    if (score >= 6) return 'bg-yellow-100 text-yellow-900'
    return 'bg-red-100 text-red-900'
  }

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl border-4 border-primary/20">
        <div className="p-6 border-b-2 border-primary/20 flex justify-between items-center sticky top-0 bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <h2 className="text-2xl font-bold text-primary">Evaluation Results</h2>
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-text-secondary hover:text-error hover:bg-error/10 rounded-full w-8 h-8 flex items-center justify-center transition"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overall Score */}
          <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 p-6 rounded-xl border-2 border-primary/30 shadow-lg">
            <div className="text-text-secondary text-sm mb-2 font-semibold uppercase tracking-wide">OVERALL SCORE</div>
            <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {result.scores.total}/10
            </div>
          </div>

          {/* Dimension Scores */}
          <div className="grid grid-cols-2 gap-4">
            {(['correctness', 'reliability', 'security', 'cost'] as const).map((dim) => (
              <div key={dim} className={`p-4 rounded-lg ${scoreColor(result.scores[dim])}`}>
                <div className="text-xs font-semibold uppercase mb-1">{dim}</div>
                <div className="text-3xl font-bold">{result.scores[dim]}/10</div>
              </div>
            ))}
          </div>

          {/* Requirements */}
          <div>
            <h3 className="font-semibold mb-3 text-text-primary flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full"></span>
              Requirements Check
            </h3>
            <div className="space-y-2">
              {result.requirements.map((req, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border-2 transition ${
                  req.met 
                    ? 'bg-success/10 border-success/30 hover:bg-success/15' 
                    : 'bg-error/10 border-error/30 hover:bg-error/15'
                }`}>
                  <div className={`text-xl flex-shrink-0 ${req.met ? 'text-success' : 'text-error'}`}>
                    {req.met ? '✓' : '✗'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-text-primary">{req.requirement}</div>
                    <div className="text-xs text-text-secondary mt-1">{req.comment}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg border-l-4 border-primary shadow-sm">
            <h3 className="font-semibold mb-2 text-primary flex items-center gap-2">
              <span>💡</span>
              Feedback
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">{result.summaryFeedback}</p>
          </div>

          {/* Hard Constraints */}
          {result.hardConstraintViolations.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-error">
              <h3 className="font-semibold mb-2 text-red-900">Issues</h3>
              <ul className="text-sm space-y-1">
                {result.hardConstraintViolations.map((violation, i) => (
                  <li key={i} className="text-red-800">
                    • {violation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

