# Puzzle Error Structure Proposal

## Overview
This document proposes a structure for organizing error messages and validation rules for puzzles. The goal is to provide specific, helpful feedback when users make common mistakes.

## Proposed Structure

### Enhanced Puzzle JSON Structure

```json
{
  "puzzles": [
    {
      "id": "puzzle-static-site-cdn",
      "title": "Static Website with CDN",
      "scenario": "...",
      "requirements": [...],
      "allowedServices": [...],
      
      // NEW: Error definitions
      "errorRules": {
        // Services that are wrong for this puzzle
        "wrongServices": {
          "EC2": {
            "message": "EC2 is not needed for a static website. Static content should be stored in S3, not on compute instances.",
            "severity": "error"
          },
          "RDS": {
            "message": "RDS is a database service and not needed for a static website with no backend.",
            "severity": "error"
          },
          "Lambda": {
            "message": "Lambda is not required for a simple static site. Consider if you need server-side processing.",
            "severity": "warning"
          }
        },
        
        // Wrong service combinations
        "wrongCombinations": [
          {
            "services": ["S3", "Route 53"],
            "condition": "directConnection",
            "message": "Don't point Route 53 directly to S3. Route 53 should point to CloudFront, which then connects to S3.",
            "severity": "error",
            "fix": "Add CloudFront between Route 53 and S3"
          },
          {
            "services": ["S3"],
            "condition": "publicBucket",
            "message": "S3 bucket should be private. All access should go through CloudFront using Origin Access Control (OAC) or Origin Access Identity (OAI).",
            "severity": "error",
            "fix": "Make S3 bucket private and configure CloudFront origin access"
          }
        ],
        
        // Wrong connection patterns
        "wrongConnections": [
          {
            "from": "CloudFront",
            "to": "Route 53",
            "message": "CloudFront should not connect to Route 53. Route 53 is DNS and should point TO CloudFront, not the other way around.",
            "severity": "error",
            "correctFlow": ["Route 53", "CloudFront", "S3"]
          },
          {
            "from": "S3",
            "to": "CloudFront",
            "message": "Connection direction is wrong. CloudFront should connect to S3 (CloudFront pulls from S3 origin), not S3 to CloudFront.",
            "severity": "error",
            "correctFlow": ["CloudFront", "S3"]
          }
        ],
        
        // Missing required connections
        "missingConnections": [
          {
            "from": "CloudFront",
            "to": "S3",
            "message": "CloudFront must connect to S3 as its origin. Without this connection, CloudFront has no content to serve.",
            "severity": "error"
          },
          {
            "from": "Route 53",
            "to": "CloudFront",
            "message": "Route 53 should point to your CloudFront distribution for proper DNS routing.",
            "severity": "warning"
          }
        ],
        
        // Service order issues (flow validation)
        "wrongOrder": [
          {
            "pattern": ["S3", "CloudFront", "Route 53"],
            "message": "The flow should be: Route 53 → CloudFront → S3. Users access via DNS (Route 53), which routes to CloudFront, which fetches from S3.",
            "severity": "error",
            "correctOrder": ["Route 53", "CloudFront", "S3"]
          }
        ],
        
        // Service-specific errors
        "serviceErrors": {
          "S3": [
            {
              "condition": "publicAccess",
              "message": "S3 bucket should be private. Public buckets are a security risk and don't meet the requirement.",
              "severity": "error"
            },
            {
              "condition": "missingCloudFrontOrigin",
              "message": "S3 needs CloudFront as its origin. Configure CloudFront to use this S3 bucket.",
              "severity": "error"
            }
          ],
          "CloudFront": [
            {
              "condition": "missingS3Origin",
              "message": "CloudFront needs an S3 origin. Configure CloudFront to point to your S3 bucket.",
              "severity": "error"
            },
            {
              "condition": "missingHTTPS",
              "message": "CloudFront should use HTTPS. Attach an ACM certificate to enable HTTPS.",
              "severity": "error"
            }
          ]
        }
      }
    }
  ]
}
```

## Alternative: Flatter Structure (Easier to Maintain)

