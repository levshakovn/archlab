# GitHub Actions Workflows

This directory contains CI/CD workflows for ArchLab.

## 🎯 Recommended Deployment

**Use `deploy-cloudflare-railway.yml`** - This is the cheapest ($5/month) and simplest option.

See [DEPLOYMENT_SETUP.md](../DEPLOYMENT_SETUP.md) for deployment instructions.

## Available Workflows

### 1. `ci.yml` - Continuous Integration ⭐
- Runs on every push and pull request
- Tests backend (Python/FastAPI)
- Tests frontend (TypeScript/React)
- Runs integration tests
- **Status**: ✅ Active

### 2. `deploy-cloudflare-railway.yml` - Deploy to Cloudflare + Railway ⭐ **RECOMMENDED**
- **Cost**: $5/month (cheapest option)
- **Complexity**: Very Easy
- Deploys backend to Railway ($5/month)
- Deploys frontend to Cloudflare Pages (FREE)
- Runs on push to `main` branch
- **Status**: ⚙️ Ready (requires secrets setup)

### 3. `deploy-railway-fullstack.yml` - Deploy to Railway (Full Stack) ⚠️ Alternative
- **Cost**: $10/month (more expensive)
- **Complexity**: Very Easy
- Deploys both backend and frontend to Railway
- Runs on push to `main` branch
- **Status**: ⚙️ Ready (requires secrets setup)
- **Note**: Only use if you prefer single-platform management

## Required Secrets

To use the deployment workflows, add these secrets to your GitHub repository:

### For Railway Deployment
- `RAILWAY_TOKEN` - Get from Railway → Account → Tokens

### For Cloudflare Pages Deployment
- `CLOUDFLARE_API_TOKEN` - Get from Cloudflare → My Profile → API Tokens
- `CLOUDFLARE_ACCOUNT_ID` - Found in Cloudflare dashboard URL

### Environment Variables (for build)
- `VITE_API_URL` - Your backend URL
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

## How to Add Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with its value

## Manual Deployment

If you prefer manual deployment, see:
- [DEPLOYMENT_SETUP.md](../DEPLOYMENT_SETUP.md) - Quick setup guide for Railway/Cloudflare
