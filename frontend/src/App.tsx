import React, { useState } from 'react'
import { PuzzleSelector } from './components/PuzzleSelector'
import { Sidebar } from './components/Sidebar'
import { Canvas } from './components/Canvas'
import { Controls } from './components/Controls'
import { ResultPanel } from './components/ResultPanel'
import { UserAvatar } from './components/UserAvatar'
import { usePuzzles } from './hooks/usePuzzles'
import { useCanvas } from './hooks/useCanvas'
import { useGrading } from './hooks/useGrading'

function App() {
  const { puzzles, currentPuzzle, selectPuzzle } = usePuzzles()
  const { nodes, edges, addNode, moveNode, deleteNode, addEdge, deleteEdge, clear, exportGraph } = useCanvas()
  const { result, loading, grade, clearResult } = useGrading()
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const [draggingServiceType, setDraggingServiceType] = useState<string | null>(null)

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
  }

  const handleSelectPuzzle = (puzzleId: string) => {
    selectPuzzle(puzzleId)
    handleClear()
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Sidebar
        puzzle={currentPuzzle}
        onDragStart={handleDragStart}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-primary/95 to-secondary border-b-4 border-primary/20 p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">🏗️</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">ArchLab</h1>
                <p className="text-white/90 text-sm">AWS Architecture Practice Tool</p>
              </div>
            </div>
            <UserAvatar
              onClick={() => {
                // TODO: Implement authentication modal/profile menu
                console.log('User profile clicked - authentication coming soon')
              }}
            />
          </div>
          {currentPuzzle && (
            <div className="mt-4">
              <PuzzleSelector
                puzzles={puzzles}
                current={currentPuzzle}
                onSelect={handleSelectPuzzle}
              />
            </div>
          )}
        </div>

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
        />

        {/* Controls */}
        <Controls
          nodeCount={Object.keys(nodes).length}
          edgeCount={edges.length}
          onGrade={handleGrade}
          onClear={handleClear}
          loading={loading}
        />
      </div>

      {/* Result Panel */}
      {result && <ResultPanel result={result} onClose={clearResult} />}
    </div>
  )
}

export default App

