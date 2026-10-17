-- ══════════════════════════════════════════════════════════════════
-- Migration: Add Authentication, Media Library & Login Tracking
-- ══════════════════════════════════════════════════════════════════

-- ── Media Library ─────────────────────────────────────────────────
-- Stores all uploaded photos, videos, and music files
CREATE TABLE IF NOT EXISTS media_library (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type      TEXT NOT NULL CHECK (media_type IN ('photo', 'video', 'music')),
  title           TEXT NOT NULL,
  caption         TEXT DEFAULT NULL,          -- For photos/videos
  artist          TEXT DEFAULT NULL,          -- For music
  storage_path    TEXT NOT NULL,              -- Supabase Storage path
  storage_bucket  TEXT NOT NULL DEFAULT 'media',
  content_type    TEXT NOT NULL,              -- MIME type
  file_size       BIGINT NOT NULL,            -- Bytes
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_library_type ON media_library(media_type);
CREATE INDEX idx_media_library_sort ON media_library(media_type, sort_order);

-- ── Login Activity ────────────────────────────────────────────────
-- Tracks when Simi successfully logs in
CREATE TABLE IF NOT EXISTS login_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type       TEXT NOT NULL CHECK (user_type IN ('simi', 'admin')),
  login_timestamp TIMESTAMPTZ DEFAULT NOW(),
  session_id      TEXT DEFAULT NULL,
  user_agent      TEXT DEFAULT NULL,
  ip_address      TEXT DEFAULT NULL,
  status          TEXT NOT NULL CHECK (status IN ('success', 'failed', 'rate_limited')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_login_events_timestamp ON login_events(login_timestamp DESC);
CREATE INDEX idx_login_events_user_type ON login_events(user_type);
CREATE INDEX idx_login_events_status ON login_events(status);

-- ── Failed Login Attempts (for rate limiting) ─────────────────────
CREATE TABLE IF NOT EXISTS failed_login_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type       TEXT NOT NULL,
  attempt_timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address      TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_failed_attempts_ip ON failed_login_attempts(ip_address, attempt_timestamp);

-- ── Auto-update timestamps ────────────────────────────────────────
CREATE TRIGGER media_library_updated_at
  BEFORE UPDATE ON media_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security ────────────────────────────────────────────
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Allow read access to media library (authenticated users only in production)
CREATE POLICY "Allow read on media_library" ON media_library
  FOR SELECT USING (true);

-- Allow admin operations on media library (will be enforced via service role key)
CREATE POLICY "Allow admin on media_library" ON media_library
  FOR ALL USING (true) WITH CHECK (true);

-- Allow all operations on login tracking (will be enforced via service role key)
CREATE POLICY "Allow all on login_events" ON login_events
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on failed_login_attempts" ON failed_login_attempts
  FOR ALL USING (true) WITH CHECK (true);

-- ── Create Storage Bucket ─────────────────────────────────────────
-- Run this in Supabase Dashboard -> Storage:
-- 1. Create a new bucket called "media"
-- 2. Set it to PUBLIC for read access
-- 3. Restrict uploads to authenticated users (via RLS policies)

