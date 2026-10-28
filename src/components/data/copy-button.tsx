"use client";

import { useState } from "react";

/** Copies `text` to the clipboard and confirms inline. */
export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-ghost"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          // Clipboard blocked — the text is still selectable on the page.
        }
      }}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
