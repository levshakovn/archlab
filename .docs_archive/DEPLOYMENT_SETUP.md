# Quick Deployment Setup Guide

## 🚀 Fastest Path: Railway (Full Stack)

### 1. Backend Setup (5 minutes)

1. Go to https://railway.app
2. Sign up with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Select your repository
5. **Add Service** → **GitHub Repo** (select same repo)
6. In service settings:
   - **Root Directory**: `backend`
   - **Build Command**: (leave empty, Railway auto-detects)
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Go to **Variables** tab, add:
   ```
   ENVIRONMENT=production
   LOG_LEVEL=INFO
   CORS_ORIGINS=https://your-frontend-url.railway.app
   ```
8. Copy the **Public URL** (e.g., `https://archlab-backend.railway.app`)

### 2. Frontend Setup (5 minutes)

1. In the same Railway project, **Add Service** again
2. **GitHub Repo** (select same repo)
3. In service settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s dist -l $PORT`
4. Go to **Variables** tab, add:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-key
   ```
5. Copy the **Public URL** (e.g., `https://archlab-frontend.railway.app`)

### 3. Update CORS

1. Go back to backend service
2. **Variables** → Update `CORS_ORIGINS` with frontend URL
3. Service will auto-restart

### 4. Test

- Frontend: `https://your-frontend-url.railway.app`
- Backend health: `https://your-backend-url.railway.app/health`

**Done!** 🎉

---

## 🌐 Alternative: Cloudflare Pages + Railway

### Backend (Railway) - Same as above

### Frontend (Cloudflare Pages)

1. Go to https://dash.cloudflare.com
2. **Pages** → **Create a project** → **Connect to Git**
3. Select your GitHub repository
4. **Build settings**:
   - Framework preset: `Vite`
   - Build command: `cd frontend && npm run build`
   - Build output directory: `frontend/dist`
   - Root directory: `/`
5. **Environment variables**:
   ```
   VITE_API_URL=https://your-backend.railway.app
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-key
   ```
6. **Save and Deploy**

**Done!** 🎉

---

## 🔐 Required GitHub Secrets (for CI/CD)

If using GitHub Actions workflows, add these secrets:

1. **Railway**:
   - `RAILWAY_TOKEN` - Get from Railway → Account → Tokens

2. **Cloudflare** (if using):
   - `CLOUDFLARE_API_TOKEN` - Get from Cloudflare → My Profile → API Tokens
   - `CLOUDFLARE_ACCOUNT_ID` - Get from Cloudflare dashboard URL

3. **Environment Variables**:
   - `VITE_API_URL` - Your backend URL
   - `VITE_SUPABASE_URL` - Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

---

## 📝 Post-Deployment Checklist

- [ ] Backend health check works: `/health`
- [ ] Frontend loads
- [ ] Can make API calls (test grading)
- [ ] Supabase auth works (test login)
- [ ] CORS configured correctly
- [ ] HTTPS enabled (automatic)
- [ ] Custom domain (optional)

---

## 🆘 Common Issues

**Backend won't start:**
- Check `PORT` is set (Railway sets this automatically)
- Check Python version (should be 3.13)
- Check logs in Railway dashboard

**Frontend can't connect:**
- Verify `VITE_API_URL` is correct
- Check CORS includes frontend URL
- Check backend is running

**Build fails:**
- Check Node.js version (should be 18+)
- Check all dependencies in `package.json`
- Check build logs for specific errors

---

## 💰 Cost Estimate

- **Railway**: $5/month per service (2 services = $10/month)
- **Cloudflare Pages**: Free
- **Total**: $5-10/month

---

For more deployment options and detailed comparisons, see the deployment guides in the repository.
