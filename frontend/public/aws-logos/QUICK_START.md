# Quick Start: Setting Up AWS Logos

## Method 1: Automated Script (Easiest)

### Step 1: Download AWS Icons
1. Go to: https://aws.amazon.com/architecture/icons/
2. Click "Download" to get the latest Architecture Icons package
3. Extract the ZIP file to a location you remember

### Step 2: Run Setup Script

**Option A: Python Script (Recommended)**
```bash
cd frontend/public/aws-logos
python3 setup_logos.py /path/to/extracted/aws-icons
```

**Option B: Bash Script**
```bash
cd frontend/public/aws-logos
./download-logos.sh
# Follow the prompts
```

### Step 3: Verify
1. Check that SVG files are in `frontend/public/aws-logos/`
2. Start your dev server: `npm run dev`
3. Add services to canvas - logos should appear!

## Method 2: Manual Setup

1. Download from: https://aws.amazon.com/architecture/icons/
2. Extract the ZIP file
3. Navigate to the `SVG` folder
4. Copy these key files and rename them:

| Copy This | Rename To |
|-----------|-----------|
| `Amazon-S3.svg` | `s3.svg` |
| `Amazon-CloudFront.svg` | `cloudfront.svg` |
| `Amazon-API-Gateway.svg` | `api-gateway.svg` |
| `AWS-Lambda.svg` | `lambda.svg` |
| `Amazon-DynamoDB.svg` | `dynamodb.svg` |
| `Amazon-EC2.svg` | `ec2.svg` |
| `Amazon-RDS.svg` | `rds.svg` |
| `Amazon-VPC.svg` | `vpc.svg` |
| `AWS-CloudWatch.svg` | `cloudwatch.svg` |
| `Amazon-Simple-Queue-Service-SQS.svg` | `sqs.svg` |
| `Amazon-Simple-Notification-Service.svg` | `sns.svg` |
| `Amazon-Athena.svg` | `athena.svg` |
| `AWS-Glue.svg` | `glue.svg` |
| `Amazon-Cognito.svg` | `cognito.svg` |
| `AWS-Key-Management-Service.svg` | `kms.svg` |
| `AWS-Identity-and-Access-Management-IAM.svg` | `iam.svg` |
| `AWS-WAF.svg` | `waf.svg` |
| `AWS-Certificate-Manager.svg` | `acm.svg` |
| `Amazon-Route-53.svg` | `route-53.svg` |

5. Place all renamed files in `frontend/public/aws-logos/`

## What If I Don't Add Logos?

**No problem!** The app will automatically show service names as text. Logos are optional - the system gracefully falls back to text-only display.

## Need More Services?

See `SERVICE_MAPPINGS.md` for the complete list of all service name mappings.

## Troubleshooting

**Script can't find SVG files?**
- Make sure you extracted the ZIP file
- Look for a folder named `SVG` or `svg` in the extracted package
- The script will search common locations automatically

**Logos not showing?**
- Check browser console for 404 errors
- Verify filenames match exactly (case-sensitive)
- Ensure files are valid SVG format

**Wrong logo showing?**
- Check the service name mapping in `SERVICE_MAPPINGS.md`
- Verify the filename matches the naming convention
