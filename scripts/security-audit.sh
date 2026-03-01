#!/bin/bash
# Security audit script for ArchLab
# Run this script to check for security vulnerabilities

set -e

echo "🔒 ArchLab Security Audit"
echo "========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Frontend security audit
echo "📦 Frontend Security Audit (npm audit)..."
cd frontend
if npm audit --audit-level=moderate; then
    echo -e "${GREEN}✅ Frontend dependencies are secure${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend has security vulnerabilities. Run 'npm audit fix' to fix automatically fixable issues.${NC}"
fi
cd ..

echo ""
echo "🐍 Backend Security Audit..."

# Check if pip-audit is installed
if command -v pip-audit &> /dev/null; then
    cd backend
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    if pip-audit; then
        echo -e "${GREEN}✅ Backend dependencies are secure${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend has security vulnerabilities. Review and update dependencies.${NC}"
    fi
    cd ..
else
    echo -e "${YELLOW}⚠️  pip-audit not installed. Install with: pip install pip-audit${NC}"
    echo "   Then run: pip-audit"
fi

echo ""
echo "🔍 Security Configuration Check..."
echo ""

# Check for security headers in main.py
if grep -q "SecurityHeadersMiddleware" backend/app/main.py; then
    echo -e "${GREEN}✅ Security headers middleware configured${NC}"
else
    echo -e "${RED}❌ Security headers middleware not found${NC}"
fi

# Check for rate limiting
if grep -q "RateLimitMiddleware" backend/app/main.py; then
    echo -e "${GREEN}✅ Rate limiting middleware configured${NC}"
else
    echo -e "${RED}❌ Rate limiting middleware not found${NC}"
fi

# Check for CSRF protection
if grep -q "CSRFProtectionMiddleware" backend/app/main.py; then
    echo -e "${GREEN}✅ CSRF protection middleware configured${NC}"
else
    echo -e "${RED}❌ CSRF protection middleware not found${NC}"
fi

# Check for input validation
if grep -q "validate_not_empty\|validate_id_format" backend/app/schemas/graph.py; then
    echo -e "${GREEN}✅ Input validation configured${NC}"
else
    echo -e "${RED}❌ Input validation not found${NC}"
fi

echo ""
echo "✅ Security audit complete!"
echo ""
echo "📝 Recommendations:"
echo "  1. Review and fix any vulnerabilities found above"
echo "  2. Keep dependencies up to date"
echo "  3. Review security headers configuration for production"
echo "  4. Test rate limiting and CSRF protection"
echo "  5. Consider adding security.txt file for responsible disclosure"
