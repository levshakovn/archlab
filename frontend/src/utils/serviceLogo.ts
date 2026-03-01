/**
 * Utility functions for AWS service logos
 * 
 * Logo images should be placed in: public/aws-logos/
 * Format: SVG files
 * Naming: Convert service name to kebab-case
 * 
 * Examples:
 * - "API Gateway" -> "api-gateway.svg"
 * - "S3" -> "s3.svg"
 * - "Lambda@Edge" -> "lambda-edge.svg"
 * - "Route 53" -> "route-53.svg"
 */

/**
 * Converts a service name to a logo filename
 * 
 * Rules:
 * - Convert to lowercase
 * - Replace spaces with hyphens
 * - Replace special characters (@, &, etc.) appropriately
 * - Remove special characters that can't be in filenames
 * 
 * @param serviceName - The AWS service name (e.g., "API Gateway", "S3")
 * @returns The expected filename (e.g., "api-gateway.svg")
 */
export function serviceNameToLogoPath(serviceName: string): string {
  return serviceName
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/@/g, '-')             // Replace @ with hyphen (Lambda@Edge -> lambda-edge)
    .replace(/&/g, 'and')           // Replace & with 'and'
    .replace(/[^a-z0-9-]/g, '')     // Remove any other special characters
    .replace(/-+/g, '-')            // Replace multiple hyphens with single
    .replace(/^-|-$/g, '')          // Remove leading/trailing hyphens
    + '.svg'
}

/**
 * Gets the full path to a service logo
 * 
 * @param serviceName - The AWS service name
 * @returns The full path to the logo image
 */
export function getServiceLogoPath(serviceName: string): string {
  const filename = serviceNameToLogoPath(serviceName)
  return `/aws-logos/${filename}`
}

/**
 * Service name mappings for special cases
 * Maps service names to alternative logo filenames or parent service logos
 */
const SERVICE_NAME_MAPPINGS: Record<string, string> = {
  // Services that can use parent service logos
  'Aurora Serverless': 'Aurora', // Uses aurora.svg
  'CloudFront Function': 'CloudFront', // Uses cloudfront.svg
  'CloudWatch Logs': 'CloudWatch', // Uses cloudwatch.svg
  'CloudWatch Logs Subscription Filter': 'CloudWatch', // Uses cloudwatch.svg
  'Lambda@Edge': 'Lambda', // Uses lambda.svg
  'S3 Access Point': 'S3', // Uses s3.svg
  'S3 Event Notification': 'S3', // Uses s3.svg
  'VPC Endpoint': 'VPC', // Uses vpc.svg
  'Redshift Serverless': 'Redshift', // Uses redshift.svg
  'Kinesis Data Firehose': 'Kinesis', // Uses kinesis.svg
  'Kinesis Data Streams': 'Kinesis Data Streams', // Uses kinesis-data-streams.svg (exists)
  
  // Abbreviations to full names
  'DLQ': 'SQS', // Dead Letter Queue uses SQS logo
  'NACL': 'VPC', // Network ACL uses VPC logo
  'ASG': 'EC2', // Auto Scaling Group uses EC2 logo
  'ALB': 'alb', // Application Load Balancer (uses alb.svg)
  'NLB': 'nlb', // Network Load Balancer (uses nlb.svg)
  
  // Infrastructure components that can use VPC or generic networking
  'Internet Gateway': 'VPC',
  'NAT Gateway': 'VPC',
  'Subnet': 'VPC',
  'Security Group': 'VPC',
  'Transit Gateway': 'VPC',
  
  // Container services
  'ECR': 'ECS', // Elastic Container Registry uses ECS logo
  'Fargate': 'ECS', // Fargate uses ECS logo
}

/**
 * Normalizes a service name before looking up the logo
 * 
 * @param serviceName - The service name from the puzzle
 * @returns The normalized service name for logo lookup
 */
export function normalizeServiceName(serviceName: string): string {
  // Check if there's a mapping
  if (SERVICE_NAME_MAPPINGS[serviceName]) {
    return SERVICE_NAME_MAPPINGS[serviceName]
  }
  return serviceName
}
