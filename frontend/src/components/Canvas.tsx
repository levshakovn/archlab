import React, { useRef, useState, forwardRef, useImperativeHandle, useEffect, useCallback } from 'react'
import { CanvasNode, CanvasEdge } from '../types'
import { ServiceNode } from './ServiceNode'

// Single source of truth for node size so arrows always meet block borders
const NODE_WIDTH = 120
const NODE_HEIGHT = 60
// Nudge connection points outward so the line/stroke never slips inside the block (border + rounding)
const CONNECTION_INSET = 2

interface Props {
  nodes: Record<string, CanvasNode>
  edges: CanvasEdge[]
  onDrop: (x: number, y: number, serviceType: string) => void
  onNodeMove: (nodeId: string, x: number, y: number, saveHistory?: boolean) => void
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

export interface CanvasRef {
  getCanvasElement: () => HTMLDivElement | null
}

const CanvasNodeItem = React.memo(({
  id,
  node,
  isDragging,
  isConnecting,
  isHovered,
  canConnectTo,
  connectingFrom,
  onMouseDown,
  onTouchStart,
  onMouseEnter,
  onMouseLeave,
  onMouseUp,
  onDelete,
  onConnectionHandleMouseDown,
  onSizeMeasure
}: {
  id: string,
  node: CanvasNode,
  isDragging: boolean,
  isConnecting: boolean,
  isHovered: boolean,
  canConnectTo: boolean,
  connectingFrom: string | null,
  onMouseDown: (id: string, e: React.MouseEvent) => void,
  onTouchStart: (id: string, e: React.TouchEvent) => void,
  onMouseEnter: (id: string) => void,
  onMouseLeave: () => void,
  onMouseUp: (id: string, e: React.MouseEvent) => void,
  onDelete: (id: string) => void,
  onConnectionHandleMouseDown: (id: string, e: React.MouseEvent) => void,
  onSizeMeasure: (id: string, w: number, h: number) => void
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      onSizeMeasure(id, w, h);
    }
  }, [id, node.serviceType, onSizeMeasure]);

  return (
    <div
      ref={nodeRef}
      onMouseDown={(e) => onMouseDown(id, e)}
      onTouchStart={(e) => onTouchStart(id, e)}
      onMouseEnter={() => onMouseEnter(id)}
      onMouseLeave={onMouseLeave}
      onMouseUp={(e) => onMouseUp(id, e)}
      role="button"
      tabIndex={0}
      aria-label={`${node.serviceType} service node. Position: ${Math.round(node.x)}, ${Math.round(node.y)}. Drag to move or press Delete to remove.`}
      onKeyDown={(e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault()
          onDelete(id)
        }
      }}
      className={`absolute p-3 group bg-gradient-to-br from-white to-primary/5 dark:from-slate-900 dark:to-slate-800 border-2 rounded-lg select-none hover:shadow-lg flex items-center justify-center touch-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isDragging
        ? 'cursor-grabbing transition-none'
        : 'cursor-move transition-[box-shadow,border-color,background-color,transform] duration-150'
      } ${isConnecting
        ? 'border-secondary shadow-lg ring-2 ring-secondary bg-gradient-to-br from-secondary/10 to-secondary/5'
        : (connectingFrom && isHovered && id !== connectingFrom)
          ? 'border-success shadow-xl ring-4 ring-success bg-success/10 scale-105 z-20'
          : canConnectTo
            ? 'border-success/40 bg-success/5 border-dashed'
            : isHovered
              ? 'border-primary shadow-md bg-gradient-to-br from-white to-primary/10'
              : 'border-primary/40'
        }`}
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: `${NODE_WIDTH}px`,
        minHeight: `${NODE_HEIGHT}px`,
        willChange: isDragging ? 'left, top' : undefined,
      }}
    >
      <ServiceNode serviceType={node.serviceType} variant="vertical" />

      {/* Connection handle - visible on hover or when connecting */}
      {(isHovered || isConnecting || connectingFrom) && !canConnectTo && (
        <div
          onMouseDown={(e) => onConnectionHandleMouseDown(id, e)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-crosshair z-20 group/handle"
          title="Drag to connect to another service"
          role="button"
          aria-label={`Connect ${node.serviceType} to another service`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onConnectionHandleMouseDown(id, e as unknown as React.MouseEvent)
            }
          }}
        >
          <div className={`w-3 h-3 bg-secondary rounded-full border-2 border-white shadow-md transition-transform duration-200 ${isHovered && !isConnecting ? 'scale-150 bg-primary' : 'group-hover/handle:scale-150 group-hover/handle:bg-primary'}`} />
        </div>
      )}

      {/* Delete: ghost circle, hover-reveal, SVG ×. Alternatives: trash icon; outline-only; "Remove" pill; corner notch. */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(id)
        }}
        className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center z-10
          bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-500
          hover:bg-error hover:border-error hover:scale-110
          text-gray-500 dark:text-slate-400 hover:text-white
          shadow-md hover:shadow-lg
          opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-1
          transition-all duration-200 ease-out"
        title="Remove from canvas"
        aria-label={`Remove ${node.serviceType} from canvas`}
      >
        <svg viewBox="0 0 12 12" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden>
          <path d="M2 2l8 8M10 2L2 10" />
        </svg>
      </button>
    </div>
  )
});

