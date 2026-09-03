<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project-specific rules

- **Toolchain**: `npm run dev`/`npm run build` run **vinext** (Vite + workerd), not `next`. Never
  switch these back to `next dev`/`next build` — Cloudflare bindings
  (`import { env } from "cloudflare:workers"`, typed in `src/lib/env.ts`) only work through vinext.
  Node 22+ required.
- **Middleware is `src/proxy.ts`** (Next 16 rename). It's an optimistic cookie check only —
  real auth is `requireAuth()` from `src/lib/auth.ts`, called in every admin page, server
  action, and `/api/admin/*` handler. Keep it that way.
- **Content lives in D1** (posts/pages/projects/images tables), media in R2. Public pages are
  `force-dynamic` on purpose (instant publish). Don't add caching without `updateTag()`
  invalidation in the admin actions.
- **Dev-proxy quirk**: returning HTTP 401 from a route handler crashes the vinext 0.0.41 dev
  server. Use 403 for unauthenticated API responses.
- **Design system**: black & white only; Inter Tight/Inter; type roles in `src/app/globals.css`
  (`.statement`, `.index-list`, `.article`, `.meta`). No colors, cards, or shadows.
