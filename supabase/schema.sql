-- ══════════════════════════════════════════════════════════════════
-- SIMI'S WORLD — PostgreSQL Schema for Supabase
-- Run this in your Supabase SQL Editor to set up the database
-- ══════════════════════════════════════════════════════════════════

-- ── Universe State ────────────────────────────────────────────────
-- Stores the main world state (visits, streak, mood, achievements)
CREATE TABLE IF NOT EXISTS universe_state (
  id            TEXT PRIMARY KEY DEFAULT 'roqeebat',
  first_visit   TIMESTAMPTZ DEFAULT NOW(),
  last_visit    TIMESTAMPTZ DEFAULT NOW(),
  total_visits  INTEGER DEFAULT 0,
  visit_streak  INTEGER DEFAULT 1,

  -- Daily
  last_daily_surprise_date  TEXT DEFAULT '',
  daily_surprise_index      INTEGER DEFAULT 0,

  -- Mood & preferences
  selected_mood     TEXT DEFAULT NULL,
  music_enabled     BOOLEAN DEFAULT FALSE,
  current_song      INTEGER DEFAULT 0,

  -- Birthday
  birthday_visited          BOOLEAN DEFAULT FALSE,
  birthday_year             INTEGER DEFAULT NULL,
  birthday_intro_completed  BOOLEAN DEFAULT FALSE,

  -- Achievements (stored as JSON array)
  unlocked_achievements  JSONB DEFAULT '["first-visit"]'::jsonb,

  -- Discoveries
  discovered_secrets  JSONB DEFAULT '[]'::jsonb,
  explored_areas      JSONB DEFAULT '[]'::jsonb,
  viewed_memories     JSONB DEFAULT '[]'::jsonb,

  -- Interactions
  smile_clicks      INTEGER DEFAULT 0,
  opened_envelopes  JSONB DEFAULT '[]'::jsonb,

  -- Game scores
  game_scores  JSONB DEFAULT '{}'::jsonb,

  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Pet State ─────────────────────────────────────────────────────
-- Stores Olajuwon's complete game state
CREATE TABLE IF NOT EXISTS pet_state (
  id          TEXT PRIMARY KEY DEFAULT 'olajuwon',

  -- Identity
  name        TEXT DEFAULT 'Olajuwon',
  level       INTEGER DEFAULT 1,
  xp          INTEGER DEFAULT 0,
  xp_to_next  INTEGER DEFAULT 100,
  bond_level  INTEGER DEFAULT 1,
  bond_xp     INTEGER DEFAULT 0,

  -- Needs (0-100)
  hunger      NUMERIC DEFAULT 80,
  thirst      NUMERIC DEFAULT 80,
  happiness   NUMERIC DEFAULT 75,
  energy      NUMERIC DEFAULT 90,
  hygiene     NUMERIC DEFAULT 85,
  health      NUMERIC DEFAULT 100,
  affection   NUMERIC DEFAULT 60,

  -- Sleeping state
  is_sleeping       BOOLEAN DEFAULT FALSE,
  sleep_start_time  TIMESTAMPTZ DEFAULT NULL,

  -- Clothing
  equipped_clothing   JSONB DEFAULT '{"collar":"pink_collar","hat":"bow","shirt":"tshirt"}'::jsonb,
  unlocked_clothing   JSONB DEFAULT '["pink_collar","bow","party_hat","birthday","tshirt","scarf","red_collar","bell_collar"]'::jsonb,

  -- Progress
  last_visit      TIMESTAMPTZ DEFAULT NOW(),
  streak          INTEGER DEFAULT 1,
  longest_streak  INTEGER DEFAULT 1,
  total_days      INTEGER DEFAULT 1,
  last_fed        TIMESTAMPTZ DEFAULT NULL,
  last_groomed    TIMESTAMPTZ DEFAULT NULL,
  last_played     TIMESTAMPTZ DEFAULT NULL,

  -- Inventory
  food_inventory  JSONB DEFAULT '{"fish":3,"chicken":2,"milk":3,"treat":2,"tuna":1,"salmon":1,"shrimp":2,"milk_tea":2}'::jsonb,
  unlocked_toys   JSONB DEFAULT '["ball","yarn"]'::jsonb,
  coins           INTEGER DEFAULT 50,

  -- Room
  room_level      INTEGER DEFAULT 1,
  unlocked_items  JSONB DEFAULT '[]'::jsonb,
  achievements    JSONB DEFAULT '["first_visit"]'::jsonb,

  -- Daily reward
  last_daily_reward  TEXT DEFAULT '',
  daily_reward_day   INTEGER DEFAULT 0,

  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Login Events ──────────────────────────────────────────────────
-- Tracks all login attempts for security and analytics
CREATE TABLE IF NOT EXISTS login_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type         TEXT NOT NULL CHECK (user_type IN ('simi', 'admin')),
  status            TEXT NOT NULL CHECK (status IN ('success', 'failed', 'rate_limited')),
  session_id        TEXT,  -- Session identifier for tracking
  login_timestamp   TIMESTAMPTZ DEFAULT NOW(),
  ip_address        TEXT,
  user_agent        TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_login_events_timestamp 
  ON login_events(login_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_login_events_user_type 
  ON login_events(user_type);
CREATE INDEX IF NOT EXISTS idx_login_events_status 
  ON login_events(status);

-- ── Failed Login Attempts ─────────────────────────────────────────
-- Tracks failed attempts for rate limiting (blocks after 5 in 15 min)
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

-- ── Diary Entries ─────────────────────────────────────────────────
-- Simi's private diary (but admin can secretly read everything)
CREATE TABLE IF NOT EXISTS diary_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  mood         TEXT DEFAULT '😊',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ DEFAULT NULL  -- Soft delete: admin still sees deleted entries
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_diary_entries_created 
  ON diary_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diary_entries_deleted 
  ON diary_entries(deleted_at) WHERE deleted_at IS NULL;

-- ── Media Library ─────────────────────────────────────────────────
-- Stores photos, videos, and music for the experience
CREATE TABLE IF NOT EXISTS media_library (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type      TEXT NOT NULL CHECK (media_type IN ('photo', 'video', 'music')),
  title           TEXT NOT NULL,
  caption         TEXT,
  artist          TEXT,  -- For music tracks
  storage_path    TEXT NOT NULL,  -- Path in Supabase Storage
  storage_bucket  TEXT NOT NULL DEFAULT 'media',
  content_type    TEXT NOT NULL,  -- MIME type
  file_size       BIGINT NOT NULL,  -- Size in bytes
  sort_order      INTEGER DEFAULT 0,  -- For manual ordering
  is_featured     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_media_library_type 
  ON media_library(media_type);
CREATE INDEX IF NOT EXISTS idx_media_library_featured 
  ON media_library(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_media_library_sort 
  ON media_library(sort_order);

-- ── Auto-update timestamps ────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER universe_state_updated_at
  BEFORE UPDATE ON universe_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER pet_state_updated_at
  BEFORE UPDATE ON pet_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER media_library_updated_at
  BEFORE UPDATE ON media_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Insert default rows ───────────────────────────────────────────
-- These will be upserted on first load, so safe to run multiple times
INSERT INTO universe_state (id) VALUES ('roqeebat')
  ON CONFLICT (id) DO NOTHING;

INSERT INTO pet_state (id) VALUES ('olajuwon')
  ON CONFLICT (id) DO NOTHING;

-- ── Row Level Security ────────────────────────────────────────────
-- This is a single-user app (Roqeebat), so we allow all operations
-- In production you'd lock this down further with auth.uid() checks
ALTER TABLE universe_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (single-user birthday app)
CREATE POLICY "Allow all on universe_state" ON universe_state
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on pet_state" ON pet_state
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on login_events" ON login_events
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on failed_login_attempts" ON failed_login_attempts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on diary_entries" ON diary_entries
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on media_library" ON media_library
  FOR ALL USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- Run these commands in Supabase Dashboard > Storage
-- ══════════════════════════════════════════════════════════════════

-- Create a 'media' bucket for photos, videos, and music
-- Then set it to PUBLIC so files can be accessed without auth

/*
1. Go to Supabase Dashboard > Storage
2. Click "New bucket"
3. Name: media
4. Public bucket: YES
5. Click "Create bucket"

6. Click on the "media" bucket
7. Go to "Policies" tab
8. Add policy:
   - Policy name: "Allow public read access"
   - SELECT operation
   - Target roles: anon, authenticated
   - USING expression: true
   
9. Add another policy:
   - Policy name: "Allow authenticated users to upload"
   - INSERT operation  
   - Target roles: authenticated
   - WITH CHECK expression: true
*/
