"use client";

import { useActionState, useState } from "react";
import { createSpaceKeyAction } from "@/app/admin/actions";

export function SpaceKeyForm() {
  const [token, formAction, pending] = useActionState(createSpaceKeyAction, null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div>
      <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
        <input
          className="field flex-1"
          name="label"
          placeholder="Label — e.g. Claude desktop"
          maxLength={60}
          required
          autoComplete="off"
        />
        <button type="submit" className="btn shrink-0" disabled={pending}>
          {pending ? "Creating…" : "Create key"}
        </button>
      </form>

      {token && (
        <div className="mt-4 rounded-md border border-[var(--fg)] p-4">
          <p className="meta mb-2">
            Copy this now — it is hashed on the server and will never be shown again.
          </p>
          <div className="flex items-center gap-3">
            <code className="flex-1 overflow-x-auto rounded-md bg-[var(--code-bg)] px-3 py-2 text-[0.85rem]">
              {token}
            </code>
            <button type="button" className="btn shrink-0" onClick={copy}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
