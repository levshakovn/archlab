import { Puzzle, GraphJSON, GradingResult } from '../types'

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
  const scores = scoreByPuzzle(puzzle.id, graph, puzzle)

  // Check architecture validation points
  const requirements = checkArchitectureValidation(puzzle, graph)

  // Check hard constraints
  const violations = checkConstraints(puzzle.id, graph)

  // Generate feedback
  const feedback = generateFeedback(puzzle.id, nodeCount, edgeCount, violations, puzzle, graph)

  return {
    scores,
    requirements,
    hardConstraintViolations: violations,
    summaryFeedback: feedback,
  }
}

function scoreByPuzzle(puzzleId: string, graph: GraphJSON, puzzle?: Puzzle) {
  const nodeCount = Object.keys(graph.nodes).length
  const edgeCount = graph.edges.length
  const serviceTypes = Object.values(graph.nodes).map((n) => n.serviceType)

  // Helper function to check if a required service exists
  const hasRequiredService = (serviceName: string): boolean => {
    return serviceTypes.includes(serviceName) || 
           (serviceName === 'ALB' && (serviceTypes.includes('ALB') || serviceTypes.includes('NLB'))) ||
           (serviceName === 'CloudWatch' && serviceTypes.some(s => s.startsWith('CloudWatch'))) ||
           (serviceName === 'ECS' && (serviceTypes.includes('ECS') || serviceTypes.includes('Fargate'))) ||
           (serviceName === 'CloudWatch Alarms' && serviceTypes.some(s => s.includes('CloudWatch'))) ||
           (serviceName === 'Kinesis Data Streams' && serviceTypes.some(s => s.includes('Kinesis')))
  }

  // Helper function to check if a required connection exists
  const hasRequiredConnection = (from: string, to: string): boolean => {
    return graph.edges.some((e) => {
      const fromService = graph.nodes[e.from]?.serviceType
      const toService = graph.nodes[e.to]?.serviceType
      // Handle flexible matching for ALB/NLB, CloudWatch variations, etc.
      const fromMatch = (from === 'ALB' && (fromService === 'ALB' || fromService === 'NLB')) ||
                       (from === 'CloudWatch' && fromService?.startsWith('CloudWatch')) ||
                       (from === 'CloudWatch Alarms' && fromService?.includes('CloudWatch')) ||
                       (from === 'Kinesis Data Streams' && fromService?.includes('Kinesis')) ||
                       fromService === from
      const toMatch = toService === to
      return fromMatch && toMatch
    })
  }

  // Check puzzle errorRules if available
  if (puzzle?.errorRules) {
    const requiredServices = puzzle.errorRules.requiredServices || {}
    const requiredConnections = puzzle.errorRules.requiredConnections || []
    
    // Check if all required services are present
    const allServicesPresent = Object.keys(requiredServices).every(serviceName => {
      // Handle special cases
      if (serviceName === 'ALB') {
        return hasRequiredService('ALB')
      }
      if (serviceName === 'CloudWatch' || serviceName === 'CloudWatch Alarms') {
        return serviceTypes.some(s => s.includes('CloudWatch'))
      }
      if (serviceName === 'ECS') {
        return serviceTypes.includes('ECS') || serviceTypes.includes('Fargate')
      }
      return serviceTypes.includes(serviceName)
    })

    // Check if all required connections are present
    const allConnectionsPresent = requiredConnections.every(conn => {
      return hasRequiredConnection(conn.from, conn.to)
    })

    // Award 100% if all requirements met
    if (allServicesPresent) {
      if (requiredConnections.length === 0 || allConnectionsPresent) {
        // Perfect score: all services present, and all connections (if any) present
        return {
          correctness: 10,
          reliability: 10,
          security: 10,
          cost: 10,
          total: 10.0,
        }
      }
      // If services present but connections missing, give partial credit
      if (!allConnectionsPresent) {
        const connectedCount = requiredConnections.filter(conn => hasRequiredConnection(conn.from, conn.to)).length
        const connectionRatio = connectedCount / requiredConnections.length
        return {
          correctness: 10,
          reliability: Math.round(7 + connectionRatio * 3),
          security: 10,
          cost: 10,
          total: Math.round((10 * 0.4 + (7 + connectionRatio * 3) * 0.2 + 10 * 0.2 + 10 * 0.2) * 10) / 10,
        }
      }
    }
  }

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

    case 'puzzle-auto-scaling': {
      const serviceTypes = Object.values(graph.nodes).map((n) => n.serviceType)
      const hasASG = serviceTypes.includes('ASG')
      const hasALB = serviceTypes.some((s) => ['ALB', 'NLB'].includes(s))
      const hasCloudWatch = serviceTypes.some((s) => ['CloudWatch', 'CloudWatch Alarms', 'CloudWatch Metrics'].includes(s))
      const hasALBToASG = graph.edges.some((e) => {
        const fromService = graph.nodes[e.from]?.serviceType
        const toService = graph.nodes[e.to]?.serviceType
        return (fromService === 'ALB' || fromService === 'NLB') && toService === 'ASG'
      })
      const hasCloudWatchToASG = graph.edges.some((e) => {
        const fromService = graph.nodes[e.from]?.serviceType
        const toService = graph.nodes[e.to]?.serviceType
        return (fromService === 'CloudWatch' || fromService === 'CloudWatch Alarms') && toService === 'ASG'
      })
      
      // Perfect score if all required services and connections are present
      if (hasASG && hasALB && hasCloudWatch && hasALBToASG && hasCloudWatchToASG) {
        correctness = 10
        reliability = 10
        security = 10
        cost = 10
      } else {
        correctness = (hasASG && hasALB) ? 8 : 4
        reliability = hasALBToASG ? 8 : 4
        security = nodeCount > 2 ? 7 : 4
        cost = nodeCount < 5 ? 8 : 6
      }
      break
    }

    default:
      correctness = (nodeCount / 5) * 8
      reliability = edgeCount > 0 ? 6 : 3
      security = 5
      cost = 6
  }

  // Calculate weighted average (weights sum to 1.0, so result is already 0-10 scale)
  const total = correctness * 0.4 + reliability * 0.2 + security * 0.2 + cost * 0.2

  return {
    correctness: Math.round(correctness),
    reliability: Math.round(reliability),
    security: Math.round(security),
    cost: Math.round(cost),
    total: Math.round(total * 10) / 10,
  }
}

