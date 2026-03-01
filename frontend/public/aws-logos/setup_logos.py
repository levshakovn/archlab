#!/usr/bin/env python3
"""
AWS Logos Setup Script
Helps download and organize AWS service logos for ArchLab
"""

import os
import shutil
import sys
import re
from pathlib import Path

# Service name mappings (AWS icon names -> our normalized names)
# These map the AWS icon file patterns to our service names
SERVICE_MAPPINGS = {
    "Amazon-S3": "s3",
    "Amazon-CloudFront": "cloudfront",
    "Amazon-API-Gateway": "api-gateway",
    "AWS-Lambda": "lambda",
    "Amazon-DynamoDB": "dynamodb",
    "Amazon-Route-53": "route-53",
    "Amazon-EC2": "ec2",
    "Amazon-RDS": "rds",
    "Amazon-VPC": "vpc",
    "AWS-Elastic-Beanstalk": "elastic-beanstalk",
    "Amazon-ElastiCache": "elasticache",
    "Amazon-EFS": "efs",
    "Amazon-ECS": "ecs",
    "Amazon-ECR": "ecr",
    "AWS-Fargate": "fargate",
    "AWS-CloudWatch": "cloudwatch",
    "Amazon-Simple-Queue-Service-SQS": "sqs",
    "Amazon-Simple-Queue-Service": "sqs",
    "Amazon-Simple-Notification-Service": "sns",
    "AWS-Step-Functions": "step-functions",
    "Amazon-EventBridge": "eventbridge",
    "Amazon-Kinesis-Data-Firehose": "kinesis-data-firehose",
    "Amazon-Kinesis-Data-Streams": "kinesis-data-streams",
    "Amazon-Athena": "athena",
    "AWS-Glue": "glue",
    "AWS-Lake-Formation": "lake-formation",
    "Amazon-OpenSearch-Service": "opensearch",
    "Amazon-Redshift": "redshift",
    "Amazon-Managed-Streaming-for-Apache-Kafka": "msk",
    "Amazon-Cognito": "cognito",
    "AWS-Key-Management-Service": "kms",
    "AWS-Identity-and-Access-Management-IAM": "iam",
    "AWS-WAF": "waf",
    "AWS-Shield": "shield",
    "AWS-Certificate-Manager": "acm",
    "AWS-Systems-Manager": "systems-manager",
    "AWS-Backup": "aws-backup",
    "AWS-Transit-Gateway": "transit-gateway",
    "Amazon-AppSync": "appsync",
    "AWS-Batch": "batch",
    "Amazon-Aurora": "aurora",
    "Application-Load-Balancer": "alb",
    "Network-Load-Balancer": "nlb",
    "Amazon-EC2-Auto-Scaling": "asg",
}


def normalize_name(service_name: str) -> str:
    """Convert service name to normalized filename"""
    name = service_name.lower()
    name = name.replace(" ", "-")
    name = name.replace("@", "-")
    name = name.replace("&", "and")
    # Remove special characters except hyphens
    name = "".join(c if c.isalnum() or c == "-" else "" for c in name)
    # Remove multiple consecutive hyphens
    while "--" in name:
        name = name.replace("--", "-")
    # Remove leading/trailing hyphens
    name = name.strip("-")
    return name


def extract_service_name_from_filename(filename: str) -> str:
    """Extract service name from AWS icon filename like 'Arch_AWS-Lambda_48.svg'"""
    # Remove 'Arch_' prefix
    name = filename.replace("Arch_", "")
    # Remove size suffix like '_48', '_64', etc.
    name = re.sub(r"_\d+$", "", name)
    # Remove file extension
    name = name.replace(".svg", "").replace(".png", "")
    return name


def find_architecture_icons_dir(source_path: str) -> Path:
    """Find the Architecture-Service-Icons directory"""
    source = Path(source_path)

    # Check if it's the Architecture-Service-Icons directory itself
    if "Architecture-Service-Icons" in source.name:
        return source

    # Look for Architecture-Service-Icons subdirectory
    possible_dirs = [
        source / "Architecture-Service-Icons_07312025",
        source / "Architecture-Service-Icons",
    ]

    # Also search for any folder matching the pattern
    if source.exists() and source.is_dir():
        for item in source.iterdir():
            if item.is_dir() and "Architecture-Service-Icons" in item.name:
                return item

    return None


