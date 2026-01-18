import React, { useState } from 'react'
import { Puzzle } from '../types'
import { ServiceNode } from './ServiceNode'

interface Props {
  puzzle: Puzzle | null
  puzzles: Puzzle[]
  onDragStart: (serviceType: string) => void
  onPuzzleSelect: (puzzleId: string) => void
  bestScores?: Record<string, number> // Map of puzzleId -> bestScore
}

/**
 * Get color classes for score badge
 */
function getScoreColor(score: number): { bg: string; text: string; border: string } {
  if (score === 100) {
    return {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-400',
    }
  } else if (score >= 80) {
    return {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-400',
    }
  } else {
    return {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-400',
    }
  }
}

export function Sidebar({ puzzle, puzzles, onDragStart, onPuzzleSelect, bestScores = {} }: Props) {
  const bestScore = puzzle ? bestScores[puzzle.id] : undefined
  const scoreColors = bestScore !== undefined ? getScoreColor(bestScore) : null
  const [expandedHintIndex, setExpandedHintIndex] = useState<number | null>(null)

  return (
    <div className="w-[20vw] min-w-[280px] bg-gradient-to-b from-white to-blue-50/30 border-r border-gray-200 px-4 pb-4 pt-0 overflow-y-auto h-full flex flex-col">
      {/* Puzzle content - combined into one block */}
      {puzzle ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4">
            {/* Scenario Section */}
            <div className="mb-6 pb-6">
              <h2 className="text-base font-bold mb-2 text-primary flex items-center gap-2">
                <span className="text-xl">📋</span>
                <span>Scenario</span>
              </h2>
              <h3 className="text-sm font-semibold mb-3 text-text-primary">{puzzle.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{puzzle.scenario}</p>
            </div>

            {/* Hints Section - Always visible with collapsible items */}
            {puzzle.advice && puzzle.advice.length > 0 && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-base font-bold text-text-primary mb-3 flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  <span>Hints</span>
                </h3>
                <div className="space-y-2">
                  {puzzle.advice.map((hintItem, i) => {
                    const isExpanded = expandedHintIndex === i
                    return (
                      <div
                        key={i}
                        className="border border-primary/20 rounded-lg overflow-hidden transition-all"
                      >
                        <button
                          onClick={() => setExpandedHintIndex(isExpanded ? null : i)}
                          className="w-full flex items-center justify-between p-2 bg-primary/5 hover:bg-primary/10 transition-colors text-left"
                        >
                          <span className="text-sm font-medium text-text-primary">
                            Hint {i + 1}
                          </span>
                          <span className="text-xs text-text-secondary">
                            {isExpanded ? '▼' : '▶'}
                          </span>
                        </button>
                        {isExpanded && (
                          <div className="p-3 bg-white border-t border-primary/10">
                            <p className="text-sm text-text-secondary leading-relaxed">
                              {hintItem}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* AWS Services Section */}
            <div>
              <h3 className="text-base font-bold text-text-primary mb-3 flex items-center gap-2">
                <span className="text-xl">☁️</span>
                <span>AWS Services</span>
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2">
                {puzzle.allowedServices.map((service) => (
                  <div
                    key={service}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', service)
                      onDragStart(service)
                    }}
                    className="p-2 bg-gradient-to-br from-white to-primary/5 border-2 border-primary/40 rounded-lg cursor-grab hover:border-primary hover:shadow-md transition-all active:cursor-grabbing active:scale-95 flex items-center justify-center min-h-[100px] h-auto w-full overflow-hidden"
                  >
                    <ServiceNode serviceType={service} variant="vertical" className="text-xs w-full h-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white rounded-lg border-2 border-gray-200">
          <p className="text-text-secondary text-sm text-center p-4">
            Select a puzzle to view details and start building
          </p>
        </div>
      )}
    </div>
  )
}

