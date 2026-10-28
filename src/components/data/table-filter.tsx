"use client";

import { useState } from "react";

/**
 * Progressive filter for a server-rendered table: hides <tbody> rows whose
 * text doesn't contain the query. The full table stays in the HTML for
 * crawlers; this only changes what a reader sees.
 */
export function TableFilter({ tableId, placeholder, total }: { tableId: string; placeholder: string; total: number }) {
  const [shown, setShown] = useState(total);
  return (
    <div className="table-filter">
      <input
        type="search"
        className="field"
        placeholder={placeholder}
        aria-label={placeholder}
        aria-controls={tableId}
        onChange={(e) => {
          const q = e.target.value.trim().toLowerCase();
          const rows = document.querySelectorAll<HTMLTableRowElement>(`#${tableId} tbody tr`);
          let n = 0;
          rows.forEach((row) => {
            const hit = !q || (row.textContent ?? "").toLowerCase().includes(q);
            row.hidden = !hit;
            if (hit) n++;
          });
          setShown(n);
        }}
      />
      <span className="meta" aria-live="polite">
        {shown} of {total}
      </span>
    </div>
  );
}
