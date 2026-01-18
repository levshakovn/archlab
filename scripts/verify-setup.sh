#!/bin/bash

# Quick Setup Verification Script
# Verifies that the development environment is set up correctly

echo "🔍 Quick Setup Verification"
echo "=========================="
echo ""

PASSED=0
FAILED=0

check() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo "❌ $1"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js installed: $NODE_VERSION"
    PASSED=$((PASSED + 1))
else
    echo "❌ Node.js not found - install Node.js 18+"
    FAILED=$((FAILED + 1))
fi

# Check Python
echo ""
echo "🐍 Checking Python..."
if command -v python3 &> /dev/null || command -v python &> /dev/null; then
    PYTHON_CMD=$(command -v python3 2>/dev/null || command -v python 2>/dev/null)
    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1)
    echo "✅ Python installed: $PYTHON_VERSION"
    PASSED=$((PASSED + 1))
else
    echo "❌ Python not found - install Python 3.13+"
    FAILED=$((FAILED + 1))
fi

# Check frontend dependencies
echo ""
echo "📱 Checking frontend setup..."
if [ -d "frontend/node_modules" ]; then
    echo "✅ Frontend dependencies installed"
    PASSED=$((PASSED + 1))
else
    echo "⚠️  Frontend dependencies not installed"
    echo "   Run: make install-frontend or cd frontend && npm install"
fi

# Check backend venv
echo ""
echo "🐍 Checking backend setup..."
if [ -d "backend/venv" ] || [ -d "backend/.venv" ]; then
    echo "✅ Backend virtual environment exists"
    PASSED=$((PASSED + 1))
else
    echo "⚠️  Backend virtual environment not found"
    echo "   Run: make install-backend"
fi

# Check Supabase config (optional)
echo ""
echo "🔐 Checking Supabase configuration (optional)..."
if [ -f "frontend/.env" ]; then
    if grep -q "VITE_SUPABASE_URL" frontend/.env 2>/dev/null; then
        echo "✅ Supabase environment variables found"
        PASSED=$((PASSED + 1))
    else
        echo "⚠️  Supabase not configured (optional for testing)"
    fi
else
    echo "ℹ️  .env file not found (optional - needed for authentication)"
fi

echo ""
echo "=========================="
echo "📊 Summary"
echo "=========================="
echo "✅ Passed: $PASSED"
if [ $FAILED -gt 0 ]; then
    echo "❌ Failed: $FAILED"
    echo ""
    echo "⚠️  Some checks failed. Install missing dependencies and run again."
    exit 1
else
    echo "✅ All essential checks passed!"
    echo ""
    echo "🚀 Ready for development!"
    echo ""
    echo "Next steps:"
    echo "  - Start development: make dev"
    echo "  - Run tests: make test"
    echo "  - Check deployment readiness: make check"
    exit 0
fi
