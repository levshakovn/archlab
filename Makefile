.PHONY: help install install-frontend install-backend dev dev-frontend dev-backend dev-all test test-frontend test-backend lint lint-frontend lint-backend format format-backend clean build build-frontend build-backend check pre-deployment

# Default target
help:
	@echo "ArchLab - Makefile Commands"
	@echo ""
	@echo "Installation:"
	@echo "  make install              Install all dependencies (frontend + backend)"
	@echo "  make install-frontend     Install frontend dependencies"
	@echo "  make install-backend      Install backend dependencies"
	@echo ""
	@echo "Verification:"
	@echo "  ./scripts/verify-setup.sh Verify development environment setup"
	@echo ""
	@echo "Development:"
	@echo "  make dev                  Start both frontend and backend (recommended)"
	@echo "  make dev-frontend         Start frontend only (port 5173)"
	@echo "  make dev-backend          Start backend only (port 8000)"
	@echo ""
	@echo "Testing:"
	@echo "  make test                 Run all tests (frontend + backend)"
	@echo "  make test-frontend        Run frontend tests (type check + build)"
	@echo "  make test-backend         Run backend tests (pytest)"
	@echo "  make check                Run pre-deployment verification"
	@echo "  make pre-deployment       Same as check (pre-deployment checklist)"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint                 Run all linters"
	@echo "  make lint-frontend        Run ESLint on frontend"
	@echo "  make lint-backend         Run flake8 on backend"
	@echo "  make format               Format backend code (black + isort)"
	@echo "  make format-check         Check backend formatting without changes"
	@echo ""
	@echo "Build:"
	@echo "  make build                Build frontend for production"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean                Remove node_modules, venv, and build artifacts"
	@echo "  make clean-frontend       Remove frontend build artifacts"
	@echo "  make clean-backend        Remove backend build artifacts"

# Installation
install: install-frontend install-backend
	@echo "✅ All dependencies installed"

install-frontend:
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install

install-backend:
	@echo "📦 Installing backend dependencies..."
	@cd backend && \
	if [ ! -d "venv" ]; then \
		echo "Creating virtual environment..."; \
		python3 -m venv venv || python -m venv venv; \
	fi && \
	if [ -f "venv/bin/activate" ]; then \
		. venv/bin/activate && \
		pip install --upgrade pip && \
		pip install -r requirements.txt; \
	elif [ -f "venv/Scripts/activate" ]; then \
		venv/Scripts/activate && \
		pip install --upgrade pip && \
		pip install -r requirements.txt; \
	else \
		echo "❌ Failed to create or find virtual environment"; \
		exit 1; \
	fi

install-backend-dev: install-backend
	@echo "📦 Installing backend dev dependencies..."
	@cd backend && \
	if [ -f "venv/bin/activate" ]; then \
		. venv/bin/activate && \
		pip install -r requirements-dev.txt; \
	elif [ -f "venv/Scripts/activate" ]; then \
		venv/Scripts/activate && \
		pip install -r requirements-dev.txt; \
	else \
		echo "❌ Virtual environment not found"; \
		exit 1; \
	fi

# Development servers
dev: dev-all

dev-all:
	@echo "🚀 Starting both frontend and backend..."
	@echo "   Frontend: http://localhost:5173"
	@echo "   Backend:  http://localhost:8000"
	@echo "   API Docs: http://localhost:8000/docs"
	@echo ""
	@echo "Press Ctrl+C to stop both servers"
	@trap 'kill 0' EXIT; \
	cd frontend && npm run dev & \
	cd backend && \
	if [ -f "venv/bin/activate" ]; then \
		. venv/bin/activate && uvicorn app.main:app --reload & \
	elif [ -f "venv/Scripts/activate" ]; then \
		venv/Scripts/activate && uvicorn app.main:app --reload & \
	else \
		echo "❌ Virtual environment not found. Run 'make install-backend' first"; \
		exit 1; \
	fi && \
	wait

dev-frontend:
	@echo "🚀 Starting frontend (http://localhost:5173)..."
	cd frontend && npm run dev

dev-backend:
	@echo "🚀 Starting backend (http://localhost:8000)..."
	@echo "   API Docs: http://localhost:8000/docs"
	@cd backend && \
	if [ ! -d "venv" ]; then \
		echo "❌ Virtual environment not found. Run 'make install-backend' first"; \
		exit 1; \
	fi && \
	if [ -f "venv/bin/activate" ]; then \
		. venv/bin/activate && \
		uvicorn app.main:app --reload; \
	elif [ -f "venv/Scripts/activate" ]; then \
		venv/Scripts/activate && \
		uvicorn app.main:app --reload; \
	else \
		echo "❌ Virtual environment activation script not found"; \
		exit 1; \
	fi

