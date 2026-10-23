# ⚡ QUICK SETUP - Admin Features (5 Minutes)

## 🎯 What You'll Get

After this setup:
- ✅ Admin can see **every Simi login** in Login History tab
- ✅ Admin can **upload photos/videos/music**
- ✅ Admin can **manage media library**
- ✅ All features fully functional

---

## 📋 STEP 1: Get Supabase Service Role Key

### 1.1 Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/kksliorolwzbawfaqcaf

### 1.2 Navigate to API Settings
1. Click **"Settings"** (⚙️) in the left sidebar
2. Click **"API"** section
3. Scroll down to **"Project API keys"**

### 1.3 Copy Service Role Key
1. Find the row labeled **"service_role"** (NOT "anon")
2. Click the **"Reveal"** button (👁️)
3. Click **"Copy"** button
4. **IMPORTANT**: This key is secret! Don't share it publicly

### 1.4 Update `.env` File
Open `.env` file in your project and replace this line:
```env
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

With:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...your_actual_key_here
```

**Save the file!**

---

## 📋 STEP 2: Create Database Tables

### 2.1 Open SQL Editor
Go to: https://supabase.com/dashboard/project/kksliorolwzbawfaqcaf/sql/new

### 2.2 Copy This SQL
Copy **ALL** of the SQL below:

```sql
-- ═══════════════════════════════════════════════════════════════
--  ADMIN FEATURES SETUP - Complete Database Schema
-- ═══════════════════════════════════════════════════════════════

-- ── 1. LOGIN TRACKING TABLE ────────────────────────────────────
-- Tracks every login attempt (Simi & Admin)
CREATE TABLE IF NOT EXISTS login_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type         TEXT NOT NULL CHECK (user_type IN ('simi', 'admin')),
  status            TEXT NOT NULL CHECK (status IN ('success', 'failed', 'rate_limited')),
  login_timestamp   TIMESTAMPTZ DEFAULT NOW(),
  ip_address        TEXT,
  user_agent        TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_login_events_timestamp 
  ON login_events(login_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_login_events_user_type 
  ON login_events(user_type);
CREATE INDEX IF NOT EXISTS idx_login_events_status 
  ON login_events(status);

-- ── 2. FAILED LOGIN ATTEMPTS TABLE ─────────────────────────────
-- For rate limiting (blocks after 5 failed attempts in 15 min)
CREATE TABLE IF NOT EXISTS failed_login_attempts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type         TEXT NOT NULL CHECK (user_type IN ('simi', 'admin')),
  ip_address        TEXT NOT NULL,
  attempt_timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for rate limit checks
CREATE INDEX IF NOT EXISTS idx_failed_attempts_timestamp 
  ON failed_login_attempts(attempt_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_failed_attempts_ip 
  ON failed_login_attempts(ip_address, user_type);

-- ── 3. MEDIA LIBRARY TABLE ─────────────────────────────────────
-- Stores all photos, videos, and music
CREATE TABLE IF NOT EXISTS media_library (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type      TEXT NOT NULL CHECK (media_type IN ('photo', 'video', 'music')),
  title           TEXT NOT NULL,
  caption         TEXT,
  artist          TEXT,
  storage_path    TEXT NOT NULL,
  storage_bucket  TEXT NOT NULL DEFAULT 'media',
  content_type    TEXT,
  file_size       BIGINT,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for sorting
CREATE INDEX IF NOT EXISTS idx_media_library_type_sort 
  ON media_library(media_type, sort_order);

-- ── 4. UNIVERSE STATE TABLE ────────────────────────────────────
-- Stores Simi's progress and achievements
CREATE TABLE IF NOT EXISTS universe_state (
  id                TEXT PRIMARY KEY DEFAULT 'default',
  first_visit_date  TIMESTAMPTZ,
  last_visit_date   TIMESTAMPTZ,
  total_visits      INTEGER DEFAULT 0,
  visit_streak      INTEGER DEFAULT 0,
  unlocked_achievements TEXT[] DEFAULT '{}',
  discovered_secrets TEXT[] DEFAULT '{}',
  explored_areas    TEXT[] DEFAULT '{}',
  game_scores       JSONB DEFAULT '{}',
  selected_mood     TEXT,
  birthday_visited  BOOLEAN DEFAULT FALSE,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. PET STATE TABLE ─────────────────────────────────────────
-- Stores Olajuwon the cat's data
CREATE TABLE IF NOT EXISTS pet_state (
  id            TEXT PRIMARY KEY DEFAULT 'default',
  pet_name      TEXT DEFAULT 'Olajuwon',
  happiness     INTEGER DEFAULT 80,
  energy        INTEGER DEFAULT 100,
  love          INTEGER DEFAULT 50,
  xp            INTEGER DEFAULT 0,
  coins         INTEGER DEFAULT 100,
  last_fed      TIMESTAMPTZ,
  last_played   TIMESTAMPTZ,
  equipped      JSONB DEFAULT '{}',
  owned_items   TEXT[] DEFAULT '{}',
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. ROW LEVEL SECURITY (RLS) ───────────────────────────────
-- Allow all access (single-user app, secure via admin auth)
ALTER TABLE login_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE universe_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_state ENABLE ROW LEVEL SECURITY;

-- Allow all operations (backend validates with admin auth)
CREATE POLICY IF NOT EXISTS "Allow all on login_events" 
  ON login_events FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow all on failed_login_attempts" 
  ON failed_login_attempts FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow all on media_library" 
  ON media_library FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow all on universe_state" 
  ON universe_state FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow all on pet_state" 
  ON pet_state FOR ALL USING (true) WITH CHECK (true);

-- ── 7. STORAGE BUCKET FOR MEDIA ───────────────────────────────
-- Create storage bucket for uploads (if doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to media bucket
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Allow authenticated uploads (admin only via backend)
CREATE POLICY IF NOT EXISTS "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media');

-- ══════════════════════════════════════════════════════════════
--  SETUP COMPLETE! All tables and policies created.
-- ══════════════════════════════════════════════════════════════
```

