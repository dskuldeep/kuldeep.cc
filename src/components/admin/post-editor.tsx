"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Post } from "@/lib/content";
import {
  deletePost,
  publishPost,
  savePost,
  unpublishPost,
  type PostFields,
} from "@/app/admin/actions";
import { CrepeEditor } from "@/components/admin/crepe-editor";
import { externalizeImages, hasInlineImages } from "@/lib/externalize-images";

type SaveState = "saved" | "dirty" | "saving" | "uploading" | "error";

const MAX_CONTENT_BYTES = 1_500_000;

export function PostEditor({ post }: { post: Post }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [tags, setTags] = useState(post.tags.join(", "));
  const [contentMd, setContentMd] = useState(post.contentMd);
  const [status, setStatus] = useState(post.status);
  const [rawMode, setRawMode] = useState(false);
  const [editorEpoch, setEditorEpoch] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [saveError, setSaveError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const doSave = useCallback(async (): Promise<boolean> => {
    try {
      let md = contentMd;

      // Pasted images arrive as inline base64 — upload them to R2 and swap in
      // /media URLs before saving, or the payload blows the action body limit.
      if (hasInlineImages(md)) {
        setSaveState("uploading");
        const result = await externalizeImages(md);
        md = result.md;
        setContentMd(md);
        if (result.uploaded > 0 && !rawMode) {
          // Remount the rich editor so it shows the uploaded images.
          setEditorEpoch((n) => n + 1);
        }
      }

      if (new Blob([md]).size > MAX_CONTENT_BYTES) {
        setSaveState("error");
        setSaveError("Post is too large to save (over 1.5 MB of text). Split it up.");
        return false;
      }

      setSaveState("saving");
      const fields: PostFields = {
        title,
        slug,
        excerpt,
        contentMd: md,
        tags: tags.split(","),
      };
      const result = await savePost(post.id, fields);
      if (result.ok) {
        setSaveState("saved");
        setSaveError("");
        return true;
      }
      setSaveState("error");
      setSaveError(result.error);
      return false;
    } catch (err) {
      setSaveState("error");
      setSaveError(err instanceof Error ? err.message : "Save failed — check your connection.");
      return false;
    }
  }, [post.id, title, slug, excerpt, contentMd, tags, rawMode]);

  // Debounced autosave
  useEffect(() => {
    if (saveState !== "dirty") return;
    const timer = setTimeout(doSave, 1500);
    return () => clearTimeout(timer);
  }, [saveState, doSave]);

  const markDirty = () => setSaveState("dirty");

  const toggleRawMode = () => {
    // Remount the rich editor with the latest markdown when switching back.
    setRawMode((prev) => !prev);
    setEditorEpoch((n) => n + 1);
  };

  const onPublishToggle = () => {
    startTransition(async () => {
      try {
        // Never publish a version that failed to save.
        if (!(await doSave())) return;
        if (status === "published") {
          await unpublishPost(post.id);
          setStatus("draft");
        } else {
          await publishPost(post.id);
          setStatus("published");
        }
        router.refresh();
      } catch (err) {
        setSaveState("error");
        setSaveError(err instanceof Error ? err.message : "Publish failed — try again.");
      }
    });
  };

  const onDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    startTransition(async () => {
      try {
        await deletePost(post.id);
      } catch (err) {
        // deletePost redirects on success (throws NEXT_REDIRECT) — rethrow those.
        if (err && typeof err === "object" && "digest" in err) throw err;
        setSaveState("error");
        setSaveError(err instanceof Error ? err.message : "Delete failed — try again.");
      }
    });
  };

  const saveLabel =
    saveState === "saved"
      ? "Saved"
      : saveState === "saving"
        ? "Saving…"
        : saveState === "uploading"
          ? "Uploading pasted images…"
          : saveState === "dirty"
            ? "Unsaved changes"
            : `Error: ${saveError}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={`meta ${saveState === "error" ? "font-semibold" : ""}`}>{saveLabel}</span>
        <div className="flex items-center gap-3">
          {status === "published" && (
            <a href={`/writing/${slug}`} target="_blank" rel="noreferrer" className="link meta">
              View live
            </a>
          )}
          <button type="button" className="btn-ghost btn" onClick={toggleRawMode}>
            {rawMode ? "Rich editor" : "Markdown"}
          </button>
          <button type="button" className="btn" onClick={onPublishToggle} disabled={isPending}>
            {status === "published" ? "Unpublish" : "Publish"}
          </button>
          <button type="button" className="btn-danger btn" onClick={onDelete} disabled={isPending}>
            {confirmDelete ? "Really delete?" : "Delete"}
          </button>
        </div>
      </div>

      <input
        className="field text-2xl font-bold"
        style={{ fontFamily: "var(--font-display)" }}
        value={title}
        placeholder="Post title"
        onChange={(e) => {
          setTitle(e.target.value);
          markDirty();
        }}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="meta">Slug</span>
          <input
            className="field"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              markDirty();
            }}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="meta">Tags (comma-separated)</span>
          <input
            className="field"
            value={tags}
            onChange={(e) => {
              setTags(e.target.value);
              markDirty();
            }}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="meta">Excerpt</span>
        <textarea
          className="field"
          rows={2}
          value={excerpt}
          onChange={(e) => {
            setExcerpt(e.target.value);
            markDirty();
          }}
        />
      </label>

      {rawMode ? (
        <textarea
          className="field min-h-[60vh] font-mono text-[0.9rem] leading-relaxed"
          value={contentMd}
          onChange={(e) => {
            setContentMd(e.target.value);
            markDirty();
          }}
        />
      ) : (
        <div className="rounded-md border border-[var(--rule)]">
          <CrepeEditor
            key={editorEpoch}
            defaultValue={contentMd}
            onChange={(markdown) => {
              setContentMd(markdown);
              markDirty();
            }}
          />
        </div>
      )}
    </div>
  );
}
