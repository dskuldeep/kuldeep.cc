-- Migration number: 0004    Created: 2026-09-15
-- Expand space_artifacts to hold non-HTML artifact types (pdf, docx, xlsx,
-- csv, code, text, json). SQLite cannot ALTER a CHECK constraint, so we
-- rebuild the table. New nullable columns carry the original filename, MIME
-- type, source R2 key (for download), and language hint for code files.

CREATE TABLE space_artifacts_new (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  format TEXT NOT NULL CHECK (format IN (
    'html', 'markdown', 'text', 'code', 'json', 'csv', 'pdf', 'docx', 'xlsx'
  )),
  r2_key TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  published_by TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  mime_type TEXT,
  source_key TEXT,
  filename TEXT,
  language TEXT
);

INSERT INTO space_artifacts_new
  (slug, title, summary, format, r2_key, size, published_by, created_at)
SELECT slug, title, summary, format, r2_key, size, published_by, created_at
FROM space_artifacts;

DROP TABLE space_artifacts;
ALTER TABLE space_artifacts_new RENAME TO space_artifacts;

CREATE INDEX idx_space_created ON space_artifacts (created_at DESC);