### 2.3 Run the SQL
1. **Paste** all the SQL into the editor
2. Click the **"Run"** button (or press Ctrl+Enter)
3. Wait for "Success" message
4. You should see: "Success. No rows returned"

### 2.4 Verify Tables Were Created
1. Click **"Table Editor"** in left sidebar
2. You should now see these tables:
   - ✅ `login_events`
   - ✅ `failed_login_attempts`
   - ✅ `media_library`
   - ✅ `universe_state`
   - ✅ `pet_state`

---

## 📋 STEP 3: Deploy Updated .env

### 3.1 Commit Changes
```bash
git add .env
git commit -m "Add Supabase service role key for admin features"
git push
```

### 3.2 Wait for Deployment
- Go to your Pxxl deployment dashboard
- Wait for build to complete (~2-3 minutes)
- Look for "Deployed" status

---

## ✅ STEP 4: Test Admin Features

### 4.1 Test Login Tracking
1. **Open incognito window**
2. Go to: https://roqeebat.pxxl.click
3. Complete Act 1
4. Login as Simi with password: `simi1234`
5. This login will be recorded!

### 4.2 Check Admin Dashboard
1. Go to: https://roqeebat.pxxl.click/admin
2. Login with password: `emmjay1234`
3. Click **"Login History"** tab
4. **You should see Simi's login!** ✅

### 4.3 Test Media Upload
1. Still in admin dashboard
2. Click **"Sunshine Gallery"** tab
3. Click **"📤 Upload Media"**
4. Select **"Photo"** type
5. Choose any image file
6. Click upload
7. **Image should upload successfully!** ✅

---

## 🎯 Expected Results

### Login History Tab Should Show:
```
┌─────────────────────────────────────────────┐
│ Total Events: 2 | Successful: 2 | Failed: 0│
├─────────────────────────────────────────────┤
│ ✅ 👤 Simi logged in                        │
│    22/Oct/2026 15:30:45 (Lagos)            │
│    IP: 197.210.xxx.xxx                     │
├─────────────────────────────────────────────┤
│ ✅ 🔑 Admin logged in                       │
│    22/Oct/2026 15:25:10 (Lagos)            │
│    IP: 197.210.xxx.xxx                     │
└─────────────────────────────────────────────┘
```

### Media Upload Should Show:
```
Upload successful! Photo uploaded & optimized!
(67% smaller)
```

---

## 🔍 TROUBLESHOOTING

### ❌ "Failed to load login history"

**Cause**: Service role key not set or tables don't exist

