import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePuzzles } from '../hooks/usePuzzles'
import { useCompletions } from '../hooks/useCompletions'
import { Header } from './Header'
import { SEOHead } from './SEOHead'
import { LoginModal } from './auth/LoginModal'
import { SignUpModal } from './auth/SignUpModal'
import { ForgotPasswordModal } from './auth/ForgotPasswordModal'
import { getServiceLogoPath } from '../utils/serviceLogo'
import { LazyImage } from './LazyImage'
import { Puzzle } from '../types'
import { useAuth } from '../contexts/AuthContext'

/**
 * Get color classes for score badge
 */
function getScoreColor(score: number): { bg: string; text: string; border: string } {
  if (score === 100) {
    return {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-400',
    }
  } else if (score >= 80) {
    return {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-400',
    }
  } else {
    return {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-400',
    }
  }
}

export function HomePage() {
  const navigate = useNavigate()
  const { puzzles } = usePuzzles()
  const { bestScores } = useCompletions()
  const { user } = useAuth()
  const [randomPuzzles, setRandomPuzzles] = useState<Puzzle[]>([])
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)

  // Select 3 random puzzles on mount
  useEffect(() => {
    if (puzzles.length > 0) {
      const shuffled = [...puzzles].sort(() => Math.random() - 0.5)
      setRandomPuzzles(shuffled.slice(0, Math.min(3, puzzles.length)))
    }
  }, [puzzles])

  const handleGetStarted = () => {
    if (puzzles.length > 0) {
      navigate('/workspace')
    }
  }

  const handleSwitchToSignUp = () => {
    setShowLoginModal(false)
    setShowSignUpModal(true)
  }

  const handleSwitchToLogin = () => {
    setShowSignUpModal(false)
    setShowForgotPasswordModal(false)
    setShowLoginModal(true)
  }

  const handleSwitchToForgotPassword = () => {
    setShowLoginModal(false)
    setShowForgotPasswordModal(true)
  }

  return (
    <>
      <SEOHead
        title="ArchLab - Free AWS Architecture Practice Tool | Master Cloud Design"
        description="Practice AWS architecture design with interactive puzzles. Drag-and-drop AWS services, get intelligent feedback, and master the Well-Architected Framework. Perfect for AWS certification prep and system design interviews."
        keywords="AWS architecture practice, cloud architecture, AWS certification, Solutions Architect, system design, AWS training, cloud computing practice, architecture patterns"
      />
      <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950">
        <Header />

        {/* Main Content */}
        <main id="main-content" className="max-w-7xl mx-auto px-6 py-12" role="main">
          {/* Hero Section */}
          <header className="text-center mb-16">
            <h1 className="text-5xl font-bold text-text-primary mb-4">
              Master AWS Architecture Through Practice
            </h1>
            <p className="text-xl text-text-primary max-w-3xl mx-auto mb-8 opacity-90">
              Build real-world AWS architectures, receive intelligent feedback, and learn the trade-offs
              between different design patterns. Perfect for certification prep and interview preparation.
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 text-lg"
            >
              Start architecting →
            </button>
          </header>

          {!user ? (
            <aside className="mb-16 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-xl p-6 border-2 border-primary/20" aria-label="Registration promotion">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">✨</div>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary mb-1">
                      Free AI-Powered Feedback
                    </h2>
                    <p className="text-text-secondary">
                      Register for free and unlock intelligent AI feedback on your architectures
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSignUpModal(true)}
                  className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
                >
                  Register Free →
                </button>
              </div>
            </aside>
          ) : (
            <aside className="mb-16 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-xl p-6 border-2 border-primary/20" aria-label="Welcome back">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">✅</div>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary mb-1">
                      You're signed in
                    </h2>
                    <p className="text-text-secondary">
                      Pick up where you left off or check your progress.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
                >
                  View Profile →
                </button>
              </div>
            </aside>
          )}

          {/* Visualization */}
          <section className="mb-16" aria-label="Interactive architecture visualization">
            <ArchitectureVisualization />
          </section>

          {/* Features Grid */}
          <section className="grid md:grid-cols-3 gap-8 mb-16" aria-labelledby="features">
            <h2 id="features" className="sr-only">Key Features</h2>
            <FeatureCard
              icon="🎯"
              title="Real-World Puzzles"
              description="From static sites to data lakes, practice with real-world scenarios that cover the most common AWS architecture patterns."
            />
            <FeatureCard
              icon="🧠"
              title="AI-Powered Feedback"
              description="Get detailed scores on correctness, reliability, security, and cost. Understand why certain choices are better than others. Free for registered users!"
            />
            <FeatureCard
              icon="🎨"
              title="Interactive Canvas"
              description="Drag and drop AWS services, create connections, and visualize your architecture in an intuitive interface."
            />
          </section>

          {/* Puzzle Preview */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-16" aria-labelledby="available-puzzles">
            <h2 id="available-puzzles" className="text-2xl font-bold text-text-primary mb-6">Available Puzzles</h2>
            <div className="grid grid-cols-3 gap-4">
              {randomPuzzles.map((puzzle) => {
                const bestScore = bestScores[puzzle.id]
                const hasCompletion = bestScore !== undefined
                const scoreColors = hasCompletion ? getScoreColor(bestScore) : null

                return (
                  <div
                    key={puzzle.id}
                    className={`border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer relative ${hasCompletion && scoreColors
                      ? `${scoreColors.border} border-l-4`
                      : 'border-gray-200 hover:border-primary'
                      }`}
                    onClick={() => navigate('/workspace', { state: { puzzleId: puzzle.id } })}
                  >
                    {hasCompletion && (
                      <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-semibold ${scoreColors?.bg} ${scoreColors?.text} ${scoreColors?.border} border`}>
                        {bestScore}%
                      </div>
                    )}
                    <h3 className="font-semibold text-text-primary mb-2 pr-12">{puzzle.title}</h3>
                    <p className="text-sm text-text-secondary overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: '1.4',
                      maxHeight: '2.8em'
                    }}>{puzzle.scenario}</p>
                  </div>
                )
              })}
            </div>
            {puzzles.length > 3 && (
              <p className="text-center text-text-secondary mt-6 text-lg">
                ... and many more!
              </p>
            )}
          </section>
        </main>

        {/* Auth Modals */}
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSwitchToSignUp={handleSwitchToSignUp}
          onSwitchToForgotPassword={handleSwitchToForgotPassword}
        />
        <SignUpModal
          isOpen={showSignUpModal}
          onClose={() => setShowSignUpModal(false)}
          onSwitchToLogin={handleSwitchToLogin}
        />
        <ForgotPasswordModal
          isOpen={showForgotPasswordModal}
          onClose={() => setShowForgotPasswordModal(false)}
          onSwitchToLogin={handleSwitchToLogin}
        />
      </div>
    </>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary">{description}</p>
    </div>
  )
}

interface ServicePosition {
  id: string
  serviceType: string
  x: number
  y: number
  targetX: number
  targetY: number
  vx: number
  vy: number
}

interface Connection {
  from: string
  to: string
  visible: boolean
}

function ArchitectureVisualization() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mousePosRef = useRef<{ x: number; y: number } | null>(null)
  const draggedNodeRef = useRef<string | null>(null)
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null)

  // Available AWS services for the visualization
  const availableServices = [
    'CloudFront', 'S3', 'Lambda', 'DynamoDB', 'API Gateway',
    'RDS', 'EC2', 'ALB', 'Route 53', 'VPC', 'ElastiCache', 'SQS'
  ]

  const [services, setServices] = useState<ServicePosition[]>([
    { id: '1', serviceType: 'CloudFront', x: 100, y: 100, targetX: 100, targetY: 100, vx: 0, vy: 0 },
    { id: '2', serviceType: 'S3', x: 300, y: 150, targetX: 300, targetY: 150, vx: 0, vy: 0 },
    { id: '3', serviceType: 'Lambda', x: 500, y: 100, targetX: 500, targetY: 100, vx: 0, vy: 0 },
    { id: '4', serviceType: 'DynamoDB', x: 400, y: 250, targetX: 400, targetY: 250, vx: 0, vy: 0 },
  ])
  const [connections, setConnections] = useState<Connection[]>([
    { from: '1', to: '2', visible: true },
    { from: '2', to: '3', visible: true },
    { from: '3', to: '4', visible: true },
  ])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.offsetWidth
    const height = container.offsetHeight
    const nodeWidth = 120
    const nodeHeight = 80
    const padding = 40
    const minDistance = 150 // Minimum distance between services

    // Check if position overlaps with other services (checking both current and target positions)
    const isPositionValid = (
      x: number,
      y: number,
      services: ServicePosition[],
      excludeId: string,
      checkTargets: boolean = true
    ): boolean => {
      for (const service of services) {
        if (service.id === excludeId) continue

        // Check against current position
        const dx = Math.abs(service.x - x)
        const dy = Math.abs(service.y - y)
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < minDistance) {
          return false
        }

        // Also check against target position if service is moving
        if (checkTargets) {
          const targetDx = Math.abs(service.targetX - x)
          const targetDy = Math.abs(service.targetY - y)
          const targetDistance = Math.sqrt(targetDx * targetDx + targetDy * targetDy)

          if (targetDistance < minDistance) {
            return false
          }
        }
      }
      return true
    }

    // Generate a valid position that doesn't overlap with any service
    const generateValidPosition = (
      services: ServicePosition[],
      excludeId: string,
      maxAttempts: number = 100
    ): { x: number; y: number } => {
      let attempts = 0
      let x: number, y: number

      do {
        x = padding + Math.random() * (width - nodeWidth - padding * 2)
        y = padding + Math.random() * (height - nodeHeight - padding * 2)
        attempts++

        // If we can't find a valid position after many attempts, try to find a position with more space
        if (attempts > maxAttempts) {
          // Try positions in a grid pattern as fallback
          const gridCols = 3
          const gridRows = 2
          const cellWidth = (width - padding * 2) / gridCols
          const cellHeight = (height - padding * 2) / gridRows
          const serviceIndex = services.findIndex(s => s.id === excludeId)
          const col = serviceIndex % gridCols
          const row = Math.floor(serviceIndex / gridCols)
          x = padding + col * cellWidth + cellWidth / 2 - nodeWidth / 2
          y = padding + row * cellHeight + cellHeight / 2 - nodeHeight / 2
          break
        }
      } while (!isPositionValid(x, y, services, excludeId, true))

      return { x, y }
    }

    // Randomly replace one service before shuffling
    const replaceRandomService = (services: ServicePosition[]): ServicePosition[] => {
      if (services.length === 0) return services

      // Get all currently used service types to ensure uniqueness
      const usedServiceTypes = new Set(services.map(s => s.serviceType))

      // Pick a random service to replace
      const randomIndex = Math.floor(Math.random() * services.length)
      const serviceToReplace = services[randomIndex]

      // Get available services excluding ALL currently used service types
      const availableUniqueServices = availableServices.filter((s: string) => !usedServiceTypes.has(s))

      // If no unique service is available, don't replace
      if (availableUniqueServices.length === 0) return services

      // Pick a random replacement service from unique options
      const newServiceType = availableUniqueServices[Math.floor(Math.random() * availableUniqueServices.length)]

      // Replace the service type
      const updated = [...services]
      updated[randomIndex] = {
        ...serviceToReplace,
        serviceType: newServiceType,
      }

      return updated
    }

    // Initialize random positions with collision detection
    const updatePositions = () => {
      setServices(prev => {
        // First, randomly replace one service
        const servicesWithReplacement = replaceRandomService(prev)

        const updated: ServicePosition[] = []

        // Generate positions one by one, checking against both existing and newly placed services
        for (const service of servicesWithReplacement) {
          const newPos = generateValidPosition([...servicesWithReplacement.filter(s => !updated.some(u => u.id === s.id)), ...updated], service.id)
          updated.push({
            ...service,
            targetX: newPos.x,
            targetY: newPos.y,
          })
        }

        return updated
      })
    }

    // Check and fix overlapping services when they stop
    const fixOverlappingServices = () => {
      setServices(prev => {
        const hasOverlaps = prev.some((service, i) => {
          return prev.some((other, j) => {
            if (i === j || service.id === other.id) return false
            const dx = Math.abs(service.x - other.x)
            const dy = Math.abs(service.y - other.y)
            const distance = Math.sqrt(dx * dx + dy * dy)
            return distance < minDistance
          })
        })

        if (hasOverlaps && areServicesStationary(prev)) {
          // Services have stopped but are overlapping, regenerate positions
          const updated: ServicePosition[] = []
          for (const service of prev) {
            const newPos = generateValidPosition([...prev.filter(s => !updated.some(u => u.id === s.id)), ...updated], service.id)
            updated.push({
              ...service,
              x: newPos.x,
              y: newPos.y,
              targetX: newPos.x,
              targetY: newPos.y,
            })
          }
          return updated
        }

        return prev
      })
    }

    // Initial positions
    updatePositions()
    const positionInterval = setInterval(updatePositions, 6000) // Slower updates

    // Animation loop with easing
    let animationFrameId: number | null = null
    let isRunning = true

    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3)
    }

    const animate = () => {
      if (!isRunning) return

      setServices(prev => prev.map(service => {
        const nodeWidth = 120
        const nodeHeight = 80
        const padding = 40
        const width = containerRef.current?.offsetWidth || 800
        const height = containerRef.current?.offsetHeight || 400

        // 1. DRAG LOGIC
        if (draggedNodeRef.current === service.id && mousePosRef.current) {
          const { x, y } = mousePosRef.current
          // Center the mouse on the node
          const newX = Math.max(padding, Math.min(x - nodeWidth / 2, width - padding - nodeWidth))
          const newY = Math.max(padding, Math.min(y - nodeHeight / 2, height - padding - nodeHeight))

          return {
            ...service,
            x: newX,
            y: newY,
            targetX: newX,
            targetY: newY,
            vx: 0,
            vy: 0
          }
        }

        const dx = service.targetX - service.x
        const dy = service.targetY - service.y
        const distance = Math.max(0.1, Math.sqrt(dx * dx + dy * dy))

        // Check if service has reached target
        if (distance < 0.5) {
          return { ...service, x: service.targetX, y: service.targetY, vx: 0, vy: 0 }
        }

        // Smooth easing animation - slower and more gradual
        const speed = 0.007 // Even slower for smoother, more relaxed movement
        const maxSpeed = 1.5 // Cap the maximum movement per frame

        // Normalize direction
        const normalizedDx = dx / distance
        const normalizedDy = dy / distance

        // Apply easing: start fast, slow down as we approach target
        const progress = Math.min(distance / 100, 1)
        const easedFactor = easeOutCubic(progress)
        const currentSpeed = speed * (1 + easedFactor * 2)

        // Border collision detection - check BEFORE calculating movement
        // Check if service is at or near border and moving towards it
        const borderThreshold = 5 // Consider "at border" if within 5px
        let hitBorder = false
        let newTargetX = service.targetX
        let newTargetY = service.targetY

        // Check left border
        if (service.x <= padding + borderThreshold && dx < 0) {
          hitBorder = true
          // Bounce: set new target away from left border (towards right)
          newTargetX = padding + 80 + Math.random() * (width - nodeWidth - padding * 2 - 80)
          newTargetY = service.targetY
        }
        // Check right border
        else if (service.x + nodeWidth >= width - padding - borderThreshold && dx > 0) {
          hitBorder = true
          // Bounce: set new target away from right border (towards left)
          newTargetX = padding + Math.random() * (width - nodeWidth - padding * 2 - 80)
          newTargetY = service.targetY
        }
        // Check top border
        else if (service.y <= padding + borderThreshold && dy < 0) {
          hitBorder = true
          // Bounce: set new target away from top border (towards bottom)
          newTargetY = padding + 80 + Math.random() * (height - nodeHeight - padding * 2 - 80)
          newTargetX = service.targetX
        }
        // Check bottom border
        else if (service.y + nodeHeight >= height - padding - borderThreshold && dy > 0) {
          hitBorder = true
          // Bounce: set new target away from bottom border (towards top)
          newTargetY = padding + Math.random() * (height - nodeHeight - padding * 2 - 80)
          newTargetX = service.targetX
        }

        // If we hit a border, update target and recalculate movement direction
        if (hitBorder) {
          const newDx = newTargetX - service.x
          const newDy = newTargetY - service.y
          const newDistance = Math.sqrt(newDx * newDx + newDy * newDy)

          if (newDistance > 0.5) {
            // Recalculate movement with new target
            const newNormalizedDx = newDx / newDistance
            const newNormalizedDy = newDy / newDistance
            const newProgress = Math.min(newDistance / 100, 1)
            const newEasedFactor = easeOutCubic(newProgress)
            const newCurrentSpeed = speed * (1 + newEasedFactor * 2)

            let moveX = newNormalizedDx * newCurrentSpeed * newDistance
            let moveY = newNormalizedDy * newCurrentSpeed * newDistance

            moveX = Math.sign(moveX) * Math.min(Math.abs(moveX), Math.abs(newDx), maxSpeed)
            moveY = Math.sign(moveY) * Math.min(Math.abs(moveY), Math.abs(newDy), maxSpeed)

            // Clamp position to border
            const newX = Math.max(padding, Math.min(service.x + moveX, width - padding - nodeWidth))
            const newY = Math.max(padding, Math.min(service.y + moveY, height - padding - nodeHeight))

            return {
              ...service,
              x: newX,
              y: newY,
              targetX: newTargetX,
              targetY: newTargetY,
              vx: moveX,
              vy: moveY,
            }
          }
        }

        // Calculate movement with speed cap (normal path when not hitting border)
        let moveX = normalizedDx * currentSpeed * distance
        let moveY = normalizedDy * currentSpeed * distance

        // Cap movement to prevent overshooting
        moveX = Math.sign(moveX) * Math.min(Math.abs(moveX), Math.abs(dx), maxSpeed)
        moveY = Math.sign(moveY) * Math.min(Math.abs(moveY), Math.abs(dy), maxSpeed)

        // Apply mouse repulsion if NOT being dragged
        let repulseDx = 0
        let repulseDy = 0
        if (mousePosRef.current && draggedNodeRef.current !== service.id) {
          const mDx = service.x + nodeWidth / 2 - mousePosRef.current.x
          const mDy = service.y + nodeHeight / 2 - mousePosRef.current.y
          const mDist = Math.max(1, Math.sqrt(mDx * mDx + mDy * mDy))

          if (mDist < 150) { // Repulsion radius
            const force = Math.pow((150 - mDist) / 150, 2)
            repulseDx = (mDx / mDist) * force * 5
            repulseDy = (mDy / mDist) * force * 5

            // Nudge target away so it doesn't immediately snap back
            newTargetX += repulseDx
            newTargetY += repulseDy
          }
        }

        // Clamp new targets to border
        newTargetX = Math.max(padding, Math.min(newTargetX, width - padding - nodeWidth))
        newTargetY = Math.max(padding, Math.min(newTargetY, height - padding - nodeHeight))

        // Calculate new position with border clamping
        let newX = service.x + moveX + repulseDx
        let newY = service.y + moveY + repulseDy

        // Clamp to borders to prevent going outside
        newX = Math.max(padding, Math.min(newX, width - padding - nodeWidth))
        newY = Math.max(padding, Math.min(newY, height - padding - nodeHeight))

        return {
          ...service,
          x: newX,
          y: newY,
          targetX: newTargetX,
          targetY: newTargetY,
          vx: moveX,
          vy: moveY,
        }
      }))
      animationFrameId = requestAnimationFrame(animate)
    }
    animate()

    // Check if all services have stopped moving
    const areServicesStationary = (services: ServicePosition[]): boolean => {
      return services.every(service => {
        const dx = service.targetX - service.x
        const dy = service.targetY - service.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        return distance < 1
      })
    }

    // Ensure all services are connected in a chain
    const ensureAllServicesConnected = (services: ServicePosition[]) => {
      const serviceIds = services.map(s => s.id)
      const connections: Connection[] = []

      // Create a simple chain: 1→2→3→4
      for (let i = 0; i < serviceIds.length - 1; i++) {
        connections.push({
          from: serviceIds[i],
          to: serviceIds[i + 1],
          visible: true,
        })
      }

      return connections
    }

    // Update connections when services are stationary
    const updateConnections = () => {
      setServices(prev => {
        if (areServicesStationary(prev)) {
          // Services have stopped, ensure all are connected
          const newConnections = ensureAllServicesConnected(prev)
          setConnections(newConnections)
        }
        return prev
      })
    }

    // Check connections periodically
    const connectionCheckInterval = setInterval(updateConnections, 500)

    // Check for overlapping services periodically
    const overlapCheckInterval = setInterval(fixOverlappingServices, 1000)

    // Randomly toggle connections (slower) - but maintain chain structure
    const connectionInterval = setInterval(() => {
      setServices(prev => {
        if (areServicesStationary(prev)) {
          // When stationary, randomly toggle connections but keep the chain structure
          setConnections(currentConnections => {
            // Ensure we have the chain structure first
            const chainConnections = ensureAllServicesConnected(prev)

            // If current connections don't match the chain, replace them
            if (currentConnections.length !== chainConnections.length ||
              !chainConnections.every(chainConn =>
                currentConnections.some(c => c.from === chainConn.from && c.to === chainConn.to)
              )) {
              return chainConnections
            }

            // Randomly toggle visibility but keep all connections in the chain
            return currentConnections.map(conn => ({
              ...conn,
              visible: Math.random() > 0.2, // 80% chance to be visible
            }))
          })
        }
        return prev
      })
    }, 3000) // Slower connection changes

    return () => {
      isRunning = false
      clearInterval(positionInterval)
      clearInterval(connectionInterval)
      clearInterval(connectionCheckInterval)
      clearInterval(overlapCheckInterval)
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  // Calculate connection point on the edge of a service node closest to another point
  const getConnectionPoint = (
    service: ServicePosition,
    targetX: number,
    targetY: number,
    nodeWidth: number = 120,
    nodeHeight: number = 80
  ): { x: number; y: number } => {
    const centerX = service.x + nodeWidth / 2
    const centerY = service.y + nodeHeight / 2

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
        return { x: service.x + nodeWidth, y: centerY }
      } else {
        // Target is to the left, connect to left side
        return { x: service.x, y: centerY }
      }
    } else {
      // Vertical connection (top or bottom side)
      if (dy > 0) {
        // Target is below, connect to bottom side
        return { x: centerX, y: service.y + nodeHeight }
      } else {
        // Target is above, connect to top side
        return { x: centerX, y: service.y }
      }
    }
  }
  const handleNodeClick = (id: string) => {
    setServices(prev => {
      const updated = [...prev]
      const idx = updated.findIndex(s => s.id === id)
      if (idx !== -1) {
        // cycle to random new service
        const currentType = updated[idx].serviceType
        const unUsed = availableServices.filter(s => !prev.some(p => p.serviceType === s) && s !== currentType)
        if (unUsed.length > 0) {
          const newType = unUsed[Math.floor(Math.random() * unUsed.length)]
          updated[idx] = { ...updated[idx], serviceType: newType }
        }
      }
      return updated
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 overflow-hidden">
      <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">
        Build Architectures Like This
      </h2>
      <div
        ref={containerRef}
        className="relative h-96 bg-white shadow-inner border border-gray-100 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 dark:border-slate-700 dark:shadow-inner rounded-lg overflow-hidden cursor-crosshair touch-none"
        onMouseMove={(e) => {
          if (!containerRef.current) return
          const rect = containerRef.current.getBoundingClientRect()
          mousePosRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          }
        }}
        onMouseLeave={() => {
          mousePosRef.current = null
          draggedNodeRef.current = null
        }}
        onMouseUp={() => {
          draggedNodeRef.current = null
        }}
        onDragStart={(e) => e.preventDefault()}
      >
        {/* SVG for connections */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          <defs>
            <marker
              id="arrowhead-home"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#1976D2" />
            </marker>
          </defs>
          {connections.map((conn, idx) => {
            const fromService = services.find(s => s.id === conn.from)
            const toService = services.find(s => s.id === conn.to)
            if (!fromService || !toService || !conn.visible) return null

            // Calculate connection points on the edges of the nodes
            const toNodeCenterX = toService.x + 60
            const toNodeCenterY = toService.y + 40
            const fromPoint = getConnectionPoint(fromService, toNodeCenterX, toNodeCenterY)

            const fromNodeCenterX = fromService.x + 60
            const fromNodeCenterY = fromService.y + 40
            const toPoint = getConnectionPoint(toService, fromNodeCenterX, fromNodeCenterY)

            return (
              <line
                key={idx}
                x1={fromPoint.x}
                y1={fromPoint.y}
                x2={toPoint.x}
                y2={toPoint.y}
                stroke="#1976D2"
                strokeWidth="2"
                strokeOpacity={conn.visible ? 1 : 0}
                markerEnd="url(#arrowhead-home)"
                className="transition-opacity duration-500"
              />
            )
          })}
        </svg>

        {/* Service nodes */}
        {services.map((service) => {
          const isDragged = draggedNodeRef.current === service.id
          return (
            <div
              key={service.id}
              className={`absolute bg-white border-2 border-primary rounded-lg shadow-md p-3 select-none transition-transform ${isDragged ? 'z-10 scale-105 shadow-xl ring-2 ring-primary/50 cursor-grabbing' : 'z-[2] cursor-grab hover:scale-105 hover:shadow-lg'
                }`}
              style={{
                left: `${service.x}px`,
                top: `${service.y}px`,
                width: '120px',
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                draggedNodeRef.current = service.id
                dragStartPosRef.current = { x: e.clientX, y: e.clientY }
              }}
              onClick={(e) => {
                if (dragStartPosRef.current) {
                  const dx = e.clientX - dragStartPosRef.current.x
                  const dy = e.clientY - dragStartPosRef.current.y
                  if (Math.sqrt(dx * dx + dy * dy) < 5) {
                    handleNodeClick(service.id)
                  }
                }
              }}
            >
              <AnimatedServiceNode serviceType={service.serviceType} />
            </div>
          )
        })}
      </div>
      <p className="text-center text-text-secondary mt-4">
        Interactive drag-and-drop interface • Real-time feedback • Learn best practices
      </p>
    </div>
  )
}

function AnimatedServiceNode({ serviceType }: { serviceType: string }) {
  const [logoError, setLogoError] = useState(false)
  const [, setLogoLoaded] = useState(false)

  const logoPath = getServiceLogoPath(serviceType)

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      {!logoError && (
        <LazyImage
          src={logoPath}
          alt={`${serviceType} AWS service icon`}
          className="w-10 h-10 object-contain flex-shrink-0"
          loading="lazy"
          onLoad={() => setLogoLoaded(true)}
          onError={() => setLogoError(true)}
        />
      )}
      <span className="font-semibold text-xs text-primary text-center leading-tight">
        {serviceType}
      </span>
    </div>
  )
}
