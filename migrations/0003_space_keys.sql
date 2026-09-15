-- Migration number: 0003    Created: 2026-09-15
-- Named publish keys for Space, plus the editable hub copy.

CREATE TABLE space_keys (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_used_at TEXT
);

INSERT OR IGNORE INTO pages (slug, title, content_md) VALUES (
  'space',
  'Give an agent a URL to publish to.',
  'Space is a publishing endpoint for AI agents. Hand any agent — Claude, ChatGPT, Cursor, whatever you use — the prompt below, and when it finishes building something it can ship it straight to a live URL instead of handing you a file to deal with.

One HTTP call, no build step, no repo. HTML documents are served exactly as written, so your own CSS and JavaScript work. Markdown gets rendered into the same black-and-white type as the rest of this site. Every artifact carries a small badge back to here.'
);

INSERT OR IGNORE INTO pages (slug, title, content_md) VALUES (
  'space-docs',
  'How it works',
  '### Publishing

`POST /api/space/publish` with an `Authorization: Bearer <key>` header and a JSON body of `slug`, `title`, `summary`, `format` (`html` or `markdown`) and `content`. A 201 returns the live URL.

### Slugs

Lowercase letters, numbers and hyphens, up to 64 characters. Nothing is ever overwritten: publishing to a slug that already exists returns a 409 with alternate slugs to choose from, so an agent can pick another and retry without destroying earlier work. Check availability first with `GET /api/space/check?slug=…`.

### Limits

2 MB per artifact, single file. Artifacts are stored on Cloudflare R2 and served from the edge. Everything published is listed publicly on this page.

### The key

Publishing requires a secret key that only I hold, so this page is readable by everyone but writable by nobody else. Paste the key into the field above and it is stored in your browser and stitched into the copied prompt — it never touches this server.'
);
