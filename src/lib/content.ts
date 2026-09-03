import { appEnv } from "@/lib/env";

export interface PostListItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  status: "draft" | "published";
  publishedAt: string | null;
  updatedAt: string;
  readingTime: string;
}

export interface Post extends PostListItem {
  contentMd: string;
}

export interface Page {
  slug: string;
  title: string;
  contentMd: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  title: string;
  url: string | null;
  description: string;
  year: number | null;
  sortOrder: number;
}

interface PostRow {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content_md: string;
  tags: string;
  status: "draft" | "published";
  published_at: string | null;
  updated_at: string;
}

function parseTags(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** SQLite's datetime('now') yields "YYYY-MM-DD HH:MM:SS" in UTC — normalize to ISO 8601. */
function toIso(value: string | null): string | null {
  if (!value) return null;
  return value.includes("T") ? value : value.replace(" ", "T") + "Z";
}

function readingTimeOf(contentMd: string): string {
  const words = contentMd.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function toListItem(row: PostRow): PostListItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    tags: parseTags(row.tags),
    status: row.status,
    publishedAt: toIso(row.published_at),
    updatedAt: toIso(row.updated_at)!,
    readingTime: readingTimeOf(row.content_md),
  };
}

function toPost(row: PostRow): Post {
  return { ...toListItem(row), contentMd: row.content_md };
}

const POST_COLUMNS =
  "id, slug, title, excerpt, content_md, tags, status, published_at, updated_at";

export async function getPublishedPosts(): Promise<PostListItem[]> {
  const { results } = await appEnv.DB.prepare(
    `SELECT ${POST_COLUMNS} FROM posts WHERE status = 'published' ORDER BY published_at DESC`,
  ).all<PostRow>();
  return results.map(toListItem);
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  const row = await appEnv.DB.prepare(
    `SELECT ${POST_COLUMNS} FROM posts WHERE slug = ?1 AND status = 'published'`,
  )
    .bind(slug)
    .first<PostRow>();
  return row ? toPost(row) : null;
}

export async function getPage(slug: string): Promise<Page | null> {
  const row = await appEnv.DB.prepare(
    "SELECT slug, title, content_md, updated_at FROM pages WHERE slug = ?1",
  )
    .bind(slug)
    .first<{ slug: string; title: string; content_md: string; updated_at: string }>();
  return row
    ? { slug: row.slug, title: row.title, contentMd: row.content_md, updatedAt: row.updated_at }
    : null;
}

export async function getProjects(): Promise<Project[]> {
  const { results } = await appEnv.DB.prepare(
    "SELECT id, title, url, description, year, sort_order FROM projects ORDER BY sort_order ASC, year DESC",
  ).all<{
    id: number;
    title: string;
    url: string | null;
    description: string;
    year: number | null;
    sort_order: number;
  }>();
  return results.map((row) => ({
    id: row.id,
    title: row.title,
    url: row.url,
    description: row.description,
    year: row.year,
    sortOrder: row.sort_order,
  }));
}

// ---------- Admin queries (call requireAuth() before using) ----------

export async function getAllPosts(): Promise<PostListItem[]> {
  const { results } = await appEnv.DB.prepare(
    `SELECT ${POST_COLUMNS} FROM posts ORDER BY COALESCE(published_at, updated_at) DESC`,
  ).all<PostRow>();
  return results.map(toListItem);
}

export async function getPostById(id: number): Promise<Post | null> {
  const row = await appEnv.DB.prepare(`SELECT ${POST_COLUMNS} FROM posts WHERE id = ?1`)
    .bind(id)
    .first<PostRow>();
  return row ? toPost(row) : null;
}
