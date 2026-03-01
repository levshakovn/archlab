import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { GraphJSON, Puzzle } from '../types'
import { usePuzzles } from '../hooks/usePuzzles'
import { Header } from './Header'
import { SEOHead } from './SEOHead'
import { ServiceNode } from './ServiceNode'

export function SolutionViewer() {
  const { puzzleId } = useParams<{ puzzleId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { puzzles } = usePuzzles()
  const [graph, setGraph] = useState<GraphJSON | null>(null)
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!puzzleId) {
      setError('Invalid puzzle ID')
      return
    }

    // Find the puzzle
    const foundPuzzle = puzzles.find((p) => p.id === puzzleId)
    if (!foundPuzzle) {
      setError('Puzzle not found')
      return
    }
    setPuzzle(foundPuzzle)

    // Decode the solution data from URL
    const encodedData = searchParams.get('data')
    if (!encodedData) {
      setError('No solution data provided')
      return
    }

    try {
      const decoded = JSON.parse(atob(encodedData)) as GraphJSON
      if (decoded.puzzleId !== puzzleId) {
        setError('Solution data does not match puzzle')
        return
      }
      setGraph(decoded)
    } catch (err) {
      console.error('Failed to decode solution data:', err)
      setError('Invalid solution data')
    }
  }, [puzzleId, searchParams, puzzles])

  if (error) {
    return (
      <>
        <Header />
        <main id="main-content" className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center" role="main">
          <div className="text-center max-w-md px-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-text-primary mb-4">Error Loading Solution</h1>
            <p className="text-text-secondary mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Go Home
            </button>
          </div>
        </main>
      </>
    )
  }

  if (!graph || !puzzle) {
    return (
      <>
        <Header />
        <main id="main-content" className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center" role="main">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading solution...</p>
          </div>
        </main>
      </>
    )
  }

  // Calculate bounding box for nodes
  const nodeEntries = Object.entries(graph.nodes)
  if (nodeEntries.length === 0) {
    return (
      <>
        <Header />
        <main id="main-content" className="min-h-screen bg-white dark:bg-slate-900" role="main">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-text-primary mb-4">{puzzle.title}</h1>
              <p className="text-text-secondary">This solution has no services.</p>
            </div>
          </div>
        </main>
      </>
    )
  }

  const minX = Math.min(...nodeEntries.map(([, node]) => node.x))
  const minY = Math.min(...nodeEntries.map(([, node]) => node.y))
  const maxX = Math.max(...nodeEntries.map(([, node]) => node.x + 120))
  const maxY = Math.max(...nodeEntries.map(([, node]) => node.y + 60))
  const width = maxX - minX + 200
  const height = maxY - minY + 200

  return (
    <>
      <SEOHead
        title={`${puzzle.title} - Shared Solution | ArchLab`}
        description={`View a shared solution for ${puzzle.title}`}
        keywords={`AWS architecture, ${puzzle.title}, shared solution, cloud architecture`}
      />
      <Header />
      <main id="main-content" className="min-h-screen bg-white dark:bg-slate-900" role="main">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-6">
            <button
              onClick={() => navigate('/')}
              className="text-text-secondary hover:text-text-primary mb-4 flex items-center gap-2 transition-colors"
              aria-label="Go back to home"
            >
              ← Back to Home
            </button>
            <h1 className="text-3xl font-bold text-text-primary mb-2">{puzzle.title}</h1>
            <p className="text-text-secondary mb-4">{puzzle.scenario}</p>
            <p className="text-sm text-text-secondary">
              Shared solution with {Object.keys(graph.nodes).length} service{Object.keys(graph.nodes).length !== 1 ? 's' : ''} and {graph.edges.length} connection{graph.edges.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 overflow-auto">
            <div
              className="relative mx-auto"
              style={{
                width: `${width}px`,
                height: `${height}px`,
                minWidth: '100%',
                backgroundImage:
                  'linear-gradient(0deg, rgba(25,118,210,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(25,118,210,.08) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            >
              {/* Render nodes */}
              {nodeEntries.map(([id, node]) => (
                <div
                  key={id}
                  className="absolute p-3 bg-gradient-to-br from-white to-primary/5 dark:from-slate-900 dark:to-slate-800 border-2 border-primary/40 rounded-lg flex items-center justify-center"
                  style={{
                    left: `${node.x - minX + 100}px`,
                    top: `${node.y - minY + 100}px`,
                    width: '120px',
                    minHeight: '60px',
                  }}
                >
                  <ServiceNode serviceType={node.serviceType} variant="vertical" />
                </div>
              ))}

              {/* Render edges */}
              <svg className="absolute inset-0" width={width} height={height} style={{ pointerEvents: 'none' }}>
                <defs>
                  <marker
                    id="arrowhead-shared"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#00ACC1" />
                  </marker>
                </defs>
                {graph.edges.map((edge, i) => {
                  const fromNode = graph.nodes[edge.from]
                  const toNode = graph.nodes[edge.to]
                  if (!fromNode || !toNode) return null

                  const x1 = fromNode.x - minX + 100 + 60
                  const y1 = fromNode.y - minY + 100 + 30
                  const x2 = toNode.x - minX + 100 + 60
                  const y2 = toNode.y - minY + 100 + 30

                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#00ACC1"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead-shared)"
                    />
                  )
                })}
              </svg>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/workspace', { state: { puzzleId: puzzle.id } })}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Try This Puzzle Yourself →
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
