# Security Policy

## Security Features

ArchLab implements multiple layers of security to protect users and the application:

### 1. Security Headers
- **Content Security Policy (CSP)**: Prevents XSS attacks by controlling resource loading
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-XSS-Protection**: Enables browser XSS filtering
- **Strict-Transport-Security (HSTS)**: Enforces HTTPS in production
- **Referrer-Policy**: Controls referrer information sharing
- **Permissions-Policy**: Restricts browser features

### 2. Rate Limiting
- **Sliding Window Algorithm**: Limits API requests to 100 per minute per IP
- **Per-IP Tracking**: Tracks requests by client IP address
- **Rate Limit Headers**: Returns `X-RateLimit-Limit` and `X-RateLimit-Remaining` headers
- **429 Response**: Returns appropriate error when limit exceeded

### 3. CSRF Protection
- **Origin Validation**: Validates Origin header for state-changing requests
- **Referer Fallback**: Uses Referer header if Origin is not present
- **Allowed Origins**: Only accepts requests from configured CORS origins
- **Safe Methods**: Skips CSRF check for GET, HEAD, OPTIONS requests

### 4. Input Validation
- **Pydantic Schemas**: Strong type validation for all API inputs
- **Format Validation**: Validates node IDs, puzzle IDs, and coordinates
- **XSS Prevention**: Sanitizes user input to remove script tags and dangerous patterns
- **Length Limits**: Prevents DoS attacks with size limits on inputs
- **Graph Size Limits**: Limits nodes (1000) and edges (5000) per graph

### 5. CORS Configuration
- **Whitelist Origins**: Only allows requests from configured origins
- **Credential Support**: Supports credentials for authenticated requests
- **Method Restrictions**: Only allows GET, POST, OPTIONS methods
- **Header Restrictions**: Only allows Content-Type and Authorization headers

## Running Security Audits

### Frontend
```bash
cd frontend
npm audit
npm audit fix  # Auto-fix vulnerabilities
```

### Backend
```bash
# Install pip-audit
pip install pip-audit

# Run audit
cd backend
pip-audit
```

### Full Security Audit
```bash
./scripts/security-audit.sh
```

## Security Best Practices

1. **Keep Dependencies Updated**
   - Regularly run `npm audit` and `pip-audit`
   - Update dependencies when security patches are available

2. **Environment Variables**
   - Never commit `.env` files
   - Use strong secrets for production
   - Rotate secrets regularly

3. **API Keys**
   - Store API keys in environment variables
   - Use different keys for development and production
   - Rotate keys if compromised

4. **HTTPS Only**
   - Always use HTTPS in production
   - HSTS header enforces HTTPS connections

5. **Input Sanitization**
   - All user input is validated and sanitized
   - Never trust user input
   - Use parameterized queries (if using SQL)

6. **Error Handling**
   - Don't expose sensitive information in error messages
   - Log errors securely
   - Return generic error messages to users

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** create a public GitHub issue
2. Email security concerns to: [your-email@example.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to resolve the issue.

## Security Checklist

- [x] Security headers configured
- [x] Rate limiting implemented
- [x] CSRF protection enabled
- [x] Input validation enhanced
- [x] CORS properly configured
- [ ] Security audit script created
- [ ] Regular dependency updates
- [ ] Security testing in CI/CD
- [ ] Penetration testing (recommended)

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/advanced/security/)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#security)
