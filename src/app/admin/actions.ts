"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  requireAuth,
  SESSION_COOKIE,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";
import { appEnv } from "@/lib/env";

// ---------- Auth ----------

export async function login(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  if (!(await verifyPassword(password))) {
    redirect("/admin/login?error=1");
  }
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions);
  redirect("/admin");
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ---------- Posts ----------

export interface PostFields {
  title: string;
  slug: string;
  excerpt: string;
  contentMd: string;
  tags: string[];
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "untitled"
  );
}

export async function createDraftPost(): Promise<void> {
  await requireAuth();
  const slug = `untitled-${Date.now()}`;
  const result = await appEnv.DB.prepare(
    "INSERT INTO posts (slug, title) VALUES (?1, 'Untitled') RETURNING id",
  )
    .bind(slug)
    .first<{ id: number }>();
  redirect(`/admin/posts/${result!.id}`);
}

export async function savePost(
  id: number,
  fields: PostFields,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAuth();
  const slug = slugify(fields.slug || fields.title);
  try {
    await appEnv.DB.prepare(
      `UPDATE posts SET title = ?1, slug = ?2, excerpt = ?3, content_md = ?4, tags = ?5,
         updated_at = datetime('now') WHERE id = ?6`,
    )
      .bind(
        fields.title.trim() || "Untitled",
        slug,
        fields.excerpt.trim(),
        fields.contentMd,
        JSON.stringify(fields.tags.map((t) => t.trim()).filter(Boolean)),
        id,
      )
      .run();
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      error: message.includes("UNIQUE") ? `Slug "${slug}" is already taken.` : message,
    };
  }
}

export async function publishPost(id: number): Promise<void> {
  await requireAuth();
  await appEnv.DB.prepare(
    `UPDATE posts SET status = 'published',
       published_at = COALESCE(published_at, datetime('now')),
       updated_at = datetime('now') WHERE id = ?1`,
  )
    .bind(id)
    .run();
}

export async function unpublishPost(id: number): Promise<void> {
  await requireAuth();
  await appEnv.DB.prepare(
    "UPDATE posts SET status = 'draft', updated_at = datetime('now') WHERE id = ?1",
  )
    .bind(id)
    .run();
}

export async function deletePost(id: number): Promise<void> {
  await requireAuth();
  await appEnv.DB.prepare("DELETE FROM posts WHERE id = ?1").bind(id).run();
  redirect("/admin");
}

// ---------- Pages ----------

const EDITABLE_PAGES = new Set(["home", "about"]);

export async function savePage(
  slug: string,
  title: string,
  contentMd: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAuth();
  if (!EDITABLE_PAGES.has(slug)) return { ok: false, error: "Unknown page." };
  await appEnv.DB.prepare(
    `UPDATE pages SET title = ?1, content_md = ?2, updated_at = datetime('now') WHERE slug = ?3`,
  )
    .bind(title.trim(), contentMd, slug)
    .run();
  return { ok: true };
}

// ---------- Projects ----------

export async function saveProject(formData: FormData): Promise<void> {
  await requireAuth();
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const title = String(formData.get("title") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim();
  const yearRaw = String(formData.get("year") ?? "").trim();
  const year = yearRaw ? Number(yearRaw) : null;
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  if (!title) return;

  if (id) {
    await appEnv.DB.prepare(
      "UPDATE projects SET title = ?1, url = ?2, description = ?3, year = ?4, sort_order = ?5 WHERE id = ?6",
    )
      .bind(title, url, description, year, sortOrder, id)
      .run();
  } else {
    await appEnv.DB.prepare(
      "INSERT INTO projects (title, url, description, year, sort_order) VALUES (?1, ?2, ?3, ?4, ?5)",
    )
      .bind(title, url, description, year, sortOrder)
      .run();
  }
  redirect("/admin/projects");
}

export async function deleteProject(formData: FormData): Promise<void> {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (id) await appEnv.DB.prepare("DELETE FROM projects WHERE id = ?1").bind(id).run();
  redirect("/admin/projects");
}

// ---------- Images ----------

export async function deleteImage(formData: FormData): Promise<void> {
  await requireAuth();
  const key = String(formData.get("key") ?? "");
  if (!key) return;
  await appEnv.MEDIA.delete(key);
  await appEnv.DB.prepare("DELETE FROM images WHERE key = ?1").bind(key).run();
  redirect("/admin/images");
}
