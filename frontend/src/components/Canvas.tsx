import React, { useRef, useState } from 'react'
import { CanvasNode, CanvasEdge } from '../types'
import { ServiceNode } from './ServiceNode'

interface Props {
  nodes: Record<string, CanvasNode>
  edges: CanvasEdge[]
  onDrop: (x: number, y: number, serviceType: string) => void
  onNodeMove: (nodeId: string, x: number, y: number) => void
  onNodeDelete: (nodeId: string) => void
  onEdgeDelete: (from: string, to: string) => void
  onConnectionStart: (nodeId: string) => void
  onConnectionEnd: (nodeId: string) => void
  onConnectionCancel: () => void
  connectingFrom: string | null
  draggingServiceType: string | null
  onGrade: () => void
  onClear: () => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  loading: boolean
  nodeCount: number
}

export function Canvas({
  nodes,
  edges,
  onDrop,
  onNodeMove,
  onNodeDelete,
  onEdgeDelete,
  onConnectionStart,
  onConnectionEnd,
  onConnectionCancel,
  connectingFrom,
  draggingServiceType,
  onGrade,
  onClear,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  loading,
  nodeCount,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [connectionPreview, setConnectionPreview] = useState<{ x: number; y: number } | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [hoveredEdge, setHoveredEdge] = useState<{ from: string; to: string } | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const serviceType = draggingServiceType || e.dataTransfer.getData('text/plain')
    if (serviceType) {
      onDrop(x, y, serviceType)
    }
  }

  const getEventPosition = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    if ('touches' in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    return { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY }
  }

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggedNode(nodeId)
    const node = nodes[nodeId]
    const pos = getEventPosition(e)
    setOffset({
      x: pos.x - node.x,
      y: pos.y - node.y,
    })
  }

  const handleNodeTouchStart = (nodeId: string, e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggedNode(nodeId)
    const node = nodes[nodeId]
    const pos = getEventPosition(e)
    setOffset({
      x: pos.x - node.x,
      y: pos.y - node.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNode) {
      const pos = getEventPosition(e)
      const x = pos.x - offset.x
      const y = pos.y - offset.y
      onNodeMove(draggedNode, Math.max(0, x), Math.max(0, y))
    }
    
    // Update connection preview - track mouse position
    if (connectingFrom && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const pos = getEventPosition(e)
      setConnectionPreview({
        x: pos.x - rect.left,
        y: pos.y - rect.top,
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault() // Prevent scrolling during drag
    if (draggedNode) {
      const pos = getEventPosition(e)
      const x = pos.x - offset.x
      const y = pos.y - offset.y
      onNodeMove(draggedNode, Math.max(0, x), Math.max(0, y))
    }
    
    // Update connection preview - track touch position
    if (connectingFrom && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const pos = getEventPosition(e)
      setConnectionPreview({
        x: pos.x - rect.left,
        y: pos.y - rect.top,
      })
    }
  }

  const handleMouseUp = (e?: React.MouseEvent) => {
    // Cancel connection if clicking on canvas (not on a node)
    if (connectingFrom && e && e.target === canvasRef.current) {
      onConnectionCancel()
      setConnectionPreview(null)
    }
    setDraggedNode(null)
  }

  const handleTouchEnd = (e?: React.TouchEvent) => {
    // Cancel connection if touching canvas (not on a node)
    if (connectingFrom && e && e.target === canvasRef.current) {
      onConnectionCancel()
      setConnectionPreview(null)
    }
    setDraggedNode(null)
  }

  const handleConnectionHandleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onConnectionStart(nodeId)
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const node = nodes[nodeId]
      // Start from right edge by default (will update as mouse moves)
      setConnectionPreview({
        x: node.x + 120, // Right edge of node
        y: node.y + 30,  // Middle of node
      })
    }
  }

  const handleNodeMouseEnter = (nodeId: string) => {
    if (!connectingFrom) {
      setHoveredNode(nodeId)
    }
  }

  const handleNodeMouseLeave = () => {
    if (!connectingFrom) {
      setHoveredNode(null)
    }
  }

  const handleNodeMouseUp = (nodeId: string, e: React.MouseEvent) => {
    if (connectingFrom && connectingFrom !== nodeId) {
      e.stopPropagation()
      onConnectionEnd(nodeId)
      setConnectionPreview(null)
    }
  }

  // Calculate connection point on the edge of a node closest to another point
  const getConnectionPoint = (
    node: CanvasNode,
    targetX: number,
    targetY: number,
    nodeWidth: number = 120,
    nodeHeight: number = 60
  ): { x: number; y: number } => {
    const centerX = node.x + nodeWidth / 2
    const centerY = node.y + nodeHeight / 2
    
    const dx = targetX - centerX
    const dy = targetY - centerY
    
    // Calculate which side is closer
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    
    // Determine connection point based on which side is closer
    if (absDx > absDy) {
      // Horizontal connection (left or right side)
      if (dx > 0) {
        // Target is to the right, connect to right side
        return { x: node.x + nodeWidth, y: centerY }
      } else {
        // Target is to the left, connect to left side
        return { x: node.x, y: centerY }
      }
    } else {
      // Vertical connection (top or bottom side)
      if (dy > 0) {
        // Target is below, connect to bottom side
        return { x: centerX, y: node.y + nodeHeight }
      } else {
        // Target is above, connect to top side
        return { x: centerX, y: node.y }
      }
    }
  }

  return (
    <div
      ref={canvasRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => {
        // Cancel connection if clicking on canvas background
        if (connectingFrom && e.target === canvasRef.current) {
          onConnectionCancel()
          setConnectionPreview(null)
        }
      }}
      className="flex-1 bg-gradient-to-br from-white via-blue-50/10 to-white relative overflow-auto touch-pan-y"
      style={{
        backgroundImage:
          'linear-gradient(0deg, rgba(25,118,210,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(25,118,210,.08) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      {/* Connections - SVG with pointer events for edges */}
      <svg className="absolute inset-0" width="100%" height="100%" style={{ pointerEvents: connectingFrom ? 'none' : 'auto' }}>
        {/* Existing connections */}
        {edges.map((edge, i) => {
          const fromNode = nodes[edge.from]
          const toNode = nodes[edge.to]
          if (!fromNode || !toNode) return null

          // Calculate connection points on closest sides
          const toNodeCenterX = toNode.x + 60
          const toNodeCenterY = toNode.y + 30
          const fromPoint = getConnectionPoint(fromNode, toNodeCenterX, toNodeCenterY)
          
          const fromNodeCenterX = fromNode.x + 60
          const fromNodeCenterY = fromNode.y + 30
          const toPoint = getConnectionPoint(toNode, fromNodeCenterX, fromNodeCenterY)
          
          const x1 = fromPoint.x
          const y1 = fromPoint.y
          const x2 = toPoint.x
          const y2 = toPoint.y
          const isHovered = hoveredEdge?.from === edge.from && hoveredEdge?.to === edge.to
          const midX = (x1 + x2) / 2
          const midY = (y1 + y2) / 2

          const handleEdgeClick = (e: React.MouseEvent<SVGLineElement>) => {
            e.stopPropagation()
            onEdgeDelete(edge.from, edge.to)
          }

          const handleDeleteButtonClick = (e: React.MouseEvent<SVGCircleElement>) => {
            e.stopPropagation()
            onEdgeDelete(edge.from, edge.to)
          }

          return (
            <g 
              key={i}
              onMouseEnter={() => setHoveredEdge({ from: edge.from, to: edge.to })}
              onMouseLeave={() => setHoveredEdge(null)}
            >
              {/* Invisible wider line for easier clicking */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="transparent"
                strokeWidth="12"
                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                onClick={handleEdgeClick}
              />
              {/* Visible connection line */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isHovered ? "#F44336" : "#1976D2"}
                strokeWidth={isHovered ? "3" : "2"}
                markerEnd="url(#arrowhead)"
                style={{ pointerEvents: 'none' }}
              />
              {/* Delete button on hover - larger invisible area to prevent flickering */}
              {isHovered && (
                <g style={{ pointerEvents: 'auto' }}>
                  {/* Larger invisible circle to maintain hover state */}
                  <circle
                    cx={midX}
                    cy={midY}
                    r="20"
                    fill="transparent"
                    style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                    onClick={handleDeleteButtonClick}
                  />
                  {/* Visible delete button */}
                  <circle
                    cx={midX}
                    cy={midY}
                    r="12"
                    fill="#F44336"
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}
                  />
                  <text
                    x={midX}
                    y={midY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    ×
                  </text>
                </g>
              )}
            </g>
          )
        })}
        
        {/* Connection preview line */}
        {connectingFrom && connectionPreview && nodes[connectingFrom] && (
          <g>
            {(() => {
              // Calculate connection point on source node closest to preview point
              const sourcePoint = getConnectionPoint(
                nodes[connectingFrom],
                connectionPreview.x,
                connectionPreview.y
              )
              return (
                <line
                  x1={sourcePoint.x}
                  y1={sourcePoint.y}
                  x2={connectionPreview.x}
                  y2={connectionPreview.y}
                  stroke="#00ACC1"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  markerEnd="url(#arrowhead-preview)"
                />
              )
            })()}
          </g>
        )}
        
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#1976D2" />
          </marker>
          <marker
            id="arrowhead-preview"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#00ACC1" />
          </marker>
        </defs>
      </svg>

      {/* Empty State */}
      {Object.keys(nodes).length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-text-secondary max-w-md px-4">
            <div className="text-6xl mb-4 opacity-50">🏗️</div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Start Building Your Architecture
            </h3>
            <p className="text-sm leading-relaxed">
              Drag AWS services from the sidebar onto the canvas to begin designing your solution.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-text-secondary">
              <span className="px-3 py-1 bg-primary/10 rounded-full">💡 Tip: Connect services to show data flow</span>
            </div>
          </div>
        </div>
      )}

      {/* Nodes */}
      {Object.entries(nodes).map(([id, node]) => {
        const isConnecting = connectingFrom === id
        const isHovered = hoveredNode === id
        const canConnectTo = connectingFrom && connectingFrom !== id
        
        return (
          <div
            key={id}
            onMouseDown={(e) => handleNodeMouseDown(id, e)}
            onTouchStart={(e) => handleNodeTouchStart(id, e)}
            onMouseEnter={() => handleNodeMouseEnter(id)}
            onMouseLeave={handleNodeMouseLeave}
            onMouseUp={(e) => handleNodeMouseUp(id, e)}
            className={`absolute p-3 bg-gradient-to-br from-white to-primary/5 border-2 rounded-lg cursor-move select-none hover:shadow-lg transition flex items-center justify-center touch-none ${
              isConnecting
                ? 'border-secondary shadow-lg ring-2 ring-secondary bg-gradient-to-br from-secondary/10 to-secondary/5'
                : canConnectTo
                ? 'border-success shadow-lg ring-2 ring-success bg-gradient-to-br from-success/10 to-success/5'
                : isHovered
                ? 'border-primary shadow-md bg-gradient-to-br from-white to-primary/10'
                : 'border-primary/40'
            }`}
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              width: '120px',
              minHeight: '60px',
            }}
          >
            <ServiceNode serviceType={node.serviceType} variant="vertical" />
            
            {/* Connection handle - visible on hover or when connecting */}
            {(isHovered || isConnecting || connectingFrom) && (
              <div
                onMouseDown={(e) => handleConnectionHandleMouseDown(id, e)}
                className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-secondary rounded-full border-2 border-white cursor-crosshair hover:bg-primary hover:scale-110 transition z-10 shadow-md"
                title="Drag to connect to another service"
                role="button"
                aria-label={`Connect ${node.serviceType} to another service`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleConnectionHandleMouseDown(id, e as any)
                  }
                }}
              />
            )}
            
            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onNodeDelete(id)
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-error text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center transition z-10"
              title="Delete service"
              aria-label={`Delete ${node.serviceType} service`}
            >
              ×
            </button>
          </div>
        )
      })}
      
      {/* Connection hint overlay */}
      {connectingFrom && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-secondary to-primary text-white px-6 py-3 rounded-xl shadow-2xl z-20 border-2 border-white/20 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="text-lg">🔗</span>
            <span className="text-sm font-semibold">Drag to another service to connect</span>
            <button
              onClick={onConnectionCancel}
              className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition backdrop-blur-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Buttons - Undo/Redo, Grade Solution and Clear */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-30 items-center">
        {/* Undo/Redo buttons */}
        {(onUndo || onRedo) && (
          <div className="flex gap-2 mr-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="px-3 py-2.5 border-2 border-gray-300 text-text-primary rounded-lg hover:bg-primary/10 hover:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium bg-white/90 backdrop-blur-sm"
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
            >
              ↶
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="px-3 py-2.5 border-2 border-gray-300 text-text-primary rounded-lg hover:bg-primary/10 hover:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium bg-white/90 backdrop-blur-sm"
              title="Redo (Ctrl+Shift+Z)"
              aria-label="Redo"
            >
              ↷
            </button>
          </div>
        )}
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
          className="px-4 py-2.5 border-2 border-gray-300 text-text-primary rounded-lg hover:bg-error/10 hover:border-error/50 hover:text-error transition-all font-medium bg-white/90 backdrop-blur-sm"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

