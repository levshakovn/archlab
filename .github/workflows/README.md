# GitHub Actions Workflows

This directory contains CI/CD workflows for the ArchLab project.

## CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and pull request to `main` and `develop` branches.

### Jobs

1. **Backend Tests**
   - Lints Python code with flake8
   - Checks code formatting with black
   - Checks import sorting with isort
   - Runs pytest test suite

2. **Frontend Tests**
   - Runs ESLint for TypeScript/React code
   - Type checks with TypeScript compiler
   - Builds the frontend to verify compilation

3. **Integration Test**
   - Starts the backend server
   - Tests health endpoint
   - Tests grading API endpoint

### Local Testing

You can run the same checks locally:

**Backend:**
```bash
cd backend
pip install -r requirements-dev.txt
flake8 app tests
black --check app tests
isort --check-only app tests
pytest
```

**Frontend:**
```bash
cd frontend
npm install
npm run lint
npx tsc --noEmit
npm run build
```

