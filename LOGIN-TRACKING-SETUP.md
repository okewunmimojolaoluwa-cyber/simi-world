# 📊 LOGIN TRACKING SETUP - Complete Guide

## ✅ WHAT'S ALREADY WORKING

The code is **100% ready** to track every Simi login! Here's what's in place:

### Backend (✅ Complete)
- ✅ `/api/auth/login` - Logs every login attempt to database
- ✅ `/api/admin/login-history` - Fetches login history for admin
- ✅ Login tracking includes:
  - User type (Simi / Admin)
  - Status (success / failed / rate_limited)
  - Timestamp (converted to Lagos timezone)
  - IP address
  - User agent (browser info)

### Frontend (✅ Complete)
- ✅ Admin dashboard → Login History tab
- ✅ Real-time display of all login events
- ✅ Stats summary (total, successful, failed)
- ✅ Colored badges for user types
- ✅ IP address and timestamp display

### Features (✅ Complete)
- ✅ **Every Simi login is logged** automatically
- ✅ **Every Admin login is logged** automatically  
- ✅ Failed login attempts tracked
- ✅ Rate limiting after 5 failed attempts
- ✅ Lagos timezone (Africa/Lagos) for all timestamps
- ✅ Beautiful UI with color-coded events

---

## 🔧 SETUP REQUIRED

You need to complete **2 simple steps**:

### Step 1: Add Service Role Key to `.env`

**Current `.env` file** has a placeholder:
```env
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

**You need to**:
1. Go to https://supabase.com/dashboard
2. Open your project: **kksliorolwzbawfaqcaf**
3. Click **Settings** (⚙️) in left sidebar
4. Click **API** section
5. Find **service_role** key (not anon key!)
6. Click **"Reveal"** to show the key
7. Copy the entire key
8. Replace `YOUR_SERVICE_ROLE_KEY_HERE` in `.env` with the real key

**Example** (yours will be different):
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...very_long_key
```

⚠️ **Important**: Keep this key SECRET! Don't share it publicly.

### Step 2: Create Database Tables

The database needs 3 tables. Run this SQL in Supabase:

**How to run SQL**:
1. Go to https://supabase.com/dashboard
2. Open project: **kksliorolwzbawfaqcaf**
3. Click **SQL Editor** in left sidebar
4. Click **"New query"**
5. Copy and paste the SQL below
6. Click **"Run"** button

**SQL to run** (from `supabase/schema.sql`):

```sql
-- ── Login Events ──────────────────────────────────────────────────
-- Tracks all login attempts for security and analytics
CREATE TABLE IF NOT EXISTS login_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type         TEXT NOT NULL CHECK (user_type IN ('simi', 'admin')),
  status            TEXT NOT NULL CHECK (status IN ('success', 'failed', 'rate_limited')),
  login_timestamp   TIMESTAMPTZ DEFAULT NOW(),
  ip_address        TEXT,
  user_agent        TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_login_events_timestamp 
  ON login_events(login_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_login_events_user_type 
  ON login_events(user_type);
CREATE INDEX IF NOT EXISTS idx_login_events_status 
  ON login_events(status);

-- ── Failed Login Attempts ─────────────────────────────────────────
-- For rate limiting
CREATE TABLE IF NOT EXISTS failed_login_attempts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type         TEXT NOT NULL CHECK (user_type IN ('simi', 'admin')),
  ip_address        TEXT NOT NULL,
  attempt_timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Index for rate limit checks
CREATE INDEX IF NOT EXISTS idx_failed_attempts_timestamp 
  ON failed_login_attempts(attempt_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_failed_attempts_ip 
  ON failed_login_attempts(ip_address, user_type);

-- ── Row Level Security (RLS) ──────────────────────────────────────
-- For now, allow all access (single-user app)
ALTER TABLE login_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Allow all operations (adjust if you want restrictions)
CREATE POLICY IF NOT EXISTS "Allow all on login_events" 
  ON login_events FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow all on failed_login_attempts" 
  ON failed_login_attempts FOR ALL USING (true) WITH CHECK (true);
```

---

## 🚀 AFTER SETUP

Once you complete Steps 1 & 2:

### Push Updated `.env` to Git
```bash
git add .env
git commit -m "Add Supabase service role key for login tracking"
git push
```

### Wait for Deployment
- Deployment will rebuild (~2-3 min)
- New environment variable will be available

### Test Login Tracking

1. **Test as Simi**:
   - Go to https://roqeebat.pxxl.click
   - Complete Act 1
   - Enter password: `simi1234`
   - Login successfully

2. **Check Admin Dashboard**:
   - Go to https://roqeebat.pxxl.click/admin
   - Enter password: `emmjay1234`
   - Click **"Login History"** tab
   - You should see Simi's login! ✅

3. **Every time Simi logs in**, it will appear here automatically!

---

## 📊 WHAT YOU'LL SEE

