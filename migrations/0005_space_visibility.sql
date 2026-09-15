-- Migration number: 0005    Created: 2026-09-15
-- Artifact visibility: 'public' (default) shows on the hub and is world-readable,
-- 'unlisted' is world-readable but hidden from the hub, 'private' is admin-only.

ALTER TABLE space_artifacts
ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public'
  CHECK (visibility IN ('public', 'unlisted', 'private'));
