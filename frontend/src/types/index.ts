// Puzzle Types
export interface ErrorRule {
  message: string
  error?: string
  severity?: 'error' | 'warning'
  correctFlow?: string[]
  condition?: string
}

export interface RequiredService {
  message: string
  error: string
}

export interface ForbiddenService {
  message: string
  severity: 'error' | 'warning'
}

export interface ConnectionRule {
  from: string
  to: string
  message: string
  error?: string
  correctFlow?: string[]
  severity?: 'error' | 'warning'
}

export interface ServiceConfigError {
  condition: string
  message: string
  severity: 'error' | 'warning'
}

export interface FlowValidation {
  description: string
  correctFlow: string[]
  message: string
}

export interface ErrorRules {
  requiredServices?: Record<string, RequiredService | undefined>
  forbiddenServices?: Record<string, ForbiddenService | undefined>
  requiredConnections?: ConnectionRule[]
  wrongConnections?: ConnectionRule[]
  serviceConfigErrors?: Record<string, ServiceConfigError[]>
  flowValidation?: FlowValidation
}

export interface PuzzleTags {
  certification: string[]
  category: string[]
  services?: string[]
}

export interface Puzzle {
  id: string
  title: string
  scenario: string
  requirements: string[]
  allowedServices: string[]
  commonMistakes: string[]
  tags: PuzzleTags
  advice?: string[] // Optional advice/hints for each puzzle (sorted from least to most helpful)
  errorRules?: ErrorRules
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

// Puzzle Completion Types
export interface PuzzleCompletion {
  id: string
  user_id: string
  puzzle_id: string
  score: number // Latest percentage score (0-100)
  best_score: number // Best score achieved for this puzzle (0-100)
  completed_at: string
  created_at: string
  updated_at: string
}