### Login History Tab
```
┌─────────────────────────────────────────────────┐
│ Total Events: 5 | Successful: 4 | Failed: 1    │
├─────────────────────────────────────────────────┤
│ ✅ 👤 Simi logged in                           │
│    22/Oct/2026 14:30:45                        │
│    IP: 197.210.xxx.xxx                         │
├─────────────────────────────────────────────────┤
│ ✅ 🔑 Admin logged in                          │
│    22/Oct/2026 14:15:20                        │
│    IP: 197.210.xxx.xxx                         │
├─────────────────────────────────────────────────┤
│ ❌ 👤 Simi failed to login                     │
│    22/Oct/2026 13:05:10                        │
│    IP: 41.58.xxx.xxx                           │
└─────────────────────────────────────────────────┘
```

### What Gets Logged

**Every Simi login captures**:
- ✅ Timestamp (Lagos timezone)
- ✅ IP address
- ✅ Browser/device info
- ✅ Success/failure status
- ✅ User type (Simi vs Admin)

---

## 🔍 TROUBLESHOOTING

### Issue: "Failed to load login history"

**Cause**: Service role key not set or database tables don't exist

**Solution**:
1. Verify `.env` has real service role key (not placeholder)
2. Check tables exist in Supabase dashboard:
   - Go to **Table Editor**
   - Look for `login_events` and `failed_login_attempts`
   - If missing, run the SQL from Step 2
3. Redeploy after adding key

### Issue: Login history shows empty

**Cause**: No logins recorded yet

**Solution**:
1. Log in as Simi once
2. Refresh admin dashboard
3. Should appear immediately

### Issue: Only seeing some logins

**Possible causes**:
- Service role key was added after those logins happened
- Table was created after those logins happened
- Logs were cleared/deleted

**Solution**: Future logins will be tracked correctly

---

## 📝 TECHNICAL DETAILS

### How It Works

**Login Flow**:
```
1. User enters password
       ↓
2. /api/auth/login validates password
       ↓
3. If valid: logLoginEvent('simi', 'success', ...)
       ↓
4. Data saved to login_events table
       ↓
5. Admin can view in Login History tab
```

### Database Schema

**login_events table**:
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique event ID |
| user_type | TEXT | 'simi' or 'admin' |
| status | TEXT | 'success', 'failed', or 'rate_limited' |
| login_timestamp | TIMESTAMPTZ | When login occurred |
| ip_address | TEXT | User's IP address |
| user_agent | TEXT | Browser/device info |
| created_at | TIMESTAMPTZ | Row creation time |

### Rate Limiting

After **5 failed login attempts** in 15 minutes:
- User is blocked for 15 minutes
- Status logged as `rate_limited`
- Prevents brute force attacks

### Timezone

All timestamps converted to **Lagos timezone** (Africa/Lagos = UTC+1):
- Stored in database as UTC
- Displayed in admin dashboard as Lagos time
- API returns both formats

---

## ✅ CHECKLIST

Before testing:
- [ ] Added real service role key to `.env`
- [ ] Ran SQL to create tables in Supabase
- [ ] Committed and pushed `.env` to GitHub
- [ ] Waited for deployment to complete
- [ ] Verified deployment shows "Deployed" status

After setup:
- [ ] Tested Simi login
- [ ] Checked admin Login History tab
- [ ] Verified login event appears
- [ ] Checked timestamp shows Lagos time
- [ ] Confirmed IP address is captured

---

## 🎯 BENEFITS

### For You (Admin)
- ✅ **Monitor activity**: See when Simi logs in
- ✅ **Security**: Track failed login attempts
- ✅ **Analytics**: Understand usage patterns
- ✅ **Debugging**: Troubleshoot login issues
- ✅ **Audit trail**: Complete history of all logins

### For Simi (User)
- ✅ **Protection**: Rate limiting prevents attacks
- ✅ **No impact**: Tracking happens silently
- ✅ **Fast**: No performance impact
- ✅ **Reliable**: Always logs, even if page crashes

---

## 📚 FILES INVOLVED

**Backend**:
- `lib/auth.ts` - Login tracking functions
- `app/api/auth/login/route.ts` - Login API
- `app/api/admin/login-history/route.ts` - History API

**Frontend**:
- `components/admin/LoginHistory.tsx` - Display component
- `app/admin/page.tsx` - Admin dashboard

**Configuration**:
- `.env` - Environment variables (needs service key!)
- `supabase/schema.sql` - Database schema

**Documentation**:
- `LOGIN-TRACKING-SETUP.md` - This file
- `ADMIN-SETUP-GUIDE.md` - General admin setup

---

**Status**: ✅ Code ready, needs configuration  
**Required**: Service role key + Database tables  
**Time to setup**: ~5 minutes  
**Difficulty**: Easy (copy-paste)  
**Last Updated**: October 22, 2026
