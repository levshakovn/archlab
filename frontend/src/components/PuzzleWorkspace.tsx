import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Canvas } from './Canvas'
import { ResultPanel } from './ResultPanel'
import { Header } from './Header'
import { SEOHead } from './SEOHead'
import { ErrorToast } from './ErrorToast'
import { OfflineBanner } from './OfflineBanner'
import { usePuzzles } from '../hooks/usePuzzles'
import { useCanvas } from '../hooks/useCanvas'
import { useGrading } from '../hooks/useGrading'
import { useCompletions } from '../hooks/useCompletions'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { analytics } from '../services/analytics'

export function PuzzleWorkspace() {
  const location = useLocation()
  const { puzzles, currentPuzzle, selectPuzzle } = usePuzzles()
  const { bestScores, refresh: refreshCompletions } = useCompletions()
  const [displayPuzzles, setDisplayPuzzles] = useState(puzzles)
  const isOnline = useOnlineStatus()
  
  // Sync display puzzles when puzzles change
  useEffect(() => {
    setDisplayPuzzles(puzzles)
  }, [puzzles])

  // Select puzzle from navigation state if provided
  useEffect(() => {
    const state = location.state as { puzzleId?: string } | null
    if (state?.puzzleId) {
      selectPuzzle(state.puzzleId)
    }
  }, [location.state, selectPuzzle])

  const handleShuffle = () => {
    const shuffled = [...puzzles].sort(() => Math.random() - 0.5)
    setDisplayPuzzles(shuffled)
  }

  const handleRestore = () => {
    setDisplayPuzzles(puzzles)
  }
  const { nodes, edges, addNode, moveNode, deleteNode, addEdge, deleteEdge, clear, exportGraph, undo, redo, canUndo, canRedo } = useCanvas(currentPuzzle?.id || null)
  const { result, loading, error, grade, clearResult } = useGrading()
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const [draggingServiceType, setDraggingServiceType] = useState<string | null>(null)

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
      <div className="flex h-screen bg-gradient-to-br from-white to-blue-50/20 flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Puzzle Details and Services */}
        <Sidebar
          puzzle={currentPuzzle}
          puzzles={puzzles}
          onDragStart={handleDragStart}
          onPuzzleSelect={handleSelectPuzzle}
          bestScores={bestScores}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas */}
          <Canvas
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
        <div className="w-[20%] min-w-[200px] bg-gradient-to-b from-white to-blue-50/30 border-l border-gray-200 flex flex-col">
          <div className="p-4 flex-1 overflow-y-auto">
            <h3 className="text-sm font-bold text-text-primary mb-3 uppercase tracking-wide">Scenarios</h3>
            <div className="space-y-2">
              {displayPuzzles.map((p, index) => {
                const isSelected = currentPuzzle?.id === p.id
                const score = bestScores[p.id]
                
                // Determine color based on score (matching ProfilePage thresholds)
                let backgroundColor = 'bg-gray-50'
                let borderColor = 'border-gray-300'
                
                if (score === undefined) {
                  // No attempts - gray
                  backgroundColor = 'bg-gray-50'
                  borderColor = 'border-gray-300'
                } else if (score === 100) {
                  // Perfect score - green
                  backgroundColor = 'bg-green-50'
                  borderColor = 'border-green-300'
                } else if (score >= 80) {
                  // Good score - yellow
                  backgroundColor = 'bg-yellow-50'
                  borderColor = 'border-yellow-300'
                } else {
                  // Low score - red
                  backgroundColor = 'bg-red-50'
                  borderColor = 'border-red-300'
                }
                
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPuzzle(p.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? `bg-primary/10 border-primary shadow-md`
                        : `${backgroundColor} ${borderColor} hover:border-primary/50 hover:bg-primary/5`
                    }`}
                  >
                    <div className="font-medium text-sm text-text-primary mb-1">
                      <span className="text-text-secondary mr-2">{index + 1}.</span>
                      {p.title}
                    </div>
                    {score !== undefined && (
                      <div className="text-xs text-text-secondary">
                        Best: {score}%
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
          {/* Shuffle and Restore Buttons */}
          <div className="p-4 border-t border-gray-200 flex gap-2">
            <button
              onClick={handleShuffle}
              className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 text-text-primary rounded-lg hover:bg-primary/10 hover:border-primary/50 transition-all font-medium"
            >
              Shuffle
            </button>
            <button
              onClick={handleRestore}
              className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 text-text-primary rounded-lg hover:bg-primary/10 hover:border-primary/50 transition-all font-medium"
            >
              Restore
            </button>
          </div>
        </div>
      </div>

      {/* Result Panel */}
      {result && <ResultPanel result={result} onClose={clearResult} />}

      {/* Error Toast */}
      {error && (
        <ErrorToast
          message={error}
          onClose={() => clearResult()}
        />
      )}

      {/* Offline Banner */}
      <OfflineBanner isOnline={isOnline} />
      </div>
    </>
  )
}
