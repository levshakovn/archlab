import React, { useRef, useState } from 'react'
import { CanvasNode, CanvasEdge } from '../types'

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

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggedNode(nodeId)
    const node = nodes[nodeId]
    setOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNode) {
      const x = e.clientX - offset.x
      const y = e.clientY - offset.y
      onNodeMove(draggedNode, Math.max(0, x), Math.max(0, y))
    }
    
    // Update connection preview - track mouse position
    if (connectingFrom && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      setConnectionPreview({
        x: mouseX,
        y: mouseY,
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
      onMouseUp={handleMouseUp}
      onClick={(e) => {
        // Cancel connection if clicking on canvas background
        if (connectingFrom && e.target === canvasRef.current) {
          onConnectionCancel()
          setConnectionPreview(null)
        }
      }}
      className="flex-1 bg-gradient-to-br from-blue-50/50 via-white to-secondary/20 relative overflow-auto"
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

      {/* Nodes */}
      {Object.entries(nodes).map(([id, node]) => {
        const isConnecting = connectingFrom === id
        const isHovered = hoveredNode === id
        const canConnectTo = connectingFrom && connectingFrom !== id
        
        return (
          <div
            key={id}
            onMouseDown={(e) => handleNodeMouseDown(id, e)}
            onMouseEnter={() => handleNodeMouseEnter(id)}
            onMouseLeave={handleNodeMouseLeave}
            onMouseUp={(e) => handleNodeMouseUp(id, e)}
            className={`absolute p-3 bg-gradient-to-br from-white to-primary/5 border-2 rounded-lg cursor-move select-none hover:shadow-lg transition ${
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
              textAlign: 'center',
            }}
          >
            <div className="font-semibold text-sm text-primary">{node.serviceType}</div>
            
            {/* Connection handle - visible on hover or when connecting */}
            {(isHovered || isConnecting || connectingFrom) && (
              <div
                onMouseDown={(e) => handleConnectionHandleMouseDown(id, e)}
                className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-secondary rounded-full border-2 border-white cursor-crosshair hover:bg-primary hover:scale-110 transition z-10 shadow-md"
                title="Drag to connect to another service"
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
    </div>
  )
}

