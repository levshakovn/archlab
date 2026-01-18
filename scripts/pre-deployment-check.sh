#!/bin/bash

# Pre-Deployment Verification Script
# This script checks if the project is ready for deployment

set -e  # Exit on any error

echo "🔍 Pre-Deployment Verification"
echo "=============================="
echo ""

ERRORS=0
WARNINGS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_pass() {
    echo -e "${GREEN}✅${NC} $1"
}

check_fail() {
    echo -e "${RED}❌${NC} $1"
    ERRORS=$((ERRORS + 1))
}

check_warn() {
    echo -e "${YELLOW}⚠️${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

# 1. Check required files exist
echo "📁 Checking required files..."
if [ ! -f "README.md" ]; then
    check_fail "README.md missing"
else
    check_pass "README.md exists"
fi

if [ ! -f "frontend/package.json" ]; then
    check_fail "frontend/package.json missing"
else
    check_pass "frontend/package.json exists"
fi

if [ ! -f "backend/requirements.txt" ]; then
    check_fail "backend/requirements.txt missing"
else
    check_pass "backend/requirements.txt exists"
fi

if [ ! -f "frontend/src/data/puzzles.json" ]; then
    check_fail "puzzles.json missing"
else
    check_pass "puzzles.json exists"
fi

echo ""

# 2. Check environment variables documentation
echo "🔐 Checking environment variables..."
if grep -q "VITE_SUPABASE_URL" README.md 2>/dev/null; then
    check_pass "Supabase environment variables documented"
else
    check_warn "Supabase environment variables not clearly documented"
fi

if grep -q "VITE_BRICK_SCRIPT_URL" README.md 2>/dev/null; then
    check_pass "Brick analytics documented (optional)"
else
    check_warn "Brick analytics not documented (optional)"
fi

echo ""

# 3. Check frontend dependencies
echo "📦 Checking frontend dependencies..."
if [ -d "frontend/node_modules" ]; then
    check_pass "Frontend dependencies installed"
    
    # Check for reactflow (should be removed if unused)
    if grep -q '"reactflow"' frontend/package.json; then
        if ! grep -r "reactflow\|react-flow" frontend/src --quiet 2>/dev/null; then
            check_warn "reactflow in package.json but not used - consider removing"
        else
            check_pass "reactflow dependency is used"
        fi
    fi
else
    check_fail "Frontend dependencies not installed (run: make install-frontend)"
fi

echo ""

# 4. Check backend dependencies
echo "🐍 Checking backend dependencies..."
if [ -d "backend/venv" ] || [ -d "backend/.venv" ]; then
    check_pass "Backend virtual environment exists"
    
    # Check if pytest is installed
    if [ -f "backend/venv/bin/pytest" ] || [ -f "backend/.venv/bin/pytest" ] || command -v pytest &> /dev/null; then
        check_pass "pytest available"
    else
        check_warn "pytest not found - backend tests may not run"
    fi
else
    check_warn "Backend virtual environment not found (run: make install-backend)"
fi

echo ""

# 5. Type checking (frontend)
echo "🔷 Type checking frontend..."
if command -v npx &> /dev/null; then
    cd frontend
    if npx tsc --noEmit 2>&1 | grep -q "error TS"; then
        check_fail "TypeScript errors found - check output above"
        npx tsc --noEmit
    else
        check_pass "TypeScript type checking passed"
    fi
    cd ..
else
    check_warn "npx not available - skipping TypeScript check"
fi

echo ""

# 6. Linting (frontend)
echo "🔍 Linting frontend..."
if [ -d "frontend/node_modules" ]; then
    cd frontend
    if npm run lint 2>&1 | grep -q "error\|Error"; then
        check_warn "ESLint found issues - check output above"
    else
        check_pass "Frontend linting passed"
    fi
    cd ..
else
    check_warn "Frontend dependencies not installed - skipping lint check"
fi

echo ""

# 7. Build check
echo "🏗️  Checking production build..."
if [ -d "frontend/node_modules" ]; then
    cd frontend
    if npm run build > /dev/null 2>&1; then
        check_pass "Production build successful"
        if [ -d "dist" ]; then
            BUILD_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
            check_pass "Build output exists ($BUILD_SIZE)"
        fi
    else
        check_fail "Production build failed"
    fi
    cd ..
else
    check_warn "Frontend dependencies not installed - skipping build check"
fi

echo ""

# 8. Check for console.log statements (warnings only)
echo "📝 Checking for debug statements..."
if grep -r "console\.log" frontend/src --exclude-dir=node_modules 2>/dev/null | grep -v "console.error\|console.warn" | grep -v "// eslint-disable\|// eslint-disable-next-line" | grep -v "test\|Test" | head -5 | grep -q .; then
    check_warn "Found console.log statements - consider removing for production"
    grep -r "console\.log" frontend/src --exclude-dir=node_modules 2>/dev/null | grep -v "console.error\|console.warn" | grep -v "// eslint-disable\|// eslint-disable-next-line" | grep -v "test\|Test" | head -3
else
    check_pass "No debug console.log statements found"
fi

echo ""

# 9. Check for TODO/FIXME comments
echo "📋 Checking for TODO/FIXME comments..."
TODO_COUNT=$(grep -r "TODO\|FIXME" frontend/src backend/app --exclude-dir=node_modules --exclude-dir=venv --exclude-dir=.venv 2>/dev/null | wc -l | tr -d ' ')
if [ "$TODO_COUNT" -gt 10 ]; then
    check_warn "Found $TODO_COUNT TODO/FIXME comments - review before deployment"
else
    check_pass "TODO/FIXME comments acceptable ($TODO_COUNT found)"
fi

echo ""

# 10. Check database setup files
echo "💾 Checking database setup..."
if [ -f "database/setup.sql" ]; then
    check_pass "Database setup script exists"
else
    check_warn "database/setup.sql not found"
fi

if [ -f "database/storage_setup.sql" ]; then
    check_pass "Storage setup script exists"
else
    check_warn "database/storage_setup.sql not found"
fi

if [ -f "database/puzzle_completions_setup.sql" ]; then
    check_pass "Completions table setup exists"
else
    check_warn "database/puzzle_completions_setup.sql not found"
fi

echo ""

# 11. Check documentation
echo "📚 Checking documentation..."
if [ -f "TESTING_GUIDE.md" ]; then
    check_pass "TESTING_GUIDE.md exists"
else
    check_warn "TESTING_GUIDE.md not found"
fi

if [ -f "DEPLOYMENT_SETUP.md" ]; then
    check_pass "DEPLOYMENT_SETUP.md exists"
else
    check_warn "DEPLOYMENT_SETUP.md not found"
fi

echo ""

# Summary
echo "=============================="
echo "📊 Summary"
echo "=============================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "🚀 Project is ready for deployment!"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
    echo ""
    echo "✅ No blocking errors - review warnings above"
    echo "🚀 Project can be deployed, but review warnings first"
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) found, $WARNINGS warning(s)${NC}"
    echo ""
    echo "❌ Fix errors before deployment"
    exit 1
fi
