# AWS Logos Directory

This directory contains AWS service logos used in ArchLab.

## Quick Setup

### Option 1: Automated Script (Recommended)

1. Download AWS Architecture Icons from: https://aws.amazon.com/architecture/icons/
2. Extract the ZIP file
3. Run the setup script:
   ```bash
   cd frontend/public/aws-logos
   ./download-logos.sh
   ```
4. Follow the prompts to point to the extracted icons folder

### Option 2: Manual Setup

1. Download AWS Architecture Icons from: https://aws.amazon.com/architecture/icons/
2. Extract the ZIP file
3. Navigate to the `SVG` folder in the extracted package
4. Copy relevant SVG files to this directory
5. Rename them according to the naming convention (see below)

## Naming Convention

Service names are converted to filenames automatically. Examples:

- `S3` → `s3.svg`
- `API Gateway` → `api-gateway.svg`
- `Lambda@Edge` → `lambda-edge.svg`
- `Route 53` → `route-53.svg`
- `CloudFront` → `cloudfront.svg`

## Required Logos

Based on current puzzles, you'll need logos for these services:

### Core Services (High Priority)
- `s3.svg`
- `cloudfront.svg`
- `api-gateway.svg`
- `lambda.svg`
- `dynamodb.svg`
- `ec2.svg`
- `rds.svg`
- `vpc.svg`
- `route-53.svg`

### Additional Services
- `alb.svg` (Application Load Balancer)
- `nlb.svg` (Network Load Balancer)
- `asg.svg` (Auto Scaling Group)
- `aurora.svg`
- `elasticache.svg`
- `efs.svg`
- `ecs.svg`
- `fargate.svg`
- `sqs.svg`
- `sns.svg`
- `cloudwatch.svg`
- `cloudwatch-logs.svg`
- `athena.svg`
- `glue.svg`
- `cognito.svg`
- `kms.svg`
- `iam.svg`
- `waf.svg`
- `acm.svg` (Certificate Manager)
- And more...

## File Format

- **Format**: SVG (preferred) or PNG
- **Size**: 64x64px or 128x128px recommended
- **Background**: Transparent

## Fallback Behavior

If a logo is missing, the application will automatically display the service name as text. No errors will occur.

## Testing

After adding logos:

1. Start the dev server: `npm run dev`
2. Add services to the canvas
3. Verify logos appear (or text fallback works)

## Troubleshooting

### Logo not showing?
- Check filename matches exactly (case-sensitive)
- Verify file is valid SVG
- Check browser console for 404 errors

### Wrong logo?
- Check the service name mapping in `frontend/src/utils/serviceLogo.ts`
- Verify filename matches the naming convention
