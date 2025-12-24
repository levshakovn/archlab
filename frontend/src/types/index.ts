// Puzzle Types
export interface Puzzle {
  id: string
  title: string
  scenario: string
  requirements: string[]
  allowedServices: string[]
  commonMistakes: string[]
}

// Canvas Types
export interface CanvasNode {
  id: string
  serviceType: string
  label: string
  x: number
  y: number
}

export interface CanvasEdge {
  from: string
  to: string
  type: string
}

export interface GraphJSON {
  puzzleId: string
  nodes: Record<string, CanvasNode>
  edges: CanvasEdge[]
}

// Grading Types
export interface RequirementStatus {
  requirement: string
  met: boolean
  comment: string
}

export interface GradingResult {
  scores: {
    correctness: number
    reliability: number
    security: number
    cost: number
    total: number
  }
  requirements: RequirementStatus[]
  hardConstraintViolations: string[]
  summaryFeedback: string
}

export interface GradingRequest {
  puzzleId: string
  nodes: Record<string, CanvasNode>
  edges: CanvasEdge[]
}

