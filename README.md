# ArchLab - AWS Architecture Practice Tool

Free AWS architecture practice tool with AI-powered feedback.

## 🎯 About

ArchLab helps engineers master AWS architecture through interactive practice puzzles. Drag AWS services onto a canvas, receive intelligent feedback on your design choices, and understand the trade-offs between different architectural patterns.

**Built for:**
- AWS certification prep (Solutions Architect, Developer, DevOps)
- Cloud architecture learning
- Interview preparation
- Understanding Well-Architected Framework principles

## ✨ Features

- **5 Fundamental Puzzles**: Static site CDN, 3-tier web app, serverless API, async processing, data lake
- **Interactive Canvas**: Drag-and-drop AWS services, position them, create connections
- **Smart Feedback**: Scores based on correctness, reliability, security, and cost
- **Rich Service Palette**: 30+ AWS services available per puzzle
- **No Installation Required**: Works in your browser locally

## 🚀 Quick Start

> **TL;DR (with Makefile)**: `make install && make dev` → http://localhost:5173  
> **TL;DR (manual)**: `cd frontend && npm install && npm run dev` → http://localhost:5173  
> Backend optional: `cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload`

### Option 1: Using Makefile (Recommended)

The easiest way to get started is using the provided Makefile:

```bash
# Install all dependencies
make install

# Start both frontend and backend
make dev

# Or start them separately
make dev-frontend  # Frontend only (port 5173)
make dev-backend   # Backend only (port 8000)
```

**Available Makefile commands:**
- `make help` - Show all available commands
- `make install` - Install all dependencies
- `make dev` - Start both frontend and backend
- `make test` - Run all tests
- `make lint` - Run all linters
- `make format` - Format backend code
- `make clean` - Remove all build artifacts