export const Canvas = forwardRef<CanvasRef, Props>((props, ref) => {
  const {
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
  } = props

  const canvasRef = useRef<HTMLDivElement>(null)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [draggingPos, setDraggingPos] = useState<{ x: number; y: number } | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [connectionPreview, setConnectionPreview] = useState<{ x: number; y: number } | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [hoveredEdge, setHoveredEdge] = useState<{ from: string; to: string } | null>(null)
  const [newConnections, setNewConnections] = useState<Set<string>>(new Set())
  const [removingConnections, setRemovingConnections] = useState<Map<string, CanvasEdge>>(new Map())
  const [nodeSizes, setNodeSizes] = useState<Record<string, { w: number; h: number }>>({})
  const previousEdgesRef = useRef<CanvasEdge[]>([])

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
      setDraggingPos({ x: Math.max(0, x), y: Math.max(0, y) })
    }

    // Update connection preview - track mouse position
    if (connectingFrom && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const pos = getEventPosition(e)
      let targetX = pos.x - rect.left
      let targetY = pos.y - rect.top

      // Connection Snapping Logic
      const snapThreshold = 100;
      let closestNodeId: string | null = null;
      let minDistance = Infinity;

      Object.entries(nodes).forEach(([id, node]) => {
        if (id === connectingFrom) return;
        const size = nodeSizes[id];
        const w = size?.w ?? NODE_WIDTH;
        const h = size?.h ?? NODE_HEIGHT;
        const centerX = node.x + w / 2;
        const centerY = node.y + h / 2;

        const dx = targetX - centerX;
        const dy = targetY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < snapThreshold && dist < minDistance) {
          minDistance = dist;
          closestNodeId = id;
        }
      });

      if (closestNodeId) {
        setHoveredNode(closestNodeId);
        const targetNode = nodes[closestNodeId];
        const sourceNode = nodes[connectingFrom];

        const size = nodeSizes[connectingFrom];
        const w = size?.w ?? NODE_WIDTH;
        const h = size?.h ?? NODE_HEIGHT;
        const sourceCenterX = sourceNode.x + w / 2;
        const sourceCenterY = sourceNode.y + h / 2;

        const snapPoint = getConnectionPoint(
          targetNode,
          sourceCenterX,
          sourceCenterY,
          nodeSizes[closestNodeId]
        );
        targetX = snapPoint.x;
        targetY = snapPoint.y;
      } else {
        setHoveredNode(null);
      }

      setConnectionPreview({
        x: targetX,
        y: targetY,
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault() // Prevent scrolling during drag
    if (draggedNode) {
      const pos = getEventPosition(e)
      const x = pos.x - offset.x
      const y = pos.y - offset.y
      setDraggingPos({ x: Math.max(0, x), y: Math.max(0, y) })
    }

    // Update connection preview - track touch position
    if (connectingFrom && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const pos = getEventPosition(e)
      let targetX = pos.x - rect.left
      let targetY = pos.y - rect.top

      // Connection Snapping Logic
      const snapThreshold = 100;
      let closestNodeId: string | null = null;
      let minDistance = Infinity;

      Object.entries(nodes).forEach(([id, node]) => {
        if (id === connectingFrom) return;
        const size = nodeSizes[id];
        const w = size?.w ?? NODE_WIDTH;
        const h = size?.h ?? NODE_HEIGHT;
        const centerX = node.x + w / 2;
        const centerY = node.y + h / 2;

        const dx = targetX - centerX;
        const dy = targetY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < snapThreshold && dist < minDistance) {
          minDistance = dist;
          closestNodeId = id;
        }
      });

      if (closestNodeId) {
        setHoveredNode(closestNodeId);
        const targetNode = nodes[closestNodeId];
        const sourceNode = nodes[connectingFrom];

        const size = nodeSizes[connectingFrom];
        const w = size?.w ?? NODE_WIDTH;
        const h = size?.h ?? NODE_HEIGHT;
        const sourceCenterX = sourceNode.x + w / 2;
        const sourceCenterY = sourceNode.y + h / 2;

        const snapPoint = getConnectionPoint(
          targetNode,
          sourceCenterX,
          sourceCenterY,
          nodeSizes[closestNodeId]
        );
        targetX = snapPoint.x;
        targetY = snapPoint.y;
      } else {
        setHoveredNode(null);
      }

      setConnectionPreview({
        x: targetX,
        y: targetY,
      })
    }
  }

  const handleMouseUp = (e?: React.MouseEvent) => {
    // If we're connecting and have snapped to a hovered node
    if (connectingFrom && hoveredNode && hoveredNode !== connectingFrom) {
      onConnectionEnd(hoveredNode)
      setConnectionPreview(null)
      setHoveredNode(null)
    } else if (connectingFrom && e && e.target === canvasRef.current) {
      onConnectionCancel()
      setConnectionPreview(null)
    }

    if (draggedNode && draggingPos) {
      onNodeMove(draggedNode, draggingPos.x, draggingPos.y, true)
    }

    setDraggingPos(null)
    setDraggedNode(null)
  }

  const handleTouchEnd = (e?: React.TouchEvent) => {
    // If we're connecting and have snapped to a hovered node
    if (connectingFrom && hoveredNode && hoveredNode !== connectingFrom) {
      onConnectionEnd(hoveredNode)
      setConnectionPreview(null)
      setHoveredNode(null)
    } else if (connectingFrom && e && e.target === canvasRef.current) {
      onConnectionCancel()
      setConnectionPreview(null)
    }

    if (draggedNode && draggingPos) {
      onNodeMove(draggedNode, draggingPos.x, draggingPos.y, true)
    }

    setDraggingPos(null)
    setDraggedNode(null)
  }

  const getActiveNode = (id: string, node: CanvasNode): CanvasNode => {
    if (id === draggedNode && draggingPos) {
      return { ...node, x: draggingPos.x, y: draggingPos.y }
    }
    return node
  }

  const handleConnectionHandleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onConnectionStart(nodeId)
    if (canvasRef.current) {
      const node = nodes[nodeId]
      setConnectionPreview({
        x: node.x + NODE_WIDTH,
        y: node.y + NODE_HEIGHT / 2,
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

  const handleNodeMouseUp = useCallback((nodeId: string, e: React.MouseEvent) => {
    if (connectingFrom && connectingFrom !== nodeId) {
      e.stopPropagation()
      onConnectionEnd(nodeId)
      setConnectionPreview(null)
    }
  }, [connectingFrom, onConnectionEnd])

  const handleSizeMeasure = useCallback((id: string, w: number, h: number) => {
    setNodeSizes((prev) => {
      if (prev[id]?.w === w && prev[id]?.h === h) return prev
      return { ...prev, [id]: { w, h } }
    })
  }, [])

  // Connection point just outside the node rectangle (closest side to target).
  // Uses measured size when available so bottom edge matches actual height (fixes top→bottom slip).
  const getConnectionPoint = (
    node: CanvasNode,
    targetX: number,
    targetY: number,
    size?: { w: number; h: number }
  ): { x: number; y: number } => {
    const w = size?.w ?? NODE_WIDTH
    const h = size?.h ?? NODE_HEIGHT
    const centerX = node.x + w / 2
    const centerY = node.y + h / 2
    const dx = targetX - centerX
    const dy = targetY - centerY
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    if (absDx > absDy) {
      if (dx > 0) return { x: node.x + w + CONNECTION_INSET, y: centerY }
      return { x: node.x - CONNECTION_INSET, y: centerY }
    }
    if (dy > 0) return { x: centerX, y: node.y + h + CONNECTION_INSET }
    return { x: centerX, y: node.y - CONNECTION_INSET }
  }

  // Generate a curved bezier path for more natural-looking connections
  const getBezierPath = (
    fromPoint: { x: number; y: number },
    toPoint: { x: number; y: number }
  ): string => {
    const dx = toPoint.x - fromPoint.x
    const dy = toPoint.y - fromPoint.y

    // Calculate control points for smooth curves
    // The curve strength is proportional to distance, but capped
    const distance = Math.sqrt(dx * dx + dy * dy)
    const curveStrength = Math.min(distance * 0.3, 80)

    // Determine curve direction based on connection direction
    let cp1x: number, cp1y: number, cp2x: number, cp2y: number

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal connection
      cp1x = fromPoint.x + (dx > 0 ? curveStrength : -curveStrength)
      cp1y = fromPoint.y
      cp2x = toPoint.x + (dx > 0 ? -curveStrength : curveStrength)
      cp2y = toPoint.y
    } else {
      // Vertical connection
      cp1x = fromPoint.x
      cp1y = fromPoint.y + (dy > 0 ? curveStrength : -curveStrength)
      cp2x = toPoint.x
      cp2y = toPoint.y + (dy > 0 ? -curveStrength : curveStrength)
    }

    // Use cubic bezier for smoother curves
    return `M ${fromPoint.x} ${fromPoint.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toPoint.x} ${toPoint.y}`
  }

  // Keep nodeSizes in sync with current nodes (drop sizes for removed nodes)
  useEffect(() => {
    const ids = new Set(Object.keys(nodes))
    setNodeSizes((prev) => {
      const next: Record<string, { w: number; h: number }> = {}
      for (const id of Object.keys(prev)) {
        if (ids.has(id)) next[id] = prev[id]
      }
      return Object.keys(next).length === Object.keys(prev).length ? prev : next
    })
  }, [nodes])

  // Track new and removed connections for animations
  useEffect(() => {
    const previousEdges = previousEdgesRef.current
    const currentEdgeKeys = new Set(edges.map(e => `${e.from}-${e.to}`))
    const previousEdgeKeys = new Set(previousEdges.map(e => `${e.from}-${e.to}`))

    // Find new connections
    const newKeys = Array.from(currentEdgeKeys).filter(key => !previousEdgeKeys.has(key))
    if (newKeys.length > 0) {
      setNewConnections(new Set(newKeys))
      // Remove animation class after animation completes
      setTimeout(() => {
        setNewConnections(prev => {
          const updated = new Set(prev)
          newKeys.forEach(key => updated.delete(key))
          return updated
        })
      }, 400)
    }

    // Find removed connections - store the full edge data for rendering
    const removedEdges = previousEdges.filter(e => {
      const key = `${e.from}-${e.to}`
      return !currentEdgeKeys.has(key)
    })
    if (removedEdges.length > 0) {
      const removingMap = new Map<string, CanvasEdge>()
      removedEdges.forEach(edge => {
        const key = `${edge.from}-${edge.to}`
        removingMap.set(key, edge)
      })
      setRemovingConnections(removingMap)
      // Clean up after animation
      setTimeout(() => {
        setRemovingConnections(new Map())
      }, 300)
    }

    previousEdgesRef.current = [...edges]
  }, [edges])

  useImperativeHandle(ref, () => ({
    getCanvasElement: () => canvasRef.current,
  }), [])

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
      className="flex-1 bg-gradient-to-br from-white via-blue-50/10 to-white dark:from-slate-950 dark:via-slate-900/30 dark:to-slate-950 relative overflow-auto touch-pan-y"
      role="application"
      aria-label="Architecture canvas. Drag and drop AWS services here to build your architecture."
      style={{
        backgroundImage:
          'linear-gradient(0deg, rgba(25,118,210,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(25,118,210,.08) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      {/* Connections - SVG with pointer events for edges */}
      <svg className="absolute inset-0" width="100%" height="100%" style={{ pointerEvents: connectingFrom ? 'none' : 'auto' }}>
        {/* Removing connections (for exit animation) */}
        {Array.from(removingConnections.entries()).map(([edgeKey, edge]) => {
          if (!nodes[edge.from] || !nodes[edge.to]) return null
          const fromNode = getActiveNode(edge.from, nodes[edge.from])
          const toNode = getActiveNode(edge.to, nodes[edge.to])
          const fromSize = nodeSizes[edge.from]
          const toSize = nodeSizes[edge.to]
          const toW = toSize?.w ?? NODE_WIDTH
          const toH = toSize?.h ?? NODE_HEIGHT
          const fromW = fromSize?.w ?? NODE_WIDTH
          const fromH = fromSize?.h ?? NODE_HEIGHT
          const toCenterX = toNode.x + toW / 2
          const toCenterY = toNode.y + toH / 2
          const fromPoint = getConnectionPoint(fromNode, toCenterX, toCenterY, fromSize)
          const fromCenterX = fromNode.x + fromW / 2
          const fromCenterY = fromNode.y + fromH / 2
          const toPoint = getConnectionPoint(toNode, fromCenterX, fromCenterY, toSize)

          const pathData = getBezierPath(fromPoint, toPoint)

          return (
            <g key={edgeKey}>
              <path
                d={pathData}
                fill="none"
                stroke="#1976D2"
                strokeWidth="2"
                strokeLinecap="round"
                markerEnd="url(#arrowhead)"
                className="connection-disappear"
                style={{ pointerEvents: 'none' }}
              />
            </g>
          )
        })}

        {/* Existing connections */}
        {edges.map((edge) => {
          if (!nodes[edge.from] || !nodes[edge.to]) return null
          const fromNode = getActiveNode(edge.from, nodes[edge.from])
          const toNode = getActiveNode(edge.to, nodes[edge.to])
          const fromSize = nodeSizes[edge.from]
          const toSize = nodeSizes[edge.to]
          const toW = toSize?.w ?? NODE_WIDTH
          const toH = toSize?.h ?? NODE_HEIGHT
          const fromW = fromSize?.w ?? NODE_WIDTH
          const fromH = fromSize?.h ?? NODE_HEIGHT
          const toCenterX = toNode.x + toW / 2
          const toCenterY = toNode.y + toH / 2
          const fromPoint = getConnectionPoint(fromNode, toCenterX, toCenterY, fromSize)
          const fromCenterX = fromNode.x + fromW / 2
          const fromCenterY = fromNode.y + fromH / 2
          const toPoint = getConnectionPoint(toNode, fromCenterX, fromCenterY, toSize)

          const edgeKey = `${edge.from}-${edge.to}`
          const isHovered = hoveredEdge?.from === edge.from && hoveredEdge?.to === edge.to
          const isNew = newConnections.has(edgeKey)

          // Generate curved bezier path
          const pathData = getBezierPath(fromPoint, toPoint)

          // Calculate midpoint for delete button (approximate for bezier curve)
          const midX = (fromPoint.x + toPoint.x) / 2
          const midY = (fromPoint.y + toPoint.y) / 2

          const handleEdgeClick = (e: React.MouseEvent<SVGPathElement>) => {
            e.stopPropagation()
            onEdgeDelete(edge.from, edge.to)
          }

          const handleDeleteButtonClick = (e: React.MouseEvent<SVGCircleElement>) => {
            e.stopPropagation()
            onEdgeDelete(edge.from, edge.to)
          }

          return (
            <g
              key={edgeKey}
              onMouseEnter={() => setHoveredEdge({ from: edge.from, to: edge.to })}
              onMouseLeave={() => setHoveredEdge(null)}
            >
              {/* Invisible wider path for easier clicking */}
              <path
                d={pathData}
                fill="none"
                stroke="transparent"
                strokeWidth="24"
                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                onClick={handleEdgeClick}
              />
              {/* Visible connection path with animation */}
              <path
                d={pathData}
                fill="none"
                stroke={isHovered ? "#F44336" : "#1976D2"}
                strokeWidth={isHovered ? "3" : "2"}
                strokeLinecap="round"
                strokeLinejoin="round"
                markerEnd={isHovered ? "url(#arrowhead-hover)" : "url(#arrowhead)"}
                className={`${isNew ? "connection-appear" : ""} ${isHovered ? "connection-flow" : ""}`}
                style={{ pointerEvents: 'none' }}
              />
              {/* Delete button on hover */}
              {isHovered && (
                <g style={{ pointerEvents: 'auto', transformOrigin: `${midX}px ${midY}px` }} className="transition-transform duration-200 hover:scale-110">
                  {/* Larger invisible circle to maintain hover state */}
                  <circle
                    cx={midX}
                    cy={midY}
                    r="24"
                    fill="transparent"
                    style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                    onClick={handleDeleteButtonClick}
                  />
                  {/* Visible delete button with shadow */}
                  <circle
                    cx={midX}
                    cy={midY}
                    r="14"
                    fill="#F44336"
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}
                    className="shadow-md"
                  />
                  {/* Trash Icon */}
                  <svg x={midX - 8} y={midY - 8} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none' }}>
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </g>
              )}
            </g>
          )
        })}

        {/* Connection preview line */}
        {connectingFrom && connectionPreview && nodes[connectingFrom] && (
          <g>
            {(() => {
              const activeSourceNode = getActiveNode(connectingFrom, nodes[connectingFrom]);
              const sourcePoint = getConnectionPoint(
                activeSourceNode,
                connectionPreview.x,
                connectionPreview.y,
                nodeSizes[connectingFrom]
              )
              const previewPath = getBezierPath(sourcePoint, connectionPreview)
              return (
                <path
                  d={previewPath}
                  fill="none"
                  stroke="#00ACC1"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  strokeLinecap="round"
                  markerEnd="url(#arrowhead-preview)"
                  opacity="0.8"
                />
              )
            })()}
          </g>
        )}

        <defs>
          {/* Improved arrow marker for normal connections */}
          <marker
            id="arrowhead"
            markerWidth="12"
            markerHeight="12"
            refX="10"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M 0 0 L 10 4 L 0 8 L 3 4 Z"
              fill="#1976D2"
              stroke="#1976D2"
              strokeWidth="0.5"
            />
          </marker>
          {/* Arrow marker for hovered connections */}
          <marker
            id="arrowhead-hover"
            markerWidth="12"
            markerHeight="12"
            refX="10"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M 0 0 L 10 4 L 0 8 L 3 4 Z"
              fill="#F44336"
              stroke="#F44336"
              strokeWidth="0.5"
            />
          </marker>
          {/* Arrow marker for preview connections */}
          <marker
            id="arrowhead-preview"
            markerWidth="12"
            markerHeight="12"
            refX="10"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M 0 0 L 10 4 L 0 8 L 3 4 Z"
              fill="#00ACC1"
              stroke="#00ACC1"
              strokeWidth="0.5"
            />
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
        const canConnectTo = Boolean(connectingFrom && connectingFrom !== id)
        const activeNode = getActiveNode(id, node)

        return (
          <CanvasNodeItem
            key={id}
            id={id}
            node={activeNode}
            isDragging={id === draggedNode}
            isConnecting={isConnecting}
            isHovered={isHovered}
            canConnectTo={canConnectTo}
            connectingFrom={connectingFrom}
            onSizeMeasure={handleSizeMeasure}
            onMouseDown={handleNodeMouseDown}
            onTouchStart={handleNodeTouchStart}
            onMouseEnter={handleNodeMouseEnter}
            onMouseLeave={handleNodeMouseLeave}
            onMouseUp={handleNodeMouseUp}
            onDelete={onNodeDelete}
            onConnectionHandleMouseDown={handleConnectionHandleMouseDown}
          />
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
              aria-label="Cancel connection"
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
              className="px-3 py-2.5 border-2 border-gray-300 dark:border-slate-600 text-text-primary rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
            >
              ↶
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="px-3 py-2.5 border-2 border-gray-300 dark:border-slate-600 text-text-primary rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
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
          aria-label={loading ? 'Grading solution, please wait' : nodeCount === 0 ? 'Grade solution (disabled: no services added)' : 'Grade solution'}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></span>
              <span>Grading...</span>
            </>
          ) : (
            <>
              <span aria-hidden="true">✓</span>
              <span>Grade Solution</span>
            </>
          )}
        </button>
        <button
          onClick={onClear}
          className="px-4 py-2.5 border-2 border-gray-300 dark:border-slate-600 text-text-primary rounded-lg hover:bg-error/10 dark:hover:bg-error/20 hover:border-error/50 hover:text-error transition-all font-medium bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
          aria-label="Clear all services from canvas"
        >
          Clear
        </button>
      </div>
    </div>
  )
})

Canvas.displayName = 'Canvas'
