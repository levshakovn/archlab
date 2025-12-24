# ArchLab POC - Internal Context & Development Notes

This file contains internal context, implementation details, and notes for developers working on the ArchLab POC.

## Project Structure

```
archlab/
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      # React UI components
│   │   ├── hooks/           # Custom React hooks (state management)
│   │   ├── services/        # API clients and business logic
│   │   ├── types/           # TypeScript type definitions
│   │   ├── data/            # Static data (puzzles.json)
│   │   ├── styles/          # Global CSS and Tailwind
│   │   ├── App.tsx          # Main application component
│   │   └── main.tsx         # React entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                  # FastAPI + Python
│   ├── app/
│   │   ├── api/v1/endpoints/  # API route handlers
│   │   ├── core/              # Config, logging
│   │   ├── schemas/           # Pydantic models
│   │   ├── services/          # Business logic
│   │   └── main.py            # FastAPI app entry
│   ├── tests/                 # Test suite
│   └── requirements.txt
│
└── [documentation files]
```

## Key Implementation Decisions

### Frontend Architecture

1. **State Management**: Custom React hooks instead of Redux/Zustand
   - `usePuzzles`: Manages puzzle selection and loading
   - `useCanvas`: Manages nodes and edges state
   - `useGrading`: Manages grading state and API calls
   - Rationale: Simple enough for POC, easy to upgrade later

