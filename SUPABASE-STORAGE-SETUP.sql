-- ===================================================================
-- SUPABASE STORAGE BUCKET SETUP
-- Run this in Supabase SQL Editor to create the media storage bucket
-- ===================================================================

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies to allow public read and admin write
-- This allows anyone to view media but only authenticated admins can upload/delete

-- Policy: Allow public to READ media files
CREATE POLICY "Public Access to Media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Policy: Allow authenticated users to UPLOAD media files
CREATE POLICY "Authenticated Upload to Media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Policy: Allow authenticated users to UPDATE their media files
CREATE POLICY "Authenticated Update Media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media');

-- Policy: Allow authenticated users to DELETE their media files
CREATE POLICY "Authenticated Delete Media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');

-- Verify bucket creation
SELECT * FROM storage.buckets WHERE id = 'media';
