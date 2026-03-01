# Final Pre-Deployment Checks

Quick checklist to verify everything is ready before deployment.

## 🚀 Quick Commands

```bash
# Run all tests
make test

# Run pre-deployment verification
make check

# Or run directly
./scripts/pre-deployment-check.sh

# Run all tests with script
./scripts/run-tests.sh
```

---

## ✅ Essential Checks

### 1. Code Quality
- [ ] **Type checking**: `cd frontend && npx tsc --noEmit` (no errors)
- [ ] **Linting**: `cd frontend && npm run lint` (no errors)
- [ ] **Backend linting**: `cd backend && flake8 app tests` (no errors)
- [ ] **Build**: `cd frontend && npm run build` (builds successfully)

### 2. Tests
- [ ] **Backend tests**: `cd backend && pytest` (all pass)
- [ ] **Frontend build**: `cd frontend && npm run build` (succeeds)
- [ ] **Type check**: No TypeScript errors

### 3. Environment Variables
- [ ] **Supabase configured**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set
- [ ] **Brick configured** (optional): `VITE_BRICK_SCRIPT_URL` set if using analytics
- [ ] **API URL** (optional): `VITE_API_URL` set if using backend API

### 4. Documentation
- [ ] **README.md**: Up to date with current features
- [ ] **TESTING_GUIDE.md**: Created for testing
- [ ] **DEPLOYMENT_SETUP.md**: Deployment instructions ready

### 5. Features Verification
- [ ] **Canvas persistence**: Works (create diagram, refresh, should persist)
- [ ] **Undo/Redo**: Works (Ctrl+Z, Ctrl+Shift+Z)
- [ ] **Touch support**: Mobile interactions work (if testing mobile)
- [ ] **Grading**: Shows feedback with suggestions
- [ ] **Authentication**: Sign up/sign in works
- [ ] **Profile**: Profile page works

### 6. Performance
- [ ] **Build size**: Production build is reasonable (< 1MB)
- [ ] **Load time**: Initial load is acceptable (< 3 seconds)
- [ ] **Code splitting**: Routes load on-demand (check Network tab)

### 7. Security
- [ ] **No secrets**: No API keys or secrets committed to git
- [ ] **Environment variables**: All secrets in environment variables
- [ ] **CORS**: Backend CORS configured correctly

---

## 🐛 Common Issues to Check

### Frontend Issues
- ❌ TypeScript errors → Fix type errors
- ❌ Linting errors → Fix linting issues
- ❌ Build fails → Check for syntax errors
- ⚠️ Console.log statements → Remove or comment for production
- ⚠️ reactflow dependency → Remove if unused (`npm uninstall reactflow`)

### Backend Issues
- ❌ Tests fail → Fix failing tests
- ❌ Linting errors → Fix code style issues
- ❌ Import errors → Check dependencies

### Configuration Issues
- ❌ Missing environment variables → Set in production environment
- ❌ CORS errors → Update CORS_ORIGINS in backend config
- ❌ Database not configured → Run database setup scripts

---

## 📝 Quick Test Checklist

Run these manually to verify:

1. **Puzzle selection**: Select different puzzles - content updates ✓
2. **Add services**: Drag services to canvas - services appear ✓
3. **Move services**: Drag nodes - positions update ✓
4. **Create connections**: Connect two services - connection appears ✓
5. **Delete services**: Click × on service - service removed ✓
6. **Undo/Redo**: Test Ctrl+Z and Ctrl+Shift+Z - works ✓
7. **Canvas persistence**: Create diagram, refresh page - persists ✓
8. **Grading**: Click "Grade Solution" - feedback appears ✓
9. **Clear**: Click "Clear" - canvas cleared ✓
10. **Sign in**: Test authentication - works ✓

---

## 🎯 Deployment Readiness

After completing all checks:

✅ **Ready if**:
- All tests pass
- No blocking errors in pre-deployment check
- Environment variables configured
- Documentation updated

⚠️ **Review warnings**:
- Some warnings are acceptable (e.g., console.log in development)
- TODO/FIXME comments are okay if documented
- Optional features can be missing

❌ **Not ready if**:
- Tests failing
- Build errors
- Missing critical environment variables
- Type errors

---

## 🚀 Final Steps Before Deployment

1. **Run pre-deployment check**: `make check`
2. **Run all tests**: `make test`
3. **Review TESTING_GUIDE.md**: Manual testing checklist
4. **Check environment variables**: Verify all required vars set
5. **Deploy**: Follow DEPLOYMENT_SETUP.md

---

**Last Updated**: After adding test scripts and final checks
