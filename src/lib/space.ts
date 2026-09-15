import { marked } from "marked";
import { appEnv } from "@/lib/env";

export const SPACE_URL = "https://space.kuldeep.cc";

export const MAX_ARTIFACT_BYTES = 2 * 1024 * 1024;

export type ArtifactFormat = "html" | "markdown";

export interface SpaceArtifact {
  slug: string;
  title: string;
  summary: string;
  format: ArtifactFormat;
  r2Key: string;
  size: number;
  publishedBy: string;
  createdAt: string;
}

interface ArtifactRow {
  slug: string;
  title: string;
  summary: string;
  format: ArtifactFormat;
  r2_key: string;
  size: number;
  published_by: string;
  created_at: string;
}

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

/**
 * Slugs that would be shadowed by the host rewrite in src/proxy.ts (which
 * passes these prefixes straight through to the app) or that collide with
 * the hub itself. An artifact published under one of these is unreachable.
 */
const RESERVED_SLUGS = new Set([
  "_next",
  "_vinext",
  "admin",
  "api",
  "favicon",
  "favicon.ico",
  "media",
  "robots.txt",
  "sitemap.xml",
  "space",
]);

export function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64)
    .replace(/-$/, "");
}

export function slugError(slug: string): string | null {
  if (!SLUG_PATTERN.test(slug)) {
    return "Slug must be 1–64 characters of lowercase letters, numbers and hyphens, starting and ending alphanumeric.";
  }
  if (RESERVED_SLUGS.has(slug)) return `"${slug}" is reserved.`;
  return null;
}

function toArtifact(row: ArtifactRow): SpaceArtifact {
  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    format: row.format,
    r2Key: row.r2_key,
    size: row.size,
    publishedBy: row.published_by,
    createdAt: row.created_at.includes("T")
      ? row.created_at
      : row.created_at.replace(" ", "T") + "Z",
  };
}

export async function listArtifacts(): Promise<SpaceArtifact[]> {
  const { results } = await appEnv.DB.prepare(
    "SELECT * FROM space_artifacts ORDER BY created_at DESC",
  ).all<ArtifactRow>();
  return results.map(toArtifact);
}

export async function getArtifact(slug: string): Promise<SpaceArtifact | null> {
  const row = await appEnv.DB.prepare("SELECT * FROM space_artifacts WHERE slug = ?1")
    .bind(slug)
    .first<ArtifactRow>();
  return row ? toArtifact(row) : null;
}

