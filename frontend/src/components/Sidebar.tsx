
import { useState } from 'react'
import { Puzzle } from '../types'
import { ServiceNode } from './ServiceNode'

interface Props {
  puzzle: Puzzle | null
  onDragStart: (serviceType: string) => void
  bestScores?: Record<string, number> // Map of puzzleId -> bestScore
}

export function Sidebar({ puzzle, onDragStart }: Props) {
  const [expandedHintIndex, setExpandedHintIndex] = useState<number | null>(null)

  return (
    <div className="w-[20vw] min-w-[280px] bg-gradient-to-b from-white to-blue-50/30 dark:from-slate-900 dark:to-slate-800 border-r border-gray-200 dark:border-slate-700 px-4 pb-4 pt-0 overflow-y-auto h-full flex flex-col">
      {/* Puzzle content - combined into one block */}
      {puzzle ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4">
            {/* Puzzle Section */}
            <div className="mb-6 pb-6">
              <h2 className="text-base font-bold mb-2 text-primary flex items-center gap-2">
                <span className="text-xl">📋</span>
                <span>Puzzle</span>
              </h2>
              <h3 className="text-sm font-semibold mb-3 text-text-primary">{puzzle.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{puzzle.scenario}</p>
            </div>

            {/* Hints Section - Always visible with collapsible items */}
            {puzzle.advice && puzzle.advice.length > 0 && (
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
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
                          aria-expanded={isExpanded}
                          aria-controls={`hint-content-${i}`}
                          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} hint ${i + 1}`}
                        >
                          <span className="text-sm font-medium text-text-primary">
                            Hint {i + 1}
                          </span>
                          <span className="text-xs text-text-secondary" aria-hidden="true">
                            {isExpanded ? '▼' : '▶'}
                          </span>
                        </button>
                        {isExpanded && (
                          <div id={`hint-content-${i}`} className="p-3 bg-white dark:bg-slate-800 border-t border-primary/10 dark:border-slate-700">
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
                    role="button"
                    tabIndex={0}
                    aria-label={`Drag ${service} to canvas`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        // Could trigger a dialog to place service at a specific location
                        // For now, just announce that dragging is required
                      }
                    }}
                    className="p-2 bg-gradient-to-br from-white to-primary/5 dark:from-slate-900 dark:to-slate-800 border-2 border-primary/40 rounded-lg cursor-grab hover:border-primary hover:shadow-md transition-all active:cursor-grabbing active:scale-95 flex items-center justify-center min-h-[100px] h-auto w-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <ServiceNode serviceType={service} variant="vertical" className="text-xs w-full h-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-slate-700">
          <p className="text-text-secondary text-sm text-center p-4">
            Select a puzzle to view details and start building
          </p>
        </div>
      )}
    </div>
  )
}

