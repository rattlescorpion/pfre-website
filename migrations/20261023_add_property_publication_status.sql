
-- PFRE: Add explicit property publication approval status.
-- Existing records are preserved and default to pending.
-- This migration does not delete property records.

BEGIN;

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS status VARCHAR(20)
  NOT NULL DEFAULT 'pending';

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255);

CREATE INDEX IF NOT EXISTS properties_status_created_at_idx
  ON properties (status, created_at DESC);

COMMIT;