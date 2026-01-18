# Test Scripts

## Available Scripts

### `pre-deployment-check.sh`
Comprehensive pre-deployment verification script.

**Checks**:
- Required files exist
- Dependencies installed
- Type checking passes
- Linting passes
- Build succeeds
- No critical issues

**Usage**:
```bash
# Using Makefile (recommended)
make check
make pre-deployment

# Or run directly
./scripts/pre-deployment-check.sh
```

### `run-tests.sh`
Runs all tests for frontend and backend.

**Tests**:
- Frontend: Type checking, linting, build
- Backend: pytest, flake8

**Usage**:
```bash
# Run directly
./scripts/run-tests.sh
```

---

## Makefile Commands

### Testing
```bash
make test              # Run all tests (frontend + backend)
make test-frontend     # Frontend tests only
make test-backend      # Backend tests only
```

### Pre-Deployment
```bash
make check             # Run pre-deployment verification
make pre-deployment    # Same as check
```

### Full CI Checks
```bash
make ci                # Install deps, lint, and test everything
```

---

## Quick Testing Guide

### 1. Run Automated Tests
```bash
# Quick test
make test

# Detailed test with script
./scripts/run-tests.sh
```

### 2. Pre-Deployment Verification
```bash
# Run verification
make check
```

### 3. Manual Testing
Follow [../TESTING_GUIDE.md](../TESTING_GUIDE.md) for comprehensive manual testing.

---

**Note**: Scripts require Unix-like shell (bash). On Windows, use Git Bash or WSL.
