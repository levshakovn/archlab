import { useState, useCallback } from 'react'
import { CanvasNode, CanvasEdge, GraphJSON } from '../types'

export function useCanvas() {
  const [nodes, setNodes] = useState<Record<string, CanvasNode>>({})
  const [edges, setEdges] = useState<CanvasEdge[]>([])
  const [nodeIdCounter, setNodeIdCounter] = useState(0)

  const addNode = useCallback((serviceType: string, x: number, y: number) => {
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
  }, [nodeIdCounter])

  const moveNode = useCallback((nodeId: string, x: number, y: number) => {
    setNodes((prev) => {
      if (!prev[nodeId]) return prev
      return {
        ...prev,
        [nodeId]: { ...prev[nodeId], x, y },
      }
    })
  }, [])

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((prev) => {
      const newNodes = { ...prev }
      delete newNodes[nodeId]
      return newNodes
    })
    setEdges((prev) => prev.filter((e) => e.from !== nodeId && e.to !== nodeId))
  }, [])

  const addEdge = useCallback((from: string, to: string) => {
    if (from !== to && nodes[from] && nodes[to]) {
      setEdges((prev) => {
        // Prevent duplicate edges
        if (prev.some((e) => e.from === from && e.to === to)) return prev
        return [...prev, { from, to, type: 'connection' }]
      })
    }
  }, [nodes])

  const deleteEdge = useCallback((from: string, to: string) => {
    setEdges((prev) => prev.filter((e) => !(e.from === from && e.to === to)))
  }, [])

  const clear = useCallback(() => {
    setNodes({})
    setEdges([])
    setNodeIdCounter(0)
  }, [])

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
  }
}

