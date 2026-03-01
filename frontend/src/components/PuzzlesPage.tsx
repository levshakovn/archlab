import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from './Header'
import { SEOHead } from './SEOHead'
import { usePuzzles } from '../hooks/usePuzzles'
import { useCompletions } from '../hooks/useCompletions'
import { useSelectedPuzzles } from '../hooks/useSelectedPuzzles'
import { Puzzle } from '../types'

/** Full exam names for certification tag tooltips */
const CERTIFICATION_FULL_NAMES: Record<string, string> = {
  SAA: 'AWS Certified Solutions Architect – Associate',
  DVA: 'AWS Certified Developer – Associate',
  SOA: 'AWS Certified SysOps Administrator – Associate',
}

function getCertificationTooltip(tag: string): string {
  return CERTIFICATION_FULL_NAMES[tag] ?? tag
}

function getScoreColor(score: number): { bg: string; text: string; border: string } {
  if (score === 100) {
    return {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-400',
    }
  }

  if (score >= 80) {
    return {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-400',
    }
  }

  return {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-400',
  }
}

function toggleSelection(value: string, selected: string[]) {
  if (selected.includes(value)) {
    return selected.filter((item) => item !== value)
  }
  return [...selected, value]
}

export function PuzzlesPage() {
  const navigate = useNavigate()
  const { puzzles } = usePuzzles()
  const { bestScores } = useCompletions()
  const { addPuzzle, togglePuzzle, isSelected } = useSelectedPuzzles()
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([])

  const examPuzzles = useMemo(
    () => puzzles.filter((puzzle) => puzzle.tags.certification.length > 0),
    [puzzles]
  )

  const availableCertifications = useMemo(() => {
    const certifications = new Set<string>()

    examPuzzles.forEach((puzzle) => {
      puzzle.tags.certification.forEach((tag) => certifications.add(tag))
    })

    return Array.from(certifications).sort()
  }, [examPuzzles])

  const filteredPuzzles = useMemo(() => {
    return examPuzzles.filter((puzzle) => {
      return (
        selectedCertifications.length === 0 ||
        selectedCertifications.some((tag) => puzzle.tags.certification.includes(tag))
      )
    })
  }, [examPuzzles, selectedCertifications])

  const clearFilters = () => {
    setSelectedCertifications([])
  }

  return (
    <>
      <SEOHead
        title="AWS Exam Puzzles - ArchLab"
        description="Practice AWS certification exam scenarios with focused puzzle sets for SAA, DVA, and SOA."
        keywords="AWS exam puzzles, AWS certification prep, SAA, DVA, SOA"
      />
      <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950">
        <Header />
        <main id="main-content" className="max-w-7xl mx-auto px-6 py-12" role="main">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-text-primary mb-3">AWS Exam Puzzles</h1>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              Focus on certification-ready architecture scenarios.
            </p>
          </header>

          <section className="bg-white rounded-xl shadow-lg p-6 mb-10 border border-primary/10 dark:border-slate-800">
            <div className="flex flex-wrap gap-6 items-end">
              <FilterGroup
                title="Certification"
                options={availableCertifications}
                selected={selectedCertifications}
                onToggle={(tag) => setSelectedCertifications(toggleSelection(tag, selectedCertifications))}
                getOptionTitle={getCertificationTooltip}
              />
            </div>

            <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
              <p className="text-text-secondary">
                Showing {filteredPuzzles.length} of {examPuzzles.length} exam puzzles
              </p>
              {selectedCertifications.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border-2 border-gray-300 dark:border-slate-600 text-text-primary dark:text-slate-300 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/50 transition-all font-medium bg-white dark:bg-slate-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPuzzles.map((puzzle) => {
              const bestScore = bestScores[puzzle.id]
              const scoreColors = bestScore !== undefined ? getScoreColor(bestScore) : null

              return (
                <PuzzleCard
                  key={puzzle.id}
                  puzzle={puzzle}
                  scoreColors={scoreColors}
                  bestScore={bestScore}
                  isInMyPuzzles={isSelected(puzzle.id)}
                  onOpen={() => navigate('/workspace', { state: { puzzleId: puzzle.id } })}
                  onToggleMyPuzzles={() => togglePuzzle(puzzle.id)}
                  onAddAndGo={() => {
                    if (!isSelected(puzzle.id)) {
                      addPuzzle(puzzle.id)
                    }
                    navigate('/workspace', { state: { puzzleId: puzzle.id } })
                  }}
                />
              )
            })}
          </section>
        </main>
      </div>
    </>
  )
}

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
  getOptionTitle,
}: {
  title: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
  getOptionTitle?: (option: string) => string
}) {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)

  return (
    <div className="min-w-[220px]">
      <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = selected.includes(option)
          const tooltipText = getOptionTitle?.(option)
          const showTooltip = Boolean(tooltipText && hoveredOption === option)

          return (
            <span
              key={option}
              className="relative inline-block"
              onMouseEnter={() => tooltipText && setHoveredOption(option)}
              onMouseLeave={() => setHoveredOption(null)}
            >
              <button
                type="button"
                onClick={() => onToggle(option)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  isActive
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white dark:bg-slate-800 text-text-secondary dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-primary/50 dark:hover:border-primary/50 hover:text-text-primary'
                }`}
              >
                {option}
              </button>
              {showTooltip && (
                <span
                  className="absolute left-0 top-full mt-1 z-20 px-2 py-1.5 text-xs font-medium text-white bg-gray-800 dark:bg-slate-700 rounded shadow-lg min-w-[20rem] max-w-[24rem] whitespace-normal pointer-events-none"
                  role="tooltip"
                >
                  {tooltipText}
                </span>
              )}
            </span>
          )
        })}
      </div>
    </div>
  )
}

function PuzzleCard({
  puzzle,
  scoreColors,
  bestScore,
  isInMyPuzzles,
  onOpen,
  onToggleMyPuzzles,
  onAddAndGo,
}: {
  puzzle: Puzzle
  scoreColors: { bg: string; text: string; border: string } | null
  bestScore?: number
  isInMyPuzzles: boolean
  onOpen: () => void
  onToggleMyPuzzles: () => void
  onAddAndGo: () => void
}) {
  const [certTooltip, setCertTooltip] = useState<string | null>(null)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200 dark:border-slate-700 hover:border-primary/30 dark:hover:border-primary/50 relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleMyPuzzles()
        }}
        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        title={isInMyPuzzles ? 'Remove from My Puzzles' : 'Add to My Puzzles'}
        aria-label={isInMyPuzzles ? 'Remove from My Puzzles' : 'Add to My Puzzles'}
      >
        <span className={`text-xl transition-all ${isInMyPuzzles ? 'text-yellow-500' : 'text-gray-400 dark:text-slate-500'}`}>
          {isInMyPuzzles ? '⭐' : '☆'}
        </span>
      </button>

      <button onClick={onOpen} className="text-left w-full pr-8">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-lg font-semibold text-text-primary">{puzzle.title}</h3>
          {scoreColors && bestScore !== undefined && (
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${scoreColors.bg} ${scoreColors.text} ${scoreColors.border} border`}>
              {bestScore}%
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
          {puzzle.tags.certification.map((tag) => {
            const fullName = getCertificationTooltip(tag)
            const showTooltip = certTooltip === fullName

            return (
              <span
                key={`cert-${puzzle.id}-${tag}`}
                className="relative inline-block"
                onMouseEnter={() => setCertTooltip(fullName)}
                onMouseLeave={() => setCertTooltip(null)}
              >
                <span className="px-2 py-1 rounded-full text-xs bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 cursor-default">
                  {tag}
                </span>
                {showTooltip && (
                  <span
                    className="absolute left-0 top-full mt-1 z-10 px-2 py-1.5 text-xs font-medium text-white bg-gray-800 dark:bg-slate-700 rounded shadow-lg min-w-[20rem] max-w-[24rem] whitespace-normal pointer-events-none"
                    role="tooltip"
                  >
                    {fullName}
                  </span>
                )}
              </span>
            )
          })}
        </div>

        <p className="text-sm text-text-secondary line-clamp-2">{puzzle.scenario}</p>
      </button>

      <div className="flex gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-slate-700">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAddAndGo()
          }}
          className="flex-1 px-3 py-2 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-all"
        >
          Open in Workspace →
        </button>
      </div>
    </div>
  )
}
