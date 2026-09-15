-- Migration number: 0002    Created: 2026-09-15
-- Agent-published artifacts served from space.kuldeep.cc.

CREATE TABLE space_artifacts (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  format TEXT NOT NULL CHECK (format IN ('html', 'markdown')),
  r2_key TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  published_by TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_space_created ON space_artifacts (created_at DESC);
