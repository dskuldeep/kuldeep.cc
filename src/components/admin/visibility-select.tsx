"use client";

import type { Visibility } from "@/lib/space";

/**
 * Auto-submits the surrounding <form> on change so toggling visibility is a
 * single click. The parent form still targets the server action, so this
 * gracefully falls back to a plain form under noscript.
 */
export function VisibilitySelect({
  name,
  defaultValue,
  options,
}: {
  name: string;
  defaultValue: Visibility;
  options: readonly Visibility[];
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className="field meta"
      onChange={(event) => event.currentTarget.form?.requestSubmit()}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