> **Note for Windows users**: Makefile requires `make` which comes with Git Bash, WSL, or can be installed via [Chocolatey](https://chocolatey.org/packages/make) or [GnuWin32](http://gnuwin32.sourceforge.net/packages/make.htm). Alternatively, use Option 2 (Manual Setup) below.

See the [Makefile](Makefile) for all available commands.

### Option 2: Manual Setup

If you prefer not to use Makefile, follow these steps:

### Prerequisites

Before you begin, make sure you have:
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Python 3.13+** - [Download](https://www.python.org/downloads/)
- **Git** - [Download](https://git-scm.com/downloads)

Verify installations:
```bash
node --version  # Should be v18 or higher
python --version  # Should be 3.13 or higher
git --version
```

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/archlab.git
cd archlab
```

### Step 2: Start the Frontend

The frontend can run standalone with mock grading (no backend required).

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

✅ **Frontend is running!** Open your browser to:
- **http://localhost:5173**

The app will automatically reload when you make changes.

### Step 3: Start the Backend (Optional)

The backend is optional for the POC - the frontend uses mock grading by default. Start the backend if you want to test the API integration.

**On macOS/Linux:**
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload
```

**On Windows:**
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload
```

✅ **Backend is running!** Available at:
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Health Check**: http://localhost:8000/health

### Step 4: Verify Everything Works

1. **Frontend**: Open http://localhost:5173 in your browser
   - You should see the ArchLab interface
   - Select a puzzle from the dropdown
   - Try dragging a service from the sidebar onto the canvas

2. **Backend** (if started): Open http://localhost:8000/docs
   - You should see the Swagger API documentation
   - Try the `/health` endpoint to verify it's working

### Running Both Services

**With Makefile (easiest):**
```bash
make dev  # Starts both frontend and backend
```

**Manually (two terminals):**

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload
```

### Troubleshooting

**Port already in use?**
- Frontend (5173): Change port in `frontend/vite.config.ts` or kill the process using port 5173
- Backend (8000): Change port with `uvicorn app.main:app --port 8001 --reload`

**Python virtual environment issues?**
```bash
# Delete and recreate venv
rm -rf venv  # or rmdir /s venv on Windows
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

**npm install fails?**
```bash
# Clear cache and try again
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**CORS errors?**
- Make sure backend is running on port 8000
- Check that `backend/app/core/config.py` includes `http://localhost:5173` in `CORS_ORIGINS`

## 📁 Project Structure

```
archlab/
├── frontend/                    # React + TypeScript app
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── types/              # TypeScript interfaces
│   │   ├── data/               # puzzles.json (5 scenarios)
│   │   ├── services/           # API & grading logic
│   │   ├── utils/              # Helper functions
│   │   ├── styles/             # Global CSS
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # FastAPI Python app
│   ├── app/
│   │   ├── main.py             # FastAPI app setup
│   │   ├── api/v1/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── schemas/            # Pydantic models
│   │   └── core/               # Config & logging
│   ├── tests/
│   ├── requirements.txt
│   └── README.md
│
├── README.md
├── CHANGELOG.md
└── .gitignore
```

## 🛠 Development

### Frontend Development

```bash
cd frontend
npm run dev          # Start dev server (hot reload)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Development

**With Makefile:**
```bash
make dev-backend      # Start backend server
make test-backend     # Run tests
make lint-backend     # Run linters
make format           # Format code
```

**Manually:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Start development server with auto-reload
uvicorn app.main:app --reload

# Run tests
pytest

# Run with code quality checks
pip install -r requirements-dev.txt
flake8 app tests
black --check app tests
isort --check-only app tests

# View API docs
# Visit http://localhost:8000/docs
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/description

# Make changes
git add .
git commit -m "feat: description"

# Push and create PR
git push origin feature/description
```

## 📊 Available Puzzles

1. **Static Website with CDN** - Learn content delivery and security
2. **3-Tier Web App** - Master high availability and networking
3. **Serverless REST API** - Understand event-driven architecture
4. **Async Image Processing** - Decouple workloads with queues
5. **Data Lake & Analytics** - Build scalable data pipelines

Each puzzle has:
- A realistic scenario
- Required outcomes
- 30+ AWS services to choose from
- Common mistakes to avoid

## 🧠 How It Works

1. **Select a puzzle** from the dropdown
2. **Drag services** from the left sidebar onto the canvas
3. **Connect services** by dragging from the connection handle (small circle) on the right edge of a service to another service
   - Hover over a service to see the connection handle appear
   - Click and drag from the handle to another service to create a connection
   - A preview line shows where the connection will be made
   - Click "Cancel" or click on the canvas to cancel a connection
4. **Delete connections** by hovering over a connection line and clicking the × button that appears, or click directly on the connection line
5. **Move services** by clicking and dragging them around the canvas
6. **Delete services** by clicking the × button on a service
6. **Click "Grade Solution"** to receive AI-powered feedback
7. **Learn why** certain choices are better than others

## 📈 Scoring

Solutions are evaluated on four dimensions:

- **Correctness (40%)**: Does it solve the stated problem?
- **Reliability (20%)**: Can it handle failures? Is it fault-tolerant?
- **Security (20%)**: Are components properly isolated and protected?
- **Cost (20%)**: Is it cost-optimized for the requirements?

## 🔮 Roadmap

- [ ] Real Claude API integration for grading
- [ ] User authentication (Clerk)
- [ ] Save/load diagrams
- [ ] Progress tracking
- [ ] More puzzles (15+ total)
- [ ] Export to Terraform
- [ ] Mobile responsive design
- [ ] Community features

## 📚 Tech Stack

**Frontend:**
- React 18
- TypeScript
- React Flow (node/edge editor)
- Vite (build tool)
- Tailwind CSS (styling)

**Backend:**
- FastAPI
- Python 3.13+
- Pydantic (validation)
- Pytest (testing)

**Hosting:**
- Vercel (frontend)
- Railway/Render (backend)

## 🤝 Contributing

Pull requests welcome! To contribute:

1. Fork the repo
2. Create a feature branch
3. Add tests for new functionality
4. Update CHANGELOG.md
5. Submit a pull request

## 📝 License

MIT - see LICENSE file

## 👤 Author

Built by [Your Name] ([@yourhandle](https://twitter.com/yourhandle))

- GitHub: [@yourusername](https://github.com/yourusername)
- Twitter: [@yourhandle](https://twitter.com/yourhandle)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)

## 📬 Support

- Open an issue on GitHub for bugs
- Discussions for feature requests
- Email: your-email@example.com

---

**Built with ❤️ for the AWS community. Free, open source, and always improving.**