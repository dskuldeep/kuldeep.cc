# kuldeep.cc

Personal site and journal — black-and-white typographic design with a built-in CMS.
Next.js 16 App Router running on Cloudflare Workers via [vinext](https://github.com/cloudflare/vinext),
with content in Cloudflare D1 and images in R2. Publishing is instant: no rebuilds.

## Stack

- **Framework**: Next.js 16.2.3 via `vinext@0.0.41` (Vite + workerd). `npm run dev`/`build` go
  through vinext — do NOT use `next dev`; Cloudflare bindings (`import { env } from "cloudflare:workers"`)
  only resolve through the Vite plugin.
- **Data**: D1 (`DB` binding) — `posts`, `pages`, `projects`, `images` tables. Migrations in `migrations/`.
- **Media**: R2 (`MEDIA` binding), uploaded via `/api/admin/images`, served via `/media/*`.
- **Auth**: single admin password + HMAC-signed session cookie (`src/lib/auth.ts`).
  `src/proxy.ts` (Next 16's middleware) does an optimistic cookie check; every admin
  page/action/handler calls `requireAuth()` — that's the real boundary.
- **Editor**: Milkdown Crepe WYSIWYG (Ghost-style, markdown in/out) with a raw-markdown fallback toggle.
- **Fonts**: Inter Tight (display) + Inter (text) via `next/font/google`.

## Routes

Public: `/` · `/writing` · `/writing/[slug]` · `/projects` · `/about` · `/feed.xml` · `/sitemap.xml`.
Legacy `/journal*` and `/case-studies*` URLs 308-redirect.
Admin: `/admin` (posts) · `/admin/posts/[id]` · `/admin/pages/[slug]` · `/admin/projects` · `/admin/images` · `/admin/login`.

## Development

Requires Node 22+ (`.node-version`).

```sh
npm install
npx wrangler d1 migrations apply kuldeep-cc --local
npm run seed && npx wrangler d1 execute kuldeep-cc --local --file scripts/seed.sql
npm run dev            # vinext dev on :3000, bindings simulated by Miniflare
```

Local secrets live in `.dev.vars` (git-ignored): `ADMIN_PASSWORD`, `SESSION_SECRET`.

## Deploying (one-time setup)

```sh
npx wrangler login
npx wrangler d1 create kuldeep-cc          # put the id into wrangler.jsonc database_id
npx wrangler r2 bucket create kuldeep-cc-media
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET     # e.g. openssl rand -base64 32
npx wrangler d1 migrations apply kuldeep-cc --remote
npm run seed && npx wrangler d1 execute kuldeep-cc --remote --file scripts/seed.sql
```

Then:

```sh
npm run deploy:preview   # preview deployment
npm run deploy           # production
```

## Notes

- Public pages are `force-dynamic` — they read D1 per request, which is what makes
  publishing instant. Don't add `"use cache"` without wiring `updateTag()` into the admin actions.
- A 401 response from a route handler crashes the vinext 0.0.41 dev proxy; admin APIs
  return 403 for unauthenticated requests instead.
- `content/` holds the original markdown used by `scripts/seed-content.ts`. Once the remote
  D1 is seeded and verified, it can be removed (the CMS is then the source of truth).
