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

