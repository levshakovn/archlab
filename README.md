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

- **20 Real-World Puzzles**: Covering static sites, serverless, containers, data analytics, ML, and more
- **Interactive Canvas**: Drag-and-drop AWS services, position them, create connections
- **Smart Feedback**: Scores based on correctness, reliability, security, and cost with detailed suggestions
- **Rich Service Palette**: 30+ AWS services available per puzzle
- **Canvas Persistence**: Your work is automatically saved and persists across sessions
- **Undo/Redo**: Full undo/redo support with keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- **User Authentication**: Sign up with email or Google OAuth (Supabase)
- **Profile Management**: Upload and crop profile photos, change password, track your progress
- **Task Completion Tracking**: See your best scores, completion history, and progress
- **Mobile Support**: Touch interactions for mobile devices
- **Enhanced Feedback**: Puzzle-specific suggestions with links to AWS documentation
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

### Step 2: Configure Supabase (Required for Authentication)

ArchLab uses Supabase for user authentication, profile management, and task completion tracking.

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Get your credentials** from Project Settings → API
3. **Create a `.env` file** in the `frontend` directory:
   ```bash
   cd frontend
   cp .env.example .env  # If .env.example exists
   ```
4. **Add your Supabase credentials** to `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
5. **Enable Google OAuth (optional but recommended)**:
   - In Supabase Dashboard: Authentication → Providers → Google → Enable
   - Add your Google OAuth Client ID and Client Secret
   - Add authorized redirect URLs in Google Cloud Console:
     - `https://your-project-id.supabase.co/auth/v1/callback`
     - `http://localhost:5173/auth/callback`
     - `http://localhost:3000/auth/callback`
     - `https://yourdomain.com/auth/callback`
   - No additional environment variables are required for Google OAuth
6. **Set up the database**:
   - Run `database/setup.sql` in Supabase SQL Editor (creates profiles table)
   - Run `database/storage_setup.sql` in Supabase SQL Editor (creates storage bucket policies)
   - Create a storage bucket named `profile-photos` in Supabase Dashboard
   - Run `database/puzzle_completions_setup.sql` in Supabase SQL Editor (creates completions table)

7. **Configure AI Discussion (Optional)**:
   - Get an OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)
   - Add `OPENAI_API_KEY=sk-your-key-here` to `backend/.env` file
   - See [AI_SETUP.md](AI_SETUP.md) for detailed instructions

See [database/README.md](database/README.md) for detailed setup instructions.

### Step 3: Start the Frontend

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

> **Note**: Without Supabase configuration, authentication features will be disabled, but you can still use the app to practice puzzles.

### Step 4: Start the Backend (Optional)

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

### Step 5: Verify Everything Works

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
│   │   ├── data/               # puzzles.json (20 scenarios)
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
├── database/              # Supabase database setup scripts
│   ├── setup.sql         # Profiles table setup
│   ├── storage_setup.sql # Storage bucket policies
│   ├── puzzle_completions_setup.sql # Task completion tracking
│   └── README.md         # Database setup guide
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

**Want to add a new puzzle?** See [ADDING_PUZZLES.md](ADDING_PUZZLES.md) for a complete guide on how to create and add new puzzles to ArchLab.

## 🧠 How It Works

1. **Select a puzzle** from the right sidebar (numbered list)
2. **Drag services** from the left sidebar onto the canvas (or use touch on mobile)
3. **Connect services** by clicking the connection handle (small circle) on a service, then clicking another service
   - Hover over a service to see the connection handle appear
   - Click the handle to start connection mode
   - Click another service to complete the connection
   - Click "Cancel" or click on the canvas to cancel a connection
4. **Delete connections** by hovering over a connection line and clicking the × button that appears
5. **Move services** by clicking and dragging them around the canvas (works with touch on mobile)
6. **Delete services** by clicking the × button on a service
7. **Undo/Redo** using buttons or keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z)
8. **Click "Grade Solution"** to receive feedback with scores and suggestions
9. **Your work is saved** automatically - refresh the page and it will be restored
10. **Learn from feedback** - suggestions include links to AWS documentation

## 📈 Scoring

Solutions are evaluated on four dimensions and displayed as a single percentage score:

- **Correctness (40%)**: Does it solve the stated problem?
- **Reliability (20%)**: Can it handle failures? Is it fault-tolerant?
- **Security (20%)**: Are components properly isolated and protected?
- **Cost (20%)**: Is it cost-optimized for the requirements?

**Score Indicators:**
- 🟢 **Green (100%)**: Perfect score
- 🟡 **Yellow (80-99%)**: Good score
- 🔴 **Red (<80%)**: Needs improvement

Your best score for each puzzle is automatically tracked and displayed in the sidebar and profile page.

## 🔮 Roadmap

- [x] User authentication (Supabase)
- [x] Profile management with photo upload
- [x] Task completion tracking
- [x] Canvas persistence (localStorage)
- [x] Undo/Redo functionality
- [x] Enhanced grading feedback with suggestions
- [x] Mobile touch support
- [x] Performance optimizations (code splitting)
- [ ] Real AI integration for grading and discussion
- [ ] Cloud diagram saving
- [ ] Export to Terraform/CloudFormation
- [ ] Community features

## 📚 Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Supabase (authentication & database)
- react-easy-crop (photo cropping)

**Backend:**
- FastAPI
- Python 3.13+
- Pydantic (validation)
- Pytest (testing)

**Database & Auth:**
- Supabase (PostgreSQL database, authentication, storage)

**Hosting:**
- Cloudflare Pages / Vercel / Railway (frontend)
- Railway / Render / Fly.io (backend)
- Supabase Cloud (database & auth)

## 🤝 Contributing

Pull requests welcome! To contribute:

1. Fork the repo
2. Create a feature branch
3. Add tests for new functionality
4. Update CHANGELOG.md
5. Submit a pull request

**Adding a new puzzle?** Check out [ADDING_PUZZLES.md](ADDING_PUZZLES.md) for a step-by-step guide on creating puzzles with error validation rules.

## 📝 License

MIT - see LICENSE file

## 👤 Author

Built by [Your Name] ([@yourhandle](https://twitter.com/yourhandle))

- GitHub: [@yourusername](https://github.com/yourusername)
- Twitter: [@yourhandle](https://twitter.com/yourhandle)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)

## 🚀 Deployment

ArchLab can be deployed to various platforms. See deployment guide:

- **[DEPLOYMENT_SETUP.md](./DEPLOYMENT_SETUP.md)** - Quick setup guide for Railway/Cloudflare

**Recommended**: Railway (full stack) or Cloudflare Pages + Railway (separate services)

**Cost**: $5-20/month depending on platform and traffic

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for pre-deployment testing checklist.

**Before deploying, run**: `make check` to verify everything is ready.

## 📬 Support

- Open an issue on GitHub for bugs
- Discussions for feature requests
- Email: your-email@example.com

---

**Built with ❤️ for the AWS community. Free, open source, and always improving.**