# Google OAuth Implementation Plan

## 📋 Current Status

### ✅ Already Implemented
- Frontend `signInWithGoogle()` function in `AuthContext.tsx`
- Google sign-in buttons in `LoginModal.tsx` and `SignUpModal.tsx`
- OAuth callback handler in `AuthCallback.tsx`
- Route setup for `/auth/callback` in `App.tsx`
- Analytics tracking for Google sign-ins
- Database trigger to auto-create profiles on user signup

### ⚠️ Needs Configuration/Completion
- Supabase Google OAuth provider configuration
- Profile creation for Google OAuth users (metadata handling)
- Error handling improvements
- Testing and verification

---

## 🎯 Implementation Steps

### Phase 1: Supabase Configuration (Required)

#### Step 1.1: Enable Google Provider in Supabase
1. **Go to Supabase Dashboard**
   - Navigate to: Authentication → Providers
   - Find "Google" in the list

2. **Enable Google Provider**
   - Toggle "Enable Google provider" to ON
   - Click "Save"

3. **Configure Google OAuth Credentials**
   - You'll need to create OAuth credentials in Google Cloud Console first (see Step 1.2)
   - Enter:
     - **Client ID (for OAuth)**: Your Google OAuth Client ID
     - **Client Secret (for OAuth)**: Your Google OAuth Client Secret

4. **Set Redirect URL**
   - Supabase will provide a redirect URL like: `https://your-project.supabase.co/auth/v1/callback`
   - You'll need to add this to Google Cloud Console (see Step 1.2)

#### Step 1.2: Google Cloud Console Setup
1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select or create a project

2. **Enable Google+ API** (if needed)
   - Navigate to: APIs & Services → Library
   - Search for "Google+ API" or "People API"
   - Enable it

3. **Create OAuth 2.0 Credentials**
   - Navigate to: APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: "ArchLab" (or your project name)

4. **Configure Authorized Redirect URIs**
   - Add your Supabase redirect URL:
     ```
     https://your-project-id.supabase.co/auth/v1/callback
     ```
   - For local development, also add:
     ```
     http://localhost:5173/auth/callback
     http://localhost:3000/auth/callback
     ```
   - For production, add your production URL:
     ```
     https://yourdomain.com/auth/callback
     ```

5. **Get Credentials**
   - Copy the **Client ID** and **Client Secret**
   - Paste them into Supabase Dashboard (Step 1.1)

---

### Phase 2: Code Improvements

#### Step 2.1: Enhance Profile Creation for Google OAuth
**File**: `frontend/src/contexts/AuthContext.tsx`

**Issue**: Google OAuth users might not have `first_name` and `last_name` in metadata initially.

**Solution**: Update `loadProfile` to handle Google OAuth metadata and create profile if missing.

```typescript
// In loadProfile function, add fallback for Google OAuth users
const loadProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist - create it
      // This can happen with Google OAuth if trigger didn't fire
      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user) {
        const user = userData.user
        const metadata = user.user_metadata || {}
        
        // Create profile with Google OAuth data
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            first_name: metadata.first_name || metadata.full_name?.split(' ')[0] || null,
            last_name: metadata.last_name || metadata.full_name?.split(' ').slice(1).join(' ') || null,
            profile_photo_url: metadata.avatar_url || metadata.picture || null,
          })
        
        if (!insertError) {
          // Reload profile
          return loadProfile(userId)
        }
      }
    }
    
    // ... rest of existing code
  }
}
```

#### Step 2.2: Improve OAuth Callback Handling
**File**: `frontend/src/components/auth/AuthCallback.tsx`

**Enhancements**:
- Better error messages
- Handle profile creation if needed
- Extract user metadata from Google

```typescript
// Update handleAuthCallback to ensure profile exists
const handleAuthCallback = async () => {
  try {
    // ... existing code ...
    
    if (data.session) {
      // Ensure profile exists (for Google OAuth users)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.session.user.id)
        .single()
      
      if (!profileData) {
        // Profile missing - create it
        const user = data.session.user
        const metadata = user.user_metadata || {}
        
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email || '',
          first_name: metadata.first_name || metadata.full_name?.split(' ')[0] || null,
          last_name: metadata.last_name || metadata.full_name?.split(' ').slice(1).join(' ') || null,
          profile_photo_url: metadata.avatar_url || metadata.picture || null,
        })
      }
      
      // Track and redirect
      analytics.trackUserSignedIn('google')
      navigate('/profile')
    }
  }
}
```

#### Step 2.3: Enhance Google Sign-In with Metadata
**File**: `frontend/src/contexts/AuthContext.tsx`

**Enhancement**: Request additional scopes to get user profile data.

```typescript
const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      scopes: 'email profile', // Request email and profile info
    },
  })
  if (error) throw error
}
```

#### Step 2.4: Add Error Handling for OAuth Failures
**File**: `frontend/src/components/auth/AuthCallback.tsx`

**Enhancement**: Better error handling and user feedback.