```json
{
  "puzzles": [
    {
      "id": "puzzle-static-site-cdn",
      "title": "Static Website with CDN",
      "scenario": "...",
      "requirements": [...],
      "allowedServices": [...],
      
      // NEW: Error definitions (flatter structure)
      "errors": {
        // Services that shouldn't be used
        "forbiddenServices": {
          "EC2": "EC2 is not needed for a static website. Use S3 for static content storage.",
          "RDS": "RDS is a database service and not needed for a static website.",
          "Lambda": "Lambda is not required for a simple static site without server-side processing."
        },
        
        // Required services (missing = error)
        "requiredServices": {
          "S3": {
            "message": "S3 is required to host static content.",
            "error": "Missing required service: S3"
          },
          "CloudFront": {
            "message": "CloudFront is required to serve content via CDN.",
            "error": "Missing required service: CloudFront"
          }
        },
        
        // Required connections (missing = error)
        "requiredConnections": [
          {
            "from": "CloudFront",
            "to": "S3",
            "message": "CloudFront must connect to S3 as its origin.",
            "error": "Missing required connection: CloudFront → S3"
          }
        ],
        
        // Wrong connections (incorrect direction or pattern)
        "wrongConnections": [
          {
            "from": "S3",
            "to": "CloudFront",
            "message": "Connection direction is wrong. CloudFront should connect to S3 (CloudFront pulls from S3), not S3 to CloudFront.",
            "correct": ["CloudFront", "S3"]
          },
          {
            "from": "Route 53",
            "to": "S3",
            "message": "Don't point Route 53 directly to S3. Route 53 should point to CloudFront, which connects to S3.",
            "correct": ["Route 53", "CloudFront", "S3"]
          }
        ],
        
        // Service configuration errors
        "serviceConfigErrors": {
          "S3": {
            "publicBucket": "S3 bucket should be private. Use CloudFront with Origin Access Control (OAC) for access.",
            "missingOriginAccess": "S3 needs CloudFront origin access configured to prevent direct public access."
          },
          "CloudFront": {
            "missingS3Origin": "CloudFront must have an S3 origin configured.",
            "missingHTTPS": "CloudFront should use HTTPS. Attach an ACM certificate."
          }
        },
        
        // Flow/order validation
        "flowErrors": [
          {
            "description": "User access flow should be: Route 53 → CloudFront → S3",
            "validate": {
              "hasRoute53": true,
              "hasCloudFront": true,
              "hasS3": true,
              "connections": [
                {"from": "Route 53", "to": "CloudFront"},
                {"from": "CloudFront", "to": "S3"}
              ]
            },
            "message": "The correct flow is: Users → Route 53 (DNS) → CloudFront (CDN) → S3 (Storage)"
          }
        ]
      }
    }
  ]
}
```

## Implementation Approach

### Option 1: Validation Functions
Create validation functions that check:
1. **Service validation**: Check if services are in `allowedServices` and not in `forbiddenServices`
2. **Connection validation**: Check if connections match required patterns
3. **Flow validation**: Verify service order in the architecture flow
4. **Configuration validation**: Check service-specific configurations (harder to detect, may need user input)

### Option 2: Rule Engine
Create a rule engine that:
1. Loads error rules from puzzle definition
2. Validates architecture against rules
3. Returns structured errors with messages
4. Can be extended with AI for more complex patterns

### Recommended Structure (Simplified)

```json
{
  "errors": {
    // Simple list of error patterns with messages
    "patterns": [
      {
        "id": "wrong-service-ec2",
        "type": "wrongService",
        "service": "EC2",
        "message": "EC2 is not needed for a static website. Use S3 for static content storage.",
        "severity": "error"
      },
      {
        "id": "missing-cloudfront-s3-connection",
        "type": "missingConnection",
        "from": "CloudFront",
        "to": "S3",
        "message": "CloudFront must connect to S3 as its origin. Without this, CloudFront has no content to serve.",
        "severity": "error"
      },
      {
        "id": "wrong-connection-direction",
        "type": "wrongConnection",
        "from": "S3",
        "to": "CloudFront",
        "message": "Connection direction is wrong. CloudFront should connect to S3 (CloudFront pulls from S3 origin).",
        "correctFlow": ["CloudFront", "S3"],
        "severity": "error"
      },
      {
        "id": "route53-direct-to-s3",
        "type": "wrongConnection",
        "from": "Route 53",
        "to": "S3",
        "message": "Don't point Route 53 directly to S3. Route 53 should point to CloudFront, which then connects to S3.",
        "correctFlow": ["Route 53", "CloudFront", "S3"],
        "severity": "error"
      }
    ],
    
    // Required services
    "requiredServices": ["S3", "CloudFront"],
    
    // Forbidden services
    "forbiddenServices": ["EC2", "RDS", "Lambda", "ECS", "Fargate"]
  }
}
```

## Benefits

1. **Centralized**: All error messages in one place (puzzle definition)
2. **Maintainable**: Easy to add/update error messages
3. **Specific**: Each error has a clear message explaining what's wrong
4. **Actionable**: Errors can include suggestions for fixes
5. **Extensible**: Can add new error types as needed

## Next Steps

1. Choose a structure (recommend simplified "patterns" approach)
2. Update puzzle JSON files with error definitions
3. Update grading service to check error patterns
4. Display errors in UI with helpful messages
