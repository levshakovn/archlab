# Testing Guide - ArchLab

## 🧪 Testing Checklist

Use this guide to thoroughly test ArchLab before deployment.

## 🤖 Automated Tests

Run automated checks before manual testing:

```bash
./scripts/run-tests.sh
```

This includes frontend type checks, linting, production build, and backend pytest coverage (including grading service tests).

### End-to-End (Playwright)

```bash
cd frontend
npm run test:e2e:install
npm run test:e2e
```

---

## ✅ Core Functionality Testing

### 1. Puzzle Selection
- [ ] **Puzzle dropdown loads**: All 20 puzzles appear in selector
- [ ] **Puzzle switching**: Clicking different puzzles switches content correctly
- [ ] **Puzzle state persists**: Switching puzzles maintains canvas state (localStorage)
- [ ] **Puzzle requirements**: Each puzzle shows correct scenario and requirements

**Test Steps**:
1. Navigate to `/workspace`
2. Select puzzle from dropdown
3. Verify scenario, requirements, and allowed services update
4. Switch to another puzzle
5. Verify previous puzzle's canvas state is saved

---

### 2. Canvas Operations

#### Adding Services
- [ ] **Drag from sidebar**: Can drag services from sidebar onto canvas
- [ ] **Service appears**: Dropped service appears at correct position
- [ ] **Touch support**: Can add services via touch on mobile devices
- [ ] **Multiple services**: Can add multiple services of same type

**Test Steps**:
1. Drag a service (e.g., "S3") from sidebar to canvas
2. Verify service appears as a node
3. Repeat with different services
4. Test on mobile/touch device if available

#### Moving Services
- [ ] **Mouse drag**: Can drag nodes with mouse
- [ ] **Touch drag**: Can drag nodes with touch (mobile)
- [ ] **Position persists**: Node positions save to localStorage
- [ ] **Undo works**: After moving, undo restores position

**Test Steps**:
1. Add a service to canvas
2. Drag it to different position
3. Refresh page - position should persist
4. Use undo (Ctrl+Z) to restore previous position

#### Deleting Services
- [ ] **Delete button**: × button appears on hover
- [ ] **Delete works**: Clicking × removes service
- [ ] **Connections removed**: Deleting service removes its connections
- [ ] **Undo works**: Can undo deletion

**Test Steps**:
1. Add a service
2. Hover over it - verify × button appears
3. Click × - service should be removed
4. Use undo (Ctrl+Z) - service should return

#### Creating Connections
- [ ] **Connection handle**: Appears on hover when not connecting
- [ ] **Start connection**: Clicking handle starts connection mode
- [ ] **Preview line**: Preview line follows mouse/touch
- [ ] **Complete connection**: Clicking another service creates connection
- [ ] **Cancel connection**: Clicking canvas or Cancel button cancels
- [ ] **Touch support**: Can create connections via touch

**Test Steps**:
1. Add two services (e.g., CloudFront and S3)
2. Hover over CloudFront - verify connection handle appears
3. Click handle - verify connection mode starts (preview line appears)
4. Click S3 - connection should be created
5. Test canceling by clicking canvas

#### Deleting Connections
- [ ] **Hover to reveal**: Hovering over connection shows delete button
- [ ] **Delete works**: Clicking × or connection line removes connection
- [ ] **Undo works**: Can undo connection deletion

**Test Steps**:
1. Create a connection between two services
2. Hover over connection line
3. Click × button or connection line - connection should be removed
4. Use undo to restore it

---

### 3. Canvas Persistence
- [ ] **Auto-save**: Changes save to localStorage automatically
- [ ] **Page refresh**: Canvas state persists after refresh
- [ ] **Puzzle switching**: Each puzzle has separate saved state
- [ ] **Clear works**: Clear button removes saved state

**Test Steps**:
1. Create a diagram with 3+ services and connections
2. Refresh page (F5)
3. Verify diagram is restored
4. Switch to different puzzle
5. Switch back - original diagram should be restored
6. Click Clear - verify saved state is removed

