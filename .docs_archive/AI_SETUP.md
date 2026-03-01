# AI Discussion Feature Setup Guide

## Overview

The AI Discussion feature allows users to ask questions about their AWS architecture solutions and receive personalized feedback from AI. This guide explains how to set it up and configure it properly.

## Architecture

- **Backend**: FastAPI endpoint at `/api/v1/discuss`
- **AI Provider**: OpenAI (gpt-4o-mini model)
- **Rate Limiting**: 10 requests/hour per user, 50 requests/day per IP
- **Cost Controls**: Maximum 500 tokens per response

## Setup Instructions

### Step 1: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy the API key (you won't be able to see it again!)

### Step 2: Configure API Key

#### Option A: Environment Variable (Recommended for Production)

**Linux/macOS:**
```bash
export OPENAI_API_KEY="sk-your-api-key-here"
```

**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY="sk-your-api-key-here"
```

**Windows (Command Prompt):**
```cmd
set OPENAI_API_KEY=sk-your-api-key-here
```

#### Option B: .env File (Recommended for Development)

1. Create a `.env` file in the `backend` directory:
```bash
cd backend
touch .env
```

2. Add your API key to the `.env` file:
```env
OPENAI_API_KEY=sk-your-api-key-here
```

3. The `.env` file is already in `.gitignore`, so it won't be committed to git.

### Step 3: Install Dependencies

The OpenAI Python package is already in `requirements.txt`. Install it:

```bash
cd backend
pip install -r requirements.txt
```

Or if using a virtual environment:
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Step 4: Verify Setup

1. Start the backend server:
```bash
cd backend
uvicorn app.main:app --reload
```

2. Check the health endpoint:
```bash
curl http://localhost:8000/health
```

3. Check if AI service is available:
```bash
curl http://localhost:8000/api/v1/discuss
# Should return 503 if not configured, or 422 if configured but missing request body
```

## Cost Management

### Current Configuration

- **Model**: `gpt-4o-mini` (cost-effective)
- **Max Tokens**: 500 per response
- **Estimated Cost**: ~$0.0001-0.0003 per request

### Cost Estimation

Based on gpt-4o-mini pricing (as of 2024):
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens

**Example costs:**
- 100 requests/day ≈ $0.01-0.03/day
- 1,000 requests/day ≈ $0.10-0.30/day
- 10,000 requests/day ≈ $1.00-3.00/day

### Cost Controls Implemented

1. **Rate Limiting**:
   - 10 requests per user per hour
   - 50 requests per IP per day
   - Prevents abuse and excessive usage

2. **Token Limits**:
   - Maximum 500 tokens per response
   - Prevents long, expensive responses

3. **Model Selection**:
   - Uses `gpt-4o-mini` (cheapest GPT-4 model)
   - Still provides high-quality responses

4. **Input Validation**:
   - Question length: 10-500 characters
   - Prevents extremely long prompts

### Monitoring Costs

1. **OpenAI Dashboard**:
   - Monitor usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)
   - Set up billing alerts

2. **Application Logs**:
   - Token usage is logged for each request
   - Check logs for unusual patterns

3. **Rate Limit Headers**:
   - API returns `X-RateLimit-Remaining` headers
   - Monitor usage patterns

## Guardrails and Best Practices

### 1. Prompt Engineering

The system prompt is designed to:
- Keep responses focused on AWS architecture
- Provide educational, constructive feedback
- Reference Well-Architected Framework principles
- Stay within token limits (500 words max)

### 2. Content Filtering

- Questions are validated for inappropriate content
- Non-architectural topics are redirected
- Sensitive information requests are blocked

### 3. Rate Limiting

- **Per-user limit**: 10 requests/hour
- **Per-IP limit**: 50 requests/day
- Prevents abuse and controls costs

### 4. Error Handling

- Graceful degradation if AI service is unavailable
- Clear error messages for users
- Detailed logging for debugging

### 5. Security

- API key stored in environment variables (never in code)
- Input validation prevents injection attacks
- Rate limiting prevents DoS attacks

## Testing

### Test the AI Endpoint

```bash
curl -X POST http://localhost:8000/api/v1/discuss \
  -H "Content-Type: application/json" \
  -d '{
    "puzzle_id": "puzzle-static-site-cdn",
    "puzzle_title": "Static Site with CDN",
    "puzzle_scenario": "Build a static website with CDN",
    "question": "How can I improve my security score?",
    "solution_summary": "I used S3 and CloudFront",
    "score": 75,
    "requirements_met": ["S3 bucket", "CDN distribution"],
    "requirements_missed": ["HTTPS"],
    "feedback": "Good use of CDN but missing HTTPS"
  }'
```

## Troubleshooting

### AI Service Not Available

**Error**: "AI service is not available"

**Solutions**:
1. Check that `OPENAI_API_KEY` is set in environment
2. Verify the API key is valid
3. Check backend logs for errors
4. Ensure OpenAI package is installed

### Rate Limit Exceeded

**Error**: "Rate limit exceeded"

**Solutions**:
1. Wait for the rate limit window to reset
2. Check rate limit headers for remaining requests
3. Consider increasing limits for production (if needed)

### High Costs

**Symptoms**: Unexpected charges on OpenAI account

**Solutions**:
1. Review rate limiting settings
2. Check for abuse or unusual patterns
3. Consider reducing token limits
4. Set up billing alerts in OpenAI dashboard

## Production Considerations

### 1. Use Environment Variables

Never commit API keys to git. Always use environment variables or secret management services.

### 2. Set Up Monitoring

- Monitor API usage and costs
- Set up alerts for unusual patterns
- Track rate limit hits

### 3. Consider Caching

For common questions, consider caching responses to reduce costs.

### 4. User Authentication

In production, use user authentication to enforce per-user rate limits more accurately.

### 5. Alternative Providers

Consider supporting multiple AI providers (Anthropic Claude, etc.) for:
- Cost comparison
- Redundancy
- Provider-specific optimizations

## Security Best Practices

1. **Never commit API keys** to version control
2. **Rotate API keys** regularly
3. **Use environment variables** or secret management services
4. **Monitor usage** for unusual patterns
5. **Set up billing alerts** in OpenAI dashboard
6. **Limit API key permissions** if possible

## Support

For issues or questions:
1. Check the logs: `backend/app/services/ai_service.py`
2. Review OpenAI API documentation
3. Check rate limiting in `backend/app/middleware/rate_limit.py`
