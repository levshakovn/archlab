import { Puzzle, GraphJSON, GradingResult, CanvasNode } from '../types'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const gradingService = {
  // Local mock grading (for POC)
  async gradeLocally(puzzle: Puzzle, graph: GraphJSON): Promise<GradingResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = mockGradeArchitecture(puzzle, graph)
        resolve(result)
      }, 500)
    })
  },

  // Future: Call real API
  async gradeWithAPI(puzzle: Puzzle, graph: GraphJSON): Promise<GradingResult> {
    try {
      const response = await fetch(`${API_BASE}/v1/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puzzleId: puzzle.id,
          nodes: graph.nodes,
          edges: graph.edges,
        }),
      })

      if (!response.ok) throw new Error('Grading failed')
      return await response.json()
    } catch (error) {
      console.error('API grading failed, falling back to mock:', error)
      return mockGradeArchitecture(puzzle, graph)
    }
  },
}

// Mock grading logic - replace with real AI later
function mockGradeArchitecture(puzzle: Puzzle, graph: GraphJSON): GradingResult {
  const nodeCount = Object.keys(graph.nodes).length
  const edgeCount = graph.edges.length

  // Puzzle-specific scoring logic
  const scores = scoreByPuzzle(puzzle.id, graph)

  // Check requirements
  const requirements = puzzle.requirements.map((req, idx) => ({
    requirement: req,
    met: idx < Math.min(nodeCount - 1, puzzle.requirements.length),
    comment: nodeCount > 0 ? 'Architecture partially addresses this' : 'Add nodes to address this',
  }))

  // Check hard constraints
  const violations = checkConstraints(puzzle.id, graph)

  // Generate feedback
  const feedback = generateFeedback(puzzle.id, nodeCount, edgeCount, violations)

  return {
    scores,
    requirements,
    hardConstraintViolations: violations,
    summaryFeedback: feedback,
  }
}

function scoreByPuzzle(puzzleId: string, graph: GraphJSON) {
  const nodeCount = Object.keys(graph.nodes).length
  const edgeCount = graph.edges.length

  let correctness = 0
  let reliability = 0
  let security = 0
  let cost = 0

  switch (puzzleId) {
    case 'puzzle-3tier-basic':
      correctness = Math.min(10, (nodeCount / 6) * 10)
      reliability = edgeCount > 0 ? 8 : 4
      security = nodeCount > 3 ? 7 : 4
      cost = nodeCount < 8 ? 8 : 5
      break

    case 'puzzle-static-site-cdn':
      correctness = nodeCount > 2 ? 8 : 4
      reliability = nodeCount > 2 ? 9 : 5
      security = nodeCount > 3 ? 8 : 4
      cost = nodeCount < 5 ? 9 : 6
      break

    case 'puzzle-serverless-api':
      correctness = nodeCount > 3 ? 8 : 4
      reliability = nodeCount > 2 ? 7 : 3
      security = nodeCount > 2 ? 7 : 4
      cost = nodeCount < 6 ? 9 : 7
      break

    case 'puzzle-async-processing':
      correctness = nodeCount > 4 ? 8 : 4
      reliability = edgeCount > 1 ? 7 : 4
      security = nodeCount > 2 ? 6 : 3
      cost = nodeCount < 7 ? 8 : 5
      break

    case 'puzzle-data-lake-analytics':
      correctness = nodeCount > 3 ? 8 : 4
      reliability = nodeCount > 2 ? 7 : 4
      security = nodeCount > 1 ? 6 : 3
      cost = nodeCount < 6 ? 9 : 6
      break

    default:
      correctness = (nodeCount / 5) * 8
      reliability = edgeCount > 0 ? 6 : 3
      security = 5
      cost = 6
  }

  const total = (correctness * 0.4 + reliability * 0.2 + security * 0.2 + cost * 0.2) / 10

  return {
    correctness: Math.round(correctness),
    reliability: Math.round(reliability),
    security: Math.round(security),
    cost: Math.round(cost),
    total: Math.round(total * 10) / 10,
  }
}

function checkConstraints(puzzleId: string, graph: GraphJSON): string[] {
  const violations: string[] = []
  const serviceTypes = Object.values(graph.nodes).map((n) => n.serviceType)

  if (puzzleId === 'puzzle-3tier-basic') {
    const hasLoadBalancer = serviceTypes.some((s) => ['ALB', 'NLB'].includes(s))
    const hasCompute = serviceTypes.some((s) => ['EC2', 'ASG'].includes(s))
    const hasDatabase = serviceTypes.some((s) => ['RDS', 'Aurora', 'DynamoDB'].includes(s))

    if (!hasLoadBalancer) violations.push('Missing load balancer (ALB or NLB)')
    if (!hasCompute) violations.push('Missing compute layer (EC2 or ASG)')
    if (!hasDatabase) violations.push('Missing database layer (RDS, Aurora, or DynamoDB)')
  }

  return violations
}

function generateFeedback(puzzleId: string, nodeCount: number, edgeCount: number, violations: string[]): string {
  if (violations.length > 0) {
    return `Good attempt! But you're missing some key components: ${violations.join(', ')}. Try adding more services and connections.`
  }

  if (nodeCount < 3) {
    return 'Add more AWS services to your architecture. The puzzle requires a more complete design.'
  }

  if (edgeCount === 0) {
    return 'Services look good, but connect them to show how data flows between components.'
  }

  return 'Solid architecture! Consider if you might be overengineering for the stated requirements. Review the cost score for optimization opportunities.'
}