```typescript
// Check for error in URL params
const errorParam = searchParams.get('error')
const errorDescription = searchParams.get('error_description')

if (errorParam) {
  console.error('OAuth error:', errorParam, errorDescription)
  navigate(`/?error=oauth_${errorParam}`)
  return
}
```

---

### Phase 3: Database Enhancements

#### Step 3.1: Update Profile Creation Trigger
**File**: `database/setup.sql` (or run in Supabase SQL Editor)

**Enhancement**: Handle Google OAuth metadata better.

```sql
-- Update the trigger function to handle Google OAuth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, profile_photo_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'first_name',
      SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1),
      ''
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'last_name',
      CASE 
        WHEN NEW.raw_user_meta_data->>'full_name' IS NOT NULL 
        THEN SUBSTRING(NEW.raw_user_meta_data->>'full_name' FROM POSITION(' ' IN NEW.raw_user_meta_data->>'full_name') + 1)
        ELSE ''
      END,
      ''
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      NULL
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### Phase 4: Testing & Verification

#### Step 4.1: Local Testing Checklist
- [ ] Test Google sign-in button in LoginModal
- [ ] Test Google sign-in button in SignUpModal
- [ ] Verify redirect to Google OAuth page
- [ ] Verify callback redirects to `/auth/callback`
- [ ] Verify user is authenticated after callback
- [ ] Verify profile is created with correct data
- [ ] Verify profile photo is set (if available from Google)
- [ ] Test error handling (cancel OAuth, invalid credentials)
- [ ] Test existing user sign-in (user already has account)

#### Step 4.2: Production Testing
- [ ] Test with production Supabase project
- [ ] Verify production redirect URLs are configured
- [ ] Test on mobile devices
- [ ] Verify analytics tracking works
- [ ] Test profile photo display from Google

#### Step 4.3: Edge Cases
- [ ] User cancels Google OAuth flow
- [ ] User denies permissions
- [ ] Network error during OAuth
- [ ] User already exists with email (should link accounts or show error)
- [ ] Profile creation fails (fallback handling)

---

### Phase 5: Documentation & Deployment

#### Step 5.1: Environment Variables
**File**: `.env.example` or `README.md`

Add documentation for required environment variables:
```bash
# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Note: Google OAuth is configured in Supabase Dashboard
# No additional env vars needed for Google OAuth
```

#### Step 5.2: Update README
- Add Google OAuth setup instructions
- Document Supabase configuration steps
- Add troubleshooting section

#### Step 5.3: Deployment Checklist
- [ ] Configure Google OAuth in production Supabase project
- [ ] Add production redirect URLs to Google Cloud Console
- [ ] Test OAuth flow in production
- [ ] Verify profile creation works
- [ ] Monitor for errors in production

---

## 🔧 Implementation Order

### Priority 1: Essential (Must Have)
1. ✅ Supabase Google Provider Configuration (Step 1.1-1.2)
2. ✅ Profile Creation Enhancement (Step 2.1)
3. ✅ OAuth Callback Improvements (Step 2.2)

### Priority 2: Important (Should Have)
4. ✅ Enhanced Error Handling (Step 2.4)
5. ✅ Database Trigger Update (Step 3.1)
6. ✅ Testing (Step 4.1-4.3)

### Priority 3: Nice to Have
7. ✅ Metadata Scopes (Step 2.3)
8. ✅ Documentation Updates (Step 5.1-5.2)

---

## 📝 Code Changes Summary

### Files to Modify:
1. `frontend/src/contexts/AuthContext.tsx` - Enhance profile creation
2. `frontend/src/components/auth/AuthCallback.tsx` - Better error handling
3. `database/setup.sql` - Update trigger function (run in Supabase)

### Files to Review (No Changes Needed):
- `frontend/src/components/auth/LoginModal.tsx` - Already has Google button
- `frontend/src/components/auth/SignUpModal.tsx` - Already has Google button
- `frontend/src/App.tsx` - Route already configured

---

## 🚨 Common Issues & Solutions

### Issue 1: "Redirect URI mismatch"
**Solution**: Ensure redirect URLs match exactly in both Google Cloud Console and Supabase

### Issue 2: Profile not created for Google OAuth users
**Solution**: Implement Step 2.1 and Step 3.1 (profile creation fallback)

### Issue 3: Missing user metadata (name, photo)
**Solution**: Ensure scopes are requested (Step 2.3) and trigger handles metadata (Step 3.1)

### Issue 4: User already exists error
**Solution**: Handle account linking or show clear error message

---

## ✅ Success Criteria

- [ ] Users can sign in with Google OAuth
- [ ] Profile is automatically created with correct data
- [ ] User metadata (name, photo) is extracted from Google
- [ ] OAuth callback works correctly
- [ ] Error handling provides clear feedback
- [ ] Works in both development and production
- [ ] Analytics tracking works for Google sign-ins

---

## 📚 Resources

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Helpers](https://supabase.com/docs/reference/javascript/auth-signinwithoauth)

---

**Estimated Time**: 2-4 hours (including testing and configuration)

**Difficulty**: Medium (mostly configuration and edge case handling)
