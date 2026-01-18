-- =====================================================
-- Supabase Storage Setup for Profile Photos
-- =====================================================
-- Run this script in Supabase Dashboard > SQL Editor
-- After creating the storage bucket manually in the Dashboard
-- =====================================================

-- Note: First create the bucket manually in Supabase Dashboard:
-- 1. Go to Storage > Create new bucket
-- 2. Name: profile-photos
-- 3. Public: true (or use RLS policies below for private)
-- 4. File size limit: 5MB (recommended)
-- 5. Allowed MIME types: image/*

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can upload own photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photo" ON storage.objects;
DROP POLICY IF EXISTS "Public can view photos" ON storage.objects;

-- Policy: Users can upload their own photos
-- Photo file name format: {user_id}.{extension} (e.g., abc123-uuid.jpg)
-- Files are stored in bucket root, so we check if filename starts with user ID
CREATE POLICY "Users can upload own photo"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] IS NULL AND
  (name)::text LIKE auth.uid()::text || '.%'
);

-- Policy: Users can update their own photos
CREATE POLICY "Users can update own photo"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] IS NULL AND
  (name)::text LIKE auth.uid()::text || '.%'
);

-- Policy: Users can delete their own photos
CREATE POLICY "Users can delete own photo"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] IS NULL AND
  (name)::text LIKE auth.uid()::text || '.%'
);

-- Policy: Public can view photos (if bucket is public)
-- If you want private photos, remove this policy and make bucket private
CREATE POLICY "Public can view photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profile-photos');
