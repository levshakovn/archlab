#!/bin/bash

# Test Runner Script
# Runs all tests for ArchLab

set -e  # Exit on any error

echo "🧪 ArchLab Test Suite"
echo "===================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

run_test() {
    echo "Running: $1"
    if eval "$2"; then
        echo -e "${GREEN}✅ PASSED${NC}: $1"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAILED${NC}: $1"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo ""
}

# Frontend Tests
echo "📱 Frontend Tests"
echo "----------------"

# Type checking
run_test "TypeScript type check" "cd frontend && npx tsc --noEmit"

# Linting
run_test "ESLint" "cd frontend && npm run lint"

# Build
run_test "Production build" "cd frontend && npm run build"

echo ""

# Backend Tests
echo "🐍 Backend Tests"
echo "---------------"

# Check if venv exists
if [ -d "backend/venv" ] || [ -d "backend/.venv" ]; then
    # Activate venv and run tests
    if [ -f "backend/venv/bin/activate" ]; then
        source backend/venv/bin/activate
    elif [ -f "backend/.venv/bin/activate" ]; then
        source backend/.venv/bin/activate
    fi
    
    run_test "Pytest - Backend tests" "cd backend && pytest -v --tb=short"
    
    run_test "Flake8 - Linting" "cd backend && flake8 app tests --count --select=E9,F63,F7,F82 --show-source --statistics"
else
    echo -e "${YELLOW}⚠️  Backend venv not found - skipping backend tests${NC}"
    echo "   Run: make install-backend"
    echo ""
fi

# Summary
echo "===================="
echo "📊 Test Summary"
echo "===================="
echo -e "${GREEN}✅ Passed: $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}❌ Failed: $TESTS_FAILED${NC}"
    exit 1
else
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
fi