**Fix**:
1. Check `.env` has real key (not `YOUR_SERVICE_ROLE_KEY_HERE`)
2. Verify tables exist in Supabase Table Editor
3. Make sure you pushed `.env` and deployment completed
4. Hard refresh admin page (Ctrl + Shift + R)

### ❌ "Upload failed"

**Cause**: Storage bucket doesn't exist or policy not set

**Fix**:
1. Go to Supabase → Storage
2. Check if "media" bucket exists
3. If not, re-run the SQL (it will create it)
4. Check bucket is set to "Public"

### ❌ Login history shows empty

**Cause**: No logins recorded yet, or you're looking at old data

**Fix**:
1. Do a fresh Simi login in incognito window
2. Refresh admin page
3. Make sure deployment completed (new code is live)

### ❌ "Database not configured" error

**Cause**: Service role key is wrong or missing

**Fix**:
1. Double-check you copied the **service_role** key (not anon key)
2. Verify no extra spaces in `.env`
3. Make sure `.env` was pushed and deployed
4. Check deployment logs for the key being loaded

---

## 📊 WHAT GETS TRACKED

### Every Login Records:
- ✅ User type (Simi or Admin)
- ✅ Status (success / failed / rate limited)
- ✅ Timestamp (converted to Lagos timezone)
- ✅ IP address
- ✅ Browser/device info
- ✅ Stored permanently in database

### Automatic Features:
- ✅ Rate limiting (blocks after 5 failed attempts)
- ✅ Failed attempt tracking
- ✅ Automatic cleanup of old attempts
- ✅ Real-time updates in admin dashboard

---

## 🎓 UNDERSTANDING THE SETUP

### Why Service Role Key?
- **Anon key** = Limited access, public, read-only
- **Service role key** = Full access, server-only, admin operations
- Backend uses service role to write login events and manage media
- Never exposed to browser (server-side only)

### Why These Tables?
1. **login_events** - Complete audit trail of all logins
2. **failed_login_attempts** - Security: track and block brute force
3. **media_library** - Store uploaded photo/video/music metadata
4. **universe_state** - Simi's progress and achievements
5. **pet_state** - Olajuwon the cat's stats and items

### Why RLS Policies?
- Row Level Security ensures data access rules
- We allow all access because:
  - Single-user app (just Simi + admin)
  - Backend validates admin auth before operations
  - Simpler than complex policies for this use case

---

## ✅ SUCCESS CHECKLIST

Before saying "it's working":
- [ ] Service role key added to `.env` (real key, not placeholder)
- [ ] All SQL executed successfully in Supabase
- [ ] Tables visible in Supabase Table Editor
- [ ] `.env` committed and pushed to GitHub
- [ ] Deployment completed successfully
- [ ] Hard refreshed admin dashboard (Ctrl+Shift+R)
- [ ] Simi logged in (in incognito to ensure fresh login)
- [ ] Admin can see login in Login History tab
- [ ] Admin can upload a test photo
- [ ] Upload shows success message

---

## 🚀 AFTER SETUP

### How to Use

**View Login History**:
1. Go to admin dashboard
2. Click "Login History" tab
3. See all logins, sorted newest first
4. Click user badges to see details

**Upload Media**:
1. Go to admin dashboard
2. Click "Sunshine Gallery" or "Music Library" tab
3. Click "Upload Media" button
4. Select type (photo/video/music)
5. Choose file (any format works!)
6. Add optional caption
7. Click upload
8. Wait for optimization (images auto-converted to WebP)

**Manage Content**:
- Delete uploads if needed
- Rearrange sort order
- View file sizes and metadata
- See optimization stats

---

## 📞 STILL NOT WORKING?

If you followed all steps and it's still not working:

1. **Check deployment logs** on Pxxl dashboard
2. **Open browser console** (F12) and look for errors
3. **Verify environment variables** are loading:
   - Add `console.log(process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0,20))` to a server file
   - Should NOT show "YOUR_SERVICE_ROLE_KEY_HERE"
4. **Test Supabase connection**:
   - Try inserting a test row manually in Table Editor
   - If manual insert works, code issue
   - If manual insert fails, permission issue

---

**Total Time**: ~5 minutes  
**Difficulty**: Easy (copy-paste)  
**Result**: Fully working admin features  
**Status**: Ready to setup! 🎉
