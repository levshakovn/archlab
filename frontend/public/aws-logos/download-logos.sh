#!/bin/bash

# AWS Logos Download and Setup Script
# This script helps download and organize AWS service logos

set -e

LOGOS_DIR="$(cd "$(dirname "$0")" && pwd)"
TEMP_DIR="/tmp/aws-icons-$$"

echo "🏗️  AWS Logos Setup Script"
echo "=========================="
echo ""

# Create temp directory
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

echo "📥 Step 1: Downloading AWS Architecture Icons..."
echo ""
echo "Please download the AWS Architecture Icons from:"
echo "https://aws.amazon.com/architecture/icons/"
echo ""
echo "After downloading, extract the ZIP file and note the path."
echo ""
read -p "Enter the path to the extracted AWS icons folder (or press Enter to skip download): " ICONS_PATH

if [ -z "$ICONS_PATH" ]; then
    echo "⏭️  Skipping download. You can manually copy icons later."
    echo ""
    echo "To manually set up icons:"
    echo "1. Download from: https://aws.amazon.com/architecture/icons/"
    echo "2. Extract the ZIP file"
    echo "3. Copy SVG files from the extracted folder to: $LOGOS_DIR"
    echo "4. Rename them according to the naming convention"
    exit 0
fi

if [ ! -d "$ICONS_PATH" ]; then
    echo "❌ Error: Directory not found: $ICONS_PATH"
    exit 1
fi

echo ""
echo "📋 Step 2: Finding SVG files..."
SVG_DIR=""
if [ -d "$ICONS_PATH/SVG" ]; then
    SVG_DIR="$ICONS_PATH/SVG"
elif [ -d "$ICONS_PATH/svg" ]; then
    SVG_DIR="$ICONS_PATH/svg"
elif [ -d "$ICONS_PATH" ]; then
    # Check if directory contains SVG files
    SVG_COUNT=$(find "$ICONS_PATH" -name "*.svg" -type f | wc -l)
    if [ "$SVG_COUNT" -gt 0 ]; then
        SVG_DIR="$ICONS_PATH"
    fi
fi

if [ -z "$SVG_DIR" ]; then
    echo "❌ Error: Could not find SVG files in $ICONS_PATH"
    echo "Please check the path and try again."
    exit 1
fi

echo "✅ Found SVG directory: $SVG_DIR"
echo ""

echo "📦 Step 3: Copying and renaming logos..."
echo ""

# Function to normalize service name to filename
normalize_name() {
    echo "$1" | \
    tr '[:upper:]' '[:lower:]' | \
    sed 's/ /-/g' | \
    sed 's/@/-/g' | \
    sed 's/&/and/g' | \
    sed 's/[^a-z0-9-]//g' | \
    sed 's/-\+/-/g' | \
    sed 's/^-\|-$//g'
}

# Copy count
COPIED=0
SKIPPED=0

# Service name mappings (AWS icon names -> our service names)
declare -A SERVICE_MAP=(
    ["Amazon-S3"]="s3"
    ["Amazon-CloudFront"]="cloudfront"
    ["Amazon-API-Gateway"]="api-gateway"
    ["AWS-Lambda"]="lambda"
    ["Amazon-DynamoDB"]="dynamodb"
    ["Amazon-Route-53"]="route-53"
    ["Amazon-EC2"]="ec2"
    ["Amazon-RDS"]="rds"
    ["Amazon-VPC"]="vpc"
    ["AWS-Elastic-Beanstalk"]="elastic-beanstalk"
    ["Amazon-ElastiCache"]="elasticache"
    ["Amazon-EFS"]="efs"
    ["Amazon-ECS"]="ecs"
    ["Amazon-ECR"]="ecr"
    ["AWS-Fargate"]="fargate"
    ["Amazon-Elastic-Container-Service"]="ecs"
    ["Amazon-Elastic-Container-Registry"]="ecr"
    ["AWS-CloudWatch"]="cloudwatch"
    ["Amazon-Simple-Queue-Service-SQS"]="sqs"
    ["Amazon-Simple-Notification-Service"]="sns"
    ["AWS-Step-Functions"]="step-functions"
    ["Amazon-EventBridge"]="eventbridge"
    ["Amazon-Kinesis"]="kinesis"
    ["Amazon-Kinesis-Data-Firehose"]="kinesis-data-firehose"
    ["Amazon-Kinesis-Data-Streams"]="kinesis-data-streams"
    ["Amazon-Athena"]="athena"
    ["AWS-Glue"]="glue"
    ["AWS-Lake-Formation"]="lake-formation"
    ["Amazon-OpenSearch-Service"]="opensearch"
    ["Amazon-Redshift"]="redshift"
    ["Amazon-Managed-Streaming-for-Apache-Kafka"]="msk"
    ["Amazon-Cognito"]="cognito"
    ["AWS-Key-Management-Service"]="kms"
    ["AWS-Identity-and-Access-Management-IAM"]="iam"
    ["AWS-WAF"]="waf"
    ["AWS-Shield"]="shield"
    ["AWS-Certificate-Manager"]="acm"
    ["AWS-Systems-Manager"]="systems-manager"
    ["AWS-Backup"]="aws-backup"
    ["AWS-Transit-Gateway"]="transit-gateway"
    ["Amazon-AppSync"]="appsync"
    ["AWS-Batch"]="batch"
)

# Find and copy SVG files
find "$SVG_DIR" -name "*.svg" -type f | while read -r svg_file; do
    filename=$(basename "$svg_file" .svg)
    
    # Try to match with our service map
    target_name=""
    for aws_name in "${!SERVICE_MAP[@]}"; do
        if [[ "$filename" == *"$aws_name"* ]] || [[ "$filename" == "$aws_name" ]]; then
            target_name="${SERVICE_MAP[$aws_name]}"
            break
        fi
    done
    
    # If no mapping found, try to normalize the filename
    if [ -z "$target_name" ]; then
        # Remove common prefixes
        clean_name=$(echo "$filename" | sed 's/^Amazon-//' | sed 's/^AWS-//')
        target_name=$(normalize_name "$clean_name")
    fi
    
    target_file="$LOGOS_DIR/${target_name}.svg"
    
    if [ ! -f "$target_file" ]; then
        cp "$svg_file" "$target_file"
        echo "✅ Copied: $filename -> ${target_name}.svg"
        ((COPIED++))
    else
        echo "⏭️  Skipped: ${target_name}.svg (already exists)"
        ((SKIPPED++))
    fi
done

echo ""
echo "✨ Done! Copied $COPIED logos, skipped $SKIPPED existing files."
echo ""
echo "📝 Note: Some services might need manual mapping."
echo "Check the files in: $LOGOS_DIR"
echo ""

# Cleanup
rm -rf "$TEMP_DIR"