2. **Canvas Implementation**: Custom SVG-based canvas
   - Not using ReactFlow library (though it's in dependencies for future)
   - Simple drag-drop with mouse events
   - SVG for rendering connections
   - Rationale: Full control, lightweight for POC

3. **Grading Strategy**: Dual-mode grading service
   - `gradeLocally()`: Mock grading in browser (current default)
   - `gradeWithAPI()`: Calls backend API (ready for future)
   - Rationale: Works offline for POC, easy to switch to API later

4. **Connection Logic**: Click-to-connect
   - Click node A (selects it), then click node B (creates edge)
   - Visual feedback: selected node has primary border
   - Rationale: Simple UX for POC, can enhance later

### Backend Architecture

1. **API Design**: RESTful with `/api/v1/grade` endpoint
   - Single endpoint for now, structured for expansion
   - Pydantic schemas for validation
   - Returns structured grading results

2. **Grading Logic**: Heuristic-based scoring
   - Puzzle-specific rules in `GradingService`
   - Four dimensions: correctness, reliability, security, cost
   - Hard constraint checking (e.g., required services)
   - Rationale: Fast, deterministic, ready to swap with LLM

3. **CORS Configuration**: Allows frontend origins
   - Configured in `app/core/config.py`
   - Default: localhost:5173, localhost:3000, localhost:8000

## Data Flow

### Puzzle Selection Flow
```
User selects puzzle → usePuzzles.selectPuzzle() 
  → Updates currentPuzzle state 
  → Sidebar/Canvas re-render with new puzzle data
```

### Drag & Drop Flow
```
User drags service from Sidebar 
  → onDragStart(serviceType) sets draggingServiceType in App
  → User drops on Canvas 
  → handleServiceDrop() calls useCanvas.addNode()
  → Node appears on canvas at drop position
```

### Grading Flow
```
User clicks "Grade Solution"
  → App calls useGrading.grade()
  → gradingService.gradeLocally() (or gradeWithAPI())
  → Mock/heuristic scoring logic runs
  → Result stored in useGrading state
  → ResultPanel displays scores and feedback
```

### Connection Flow
```
User clicks node A → handleNodeClick() sets selectedNode
  → User clicks node B → handleNodeClick() detects selectedNode exists
  → Calls useCanvas.addEdge(selectedNode, nodeB)
  → Edge added to edges array
  → Canvas re-renders with new connection line
```

## Component Relationships

```
App.tsx (Root)
├── Sidebar
│   └── Displays puzzle scenario, requirements, draggable services
├── PuzzleSelector
│   └── Dropdown to switch puzzles
├── Canvas
│   └── Renders nodes and edges, handles drag-drop and interactions
├── Controls
│   └── Grade and Clear buttons
└── ResultPanel (conditional)
    └── Modal showing grading results
```

## State Management

### App Component State
- `selectedNode`: Currently selected node for connection creation
- `draggingServiceType`: Service being dragged from sidebar

### usePuzzles Hook
- `puzzles`: Array of all puzzles
- `currentPuzzle`: Currently selected puzzle
- `loading`: Loading state (not really used, always sync)

### useCanvas Hook
- `nodes`: Record<string, CanvasNode> - all nodes on canvas
- `edges`: CanvasEdge[] - all connections
- `nodeIdCounter`: Counter for generating unique node IDs

### useGrading Hook
- `result`: GradingResult | null - latest grading result
- `loading`: Boolean - grading in progress
- `error`: string | null - error message if grading fails

## API Structure

### Backend Endpoints

**POST /api/v1/grade**
- Request: `GraphJSONSchema` (puzzleId, nodes, edges)
- Response: `GradingResultSchema` (scores, requirements, violations, feedback)
- Logic: `GradingService.grade_architecture()`

**GET /health**
- Response: `{"status": "healthy", "version": "0.1.0"}`
- Purpose: Health check for monitoring

**GET /**
- Response: Welcome message with API info
- Purpose: API discovery

## Grading Logic Details

### Scoring Dimensions
- **Correctness (40%)**: Does architecture solve the problem?
- **Reliability (20%)**: Fault tolerance, high availability
- **Security (20%)**: Proper isolation, access controls
- **Cost (20%)**: Cost optimization, right-sizing

### Puzzle-Specific Rules

**puzzle-3tier-basic**:
- Requires: Load balancer (ALB/NLB), Compute (EC2/ASG), Database (RDS/Aurora/DynamoDB)
- Scoring: Higher if all three tiers present

**puzzle-static-site-cdn**:
- Requires: S3, CloudFront
- Scoring: Higher if both present

**puzzle-serverless-api**:
- Requires: Lambda, API Gateway, Managed DB
- Scoring: Higher if serverless stack complete

**puzzle-async-processing**:
- Requires: S3, Queue (SQS/SNS)
- Scoring: Higher if decoupled architecture

**puzzle-data-lake-analytics**:
- Requires: S3, Athena
- Scoring: Higher if data lake pattern complete

## Brand Colors (Applied)

- Primary Blue: `#1976D2` - Main buttons, headers, active states
- Secondary Teal: `#00ACC1` - Accents, hover states
- Success Green: `#4CAF50` - Positive feedback, checkmarks
- Warning Orange: `#FF9800` - Caution states
- Error Red: `#F44336` - Errors, delete buttons
- Text Primary: `#212121` - Main text
- Text Secondary: `#757575` - Secondary text

## Future Enhancements (Not in POC)

1. **Real AI Grading**: Replace mock logic with Claude API
2. **Save/Load**: Persist diagrams to backend
3. **User Auth**: Add authentication (Clerk mentioned in README)
4. **More Puzzles**: Expand beyond 5 puzzles
5. **Better Canvas**: Use ReactFlow for advanced features
6. **Export**: Export to Terraform/CloudFormation
7. **Mobile**: Responsive design improvements

## Development Commands

### Using Makefile (Recommended)

The project includes a Makefile for simplified command execution:

```bash
make help              # Show all available commands
make install           # Install all dependencies
make dev               # Start both frontend and backend
make dev-frontend       # Start frontend only
make dev-backend        # Start backend only
make test              # Run all tests
make test-frontend     # Run frontend tests
make test-backend      # Run backend tests
make lint              # Run all linters
make format            # Format backend code
make build             # Build frontend for production
make clean             # Remove all build artifacts
make ci                # Run all CI checks
```

### Manual Commands

**Frontend:**
```bash
cd frontend
npm install          # First time setup
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npx tsc --noEmit     # Type check without building
```

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt        # Production deps
pip install -r requirements-dev.txt    # Include dev tools
uvicorn app.main:app --reload  # Start server (port 8000)
pytest  # Run tests
flake8 app tests  # Lint code
black --check app tests  # Check formatting
isort --check-only app tests  # Check import sorting
```

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push/PR:

1. **Backend Tests Job**:
   - Lints with flake8
   - Checks formatting with black
   - Checks imports with isort
   - Runs pytest

2. **Frontend Tests Job**:
   - Runs ESLint
   - Type checks with TypeScript
   - Builds frontend

3. **Integration Test Job**:
   - Starts backend server
   - Tests health endpoint
   - Tests grading API endpoint

See `.github/workflows/README.md` for more details.

## Testing Notes

- Backend tests in `backend/tests/`
- Frontend currently has no tests (add later)
- Manual testing: Select puzzle → drag services → create connections → grade

## Known Limitations (POC)

1. No persistence: Diagrams lost on refresh
2. Mock grading: Not real AI evaluation
3. Basic connections: No edge editing, labels, or types
4. No validation: Can create invalid architectures
5. Single user: No multi-user support
6. No undo/redo: Can't undo actions

## File Dependencies

### Frontend
- `App.tsx` → All components, all hooks
- `useCanvas.ts` → `types/index.ts`
- `useGrading.ts` → `services/gradingService.ts`, `types/index.ts`
- `gradingService.ts` → `types/index.ts`
- Components → `types/index.ts`

### Backend
- `main.py` → `api.v1.endpoints`, `core.config`, `core.logging`
- `grading.py` (endpoint) → `schemas.graph`, `schemas.grading`, `services.grading_service`
- `grading_service.py` → `schemas.graph`

## Environment Variables

### Frontend (.env)
- `VITE_API_URL`: Backend API URL (default: http://localhost:8000)

### Backend (.env)
- `ENVIRONMENT`: development/production
- `LOG_LEVEL`: INFO/DEBUG/WARNING/ERROR
- `CORS_ORIGINS`: Comma-separated list of allowed origins

## Troubleshooting

### Frontend won't start
- Check Node.js version (18+)
- Run `npm install` again
- Check port 5173 is available

### Backend won't start
- Check Python version (3.13+)
- Activate virtual environment
- Install dependencies: `pip install -r requirements.txt`
- Check port 8000 is available

### CORS errors
- Verify backend CORS_ORIGINS includes frontend URL
- Check backend is running
- Verify frontend proxy config in vite.config.ts

### Grading not working
- Check browser console for errors
- Verify backend is running if using API
- Check network tab for API calls

## Code Style

- Frontend: TypeScript strict mode, functional components, hooks
- Backend: Python type hints, Pydantic models, async endpoints
- Naming: camelCase (frontend), snake_case (backend)
- Components: PascalCase, files match component names

