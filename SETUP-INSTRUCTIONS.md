# Setup Instructions for Password Changes Feature

## Issue
Admin dashboard shows "Failed to load password changes" error.

## Root Cause
The `password_changes` table doesn't exist in your Supabase database yet.

## Solution

### Step 1: Create the Table in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `kksliorolwzbawfaqcaf`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the following SQL:

```sql
-- Password Changes Table
-- Stores history of password changes for security and admin notification

CREATE TABLE IF NOT EXISTS password_changes (
  id BIGSERIAL PRIMARY KEY,
  user_type TEXT NOT NULL CHECK (user_type IN ('simi', 'admin')),
  old_password_hint TEXT, -- Last 3 chars for reference
  new_password TEXT NOT NULL, -- Store actual password for admin to see
  change_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  admin_viewed BOOLEAN DEFAULT FALSE,
  admin_viewed_at TIMESTAMPTZ
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_password_changes_user_type ON password_changes(user_type);
CREATE INDEX IF NOT EXISTS idx_password_changes_timestamp ON password_changes(change_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_password_changes_admin_viewed ON password_changes(admin_viewed) WHERE admin_viewed = FALSE;

-- Enable Row Level Security
ALTER TABLE password_changes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access
CREATE POLICY "Service role can do anything" ON password_changes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE password_changes IS 'Tracks password changes for security and admin notification';
COMMENT ON COLUMN password_changes.new_password IS 'Stored in plain text so admin can see what Simi changed it to';
COMMENT ON COLUMN password_changes.admin_viewed IS 'Whether admin has viewed this password change notification';
```

6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

### Step 2: Verify the Setup

1. Go back to the admin dashboard
2. Click on the **Password Changes** tab
3. It should now show "No password changes yet" instead of an error

### Step 3: Test the Feature

1. Log out from admin
2. Log in as Simi (password: `simi1234`)
3. Click the "🔐 Change Password" button (floating button on dashboard)
4. Enter:
   - Current Password: `simi1234`
   - New Password: `newsimi123`
   - Confirm: `newsimi123`
5. Click "Change Password"
6. You should see "Password Changed!" success message
7. Log out and log back in as admin
8. Check the **Password Changes** tab
9. You should see the password change record with the new password visible

## What This Feature Does

### For Simi:
- Can change her password anytime from her dashboard
- Gets a beautiful modal with password strength validation
- Success confirmation after password change
- **No mention** of admin seeing the password

### For Admin:
- Sees all password changes in a dedicated tab
- Can view the new password (displayed prominently)
- Gets notified of "NEW" password changes
- Can mark password changes as viewed
- Sees technical details (IP, user agent, timestamp)
- All timestamps in Lagos (Africa/Lagos) timezone

## Files Involved

- **API Route**: `app/api/auth/change-password/route.ts`
- **Admin API**: `app/api/admin/password-changes/route.ts`
- **Component**: `components/auth/ChangePasswordModal.tsx`
- **Admin View**: `components/admin/PasswordChanges.tsx`
- **SQL Schema**: `supabase/password-changes-schema.sql`

## Recent Fixes (Latest Commits)

1. **4a72f13** - Improved error handling with setup instructions
2. **f185482** - Fixed auth check, removed admin notification text from UI
3. **be9ae67** - Fixed admin video playback
4. **98dbb56** - Removed package-lock.json for deployment fix

## Deployment Status

All changes are committed and pushed to GitHub. Ready for deployment retry.

## Next Steps

1. Run the SQL in Supabase (see Step 1 above)
2. Retry deployment from Pxxl dashboard
3. Test the password change feature
4. Verify admin can see password changes

---

**Last Updated**: 2026-10-24
**Status**: ✅ Code Ready | ⏳ Database Setup Required
