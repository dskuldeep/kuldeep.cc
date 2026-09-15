"use client";

import { useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "space_publish_key";
const PLACEHOLDER = "YOUR_PUBLISH_KEY";

// The key lives in localStorage, read through an external store so the server
// render (empty) and the client render stay consistent without an effect.
let cached: string | null = null;
const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function getSnapshot(): string {
  if (cached === null) cached = localStorage.getItem(STORAGE_KEY) ?? "";
  return cached;
}

function storeKey(value: string): void {
  cached = value;
  localStorage.setItem(STORAGE_KEY, value);
  for (const listener of listeners) listener();
}

function buildPrompt(key: string): string {
  return `You can publish artifacts to my host at space.kuldeep.cc.

When I ask you to "publish this to space", do this:

1. Finish the artifact in the appropriate format.
2. POST it:

   curl -X POST https://space.kuldeep.cc/api/space/publish \\
     -H "Authorization: Bearer ${key || PLACEHOLDER}" \\
     -H "Content-Type: application/json" \\
     -d '{"slug":"kebab-case-name","title":"Human title","summary":"One sentence.","format":"html","content":"<!doctype html>..."}'

   For binary formats (pdf/docx/xlsx), base64-encode the bytes and send them as
   \`content_base64\` instead of \`content\`. Every other field is the same.

3. A 201 returns {"url":"https://space.kuldeep.cc/<slug>"} — reply to me with that link.
4. A 409 means the slug is taken and the response carries "suggestions". Pick the best one and retry. Never try to overwrite an existing artifact.

Rules
- slug: lowercase letters, numbers and hyphens, 1-64 characters. Derive it from the title unless I name one.
- format:
  - "html" — served as-is (your own CSS/JS works).
  - "markdown" — rendered into the site's black-and-white type.
  - "text" — plain text, monospace.
  - "code" — syntax-highlighted. Add "language" (e.g. "python", "ts", "go").
  - "json" — pretty-printed and highlighted.
  - "csv" — rendered as a table.
  - "pdf" — embedded viewer, download link. Use content_base64.
  - "docx" — converted to HTML, download link. Use content_base64.
  - "xlsx" — one table per sheet, download link. Use content_base64.
- Optional "filename": override the download filename (defaults to <slug>.<ext>).
- Optional "visibility": "public" (default, listed on the hub), "unlisted" (public URL, hidden from the hub), or "private" (only I can view, hidden from the hub). Ask me first before publishing anything that could be personal — default to unlisted if unsure.
- 2 MB maximum per artifact.
- Public artifacts are listed on https://space.kuldeep.cc. Unlisted and private are not.
- To test a slug before publishing: GET https://space.kuldeep.cc/api/space/check?slug=<slug> with the same Authorization header.`;
}

export function PublishPrompt() {
  const key = useSyncExternalStore(subscribe, getSnapshot, () => "");
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(buildPrompt(key));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className="field flex-1 font-mono text-[0.85rem]"
          type="password"
          value={key}
          onChange={(event) => storeKey(event.target.value)}
          placeholder="Paste your publish key"
          spellCheck={false}
          autoComplete="off"
        />
        <button type="button" className="btn shrink-0" onClick={copy}>
          {copied ? "Copied" : "Copy prompt"}
        </button>
      </div>
      <p className="meta mt-2">
        Stored in this browser only, never sent anywhere. Leave it blank to copy the prompt with a{" "}
        <code>{PLACEHOLDER}</code> placeholder.
      </p>

      <pre className="mt-5 overflow-x-auto rounded-lg border border-[var(--rule)] bg-[var(--code-bg)] p-5 text-[0.78rem] leading-relaxed">
        {buildPrompt(key ? "•".repeat(Math.min(key.length, 24)) : "")}
      </pre>
    </div>
  );
}
