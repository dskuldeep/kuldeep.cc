import { appEnv } from "@/lib/env";
import {
  extensionForFormat,
  mimeForFormat,
  renderViewer,
  type ArtifactFormat,
} from "@/lib/space-render";

export type { ArtifactFormat } from "@/lib/space-render";
export { ALL_FORMATS, isBinaryFormat, mimeForFormat } from "@/lib/space-render";

export const SPACE_URL = "https://space.kuldeep.cc";

export const MAX_ARTIFACT_BYTES = 2 * 1024 * 1024;

export type Visibility = "public" | "unlisted" | "private";

export const VISIBILITIES: readonly Visibility[] = ["public", "unlisted", "private"];

export function isVisibility(value: unknown): value is Visibility {
  return typeof value === "string" && (VISIBILITIES as readonly string[]).includes(value);
}

export interface SpaceArtifact {
  slug: string;
  title: string;
  summary: string;
  format: ArtifactFormat;
  r2Key: string;
  size: number;
  publishedBy: string;
  createdAt: string;
  mimeType: string | null;
  sourceKey: string | null;
  filename: string | null;
  language: string | null;
  visibility: Visibility;
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
  mime_type: string | null;
  source_key: string | null;
  filename: string | null;
  language: string | null;
  visibility: Visibility;
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
    mimeType: row.mime_type,
    sourceKey: row.source_key,
    filename: row.filename,
    language: row.language,
    visibility: row.visibility ?? "public",
  };
}

/** Every artifact, admin-only. Includes unlisted and private rows. */
export async function listArtifacts(): Promise<SpaceArtifact[]> {
  const { results } = await appEnv.DB.prepare(
    "SELECT * FROM space_artifacts ORDER BY created_at DESC",
  ).all<ArtifactRow>();
  return results.map(toArtifact);
}

/** Just what the public hub page shows: visibility='public'. */
export async function listPublicArtifacts(): Promise<SpaceArtifact[]> {
  const { results } = await appEnv.DB.prepare(
    "SELECT * FROM space_artifacts WHERE visibility = 'public' ORDER BY created_at DESC",
  ).all<ArtifactRow>();
  return results.map(toArtifact);
}

export async function setArtifactVisibility(slug: string, visibility: Visibility): Promise<void> {
  await appEnv.DB.prepare("UPDATE space_artifacts SET visibility = ?1 WHERE slug = ?2")
    .bind(visibility, slug)
    .run();
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

export interface PublishInput {
  slug: string;
  title: string;
  summary: string;
  format: ArtifactFormat;
  /** Text content, required for text formats. */
  textContent?: string;
  /** Raw bytes, required for binary formats. */
  binaryContent?: Uint8Array;
  language?: string;
  filename?: string;
  publishedBy: string;
  visibility?: Visibility;
}

export type PublishResult =
  | { ok: true; slug: string; url: string }
  | { ok: false; reason: "slug_taken"; suggestions: string[] };

export async function publishArtifact(input: PublishInput): Promise<PublishResult> {
  const language = input.language?.trim() || null;
  const ext = extensionForFormat(input.format, language);
  const sourceKey = `space/${input.slug}/source.${ext}`;
  const r2Key = `space/${input.slug}/index.html`;
  const filename = input.filename?.trim() || `${input.slug}.${ext}`;
  const sourceMime = mimeForFormat(input.format, language);

  const html = await renderViewer({
    format: input.format,
    title: input.title,
    slug: input.slug,
    language,
    textContent: input.textContent,
    binaryContent: input.binaryContent,
  });
  const size = new TextEncoder().encode(html).byteLength;

  // Claim the slug first: ON CONFLICT DO NOTHING makes this the atomic gate,
  // so a concurrent publish can never overwrite a live artifact in R2.
  const claimed = await appEnv.DB.prepare(
    `INSERT INTO space_artifacts
       (slug, title, summary, format, r2_key, size, published_by, mime_type, source_key, filename, language, visibility)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
     ON CONFLICT (slug) DO NOTHING
     RETURNING slug`,
  )
    .bind(
      input.slug,
      input.title,
      input.summary,
      input.format,
      r2Key,
      size,
      input.publishedBy,
      sourceMime,
      sourceKey,
      filename,
      language,
      input.visibility ?? "public",
    )
    .first<{ slug: string }>();

  if (!claimed) {
    return { ok: false, reason: "slug_taken", suggestions: await suggestSlugs(input.slug) };
  }

  try {
    // Rendered viewer.
    await appEnv.MEDIA.put(r2Key, html, {
      httpMetadata: { contentType: "text/html; charset=utf-8" },
    });
    // Original source, for download and (for PDFs) for the embedded viewer.
    const sourceBody =
      input.binaryContent ??
      (input.textContent ? new TextEncoder().encode(input.textContent) : new Uint8Array(0));
    await appEnv.MEDIA.put(sourceKey, sourceBody, {
      httpMetadata: { contentType: sourceMime },
    });
  } catch (error) {
    // Release the claim rather than leaving a row pointing at missing objects.
    await appEnv.DB.prepare("DELETE FROM space_artifacts WHERE slug = ?1").bind(input.slug).run();
    await appEnv.MEDIA.delete(r2Key).catch(() => {});
    await appEnv.MEDIA.delete(sourceKey).catch(() => {});
    throw error;
  }

  return { ok: true, slug: input.slug, url: `${SPACE_URL}/${input.slug}` };
}

export async function deleteArtifact(slug: string): Promise<void> {
  const artifact = await getArtifact(slug);
  if (!artifact) return;
  await appEnv.MEDIA.delete(artifact.r2Key);
  if (artifact.sourceKey) await appEnv.MEDIA.delete(artifact.sourceKey);
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