def find_svg_files(icons_dir: Path, preferred_size: int = 48):
    """Find all SVG files, preferring the specified size"""
    svg_files = {}

    # Search recursively for SVG files
    for svg_file in icons_dir.rglob("*.svg"):
        # Check if it's in a size folder (16, 32, 48, 64)
        parent_name = svg_file.parent.name
        if parent_name.isdigit():
            size = int(parent_name)
            filename = svg_file.stem  # filename without extension

            # Extract service name
            service_name = extract_service_name_from_filename(filename)

            # Store the file, preferring larger sizes or the preferred size
            if service_name not in svg_files:
                svg_files[service_name] = (svg_file, size)
            else:
                existing_file, existing_size = svg_files[service_name]
                # Prefer the preferred size, or larger if preferred not available
                if size == preferred_size or (
                    existing_size != preferred_size and size > existing_size
                ):
                    svg_files[service_name] = (svg_file, size)

    return svg_files


def map_service_name(aws_service_name: str) -> str:
    """Map AWS service name to our normalized name"""
    # Try exact match first
    for aws_name, normalized in SERVICE_MAPPINGS.items():
        if aws_service_name == aws_name or aws_service_name.startswith(aws_name):
            return normalized

    # Try partial match
    for aws_name, normalized in SERVICE_MAPPINGS.items():
        if aws_name in aws_service_name:
            return normalized

    # If no mapping found, normalize the name
    clean_name = aws_service_name.replace("Amazon-", "").replace("AWS-", "")
    return normalize_name(clean_name)


def setup_logos(source_path: str, target_dir: str):
    """Copy and rename logos from source to target directory"""
    target = Path(target_dir)
    target.mkdir(parents=True, exist_ok=True)

    icons_dir = find_architecture_icons_dir(source_path)
    if not icons_dir or not icons_dir.exists():
        print(
            f"❌ Error: Could not find Architecture-Service-Icons directory in {source_path}"
        )
        print(
            f"   Looking for folder containing 'Architecture-Service-Icons' in the name"
        )
        return False

    print(f"✅ Found Architecture-Service-Icons directory: {icons_dir}")
    print(f"📦 Copying logos to: {target_dir}\n")

    # Find all SVG files
    svg_files = find_svg_files(icons_dir, preferred_size=48)

    if not svg_files:
        print(f"❌ Error: No SVG files found in {icons_dir}")
        return False

    print(f"📋 Found {len(svg_files)} unique services\n")

    copied = 0
    skipped = 0

    for aws_service_name, (svg_file, size) in svg_files.items():
        # Map to our service name
        target_name = map_service_name(aws_service_name)
        target_file = target / f"{target_name}.svg"

        if not target_file.exists():
            shutil.copy2(svg_file, target_file)
            print(f"✅ {aws_service_name} ({size}px) → {target_name}.svg")
            copied += 1
        else:
            print(f"⏭️  {target_name}.svg (already exists)")
            skipped += 1

    print(f"\n✨ Done! Copied {copied} logos, skipped {skipped} existing files.")
    print(f"📁 Logos are in: {target_dir}")
    return True


def main():
    print("🏗️  AWS Logos Setup Script")
    print("=" * 50)
    print()

    script_dir = Path(__file__).parent
    target_dir = str(script_dir)

    if len(sys.argv) > 1:
        source_path = sys.argv[1]
    else:
        # Default to ~/Downloads/aws-icons if it exists
        default_path = os.path.expanduser("~/Downloads/aws-icons")
        if os.path.exists(default_path):
            print(f"📥 Using default path: {default_path}")
            source_path = default_path
        else:
            print(
                "📥 Please provide the path to the extracted AWS Architecture Icons folder"
            )
            print()
            print("Download from: https://aws.amazon.com/architecture/icons/")
            print()
            source_path = input(
                "Enter path to extracted icons folder (or press Enter to exit): "
            ).strip()

            if not source_path:
                print(
                    "\n⏭️  Exiting. Run again with: python setup_logos.py <path-to-icons>"
                )
                return

    if not os.path.exists(source_path):
        print(f"❌ Error: Path does not exist: {source_path}")
        return

    setup_logos(source_path, target_dir)


if __name__ == "__main__":
    main()
