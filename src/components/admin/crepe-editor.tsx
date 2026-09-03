"use client";

import { useEffect, useRef } from "react";
import { Crepe } from "@milkdown/crepe";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";

async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/images", { method: "POST", body: form });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Upload failed (${res.status}): ${body}`);
  }
  const { url } = (await res.json()) as { url: string };
  return url;
}

/**
 * Ghost-style WYSIWYG markdown editor (Milkdown Crepe).
 * Mount-only: remount with a new `key` to change the document.
 */
export function CrepeEditor({
  defaultValue,
  onChange,
}: {
  defaultValue: string;
  onChange: (markdown: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const crepe = new Crepe({
      root,
      defaultValue,
      featureConfigs: {
        [Crepe.Feature.ImageBlock]: {
          onUpload: uploadImage,
          inlineOnUpload: uploadImage,
          blockOnUpload: uploadImage,
        },
      },
    });

    crepe.on((api) => {
      api.markdownUpdated((_ctx, markdown) => {
        onChangeRef.current(markdown);
      });
    });

    let destroyed = false;
    crepe.create().catch(() => {});

    return () => {
      if (!destroyed) {
        destroyed = true;
        crepe.destroy().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only by design
  }, []);

  return <div ref={rootRef} className="crepe-root" />;
}
