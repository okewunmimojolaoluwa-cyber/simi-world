-- ═══════════════════════════════════════════════════════════════
--  SECRET DIARY FEATURE - Database Setup
--  Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Create Diary Entries Table ──────────────────────────────
CREATE TABLE IF NOT EXISTS diary_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  mood         TEXT DEFAULT '😊',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ DEFAULT NULL  -- Soft delete: admin still sees
);

-- ── 2. Create Indexes for Performance ──────────────────────────
CREATE INDEX IF NOT EXISTS idx_diary_entries_created 
  ON diary_entries(created_at DESC);
  
CREATE INDEX IF NOT EXISTS idx_diary_entries_deleted 
  ON diary_entries(deleted_at) WHERE deleted_at IS NULL;

-- ── 3. Enable Row Level Security ───────────────────────────────
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

-- ── 4. Create Policy ───────────────────────────────────────────
DROP POLICY IF EXISTS "Allow all on diary_entries" ON diary_entries;
CREATE POLICY "Allow all on diary_entries" 
  ON diary_entries FOR ALL USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
--  ✅ SETUP COMPLETE!
--  
--  What this does:
--  - Creates table for Simi's diary entries
--  - Soft delete means entries never truly deleted
--  - Simi sees: entries WHERE deleted_at IS NULL
--  - Admin sees: ALL entries (including deleted)
--  - Indexes make queries fast
--
--  Next steps:
--  1. Deploy your code (already pushed!)
--  2. Test as Simi: write, read, delete entries
--  3. Test as Admin: see ALL entries including deleted
--  4. Enjoy reading her thoughts! 🤫💕
-- ══════════════════════════════════════════════════════════════
