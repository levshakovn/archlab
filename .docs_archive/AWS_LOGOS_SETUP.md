# AWS Service Logos Setup Guide

## Overview

ArchLab supports displaying AWS service logos on the canvas nodes. The system is designed to gracefully fall back to text-only display if logos are missing or fail to load.

## Folder Structure

Create the following folder in your project:

```
frontend/public/aws-logos/
```

**Important**: The `public` folder is served statically by Vite, so images placed here are accessible at `/aws-logos/filename.svg`.

## Image Format

- **Format**: SVG (recommended) or PNG
- **Size**: Recommended 64x64px or 128x128px for SVG (scales automatically)
- **Color**: Full color logos work best
- **Background**: Transparent background preferred

## Naming Convention

Service names are automatically converted to filenames using these rules:

1. Convert to lowercase
2. Replace spaces with hyphens
3. Replace `@` with hyphen
4. Replace `&` with `and`
5. Remove other special characters
6. Add `.svg` extension

### Examples

| Service Name (from puzzle) | Filename |
|---------------------------|----------|
| `S3` | `s3.svg` |
| `API Gateway` | `api-gateway.svg` |
| `Lambda@Edge` | `lambda-edge.svg` |
| `Route 53` | `route-53.svg` |
| `CloudFront` | `cloudfront.svg` |
| `EC2` | `ec2.svg` |
| `RDS` | `rds.svg` |
| `DynamoDB` | `dynamodb.svg` |
| `S3 Access Point` | `s3-access-point.svg` |
| `CloudWatch Logs` | `cloudwatch-logs.svg` |
| `VPC Endpoint` | `vpc-endpoint.svg` |
| `NAT Gateway` | `nat-gateway.svg` |
| `Internet Gateway` | `internet-gateway.svg` |
| `Security Group` | `security-group.svg` |
| `Aurora Serverless` | `aurora-serverless.svg` |

## Where to Get AWS Logos

### Official Sources

1. **AWS Architecture Icons** (Recommended)
   - Download: https://aws.amazon.com/architecture/icons/
   - Format: SVG available
   - License: Free to use for AWS architecture diagrams

2. **AWS Simple Icons**
   - GitHub: https://github.com/aws-samples/aws-icons-for-plantuml
   - Format: SVG
   - License: Apache 2.0

3. **AWS Architecture Center**
   - https://aws.amazon.com/architecture/
   - Official AWS architecture icons

### Download Instructions

1. Download the AWS Architecture Icons package
2. Extract the ZIP file
3. Navigate to the `SVG` or `PNG` folder
4. Copy the service icons you need to `frontend/public/aws-logos/`
5. Rename them according to the naming convention above

## Quick Setup Script

You can use this script to help rename files (run from `frontend/public/aws-logos/`):

```bash
#!/bin/bash
# Rename AWS icons to match our naming convention

# Example: Rename "Amazon-S3.svg" to "s3.svg"
# Adjust based on your downloaded icon naming

for file in *.svg; do
  # Remove "Amazon-" prefix if present
  newname=$(echo "$file" | sed 's/Amazon-//' | sed 's/^AWS-//')
  
  # Convert to lowercase
  newname=$(echo "$newname" | tr '[:upper:]' '[:lower:]')
  
  # Replace spaces and special chars
  newname=$(echo "$newname" | sed 's/ /-/g' | sed 's/@/-/g' | sed 's/&/and/g')
  
  # Remove .svg extension temporarily
  basename="${newname%.svg}"
  
  # Add back .svg
  newname="${basename}.svg"
  
  if [ "$file" != "$newname" ]; then
    mv "$file" "$newname"
    echo "Renamed: $file -> $newname"
  fi
done
```

## Testing

After adding logos:

1. Start the dev server: `npm run dev`
2. Add a service to the canvas
3. Check if the logo appears
4. If logo is missing, check:
   - File exists in `public/aws-logos/`
   - Filename matches the naming convention
   - File is a valid SVG/PNG
   - Browser console for 404 errors

## Fallback Behavior

The system automatically falls back to text-only display if:
- Logo file doesn't exist
- Logo fails to load (network error, invalid file, etc.)
- Logo takes too long to load

**No action needed** - the text will always be visible as a fallback.

## Common Service Names Reference

Here are all the service names used in the current puzzles:

### From puzzle-static-site-cdn:
- `S3`
- `S3 Access Point`
- `CloudFront`
- `CloudFront Function`
- `Lambda@Edge`
- `Route 53`
- `ACM`
- `WAF`
- `Shield`
- `VPC Endpoint`
- `CloudWatch Logs`

### From puzzle-3tier-basic:
- `VPC`
- `Subnet`
- `Internet Gateway`
- `NAT Gateway`
- `Route 53`
- `ALB`
- `NLB`
- `EC2`
- `ASG`
- `RDS`
- `Aurora`
- `ElastiCache`
- `EFS`
- `Security Group`
- `NACL`
- `CloudWatch`
- `CloudWatch Logs`
- `AWS Backup`
- `Systems Manager`
- `Transit Gateway`
- `WAF`

### From puzzle-serverless-api:
- `API Gateway`
- `Lambda`
- `DynamoDB`
- `Aurora Serverless`
- `Cognito`
- `S3`
- `KMS`
- `IAM`
- `CloudWatch`
- `CloudWatch Logs`
- `SQS`
- `SNS`
- `Step Functions`
- `AppSync`
- `EventBridge`
- `WAF`
- `CloudFront`
- `Route 53`
- `EC2`

### From puzzle-async-processing:
- `S3`
- `S3 Event Notification`
- `SQS`
- `SNS`
- `Lambda`
- `EC2`
- `ASG`
- `ECS`
- `Fargate`
- `Batch`
- `Step Functions`
- `EventBridge`
- `ECR`
- `CloudWatch`
- `CloudWatch Logs`
- `DLQ`

### From puzzle-data-lake-analytics:
- `S3`
- `Athena`
- `Glue`
- `Lake Formation`
- `Kinesis Data Firehose`
- `Kinesis Data Streams`
- `EventBridge`
- `CloudWatch Logs`
- `CloudWatch Logs Subscription Filter`
- `Lambda`
- `OpenSearch`
- `Redshift Serverless`
- `MSK`

## Custom Mappings

If a service name doesn't map correctly, you can add a custom mapping in:

`frontend/src/utils/serviceLogo.ts`

In the `SERVICE_NAME_MAPPINGS` object:

```typescript
const SERVICE_NAME_MAPPINGS: Record<string, string> = {
  "Custom Service Name": "actual-service-name",
}
```

## Troubleshooting

### Logo not showing
1. Check browser console for 404 errors
2. Verify file exists: `ls frontend/public/aws-logos/service-name.svg`
3. Check filename matches exactly (case-sensitive in some systems)
4. Verify file is valid SVG/PNG

### Logo shows but text doesn't
- This shouldn't happen - text is always visible
- Check CSS if text is hidden

### Wrong logo showing
- Check filename matches service name conversion
- Verify no duplicate filenames
- Check custom mappings in `serviceLogo.ts`

## File Size Optimization

For production:
- Use SVG format (smaller, scalable)
- Optimize SVGs with tools like SVGO
- Consider using a CDN for logos in production

## Next Steps

1. Create the `frontend/public/aws-logos/` folder
2. Download AWS Architecture Icons
3. Copy and rename logos according to the naming convention
4. Test by adding services to the canvas
5. Verify fallback works by temporarily renaming a logo file
