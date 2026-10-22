# Admin Dashboard Setup Guide

## ✅ What's Working

The admin login is working! You can now access the admin dashboard at `/admin`.

## ❌ What Needs to be Fixed

The admin dashboard shows errors because the Supabase database tables haven't been created yet:
- "Failed to load login history" → Missing `login_events` table
- "Failed to load media" → Missing `media_library` table  
- "Failed to load music" → Missing `media_library` table

## 🔧 How to Fix

### Step 1: Go to Your Supabase Dashboard

1. Open https://supabase.com
2. Log in to your account
3. Select your project: **kksliorolwzbawfaqcaf**

### Step 2: Run the SQL Schema

1. In the left sidebar, click **"SQL Editor"**
2. Click **"New query"**
3. Copy the entire contents of `supabase/schema.sql` file
4. Paste it into the SQL editor
5. Click **"Run"** (or press Ctrl+Enter)

This will create all the required tables:
- `universe_state` - Stores Simi's world state
- `pet_state` - Stores Olajuwon's game data
- `login_events` - Tracks all login attempts
- `media_library` - Stores photos, videos, and music

### Step 3: Create Storage Bucket

1. In the left sidebar, click **"Storage"**
2. Click **"New bucket"**
3. Settings:
   - **Bucket name**: `media`
   - **Public bucket**: ✅ YES (check this box)
   - File size limit: 50MB
4. Click **"Create bucket"**

### Step 4: Set Storage Policies

1. Click on the **"media"** bucket you just created
2. Go to **"Policies"** tab
3. Click **"New Policy"**

**Policy 1: Allow Public Read**
- Policy name: `Allow public read access`
- Allowed operation: ✅ SELECT
- Target roles: `anon`, `authenticated`
- USING expression: `true`
- Click **"Review"** then **"Save policy"**

**Policy 2: Allow Uploads**
- Click **"New Policy"** again
- Policy name: `Allow authenticated users to upload`
- Allowed operation: ✅ INSERT
- Target roles: `authenticated`
- WITH CHECK expression: `true`
- Click **"Review"** then **"Save policy"**

### Step 5: Verify Setup

1. Go back to your deployed site: https://roqeebat.pxxl.click
2. Access admin dashboard (5 clicks on "Happy Birthday My Baby", password: `emmjay1234`)
3. Check each tab:
   - **Login History** - Should show your recent admin login
   - **Sunshine Gallery** - Should show "0 photos, 0 videos" instead of error
   - **Music Library** - Should show "0 music tracks" instead of error

## 📤 Using the Admin Dashboard

Once setup is complete, you can:

### Upload Photos
1. Go to **"Sunshine Gallery"** tab
2. Click **📷 Photo** button
3. Select a photo file (JPG, PNG, GIF, WEBP up to 50MB)
4. Add title and optional caption
5. Click **"Upload"**

### Upload Videos
1. Go to **"Sunshine Gallery"** tab
2. Click **🎥 Video** button
3. Select a video file (MP4, WEBM, MOV up to 50MB)
4. Add title and optional caption
5. Click **"Upload"**

### Upload Music
1. Go to **"Music Library"** tab
2. Click **🎵 Music** button
3. Select an audio file (MP3, WAV, OGG up to 50MB)
4. Add title and artist name
5. Click **"Upload"**

### View Login History
- The **"Login History"** tab shows all login attempts
- Times are displayed in **Lagos timezone** (Africa/Lagos)
- Filters available: Success/Failed, Simi/Admin

## 🔐 Security Notes

**Passwords**:
- Simi password: `simi1234`
- Admin password: `emmjay1234`
- Session secret: Set in environment variables

**Environment Variables**:
All sensitive config is stored in `.env` file (now committed to repo for deployment):
```env
SIMI_ACCESS_PASSWORD=simi1234
ADMIN_ACCESS_PASSWORD=emmjay1234
SESSION_SECRET=your_super_secret_session_key_min_32_chars_long_12345678
NEXT_PUBLIC_SUPABASE_URL=https://kksliorolwzbawfaqcaf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🐛 Troubleshooting

### "Failed to load" errors persist
- Make sure you ran the SQL schema in Supabase
- Check Supabase logs for errors
- Verify Row Level Security policies are set to allow all operations

### Can't upload files
- Make sure `media` storage bucket exists
- Verify bucket is set to **Public**
- Check storage policies allow INSERT operations

### Uploads succeed but files don't show
- Check the `media_library` table has the new rows
- Verify storage policies allow SELECT (read) operations
- Check browser console for errors

### Login history empty
- Login events are only recorded after the schema is applied
- Try logging in again after running the schema
- Check the `login_events` table in Supabase

## 📞 Need Help?

If issues persist:
1. Check browser console (F12) for JavaScript errors
2. Check Supabase Dashboard > Database > Tables to verify tables exist
3. Check Supabase Dashboard > Storage to verify `media` bucket exists
4. Share screenshots of any error messages
