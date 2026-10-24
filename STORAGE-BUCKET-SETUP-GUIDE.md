# Supabase Storage Bucket Setup Guide

## Problem
You're getting "bucket not found" error when uploading media because the Supabase storage bucket hasn't been created yet.

## Solution - Create the Storage Bucket

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase project**: https://supabase.com/dashboard
2. **Select your project**: `kksliorolwzbawfaqcaf`
3. **Click on "Storage"** in the left sidebar
4. **Click "Create a new bucket"**
5. **Enter bucket details:**
   - **Name**: `media`
   - **Public bucket**: ✅ **YES** (check this box)
   - **File size limit**: 100 MB
   - **Allowed MIME types**: Leave empty (allow all)
6. **Click "Create bucket"**

### Option 2: Using SQL Editor

1. Go to **SQL Editor** in your Supabase dashboard
2. Create a **New Query**
3. Copy and paste the contents of `SUPABASE-STORAGE-SETUP.sql`
4. Click **Run** or press `Ctrl+Enter`

### Option 3: Manual Policies Setup

If you created the bucket manually, you need to add these policies:

1. Go to **Storage** → **Policies**
2. Click **New Policy** for each of these:

**Policy 1: Public Read**
- Policy name: `Public Access to Media`
- Allowed operation: `SELECT`
- Target roles: `public`
- USING expression: `bucket_id = 'media'`

**Policy 2: Authenticated Upload**
- Policy name: `Authenticated Upload to Media`  
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- WITH CHECK expression: `bucket_id = 'media'`

**Policy 3: Authenticated Update**
- Policy name: `Authenticated Update Media`
- Allowed operation: `UPDATE`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'media'`

**Policy 4: Authenticated Delete**
- Policy name: `Authenticated Delete Media`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'media'`

## Verification

After creating the bucket, verify it's working:

1. Go to **Storage** in Supabase dashboard
2. You should see the `media` bucket
3. Try uploading a test file manually
4. Check if you can view the file

## Folder Structure

The bucket will automatically create these folders when you upload:
- `photos/` - All uploaded photos
- `videos/` - All uploaded videos  
- `musics/` - All uploaded music files

## Environment Variables

Make sure your `.env` file has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://kksliorolwzbawfaqcaf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc2xpb3JvbHd6YmF3ZmFxY2FmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTgwMDkzOCwiZXhwIjoyMTA3Mzc2OTM4fQ.80DDzd4iDcreb6RQ_YTK7EB5VwaC-sFtMdZdxdxf3cA
```

## Testing Upload

After setup:
1. Deploy your changes (they're already pushed to GitHub)
2. Wait for deployment to complete
3. Log in to admin dashboard
4. Try uploading a photo/video/music
5. Should work without errors! ✅

## Troubleshooting

**Still getting "bucket not found"?**
- Refresh your Supabase dashboard
- Check if bucket name is exactly `media` (lowercase)
- Verify your service role key is correct in `.env`
- Redeploy your app after creating the bucket

**"Unauthorized" error?**
- Check that policies are created
- Verify you're logged in as admin
- Check browser console for detailed errors

**Upload succeeds but file doesn't show?**
- Check if bucket is marked as "Public"
- Verify the `media_library` table exists
- Check database insert logs in Supabase

## Need Help?

1. Check Supabase logs: **Database** → **Logs**
2. Check API logs: **Edge Functions** → **Logs**
3. Check browser console for client-side errors
4. Verify all tables exist in **Table Editor**

---

After completing this setup, your media uploads will work perfectly! 🎉