# Testing
test: test-frontend test-backend
	@echo "✅ All tests passed"

test-frontend:
	@echo "🧪 Running frontend tests..."
	cd frontend && \
	npm run lint && \
	npx tsc --noEmit && \
	npm run build
	@echo "✅ Frontend tests passed"

test-backend:
	@echo "🧪 Running backend tests..."
	@cd backend && \
	if [ ! -d "venv" ]; then \
		echo "❌ Virtual environment not found. Run 'make install-backend' first"; \
		exit 1; \
	fi && \
	if [ -f "venv/bin/activate" ]; then \
		. venv/bin/activate && \
		pytest -v --tb=short; \
	elif [ -f "venv/Scripts/activate" ]; then \
		venv/Scripts/activate && \
		pytest -v --tb=short; \
	else \
		echo "❌ Virtual environment activation script not found"; \
		exit 1; \
	fi

# Linting
lint: lint-frontend lint-backend
	@echo "✅ All linting checks passed"

lint-frontend:
	@echo "🔍 Linting frontend..."
	cd frontend && npm run lint

lint-backend:
	@echo "🔍 Linting backend..."
	@cd backend && \
	if [ ! -d "venv" ]; then \
		echo "❌ Virtual environment not found. Run 'make install-backend-dev' first"; \
		exit 1; \
	fi && \
	if [ -f "venv/bin/activate" ]; then \
		. venv/bin/activate && \
		flake8 app tests --count --select=E9,F63,F7,F82 --show-source --statistics && \
		flake8 app tests --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics; \
	elif [ -f "venv/Scripts/activate" ]; then \
		venv/Scripts/activate && \
		flake8 app tests --count --select=E9,F63,F7,F82 --show-source --statistics && \
		flake8 app tests --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics; \
	else \
		echo "❌ Virtual environment activation script not found"; \
		exit 1; \
	fi

# Formatting
format: format-backend
	@echo "✅ Code formatted"

format-backend:
	@echo "🎨 Formatting backend code..."
	@cd backend && \
	if [ ! -d "venv" ]; then \
		echo "❌ Virtual environment not found. Run 'make install-backend-dev' first"; \
		exit 1; \
	fi && \
	if [ -f "venv/bin/activate" ]; then \
		. venv/bin/activate && \
		black app tests && \
		isort app tests; \
	elif [ -f "venv/Scripts/activate" ]; then \
		venv/Scripts/activate && \
		black app tests && \
		isort app tests; \
	else \
		echo "❌ Virtual environment activation script not found"; \
		exit 1; \
	fi

format-check:
	@echo "🔍 Checking backend code formatting..."
	@cd backend && \
	if [ ! -d "venv" ]; then \
		echo "❌ Virtual environment not found. Run 'make install-backend-dev' first"; \
		exit 1; \
	fi && \
	if [ -f "venv/bin/activate" ]; then \
		. venv/bin/activate && \
		black --check app tests && \
		isort --check-only app tests; \
	elif [ -f "venv/Scripts/activate" ]; then \
		venv/Scripts/activate && \
		black --check app tests && \
		isort --check-only app tests; \
	else \
		echo "❌ Virtual environment activation script not found"; \
		exit 1; \
	fi

# Build
build: build-frontend
	@echo "✅ Build complete"

build-frontend:
	@echo "🏗️  Building frontend for production..."
	cd frontend && npm run build
	@echo "✅ Frontend built in frontend/dist/"

# Cleanup
clean: clean-frontend clean-backend
	@echo "✅ Cleanup complete"

clean-frontend:
	@echo "🧹 Cleaning frontend..."
	cd frontend && \
	rm -rf node_modules dist .vite package-lock.json

clean-backend:
	@echo "🧹 Cleaning backend..."
	cd backend && \
	rm -rf venv .venv __pycache__ .pytest_cache *.egg-info && \
	find . -type d -name __pycache__ -exec rm -r {} + 2>/dev/null || true && \
	find . -type f -name "*.pyc" -delete

# Pre-deployment checks
check: pre-deployment

pre-deployment:
	@echo "🔍 Running pre-deployment checks..."
	@if [ -f "scripts/pre-deployment-check.sh" ]; then \
		chmod +x scripts/pre-deployment-check.sh && \
		./scripts/pre-deployment-check.sh; \
	else \
		echo "❌ Pre-deployment check script not found"; \
		exit 1; \
	fi

# CI checks (runs all checks like CI)
ci: install-backend-dev install-frontend lint test
	@echo "✅ All CI checks passed"

