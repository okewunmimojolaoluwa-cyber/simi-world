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

-- Allow all operations for now (single-user birthday app)
CREATE POLICY "Allow all on universe_state" ON universe_state
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on pet_state" ON pet_state
  FOR ALL USING (true) WITH CHECK (true);
