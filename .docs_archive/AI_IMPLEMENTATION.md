# AI Discussion Feature - Implementation Guide

## Overview

The AI Discussion feature allows users to ask questions about their AWS architecture solutions and receive personalized, educational feedback. This document explains the implementation, prompt engineering, guardrails, and best practices.

## Architecture

### Components

1. **Backend Service** (`backend/app/services/ai_service.py`)
   - Handles OpenAI API communication
   - Manages prompts and context
   - Tracks token usage and costs

2. **API Endpoint** (`backend/app/api/v1/endpoints/ai.py`)
   - RESTful endpoint at `/api/v1/discuss`
   - Validates requests
   - Applies rate limiting

3. **Rate Limiting** (`backend/app/middleware/rate_limit.py`)
   - 10 requests per user per hour
   - 50 requests per IP per day
   - Prevents abuse and controls costs

4. **Frontend Component** (`frontend/src/components/AIDiscussionModal.tsx`)
   - Chat-like interface
   - Conversation history
   - Error handling

## Prompt Engineering

### System Prompt Design

The system prompt is carefully crafted to:

1. **Define Role**: Expert AWS Solutions Architect and educator
2. **Set Context**: Puzzle title and scenario
3. **Establish Guidelines**:
   - Focus on Well-Architected Framework
   - Provide constructive feedback
   - Reference specific AWS services
   - Keep responses concise (2-4 paragraphs)

4. **Set Boundaries**:
   - Maximum 500 words
   - Stay on AWS architecture topics
   - No code generation
   - No sensitive information

### User Prompt Structure

The user prompt includes:
- Puzzle context (title, scenario)
- User's score and requirements status
- Grading feedback
- Solution summary
- User's specific question

This provides rich context for the AI to give relevant, personalized feedback.

## Guardrails and Cost Controls

### 1. Rate Limiting

**Per-User Limits:**
- 10 requests per hour
- Prevents individual users from abusing the service

**Per-IP Limits:**
- 50 requests per day
- Prevents abuse from single IP addresses

**Implementation:**
- In-memory storage (use Redis in production)
- Automatic cleanup of old entries
- Clear error messages with retry-after headers

### 2. Token Limits

**Response Limits:**
- Maximum 500 tokens per response
- Prevents expensive long responses
- Ensures concise, focused answers

**Input Validation:**
- Question length: 10-500 characters
- Solution summary: Max 1000 characters
- Feedback: Max 2000 characters

### 3. Model Selection

**Model: `gpt-4o-mini`**
- Cost-effective (cheapest GPT-4 model)
- Still provides high-quality responses
- Good balance of cost and quality

**Pricing (as of 2024):**
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens
- Estimated cost per request: $0.0001-0.0003

### 4. Content Filtering

**Input Validation:**
- Rejects empty or too-short questions
- Filters inappropriate keywords
- Validates question format

**Output Constraints:**
- System prompt enforces topic boundaries
- Prevents off-topic discussions
- No code generation or sensitive data

### 5. Error Handling

**Graceful Degradation:**
- If AI service unavailable, returns 503 error
- Clear error messages for users
- Detailed logging for debugging

**Cost Monitoring:**
- Tracks token usage per request
- Estimates cost per request
- Logs usage for analysis

## Best Practices Implemented

### 1. Security

- ✅ API key stored in environment variables (never in code)
- ✅ Input validation prevents injection attacks
- ✅ Rate limiting prevents DoS attacks
- ✅ Content filtering prevents abuse

### 2. Cost Management

- ✅ Rate limiting controls usage
- ✅ Token limits prevent expensive requests
- ✅ Cost-effective model selection
- ✅ Usage tracking and logging

### 3. User Experience

- ✅ Clear error messages
- ✅ Conversation history for context
- ✅ Loading states and feedback
- ✅ Character limits with visual indicators

### 4. Code Quality

- ✅ Type safety with Pydantic schemas
- ✅ Proper error handling
- ✅ Comprehensive logging
- ✅ Clean separation of concerns

## Configuration

### Environment Variables

**Required:**
```bash
OPENAI_API_KEY=sk-your-api-key-here
```

**Optional:**
```bash
ENVIRONMENT=production  # For HSTS headers
LOG_LEVEL=INFO
```

### API Key Setup

1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to `backend/.env` file:
   ```env
   OPENAI_API_KEY=sk-your-api-key-here
   ```
3. Restart backend server

See [AI_SETUP.md](AI_SETUP.md) for detailed setup instructions.

## Monitoring and Maintenance

### Cost Monitoring

1. **OpenAI Dashboard**:
   - Monitor usage at [platform.openai.com/usage](https://platform.openai.com/usage)
   - Set up billing alerts
   - Review usage patterns

2. **Application Logs**:
   - Token usage logged per request
   - Check for unusual patterns
   - Monitor rate limit hits

### Performance Monitoring

- Track response times
- Monitor error rates
- Review rate limit effectiveness
- Analyze user questions for improvements

### Maintenance Tasks

1. **Regular Reviews**:
   - Review prompt effectiveness
   - Update system prompt based on feedback
   - Adjust rate limits if needed

2. **Cost Optimization**:
   - Review token usage patterns
   - Consider caching common responses
   - Evaluate alternative models

3. **Security Updates**:
   - Rotate API keys periodically
   - Review content filters
   - Update dependencies

## Future Enhancements

### Potential Improvements

1. **User Authentication Integration**:
   - Track per-user usage more accurately
   - Personalize responses based on user level
   - Implement user-specific rate limits

2. **Caching**:
   - Cache common questions/responses
   - Reduce API calls and costs
   - Improve response times

3. **Multiple Providers**:
   - Support Anthropic Claude
   - Support other AI providers
   - Fallback mechanisms

4. **Advanced Features**:
   - Code snippet explanations
   - Architecture diagram suggestions
   - Comparison with best practices

5. **Analytics**:
   - Track most common questions
   - Identify learning gaps
   - Improve puzzle design

## Troubleshooting

### Common Issues

**AI Service Not Available:**
- Check `OPENAI_API_KEY` is set
- Verify API key is valid
- Check backend logs for errors

**Rate Limit Exceeded:**
- Wait for rate limit window to reset
- Check rate limit headers
- Consider increasing limits for production

**High Costs:**
- Review rate limiting settings
- Check for abuse patterns
- Consider reducing token limits

**Poor Responses:**
- Review system prompt
- Adjust temperature settings
- Update guidelines in prompt

## Testing

### Manual Testing

1. Test with valid question
2. Test rate limiting
3. Test error handling
4. Test conversation history
5. Test with different scores

### Automated Testing

Consider adding:
- Unit tests for prompt building
- Integration tests for API endpoint
- Rate limiting tests
- Cost estimation tests

## Security Considerations

1. **API Key Protection**:
   - Never commit to git
   - Use environment variables
   - Rotate regularly

2. **Input Sanitization**:
   - Validate all inputs
   - Filter inappropriate content
   - Prevent injection attacks

3. **Rate Limiting**:
   - Prevent abuse
   - Control costs
   - Ensure fair usage

4. **Error Messages**:
   - Don't expose sensitive information
   - Generic error messages for users
   - Detailed logs for debugging

## Conclusion

The AI Discussion feature is designed with:
- ✅ Strong guardrails to prevent abuse
- ✅ Cost controls to manage expenses
- ✅ Quality prompts for relevant responses
- ✅ Best practices for security and reliability

Follow the setup guide in [AI_SETUP.md](AI_SETUP.md) to get started, and monitor usage regularly to ensure optimal performance and costs.
