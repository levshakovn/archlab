import { useState, useCallback, useRef, useEffect } from 'react'
import { CanvasNode, CanvasEdge, GraphJSON } from '../types'

const STORAGE_PREFIX = 'archlab-canvas-'

interface SavedCanvasState {
  nodes: Record<string, CanvasNode>
  edges: CanvasEdge[]
  nodeIdCounter: number
}

function getStorageKey(puzzleId: string | null): string | null {
  return puzzleId ? `${STORAGE_PREFIX}${puzzleId}` : null
}

function loadCanvasState(puzzleId: string | null): SavedCanvasState | null {
  const key = getStorageKey(puzzleId)
  if (!key) return null

  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      return JSON.parse(saved) as SavedCanvasState
    }
  } catch (error) {
    console.error('Failed to load canvas state from localStorage:', error)
  }
  return null
}

function saveCanvasState(puzzleId: string | null, state: SavedCanvasState): void {
  const key = getStorageKey(puzzleId)
  if (!key) return

  try {
    localStorage.setItem(key, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save canvas state to localStorage:', error)
  }
}

function clearCanvasState(puzzleId: string | null): void {
  const key = getStorageKey(puzzleId)
  if (!key) return

  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Failed to clear canvas state from localStorage:', error)
  }
}

export function useCanvas(puzzleId: string | null = null) {
  const [nodes, setNodes] = useState<Record<string, CanvasNode>>({})
  const [edges, setEdges] = useState<CanvasEdge[]>([])
  const [nodeIdCounter, setNodeIdCounter] = useState(0)
  const nodesRef = useRef(nodes)
  const previousPuzzleIdRef = useRef<string | null>(null)

  // Undo/Redo history
  const [history, setHistory] = useState<SavedCanvasState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const MAX_HISTORY = 50 // Limit history size

  // Helper to create a state snapshot
  const createSnapshot = useCallback((): SavedCanvasState => ({
    nodes: { ...nodes },
    edges: [...edges],
    nodeIdCounter,
  }), [nodes, edges, nodeIdCounter])

  // Helper to save current state to history
  const saveToHistory = useCallback(() => {
    const snapshot = createSnapshot()
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1) // Remove any "future" history
      newHistory.push(snapshot)
      // Limit history size
      if (newHistory.length > MAX_HISTORY) {
        return newHistory.slice(-MAX_HISTORY)
      }
      return newHistory
    })
    setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1))
  }, [createSnapshot, historyIndex])

  // Apply state from snapshot
  const applySnapshot = useCallback((snapshot: SavedCanvasState) => {
    setNodes(snapshot.nodes)
    setEdges(snapshot.edges)
    setNodeIdCounter(snapshot.nodeIdCounter)
  }, [])

  // Load saved state when puzzleId changes
  useEffect(() => {
    if (puzzleId && puzzleId !== previousPuzzleIdRef.current) {
      const saved = loadCanvasState(puzzleId)
      if (saved) {
        setNodes(saved.nodes)
        setEdges(saved.edges)
        setNodeIdCounter(saved.nodeIdCounter)
      } else {
        // Clear state when switching to a puzzle without saved state
        setNodes({})
        setEdges([])
        setNodeIdCounter(0)
      }
      // Reset history when puzzle changes
      setHistory([])
      setHistoryIndex(-1)
      previousPuzzleIdRef.current = puzzleId
    } else if (!puzzleId && previousPuzzleIdRef.current) {
      // Clear state when puzzleId becomes null
      setNodes({})
      setEdges([])
      setNodeIdCounter(0)
      setHistory([])
      setHistoryIndex(-1)
      previousPuzzleIdRef.current = null
    }
  }, [puzzleId])

  // Keep ref in sync with state
  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  // Save state to localStorage whenever nodes, edges, or nodeIdCounter changes
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (puzzleId && (Object.keys(nodes).length > 0 || edges.length > 0)) {
        saveCanvasState(puzzleId, {
          nodes,
          edges,
          nodeIdCounter,
        })
      }
    }, 500)
    return () => clearTimeout(saveTimeout)
  }, [puzzleId, nodes, edges, nodeIdCounter])

  const addNode = useCallback((serviceType: string, x: number, y: number) => {
    saveToHistory()
    const id = `node-${nodeIdCounter}`
    setNodes((prev) => ({
      ...prev,
      [id]: {
        id,
        serviceType,
        label: serviceType,
        x,
        y,
      },
    }))
    setNodeIdCounter((prev) => prev + 1)
  }, [nodeIdCounter, saveToHistory])

  const moveNode = useCallback((nodeId: string, x: number, y: number, saveHistory = false) => {
    if (saveHistory) {
      saveToHistory()
    }
    setNodes((prev) => {
      if (!prev[nodeId]) return prev
      const currentNode = prev[nodeId]
      // Don't update if position hasn't changed (optimization)
      if (currentNode.x === x && currentNode.y === y) return prev
      return {
        ...prev,
        [nodeId]: { ...currentNode, x, y },
      }
    })
  }, [saveToHistory])

  const deleteNode = useCallback((nodeId: string) => {
    saveToHistory()
    setNodes((prev) => {
      const newNodes = { ...prev }
      delete newNodes[nodeId]
      return newNodes
    })
    setEdges((prev) => prev.filter((e) => e.from !== nodeId && e.to !== nodeId))
  }, [saveToHistory])

  const addEdge = useCallback((from: string, to: string) => {
    if (from === to) return

    // Check if both nodes exist using ref (always current)
    if (!nodesRef.current[from] || !nodesRef.current[to]) {
      return
    }

    saveToHistory()
    setEdges((prev) => {
      // Prevent duplicate edges
      if (prev.some((e) => e.from === from && e.to === to)) return prev
      return [...prev, { from, to, type: 'connection' }]
    })
  }, [saveToHistory])

  const deleteEdge = useCallback((from: string, to: string) => {
    saveToHistory()
    setEdges((prev) => prev.filter((e) => !(e.from === from && e.to === to)))
  }, [saveToHistory])

  const clear = useCallback(() => {
    saveToHistory()
    setNodes({})
    setEdges([])
    setNodeIdCounter(0)
    clearCanvasState(puzzleId)
  }, [puzzleId, saveToHistory])

  // Undo/Redo functions
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1]
      applySnapshot(previousState)
      setHistoryIndex((prev) => prev - 1)
    }
  }, [history, historyIndex, applySnapshot])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      applySnapshot(nextState)
      setHistoryIndex((prev) => prev + 1)
    }
  }, [history, historyIndex, applySnapshot])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const exportGraph = useCallback((puzzleId: string): GraphJSON => {
    return {
      puzzleId,
      nodes,
      edges,
    }
  }, [nodes, edges])

  return {
    nodes,
    edges,
    addNode,
    moveNode,
    deleteNode,
    addEdge,
    deleteEdge,
    clear,
    exportGraph,
    undo,
    redo,
    canUndo,
    canRedo,
  }
}