/**
 * Check architecture validation points based on puzzle requirements and errorRules
 */
function checkArchitectureValidation(puzzle: Puzzle, graph: GraphJSON) {
  const serviceTypes = Object.values(graph.nodes).map((n) => n.serviceType)

  // Helper to check if service exists (with flexible matching)
  const hasService = (serviceName: string): boolean => {
    if (serviceName === 'ALB') return serviceTypes.some(s => ['ALB', 'NLB'].includes(s))
    if (serviceName === 'CloudWatch' || serviceName === 'CloudWatch Alarms') {
      return serviceTypes.some(s => s.includes('CloudWatch'))
    }
    if (serviceName === 'ECS') return serviceTypes.some(s => ['ECS', 'Fargate'].includes(s))
    if (serviceName === 'Kinesis Data Streams') return serviceTypes.some(s => s.includes('Kinesis'))
    return serviceTypes.includes(serviceName)
  }

  // Map requirements to validation checks (only check first 3 if more exist)
  const reqsToCheck = puzzle.requirements.slice(0, 3)
  
  return reqsToCheck.map((req) => {
    // Simple heuristics based on requirement text and errorRules
    let met = false
    let comment = ''

    if (req.toLowerCase().includes('storage') || req.toLowerCase().includes('bucket') || req.toLowerCase().includes('s3')) {
      met = hasService('S3')
      comment = met ? 'Object storage service is present' : 'Missing object storage service (S3)'
    } else if (req.toLowerCase().includes('cdn') || req.toLowerCase().includes('distribution') || req.toLowerCase().includes('cloudfront')) {
      met = hasService('CloudFront')
      comment = met ? 'CDN distribution is configured' : 'Missing CDN service (CloudFront)'
    } else if (req.toLowerCase().includes('scale') || req.toLowerCase().includes('automatic') || req.toLowerCase().includes('asg')) {
      met = hasService('ASG')
      comment = met ? 'Auto scaling is configured' : 'Missing auto scaling group (ASG)'
    } else if (req.toLowerCase().includes('load balanc')) {
      met = hasService('ALB')
      comment = met ? 'Load balancer is present' : 'Missing load balancer (ALB or NLB)'
    } else if (req.toLowerCase().includes('monitor') || req.toLowerCase().includes('metrics') || req.toLowerCase().includes('cloudwatch')) {
      met = serviceTypes.some(s => s.includes('CloudWatch'))
      comment = met ? 'Monitoring service is configured' : 'Missing monitoring service (CloudWatch)'
    } else if (req.toLowerCase().includes('connect') || req.toLowerCase().includes('connection')) {
      met = graph.edges.length > 0
      comment = met ? 'Services are connected' : 'Services need to be connected'
    } else if (req.toLowerCase().includes('encrypt') || req.toLowerCase().includes('kms')) {
      met = hasService('KMS')
      comment = met ? 'Encryption key management is configured' : 'Missing encryption service (KMS)'
    } else if (req.toLowerCase().includes('database') || req.toLowerCase().includes('rds') || req.toLowerCase().includes('aurora')) {
      met = serviceTypes.some(s => ['RDS', 'Aurora', 'DynamoDB'].includes(s))
      comment = met ? 'Database service is present' : 'Missing database service'
    } else if (req.toLowerCase().includes('lambda') || req.toLowerCase().includes('serverless')) {
      met = hasService('Lambda')
      comment = met ? 'Serverless compute is configured' : 'Missing serverless compute (Lambda)'
    } else if (req.toLowerCase().includes('api gateway') || req.toLowerCase().includes('api')) {
      met = hasService('API Gateway')
      comment = met ? 'API gateway is configured' : 'Missing API gateway'
    } else if (req.toLowerCase().includes('auth') || req.toLowerCase().includes('cognito')) {
      met = hasService('Cognito')
      comment = met ? 'Authentication service is configured' : 'Missing authentication service (Cognito)'
    } else {
      // Fallback: check if any services are present
      met = serviceTypes.length > 0
      comment = met ? 'Architecture addresses this requirement' : 'Add services to address this requirement'
    }

    return {
      requirement: req,
      met,
      comment,
    }
  })
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

function generateFeedback(
  puzzleId: string, 
  nodeCount: number, 
  edgeCount: number, 
  violations: string[],
  puzzle?: Puzzle,
  graph?: GraphJSON
): string {
  const serviceTypes = graph ? Object.values(graph.nodes).map((n) => n.serviceType) : []
  const missingServices: string[] = []
  
  // Build specific feedback based on puzzle requirements
  const feedbackParts: string[] = []
  
  // Check for violations first
  if (violations.length > 0) {
    feedbackParts.push(`⚠️ **Missing Components**: ${violations.join(', ')}`)
    feedbackParts.push('')
    
    // Extract missing service names from violations for suggestions
    violations.forEach(v => {
      if (v.includes('load balancer')) missingServices.push('ALB or NLB')
      if (v.includes('compute')) missingServices.push('EC2 or ASG')
      if (v.includes('database')) missingServices.push('RDS, Aurora, or DynamoDB')
      if (v.includes('S3')) missingServices.push('S3')
      if (v.includes('CloudFront')) missingServices.push('CloudFront')
      if (v.includes('Lambda')) missingServices.push('Lambda')
      if (v.includes('API Gateway')) missingServices.push('API Gateway')
    })
  }
  
  // Puzzle-specific feedback
  switch (puzzleId) {
    case 'puzzle-static-site-cdn':
      if (!serviceTypes.includes('S3')) {
        feedbackParts.push('💡 **Suggestion**: Add S3 to host your static website content. [Learn more about S3](https://docs.aws.amazon.com/s3/latest/userguide/WebsiteHosting.html)')
      }
      if (!serviceTypes.includes('CloudFront')) {
        feedbackParts.push('💡 **Suggestion**: Add CloudFront CDN for global content delivery and improved performance. [Learn more about CloudFront](https://docs.aws.amazon.com/cloudfront/latest/DeveloperGuide/Introduction.html)')
      }
      if (serviceTypes.includes('S3') && serviceTypes.includes('CloudFront') && edgeCount === 0) {
        feedbackParts.push('💡 **Next Step**: Connect CloudFront to S3 to enable CDN distribution of your static content.')
      }
      break
      
    case 'puzzle-3tier-basic':
      if (!serviceTypes.some(s => ['ALB', 'NLB'].includes(s))) {
        feedbackParts.push('💡 **Suggestion**: Add a load balancer (ALB or NLB) to distribute traffic across your compute instances. [Learn more about ALB](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html)')
      }
      if (!serviceTypes.some(s => ['EC2', 'ASG'].includes(s))) {
        feedbackParts.push('💡 **Suggestion**: Add compute resources (EC2 instances or Auto Scaling Group) for your application tier. [Learn more about EC2](https://docs.aws.amazon.com/ec2/latest/userguide/concepts.html)')
      }
      if (!serviceTypes.some(s => ['RDS', 'Aurora', 'DynamoDB'].includes(s))) {
        feedbackParts.push('💡 **Suggestion**: Add a database layer (RDS, Aurora, or DynamoDB) to store your application data. [Learn more about RDS](https://docs.aws.amazon.com/rds/latest/userguide/Welcome.html)')
      }
      if (serviceTypes.length >= 3 && edgeCount === 0) {
        feedbackParts.push('💡 **Next Step**: Connect your services to show the data flow: Load Balancer → Compute → Database')
      }
      break
      
    case 'puzzle-serverless-api':
      if (!serviceTypes.includes('Lambda')) {
        feedbackParts.push('💡 **Suggestion**: Add AWS Lambda for serverless compute. [Learn more about Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)')
      }
      if (!serviceTypes.includes('API Gateway')) {
        feedbackParts.push('💡 **Suggestion**: Add API Gateway to create and manage your REST API. [Learn more about API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)')
      }
      if (!serviceTypes.some(s => ['DynamoDB', 'Aurora Serverless'].includes(s))) {
        feedbackParts.push('💡 **Suggestion**: Add a managed database (DynamoDB or Aurora Serverless) for serverless data storage. [Learn more about DynamoDB](https://docs.aws.amazon.com/dynamodb/latest/developerguide/Introduction.html)')
      }
      break
      
    case 'puzzle-async-processing':
      if (!serviceTypes.includes('S3')) {
        feedbackParts.push('💡 **Suggestion**: Add S3 to store uploaded images. [Learn more about S3](https://docs.aws.amazon.com/s3/latest/userguide/Welcome.html)')
      }
      if (!serviceTypes.some(s => ['SQS', 'SNS'].includes(s))) {
        feedbackParts.push('💡 **Suggestion**: Add a message queue (SQS) or pub/sub (SNS) to decouple upload from processing. [Learn more about SQS](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html)')
      }
      if (!serviceTypes.includes('Lambda')) {
        feedbackParts.push('💡 **Suggestion**: Add Lambda for serverless image processing workers. [Learn more about Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)')
      }
      break
      
    case 'puzzle-data-lake-analytics':
      if (!serviceTypes.includes('S3')) {
        feedbackParts.push('💡 **Suggestion**: Add S3 as your data lake storage layer. [Learn more about data lakes on S3](https://docs.aws.amazon.com/whitepapers/latest/building-data-lakes/amazon-s3-data-lake-storage-layer.html)')
      }
      if (!serviceTypes.includes('Athena')) {
        feedbackParts.push('💡 **Suggestion**: Add Amazon Athena for ad-hoc SQL queries on your data lake. [Learn more about Athena](https://docs.aws.amazon.com/athena/latest/ug/what-is.html)')
      }
      if (serviceTypes.includes('S3') && serviceTypes.includes('Athena') && edgeCount === 0) {
        feedbackParts.push('💡 **Next Step**: Connect Athena to S3 so queries can access your data lake.')
      }
      break
  }
  
  // General feedback based on architecture state
  if (nodeCount < 3 && !violations.length) {
    feedbackParts.push('📋 **Progress**: Add more AWS services to build a complete architecture. Start with the required services mentioned in the puzzle requirements.')
  }
  
  if (edgeCount === 0 && nodeCount > 0) {
    feedbackParts.push('🔗 **Connections**: Connect your services to show data flow and relationships between components.')
  }
  
  if (violations.length === 0 && nodeCount >= 3 && edgeCount > 0) {
    feedbackParts.push('✅ **Great Progress!** Your architecture looks solid. Review the requirement checklist above to ensure all requirements are met.')
    
    // Check if all required services are present for this puzzle
    if (puzzle?.errorRules?.requiredServices) {
      const requiredServices = Object.keys(puzzle.errorRules.requiredServices)
      const allPresent = requiredServices.every(req => {
        if (req === 'ALB') return serviceTypes.some(s => ['ALB', 'NLB'].includes(s))
        if (req === 'CloudWatch') return serviceTypes.some(s => s.includes('CloudWatch'))
        if (req === 'ECS') return serviceTypes.some(s => ['ECS', 'Fargate'].includes(s))
        return serviceTypes.includes(req)
      })
      
      if (allPresent) {
        feedbackParts.push('')
        feedbackParts.push('🎉 **Excellent!** You\'ve included all required services. Consider optimizing for cost and security based on the scores above.')
      }
    }
  }
  
  // If no specific feedback was generated, provide generic encouragement
  if (feedbackParts.length === 0) {
    return 'Keep building! Add services and connections based on the puzzle requirements.'
  }
  
  return feedbackParts.join('\n\n')
}

