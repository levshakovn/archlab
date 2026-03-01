# Adding New Puzzles to ArchLab

This guide explains how to add new puzzles to ArchLab. Puzzles are defined in JSON format and stored in `frontend/src/data/puzzles.json`.

## Table of Contents

- [Quick Start](#quick-start)
- [Puzzle Structure](#puzzle-structure)
- [Required Fields](#required-fields)
- [Optional Fields](#optional-fields)
- [Error Rules (Advanced)](#error-rules-advanced)
- [Step-by-Step Guide](#step-by-step-guide)
- [Examples](#examples)
- [Testing Your Puzzle](#testing-your-puzzle)

## Quick Start

1. Open `frontend/src/data/puzzles.json`
2. Add a new puzzle object to the `puzzles` array
3. Fill in the required fields (see below)
4. Test your puzzle in the application

## Puzzle Structure

A puzzle is a JSON object with the following structure:

```json
{
  "id": "puzzle-unique-id",
  "title": "Display Name",
  "scenario": "Description of what the user needs to build",
  "requirements": ["Requirement 1", "Requirement 2"],
  "allowedServices": ["Service1", "Service2"],
  "commonMistakes": ["Mistake 1", "Mistake 2"],
  "errorRules": { /* Optional: Advanced error validation */ }
}
```

## Required Fields

### `id` (string)
- **Required**: Yes
- **Format**: `puzzle-{descriptive-name}`
- **Example**: `"puzzle-static-site-cdn"`
- **Description**: Unique identifier for the puzzle. Used internally for routing and grading.
- **Rules**: 
  - Must be unique across all puzzles
  - Use lowercase with hyphens
  - Start with `puzzle-`

### `title` (string)
- **Required**: Yes
- **Example**: `"Static Website with CDN"`
- **Description**: Display name shown in the puzzle selector dropdown
- **Best Practice**: Keep it concise (3-8 words)

### `scenario` (string)
- **Required**: Yes
- **Example**: `"Your company needs a simple marketing website with static content..."`
- **Description**: Detailed description of the problem the user needs to solve
- **Best Practice**: 
  - 2-4 sentences
  - Include constraints and requirements
  - Be specific about what needs to be achieved

### `requirements` (array of strings)
- **Required**: Yes
- **Example**: `["Host static content in an S3 bucket.", "Serve content through a CDN distribution."]`
- **Description**: List of specific requirements that must be met
- **Best Practice**:
  - 3-6 requirements
  - Each requirement should be actionable
  - These are checked during grading

### `allowedServices` (array of strings)
- **Required**: Yes
- **Example**: `["S3", "CloudFront", "Route 53", "ACM"]`
- **Description**: List of AWS services that users can drag onto the canvas
- **Available Services**: See [Available AWS Services](#available-aws-services) below
- **Best Practice**:
  - Include all services that could reasonably be part of the solution
  - Include supporting services (e.g., Route 53, ACM, CloudWatch)
  - Don't include services that are clearly wrong for the scenario

### `commonMistakes` (array of strings)
- **Required**: Yes (but can be empty array)
- **Example**: `["Making the S3 bucket public instead of using a private bucket with CDN origin access."]`
- **Description**: List of common mistakes users make (shown in sidebar as hints)
- **Best Practice**:
  - 3-5 common mistakes
  - Be specific about what's wrong
  - These help users avoid pitfalls

## Optional Fields

### `errorRules` (object)
- **Required**: No
- **Description**: Advanced error validation rules (see [Error Rules](#error-rules-advanced) section)
- **When to Use**: When you want specific error messages for wrong services, wrong connections, or missing components

## Available AWS Services

Here are the AWS services currently supported in ArchLab. Use the exact service names in `allowedServices`:

**Compute:**
- `EC2`, `ASG` (Auto Scaling Group), `ECS`, `Fargate`, `Lambda`, `Batch`

**Storage:**
- `S3`, `S3 Access Point`, `EFS`, `EBS`

**Database:**
- `RDS`, `Aurora`, `Aurora Serverless`, `DynamoDB`, `ElastiCache`, `DocumentDB`, `Keyspaces`

**Networking:**
- `VPC`, `Subnet`, `Internet Gateway`, `NAT Gateway`, `VPC Endpoint`, `Route 53`, `CloudFront`, `ALB` (Application Load Balancer), `NLB` (Network Load Balancer), `Transit Gateway`

**Security:**
- `IAM`, `Cognito`, `KMS`, `WAF`, `Shield`, `Security Group`, `NACL`

**Application Services:**
- `API Gateway`, `AppSync`, `SQS`, `SNS`, `EventBridge`, `Step Functions`, `Lambda@Edge`, `CloudFront Function`

**Analytics:**
- `Athena`, `Glue`, `Lake Formation`, `Kinesis Data Firehose`, `Kinesis Data Streams`, `OpenSearch`, `Redshift Serverless`, `MSK`

**Monitoring:**
- `CloudWatch`, `CloudWatch Logs`, `CloudWatch Logs Subscription Filter`

**Other:**
- `ACM` (AWS Certificate Manager), `S3 Event Notification`, `DLQ` (Dead Letter Queue), `AWS Backup`, `Systems Manager`

## Error Rules (Advanced)

Error rules allow you to provide specific, helpful feedback when users make mistakes. This is optional but recommended for better user experience.

### Structure

```json
{
  "errorRules": {
    "requiredServices": {
      "S3": {
        "message": "S3 is required to host static content.",
        "error": "Missing required service: S3 bucket"
      }
    },
    "forbiddenServices": {
      "EC2": {
        "message": "EC2 is not needed for a static website. Use S3 instead.",
        "severity": "error"
      }
    },
    "requiredConnections": [
      {
        "from": "CloudFront",
        "to": "S3",
        "message": "CloudFront must connect to S3 as its origin.",
        "error": "Missing required connection: CloudFront → S3"
      }
    ],
    "wrongConnections": [
      {
        "from": "S3",
        "to": "CloudFront",
        "message": "Connection direction is wrong. CloudFront should connect to S3.",
        "correctFlow": ["CloudFront", "S3"],
        "severity": "error"
      }
    ],
    "flowValidation": {
      "description": "User access flow should be: Route 53 → CloudFront → S3",
      "correctFlow": ["Route 53", "CloudFront", "S3"],
      "message": "The correct flow is: Users → Route 53 (DNS) → CloudFront (CDN) → S3 (Storage)"
    }
  }
}
```

### Error Rule Types

#### `requiredServices`
Services that must be present in the solution.

```json
"requiredServices": {
  "ServiceName": {
    "message": "Why this service is needed",
    "error": "Error message shown if missing"
  }
}
```

#### `forbiddenServices`
Services that shouldn't be used for this puzzle.

```json
"forbiddenServices": {
  "ServiceName": {
    "message": "Why this service is wrong",
    "severity": "error" | "warning"
  }
}
```

#### `requiredConnections`
Connections that must exist between services.

```json
"requiredConnections": [
  {
    "from": "ServiceA",
    "to": "ServiceB",
    "message": "Why this connection is needed",
    "error": "Error message if missing"
  }
]
```

#### `wrongConnections`
Incorrect connection patterns.

```json
"wrongConnections": [
  {
    "from": "ServiceA",
    "to": "ServiceB",
    "message": "Why this connection is wrong",
    "correctFlow": ["ServiceB", "ServiceA"],
    "severity": "error"
  }
]
```

#### `flowValidation`
Overall architecture flow validation.

```json
"flowValidation": {
  "description": "Brief description of correct flow",
  "correctFlow": ["Service1", "Service2", "Service3"],
  "message": "Detailed explanation of the correct flow"
}
```

## Step-by-Step Guide

### Step 1: Plan Your Puzzle

Before writing code, think about:
- What AWS architecture pattern are you teaching?
- What are the key services involved?
- What are common mistakes users might make?
- What's the correct flow/order of services?

### Step 2: Create the Puzzle Object

Open `frontend/src/data/puzzles.json` and add a new object to the `puzzles` array:

```json
{
  "id": "puzzle-my-new-puzzle",
  "title": "My New Puzzle",
  "scenario": "Describe the scenario...",
  "requirements": [
    "Requirement 1",
    "Requirement 2"
  ],
  "allowedServices": [
    "Service1",
    "Service2"
  ],
  "commonMistakes": [
    "Common mistake 1"
  ]
}
```

### Step 3: Fill in Required Fields

1. **ID**: Choose a unique ID like `puzzle-my-new-puzzle`
2. **Title**: Write a clear, concise title
3. **Scenario**: Write 2-4 sentences describing the problem
4. **Requirements**: List 3-6 specific requirements
5. **Allowed Services**: List all relevant AWS services
6. **Common Mistakes**: List 3-5 common mistakes

### Step 4: Add Error Rules (Optional but Recommended)

Add an `errorRules` object with:
- Required services
- Forbidden services (if any)
- Required connections
- Wrong connections (if any)
- Flow validation

### Step 5: Test Your Puzzle

1. Start the frontend: `cd frontend && npm run dev`
2. Navigate to http://localhost:5173
3. Select your puzzle from the dropdown
4. Try building the architecture
5. Test the grading to see if feedback is helpful

## Examples

### Example 1: Simple Static Site Puzzle

```json
{
  "id": "puzzle-static-site-cdn",
  "title": "Static Website with CDN",
  "scenario": "Your company needs a simple marketing website with static content (HTML/CSS/JS). Users are global, and the site must be served over HTTPS with low latency. S3 objects must not be directly publicly accessible; all access should go through a CDN.",
  "requirements": [
    "Host static content in an S3 bucket.",
    "Serve content through a CDN distribution.",
    "Ensure traffic uses HTTPS.",
    "Prevent direct public access to S3 objects (only via CDN)."
  ],
  "allowedServices": [
    "S3",
    "CloudFront",
    "Route 53",
    "ACM",
    "WAF",
    "Shield"
  ],
  "commonMistakes": [
    "Making the S3 bucket public instead of using a private bucket with CDN origin access.",
    "Skipping HTTPS or not attaching a certificate to the CDN.",
    "Pointing DNS directly to the S3 website endpoint instead of the CDN."
  ]
}
```

### Example 2: Puzzle with Error Rules

```json
{
  "id": "puzzle-serverless-api",
  "title": "Serverless REST API Backend",
  "scenario": "A startup needs a backend for a mobile notes app. Traffic is spiky, and they want to pay only for what they use with minimal operational overhead.",
  "requirements": [
    "Expose a REST API endpoint to clients.",
    "Use serverless compute for handling requests.",
    "Use a managed, highly available data store.",
    "Ensure the design can scale automatically."
  ],
  "allowedServices": [
    "API Gateway",
    "Lambda",
    "DynamoDB",
    "Aurora Serverless",
    "Cognito",
    "KMS"
  ],
  "commonMistakes": [
    "Using EC2 instances instead of Lambda for the main API.",
    "Choosing a self-managed database instead of a managed service.",
    "Not securing API endpoints."
  ],
  "errorRules": {
    "requiredServices": {
      "Lambda": {
        "message": "Lambda is required for serverless compute.",
        "error": "Missing required service: Lambda"
      },
      "API Gateway": {
        "message": "API Gateway is required to expose REST API endpoints.",
        "error": "Missing required service: API Gateway"
      }
    },
    "forbiddenServices": {
      "EC2": {
        "message": "EC2 is not serverless. Use Lambda for serverless compute.",
        "severity": "error"
      }
    },
    "requiredConnections": [
      {
        "from": "API Gateway",
        "to": "Lambda",
        "message": "API Gateway must connect to Lambda to handle requests.",
        "error": "Missing required connection: API Gateway → Lambda"
      }
    ]
  }
}
```

## Testing Your Puzzle

### Manual Testing Checklist

- [ ] Puzzle appears in the dropdown selector
- [ ] Scenario and requirements display correctly in sidebar
- [ ] All allowed services appear in the service palette
- [ ] Can drag services onto canvas
- [ ] Can create connections between services
- [ ] Grading button works
- [ ] Feedback messages are helpful and accurate
- [ ] Error rules (if added) trigger correctly

### Common Issues

**Puzzle doesn't appear in dropdown:**
- Check JSON syntax (use a JSON validator)
- Ensure `id` is unique
- Check that puzzle is inside the `puzzles` array

**Services don't appear:**
- Verify service names match exactly (case-sensitive)
- Check that services are in the `allowedServices` array

**Grading doesn't work:**
- Check that `puzzleId` matches your puzzle's `id`
- Verify grading service has logic for your puzzle (may need backend updates)

## Best Practices

1. **Clear Scenarios**: Write scenarios that are realistic and specific
2. **Reasonable Requirements**: Don't make puzzles too easy or too hard
3. **Helpful Error Messages**: If using error rules, make messages actionable
4. **Service Selection**: Include enough services to allow creativity, but not so many it's confusing
5. **Common Mistakes**: Focus on mistakes that teach important concepts
6. **Test Thoroughly**: Try different solutions to ensure grading works correctly

## Next Steps

After adding a puzzle:

1. **Update Grading Logic**: You may need to update the grading service (`frontend/src/services/gradingService.ts` or `backend/app/services/grading_service.py`) to handle your puzzle's specific scoring logic.

2. **Add Service Logos**: If you use a new AWS service, ensure its logo exists in `frontend/public/aws-logos/` or add it.

3. **Update Documentation**: Consider updating the main README to mention your new puzzle.

## Quick Reference Template

Copy this template to get started quickly:

```json
{
  "id": "puzzle-your-puzzle-name",
  "title": "Your Puzzle Title",
  "scenario": "Describe the scenario in 2-4 sentences. Include constraints, requirements, and what needs to be achieved.",
  "requirements": [
    "First requirement that must be met",
    "Second requirement that must be met",
    "Third requirement that must be met"
  ],
  "allowedServices": [
    "Service1",
    "Service2",
    "Service3"
  ],
  "commonMistakes": [
    "First common mistake users make",
    "Second common mistake users make",
    "Third common mistake users make"
  ]
}
```

### With Error Rules Template

```json
{
  "id": "puzzle-your-puzzle-name",
  "title": "Your Puzzle Title",
  "scenario": "Describe the scenario...",
  "requirements": ["Requirement 1", "Requirement 2"],
  "allowedServices": ["Service1", "Service2"],
  "commonMistakes": ["Mistake 1", "Mistake 2"],
  "errorRules": {
    "requiredServices": {
      "Service1": {
        "message": "Why Service1 is required",
        "error": "Missing required service: Service1"
      }
    },
    "forbiddenServices": {
      "WrongService": {
        "message": "Why WrongService shouldn't be used",
        "severity": "error"
      }
    },
    "requiredConnections": [
      {
        "from": "ServiceA",
        "to": "ServiceB",
        "message": "Why this connection is needed",
        "error": "Missing required connection: ServiceA → ServiceB"
      }
    ],
    "wrongConnections": [
      {
        "from": "ServiceA",
        "to": "ServiceB",
        "message": "Why this connection is wrong",
        "correctFlow": ["ServiceB", "ServiceA"],
        "severity": "error"
      }
    ]
  }
}
```

## Questions?

- Check existing puzzles in `puzzles.json` for examples
- Review the grading service to understand how puzzles are evaluated
- See `PUZZLE_ERROR_STRUCTURE.md` for advanced error rule patterns