---

### 4. Grading System
- [ ] **Grade button**: "Grade Solution" button works
- [ ] **Empty canvas**: Grading empty canvas shows error
- [ ] **Loading state**: Shows loading indicator during grading
- [ ] **Results display**: Result panel shows scores and feedback
- [ ] **Score calculation**: Scores are reasonable (0-100%)
- [ ] **Feedback messages**: Feedback includes suggestions and links
- [ ] **Links work**: Clickable AWS documentation links open correctly

**Test Steps**:
1. Create a diagram for a puzzle
2. Click "Grade Solution"
3. Verify loading indicator appears
4. Verify result panel shows:
   - Scores (Correctness, Reliability, Security, Cost, Total)
   - Requirements checklist
   - Feedback with suggestions
   - Clickable AWS docs links
5. Test with empty canvas - should show error
6. Test with incomplete diagram - should show helpful feedback

---

### 5. Undo/Redo
- [ ] **Undo button**: Undo button appears and works
- [ ] **Redo button**: Redo button appears and works
- [ ] **Keyboard shortcuts**: Ctrl+Z (undo) and Ctrl+Shift+Z (redo) work
- [ ] **Button states**: Buttons disabled when no history
- [ ] **Operations tracked**: Add, delete, clear operations create history

**Test Steps**:
1. Add a service - verify undo button becomes enabled
2. Click undo - service should be removed
3. Click redo - service should return
4. Test keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
5. Test undo/redo for:
   - Adding services
   - Deleting services
   - Adding connections
   - Deleting connections
   - Clearing canvas

---

## 🔐 Authentication Testing

### 6. Sign Up / Sign In
- [ ] **Email sign up**: Can create account with email/password
- [ ] **Email sign in**: Can sign in with email/password
- [ ] **Google OAuth**: Can sign in with Google (if configured)
- [ ] **Error handling**: Invalid credentials show error messages
- [ ] **Success redirect**: Successful login redirects appropriately

**Test Steps**:
1. Click Sign Up
2. Create account with email/password
3. Sign out
4. Sign in with same credentials
5. Test Google OAuth (if configured)
6. Test invalid credentials - verify error message

---

### 7. Profile Management
- [ ] **Profile page loads**: Can access profile page
- [ ] **Photo upload**: Can upload profile photo
- [ ] **Photo crop**: Can crop uploaded photo
- [ ] **Password change**: Can change password
- [ ] **Completion history**: Shows puzzle completion history
- [ ] **Best scores**: Displays best scores correctly

**Test Steps**:
1. Sign in
2. Navigate to Profile page
3. Upload a profile photo
4. Crop photo and save
5. Change password
6. Complete a puzzle with score
7. Verify completion appears in history with correct score

---

### 8. Completion Tracking
- [ ] **Saves on grade**: Completion saves after grading (authenticated users)
- [ ] **Best score tracking**: Best score updates when new score is higher
- [ ] **Score indicators**: Color indicators show in puzzle selector (green/yellow/red)
- [ ] **Profile history**: Profile page shows all completions

**Test Steps**:
1. Sign in
2. Complete a puzzle with 85% score
3. Verify completion saved (check profile page)
4. Complete same puzzle with 95% score
5. Verify best score updated to 95%
6. Verify color indicator in puzzle selector
7. Check profile page for completion history

---

## 📱 Mobile Testing

### 9. Mobile Responsiveness
- [ ] **Touch interactions**: Can drag nodes with touch
- [ ] **Touch connections**: Can create connections with touch
- [ ] **Responsive layout**: Layout adapts to mobile screens
- [ ] **Button sizes**: Buttons are touch-friendly (44x44px minimum)
- [ ] **Scrolling**: Canvas scrolls correctly on mobile
- [ ] **Sidebar**: Sidebar accessible on mobile

**Test Steps**:
1. Open on mobile device or browser dev tools (mobile view)
2. Test dragging nodes with touch
3. Test creating connections with touch
4. Verify layout doesn't break
5. Test all interactive elements

---

