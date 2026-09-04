"use client";

import { useCallback, useEffect, useState } from "react";
import type { Page } from "@/lib/content";
import { savePage } from "@/app/admin/actions";
import { CrepeEditor } from "@/components/admin/crepe-editor";
import { externalizeImages, hasInlineImages } from "@/lib/externalize-images";

type SaveState = "saved" | "dirty" | "saving" | "uploading" | "error";

export function PageEditor({ page, titleHint }: { page: Page; titleHint?: string }) {
  const [title, setTitle] = useState(page.title);
  const [contentMd, setContentMd] = useState(page.contentMd);
  const [rawMode, setRawMode] = useState(false);
  const [editorEpoch, setEditorEpoch] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [saveError, setSaveError] = useState("");

  const doSave = useCallback(async () => {
    try {
      let md = contentMd;
      if (hasInlineImages(md)) {
        setSaveState("uploading");
        const result = await externalizeImages(md);
        md = result.md;
        setContentMd(md);
        if (result.uploaded > 0 && !rawMode) setEditorEpoch((n) => n + 1);
      }
      setSaveState("saving");
      const result = await savePage(page.slug, title, md);
      if (result.ok) {
        setSaveState("saved");
        setSaveError("");
      } else {
        setSaveState("error");
        setSaveError(result.error);
      }
    } catch (err) {
      setSaveState("error");
      setSaveError(err instanceof Error ? err.message : "Save failed — check your connection.");
    }
  }, [page.slug, title, contentMd, rawMode]);

  useEffect(() => {
    if (saveState !== "dirty") return;
    const timer = setTimeout(doSave, 1500);
    return () => clearTimeout(timer);
  }, [saveState, doSave]);

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
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className={`meta ${saveState === "error" ? "font-semibold" : ""}`}>{saveLabel}</span>
        <button
          type="button"
          className="btn-ghost btn"
          onClick={() => {
            setRawMode((prev) => !prev);
            setEditorEpoch((n) => n + 1);
          }}
        >
          {rawMode ? "Rich editor" : "Markdown"}
        </button>
      </div>

      <label className="flex flex-col gap-1">
        <span className="meta">{titleHint ?? "Title"}</span>
        <input
          className="field text-xl font-bold"
          style={{ fontFamily: "var(--font-display)" }}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSaveState("dirty");
          }}
        />
      </label>

      {rawMode ? (
        <textarea
          className="field min-h-[50vh] font-mono text-[0.9rem] leading-relaxed"
          value={contentMd}
          onChange={(e) => {
            setContentMd(e.target.value);
            setSaveState("dirty");
          }}
        />
      ) : (
        <div className="rounded-md border border-[var(--rule)]">
          <CrepeEditor
            key={editorEpoch}
            defaultValue={contentMd}
            onChange={(markdown) => {
              setContentMd(markdown);
              setSaveState("dirty");
            }}
          />
        </div>
      )}
    </div>
  );
}
