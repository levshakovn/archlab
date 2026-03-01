import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Canvas, CanvasRef } from './Canvas'
import { ResultPanel } from './ResultPanel'
import { Header } from './Header'
import { SEOHead } from './SEOHead'
import { ErrorToast } from './ErrorToast'
import { OfflineBanner } from './OfflineBanner'
import { ShareMenu } from './ShareMenu'
import { usePuzzles } from '../hooks/usePuzzles'
import { useCanvas } from '../hooks/useCanvas'
import { useGrading } from '../hooks/useGrading'
import { useCompletions } from '../hooks/useCompletions'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useSelectedPuzzles } from '../hooks/useSelectedPuzzles'
import { analytics } from '../services/analytics'

export function PuzzleWorkspace() {
  const location = useLocation()
  const navigate = useNavigate()
  const { puzzles, currentPuzzle, selectPuzzle } = usePuzzles()
  const { bestScores, refresh: refreshCompletions } = useCompletions()
  const { selectedPuzzleIds, removePuzzle, isSelected } = useSelectedPuzzles()
  const [showSelectedOnly, setShowSelectedOnly] = useState(false)
  const [displayPuzzles, setDisplayPuzzles] = useState(puzzles)
  const isOnline = useOnlineStatus()
  
  // Filter puzzles based on selection mode
  useEffect(() => {
    if (showSelectedOnly && selectedPuzzleIds.length > 0) {
      const filtered = puzzles.filter((p) => selectedPuzzleIds.includes(p.id))
      setDisplayPuzzles(filtered)
    } else {
      setDisplayPuzzles(puzzles)
    }
  }, [puzzles, showSelectedOnly, selectedPuzzleIds])

  // Select puzzle from navigation state if provided
  useEffect(() => {
    const state = location.state as { puzzleId?: string } | null
    if (state?.puzzleId) {
      selectPuzzle(state.puzzleId)
    }
  }, [location.state, selectPuzzle])

  const handleShuffle = () => {
    const sourcePuzzles = showSelectedOnly && selectedPuzzleIds.length > 0
      ? puzzles.filter((p) => selectedPuzzleIds.includes(p.id))
      : puzzles
    const shuffled = [...sourcePuzzles].sort(() => Math.random() - 0.5)
    setDisplayPuzzles(shuffled)
  }

  const handleRestore = () => {
    if (showSelectedOnly && selectedPuzzleIds.length > 0) {
      const filtered = puzzles.filter((p) => selectedPuzzleIds.includes(p.id))
      setDisplayPuzzles(filtered)
    } else {
      setDisplayPuzzles(puzzles)
    }
  }
  const { nodes, edges, addNode, moveNode, deleteNode, addEdge, deleteEdge, clear, exportGraph, undo, redo, canUndo, canRedo } = useCanvas(currentPuzzle?.id || null)
  const { result, loading, error, grade, clearResult } = useGrading()
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const [draggingServiceType, setDraggingServiceType] = useState<string | null>(null)
  const canvasRef = useRef<CanvasRef>(null)

  // Refresh completions when result changes (after grading)
  useEffect(() => {
    if (result) {
      refreshCompletions()
    }
  }, [result, refreshCompletions])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo) undo()
      }
      // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y for redo
      if (((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') || ((e.metaKey || e.ctrlKey) && e.key === 'y')) {
        e.preventDefault()
        if (canRedo) redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, canUndo, canRedo])

  const handleDragStart = (serviceType: string) => {
    setDraggingServiceType(serviceType)
  }

  const handleServiceDrop = (x: number, y: number, serviceType: string) => {
    addNode(serviceType, x - 60, y - 30) // Adjust for node center
    setDraggingServiceType(null)
  }

  const handleGrade = async () => {
    if (currentPuzzle) {
      const graph = exportGraph(currentPuzzle.id)
      await grade(currentPuzzle, graph)
    }
  }

  const handleClear = () => {
    clear()
    clearResult()
    setConnectingFrom(null)
    // Track canvas cleared event
    if (currentPuzzle) {
      analytics.trackCanvasCleared(currentPuzzle.id)
    }
  }

  const handleSelectPuzzle = (puzzleId: string) => {
    selectPuzzle(puzzleId)
    // Don't clear - let persistence load saved state for the selected puzzle
    clearResult() // Only clear grading result when switching puzzles
  }

  const handleConnectionStart = (nodeId: string) => {
    setConnectingFrom(nodeId)
  }

  const handleConnectionEnd = (nodeId: string) => {
    if (connectingFrom) {
      addEdge(connectingFrom, nodeId)
      setConnectingFrom(null)
    }
  }

  const handleConnectionCancel = () => {
    setConnectingFrom(null)
  }

  const puzzleTitle = currentPuzzle ? `${currentPuzzle.title} - ArchLab` : 'AWS Architecture Practice - ArchLab'
  const puzzleDescription = currentPuzzle
    ? `Practice building ${currentPuzzle.title.toLowerCase()} architecture on AWS. ${currentPuzzle.scenario}`
    : 'Build and practice AWS architectures with interactive drag-and-drop puzzles. Get intelligent feedback on your designs.'

  return (
    <>
      <SEOHead
        title={puzzleTitle}
        description={puzzleDescription}
        keywords={`AWS architecture, ${currentPuzzle?.title || 'cloud architecture'}, AWS practice, system design, cloud computing`}
      />
      <div className="flex h-screen bg-gradient-to-br from-white to-blue-50/20 dark:from-slate-950 dark:to-slate-900 flex-col">
        <Header />
        <main id="main-content" className="flex flex-1 overflow-hidden" role="main">
        {/* Left Sidebar - Puzzle Details and Services */}
        <Sidebar
          puzzle={currentPuzzle}
          onDragStart={handleDragStart}
          bestScores={bestScores}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Share Menu */}
          {currentPuzzle && (
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-end">
              <ShareMenu
                puzzle={currentPuzzle}
                graph={currentPuzzle ? exportGraph(currentPuzzle.id) : null}
                canvasRef={canvasRef}
              />
            </div>
          )}
          {/* Canvas */}
          <Canvas
            ref={canvasRef}
            nodes={nodes}
            edges={edges}
            onDrop={handleServiceDrop}
            onNodeMove={moveNode}
            onNodeDelete={deleteNode}
            onEdgeDelete={deleteEdge}
            onConnectionStart={handleConnectionStart}
            onConnectionEnd={handleConnectionEnd}
            onConnectionCancel={handleConnectionCancel}
            connectingFrom={connectingFrom}
            draggingServiceType={draggingServiceType}
            onGrade={handleGrade}
            onClear={handleClear}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            loading={loading}
            nodeCount={Object.keys(nodes).length}
          />
        </div>

        {/* Right Sidebar - Puzzle List */}
        <div className="w-[20%] min-w-[200px] bg-gradient-to-b from-white to-blue-50/30 dark:from-slate-950 dark:to-slate-900 border-l border-gray-200 dark:border-slate-700 flex flex-col">
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">Puzzles</h3>
              {selectedPuzzleIds.length > 0 && (
                <button
                  onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all border-2 ${
                    showSelectedOnly
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white dark:bg-slate-800 text-text-primary border-gray-300 dark:border-slate-600 hover:border-primary/50'
                  }`}
                  aria-label={showSelectedOnly ? 'Show all puzzles' : `Show My Puzzles (${selectedPuzzleIds.length} puzzles)`}
                  aria-pressed={showSelectedOnly}
                >
                  {showSelectedOnly ? `All Puzzles` : `⭐ My Puzzles (${selectedPuzzleIds.length})`}
                </button>
              )}
            </div>
            {showSelectedOnly && selectedPuzzleIds.length === 0 && (
              <div className="mb-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                <p className="text-xs text-text-secondary text-center mb-2">
                  No puzzles in My Puzzles yet.
                </p>
                <button
                  onClick={() => navigate('/puzzles')}
                  className="w-full px-3 py-2 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-all"
                  aria-label="Browse puzzles to add to My Puzzles"
                >
                  Browse Puzzles →
                </button>
              </div>
            )}
            <div className="space-y-2">
              {displayPuzzles.map((p, index) => {
                const isCurrentPuzzle = currentPuzzle?.id === p.id
                const score = bestScores[p.id]
                const isInSelectedList = isSelected(p.id)
                
                // Determine color based on score (matching ProfilePage thresholds)
                let backgroundColor = 'bg-gray-50 dark:bg-slate-800'
                let borderColor = 'border-gray-300 dark:border-slate-600'
                
                if (score === undefined) {
                  // No attempts - gray
                  backgroundColor = 'bg-gray-50 dark:bg-slate-800'
                  borderColor = 'border-gray-300 dark:border-slate-600'
                } else if (score === 100) {
                  // Perfect score - green
                  backgroundColor = 'bg-green-50 dark:bg-green-900/30'
                  borderColor = 'border-green-300 dark:border-green-600'
                } else if (score >= 80) {
                  // Good score - yellow
                  backgroundColor = 'bg-yellow-50 dark:bg-yellow-900/30'
                  borderColor = 'border-yellow-300 dark:border-yellow-600'
                } else {
                  // Low score - red
                  backgroundColor = 'bg-red-50 dark:bg-red-900/30'
                  borderColor = 'border-red-300 dark:border-red-600'
                }
                
                return (
                  <div key={p.id} className="relative group">
                    <button
                      onClick={() => handleSelectPuzzle(p.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        isCurrentPuzzle
                          ? `bg-primary/10 dark:bg-primary/20 border-primary dark:border-primary shadow-md`
                          : `${backgroundColor} ${borderColor} hover:border-primary/50 dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10`
                      }`}
                      aria-label={`Select puzzle: ${p.title}${score !== undefined ? `, best score: ${score}%` : ''}`}
                      aria-current={isCurrentPuzzle ? 'true' : 'false'}
                    >
                      <div className="font-medium text-sm text-text-primary mb-1">
                        <span className="text-text-secondary mr-2">{index + 1}.</span>
                        {p.title}
                      </div>
                      {score !== undefined && (
                        <div className="text-xs text-text-secondary mb-2">
                          Best: {score}%
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.tags.certification.slice(0, 2).map((tag) => (
                          <span key={`cert-${p.id}-${tag}`} className="px-1.5 py-0.5 rounded text-xs bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                            {tag}
                          </span>
                        ))}
                        {p.tags.certification.length > 2 && (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                            +{p.tags.certification.length - 2}
                          </span>
                        )}
                      </div>
                    </button>
                    {showSelectedOnly && isInSelectedList && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removePuzzle(p.id)
                        }}
                        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-xs text-text-secondary hover:text-error bg-white dark:bg-slate-700 rounded-full border border-gray-300 dark:border-slate-600 hover:border-error transition-all opacity-0 group-hover:opacity-100"
                        aria-label={`Remove ${p.title} from My Puzzles`}
                      >
                        <span aria-hidden="true">×</span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          {/* Shuffle and Restore Buttons */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex gap-2">
            <button
              onClick={handleShuffle}
              className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 dark:border-slate-600 text-text-primary rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/50 transition-all font-medium bg-white dark:bg-slate-800"
              aria-label="Shuffle puzzle list order"
            >
              Shuffle
            </button>
            <button
              onClick={handleRestore}
              className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 dark:border-slate-600 text-text-primary rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/50 transition-all font-medium bg-white dark:bg-slate-800"
              aria-label="Restore original puzzle list order"
            >
              Restore
            </button>
          </div>
        </div>
        </main>
      </div>

      {/* Result Panel */}
      {result && currentPuzzle && (
        <ResultPanel
          result={result}
          puzzle={currentPuzzle}
          solutionSummary={`Solution with ${Object.keys(nodes).length} services and ${edges.length} connections`}
          onClose={clearResult}
        />
      )}

      {/* Error Toast */}
      {error && (
        <ErrorToast
          message={error}
          onClose={() => clearResult()}
        />
      )}

      {/* Offline Banner */}
      <OfflineBanner isOnline={isOnline} />
    </>
  )
}