## 🌐 Browser Compatibility

### 10. Cross-Browser Testing
- [ ] **Chrome**: All features work in Chrome
- [ ] **Firefox**: All features work in Firefox
- [ ] **Safari**: All features work in Safari
- [ ] **Edge**: All features work in Edge
- [ ] **Mobile Safari**: Works on iOS Safari
- [ ] **Mobile Chrome**: Works on Android Chrome

**Test Steps**:
1. Test in each browser:
   - Canvas interactions
   - Grading
   - Authentication
   - Profile management
2. Verify no console errors
3. Check for visual issues

---

## 🐛 Error Handling Testing

### 11. Error Scenarios
- [ ] **Offline mode**: Offline banner appears when offline
- [ ] **Network errors**: Network errors show friendly messages
- [ ] **Invalid input**: Validation errors show helpful messages
- [ ] **Empty states**: Empty canvas shows helpful message
- [ ] **Error boundary**: React errors are caught gracefully

**Test Steps**:
1. Disconnect network - verify offline banner
2. Trigger network error - verify error message
3. Try grading empty canvas - verify validation error
4. Cause an error - verify error boundary catches it

---

## ⚡ Performance Testing

### 12. Performance Checks
- [ ] **Initial load**: Page loads in < 3 seconds
- [ ] **Puzzle loading**: Puzzles load quickly
- [ ] **Large diagrams**: Can handle 10+ services without lag
- [ ] **Code splitting**: Routes load on-demand (check Network tab)
- [ ] **Bundle size**: Initial bundle is reasonable (< 500KB)

**Test Steps**:
1. Open DevTools → Network tab
2. Reload page - check load time
3. Navigate to `/workspace` - verify lazy loading
4. Create diagram with 10+ services
5. Verify no performance issues
6. Check bundle sizes in Network tab

---

## 🔍 Edge Cases

### 13. Edge Case Testing
- [ ] **Rapid clicking**: Can't break UI with rapid clicks
- [ ] **Multiple undo/redo**: Undo/redo works repeatedly
- [ ] **Long puzzle names**: Long service/puzzle names display correctly
- [ ] **Many connections**: Can create many connections without issues
- [ ] **Clear during connection**: Can clear while in connection mode

**Test Steps**:
1. Rapidly click buttons - verify no crashes
2. Undo 10+ times - verify works correctly
3. Use puzzles/services with long names
4. Create 10+ connections
5. Start connection, then click Clear

---

## 📊 Analytics Testing

### 14. Analytics (If Brick Configured)
- [ ] **Events tracked**: Puzzle selection tracked
- [ ] **Events tracked**: Grading tracked
- [ ] **Events tracked**: Auth events tracked
- [ ] **Page views**: Page views tracked on navigation

**Test Steps**:
1. If Brick configured, check Brick dashboard
2. Perform actions (select puzzle, grade, sign in)
3. Verify events appear in Brick analytics

---

## ✅ Post-Testing Checklist

After completing all tests:

- [ ] **All critical features work**: Core functionality verified
- [ ] **No console errors**: Check browser console for errors
- [ ] **No visual bugs**: UI looks correct on all browsers
- [ ] **Performance acceptable**: Load times and interactions are smooth
- [ ] **Mobile works**: Touch interactions function correctly
- [ ] **Documentation updated**: README and guides are current

---

## 🐛 Known Issues (If Any)

Document any issues found during testing:

1. **[Issue description]**
   - Steps to reproduce:
   - Expected behavior:
   - Actual behavior:

---

## 📝 Testing Results

**Date**: [Date]
**Tester**: [Your name]
**Environment**: [Browser/OS/Device]
**Overall Status**: ✅ Ready / ⚠️ Issues Found / ❌ Not Ready

**Summary**: [Brief summary of testing results]

---

## 🚀 Ready for Deployment?

After completing this checklist:

- ✅ All critical tests pass
- ✅ No blocking bugs found
- ✅ Performance is acceptable
- ✅ Documentation is updated

**If yes, proceed with deployment!**
