# Database Setup Instructions

This directory contains SQL scripts to set up the Supabase database for ArchLab authentication and user profiles.

## Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Wait for the project to be initialized (2-3 minutes)

### 2. Get API Credentials
1. Go to **Settings** > **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbG...` (long string)

### 3. Set Environment Variables
1. In `frontend/` directory, create a `.env` file (copy from `.env.example`)
2. Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. **Important**: Never commit `.env` file to git (it's already in `.gitignore`)

### 4. Run Database Setup SQL
1. In Supabase Dashboard, go to **SQL Editor**
2. Open `database/setup.sql`
3. Copy the entire contents and paste into SQL Editor
4. Click **Run** to execute
5. Verify success - you should see "Success. No rows returned"

### 5. Create Storage Bucket
1. In Supabase Dashboard, go to **Storage**
2. Click **Create new bucket**
3. Configure:
   - **Name**: `profile-photos`
   - **Public bucket**: ✅ Checked (or use private with RLS)
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `image/*`
4. Click **Create bucket**

### 6. Run Storage Setup SQL
1. In Supabase Dashboard, go to **SQL Editor**
2. Open `database/storage_setup.sql`
3. Copy the entire contents and paste into SQL Editor
4. Click **Run** to execute
5. Verify success - you should see "Success. No rows returned"

## Verification

### Verify Profiles Table
1. Go to **Table Editor** in Supabase Dashboard
2. You should see a `profiles` table
3. Check columns: `id`, `email`, `first_name`, `last_name`, `profile_photo_url`, `created_at`, `updated_at`

### Verify Storage Bucket
1. Go to **Storage** in Supabase Dashboard
2. You should see `profile-photos` bucket
3. Click on it to verify it's accessible

### Verify Policies
1. Go to **Authentication** > **Policies** in Supabase Dashboard
2. You should see policies for `profiles` table:
   - Users can view own profile
   - Users can update own profile
   - Users can insert own profile

## What Was Created

### Database Schema
- **profiles** table - Stores user profile information
  - Extends `auth.users` (Supabase's built-in auth table)
  - Has RLS (Row Level Security) enabled
  - Auto-creates profile when user signs up

### Storage
- **profile-photos** bucket - Stores user profile photos
  - Public access for photos
  - Users can only upload/update/delete their own photos

### Triggers
- **on_auth_user_created** - Automatically creates profile when user signs up
- **set_updated_at** - Automatically updates `updated_at` timestamp

### Functions
- **handle_new_user()** - Creates profile from auth user data
- **handle_updated_at()** - Updates timestamp on profile updates

## Troubleshooting

### Error: "relation profiles does not exist"
- Make sure you ran `setup.sql` successfully
- Check that you're connected to the correct project

### Error: "bucket profile-photos does not exist"
- Make sure you created the storage bucket manually first
- Then run `storage_setup.sql` for policies

### Environment Variables Not Working
- Restart your dev server after creating/updating `.env` file
- Make sure variable names start with `VITE_` for Vite to pick them up
- Check that `.env` file is in `frontend/` directory

## Next Steps

After completing this setup:
1. ✅ Phase 1 & 2 complete
2. → Continue with Phase 3: Authentication Context
3. → Phase 4: Authentication UI
4. → Phase 5: Protected Routes
5. → Phase 6: Profile Management
6. → Phase 7: Google OAuth Setup