/** Up to three free alternatives for a slug that is already claimed. */
export async function suggestSlugs(base: string): Promise<string[]> {
  const stem = base.replace(/-\d+$/, "").slice(0, 55) || "artifact";
  const candidates = [
    `${stem}-2`,
    `${stem}-${new Date().getUTCFullYear()}`,
    `${stem}-${crypto.randomUUID().slice(0, 4)}`,
    `${stem}-${crypto.randomUUID().slice(0, 6)}`,
  ].filter((slug) => slugError(slug) === null);

  const placeholders = candidates.map((_, i) => `?${i + 1}`).join(", ");
  const { results } = await appEnv.DB.prepare(
    `SELECT slug FROM space_artifacts WHERE slug IN (${placeholders})`,
  )
    .bind(...candidates)
    .all<{ slug: string }>();

  const taken = new Set(results.map((row) => row.slug));
  return candidates.filter((slug) => !taken.has(slug)).slice(0, 3);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Standalone twin of the site's `.article` type role — no Tailwind, no build step. */
const SHELL_CSS = `
:root{--bg:#fff;--fg:#0a0a0a;--muted:#737373;--faint:#a3a3a3;--rule:#e5e5e5;--code-bg:#f5f5f5;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--bg:#0a0a0a;--fg:#f5f5f5;--muted:#969696;--faint:#6b6b6b;--rule:#262626;--code-bg:#171717;color-scheme:dark}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font-family:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;font-size:1.125rem;line-height:1.7;-webkit-font-smoothing:antialiased}
main{width:100%;max-width:44rem;margin:0 auto;padding:4rem 1.25rem 7rem}
h1,h2,h3,h4{font-family:'Inter Tight','Inter',system-ui,sans-serif;letter-spacing:-0.02em;text-wrap:balance}
h1{font-size:clamp(2rem,5vw,2.75rem);font-weight:700;line-height:1.1;margin:0 0 2rem}
h2{font-size:1.6rem;font-weight:700;line-height:1.2;margin:2.75rem 0 .9rem}
h3{font-size:1.25rem;font-weight:650;line-height:1.3;margin:2.25rem 0 .75rem}
p{margin:1.1rem 0}
a{color:inherit;text-decoration:underline;text-decoration-color:var(--faint);text-underline-offset:3px}
a:hover{text-decoration-color:var(--fg)}
strong{font-weight:650}
ul,ol{margin:1.1rem 0;padding-left:1.4rem}
li{margin:.45rem 0}
li::marker{color:var(--muted)}
blockquote{margin:1.75rem 0;padding-left:1.25rem;border-left:3px solid var(--fg);font-weight:500}
code{font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:.85em;background:var(--code-bg);padding:.15em .4em;border-radius:4px}
pre{margin:1.75rem 0;padding:1.1rem 1.25rem;background:var(--code-bg);border-radius:8px;overflow-x:auto;font-size:.85rem;line-height:1.65}
pre code{background:none;padding:0}
img{display:block;margin:2rem auto;max-width:100%;height:auto;border-radius:6px}
hr{margin:3rem 0;border:0;border-top:1px solid var(--rule)}
table{width:100%;margin:1.75rem 0;border-collapse:collapse;font-size:.95rem}
th{text-align:left;font-weight:650;border-bottom:2px solid var(--fg);padding:.5rem .75rem .5rem 0}
td{border-bottom:1px solid var(--rule);padding:.5rem .75rem .5rem 0;vertical-align:top}
`.trim();

function wrapInShell(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap">
<style>${SHELL_CSS}</style>
</head>
<body>
<main>
${bodyHtml}
</main>
</body>
</html>`;
}

/**
 * Markdown is rendered into the site's type shell. Raw HTML is served as the
 * agent wrote it — full documents pass through untouched, bare fragments get
 * the shell so they are still a valid page.
 */
export async function renderArtifact(
  content: string,
  format: ArtifactFormat,
  title: string,
): Promise<string> {
  if (format === "markdown") {
    const html = await marked.parse(content, { gfm: true });
    return wrapInShell(title, html);
  }
  return /<html[\s>]/i.test(content) ? content : wrapInShell(title, content);
}

export interface PublishInput {
  slug: string;
  title: string;
  summary: string;
  format: ArtifactFormat;
  content: string;
  publishedBy: string;
}

export type PublishResult =
  | { ok: true; slug: string; url: string }
  | { ok: false; reason: "slug_taken"; suggestions: string[] };

export async function publishArtifact(input: PublishInput): Promise<PublishResult> {
  const html = await renderArtifact(input.content, input.format, input.title);
  const r2Key = `space/${input.slug}/index.html`;
  const size = new TextEncoder().encode(html).byteLength;

  // Claim the slug first: ON CONFLICT DO NOTHING makes this the atomic gate,
  // so a concurrent publish can never overwrite a live artifact in R2.
  const claimed = await appEnv.DB.prepare(
    `INSERT INTO space_artifacts (slug, title, summary, format, r2_key, size, published_by)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
     ON CONFLICT (slug) DO NOTHING
     RETURNING slug`,
  )
    .bind(input.slug, input.title, input.summary, input.format, r2Key, size, input.publishedBy)
    .first<{ slug: string }>();

  if (!claimed) {
    return { ok: false, reason: "slug_taken", suggestions: await suggestSlugs(input.slug) };
  }

  try {
    await appEnv.MEDIA.put(r2Key, html, {
      httpMetadata: { contentType: "text/html; charset=utf-8" },
    });
  } catch (error) {
    // Release the claim rather than leaving a row pointing at a missing object.
    await appEnv.DB.prepare("DELETE FROM space_artifacts WHERE slug = ?1").bind(input.slug).run();
    throw error;
  }

  return { ok: true, slug: input.slug, url: `${SPACE_URL}/${input.slug}` };
}

export async function deleteArtifact(slug: string): Promise<void> {
  const artifact = await getArtifact(slug);
  if (!artifact) return;
  await appEnv.MEDIA.delete(artifact.r2Key);
  await appEnv.DB.prepare("DELETE FROM space_artifacts WHERE slug = ?1").bind(slug).run();
}

// ---------- Publish keys ----------

export interface SpaceKey {
  id: string;
  label: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface KeyRow {
  id: string;
  label: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
}

function toKey(row: KeyRow): SpaceKey {
  return {
    id: row.id,
    label: row.label,
    keyPrefix: row.key_prefix,
    createdAt: row.created_at.includes("T")
      ? row.created_at
      : row.created_at.replace(" ", "T") + "Z",
    lastUsedAt: row.last_used_at
      ? row.last_used_at.replace(" ", "T") + "Z"
      : null,
  };
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hashKey(token: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)));
}

export async function listSpaceKeys(): Promise<SpaceKey[]> {
  const { results } = await appEnv.DB.prepare(
    "SELECT id, label, key_prefix, created_at, last_used_at FROM space_keys ORDER BY created_at DESC",
  ).all<KeyRow>();
  return results.map(toKey);
}

/** Returns the plaintext token exactly once — only its hash is stored. */
export async function createSpaceKey(label: string): Promise<string> {
  const token = "sk_" + toHex(crypto.getRandomValues(new Uint8Array(24)).buffer);
  await appEnv.DB.prepare(
    "INSERT INTO space_keys (id, label, key_hash, key_prefix) VALUES (?1, ?2, ?3, ?4)",
  )
    .bind(crypto.randomUUID(), label, await hashKey(token), token.slice(0, 11))
    .run();
  return token;
}

export async function revokeSpaceKey(id: string): Promise<void> {
  await appEnv.DB.prepare("DELETE FROM space_keys WHERE id = ?1").bind(id).run();
}

export async function verifySpaceKey(request: Request): Promise<SpaceKey | null> {
  const match = /^Bearer\s+(.+)$/i.exec((request.headers.get("authorization") ?? "").trim());
  if (!match) return null;

  const row = await appEnv.DB.prepare(
    "SELECT id, label, key_prefix, created_at, last_used_at FROM space_keys WHERE key_hash = ?1",
  )
    .bind(await hashKey(match[1]))
    .first<KeyRow>();
  if (!row) return null;

  await appEnv.DB.prepare("UPDATE space_keys SET last_used_at = datetime('now') WHERE id = ?1")
    .bind(row.id)
    .run();
  return toKey(row);
}
