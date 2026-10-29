"use client";

import { Download, Table2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ColDef, GridApi } from "ag-grid-community";

/**
 * "View data" modal for a /data dataset: the same rows as the CSV/JSON
 * download, in a sortable, filterable grid. AG Grid is imported only when the
 * modal first opens, and themed with the site's own ink so it stays black and
 * white in both themes.
 */

type Row = Record<string, unknown>;

const isUrl = (v: unknown) => typeof v === "string" && /^https?:\/\//.test(v);

function columns(rows: Row[]): ColDef[] {
  const keys = Object.keys(rows[0] ?? {});
  return keys.map((key) => {
    const sample = rows.slice(0, 200).map((r) => r[key]).filter((v) => v !== null && v !== "");
    const numeric = sample.length > 0 && sample.every((v) => typeof v === "number");
    const link = sample.length > 0 && sample.some(isUrl);
    return {
      field: key,
      headerName: key,
      filter: numeric ? "agNumberColumnFilter" : "agTextColumnFilter",
      type: numeric ? "numericColumn" : undefined,
      minWidth: numeric ? 90 : 120,
      maxWidth: Math.min(420, Math.round(window.innerWidth * 0.55)),
      valueFormatter: (p) => (Array.isArray(p.value) ? p.value.join(" ") : (p.value ?? "")) as string,
      cellRenderer: link
        ? (p: { value: unknown }) => {
            const first = String(p.value ?? "").split(" ")[0];
            if (!isUrl(first)) return String(p.value ?? "");
            const a = document.createElement("a");
            a.href = first;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.className = "link";
            a.textContent = new URL(first).hostname.replace(/^www\./, "") + new URL(first).pathname.slice(0, 40);
            return a;
          }
        : undefined,
    } satisfies ColDef;
  });
}

export function DatasetViewer({ slug, title }: { slug: string; title: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<GridApi | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [shown, setShown] = useState(0);
  const [total, setTotal] = useState(0);

  const open = () => {
    dialogRef.current?.showModal();
    if (state === "idle") setState("loading");
  };

  useEffect(() => {
    if (state !== "loading") return;
    let live = true;
    (async () => {
      try {
        const [{ AllCommunityModule, ModuleRegistry, createGrid, themeQuartz }, res] = await Promise.all([
          import("ag-grid-community"),
          fetch(`/data/download/${slug}.json`),
        ]);
        const { rows } = (await res.json()) as { rows: Row[] };
        if (!live || !gridRef.current) return;
        ModuleRegistry.registerModules([AllCommunityModule]);
        const theme = themeQuartz.withParams({
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          backgroundColor: "var(--bg)",
          foregroundColor: "var(--fg)",
          textColor: "var(--fg)",
          headerBackgroundColor: "var(--bg)",
          headerTextColor: "var(--fg)",
          headerFontWeight: 650,
          borderColor: "var(--rule)",
          rowBorder: { color: "var(--rule)" },
          accentColor: "var(--fg)",
          chromeBackgroundColor: "var(--bg)",
          oddRowBackgroundColor: "var(--bg)",
          rowHoverColor: "var(--code-bg)",
          selectedRowBackgroundColor: "var(--code-bg)",
          inputBorder: { color: "var(--rule)" },
          inputFocusBorder: { color: "var(--fg)" },
          wrapperBorderRadius: 0,
          borderRadius: 4,
        });
        apiRef.current = createGrid(gridRef.current, {
          theme,
          rowData: rows,
          columnDefs: columns(rows),
          defaultColDef: { sortable: true, resizable: true, floatingFilter: true, filter: true },
          autoSizeStrategy: { type: "fitCellContents" },
          enableCellTextSelection: true,
          onModelUpdated: (e) => setShown(e.api.getDisplayedRowCount()),
        });
        setTotal(rows.length);
        setShown(rows.length);
        setState("ready");
      } catch {
        if (live) setState("error");
      }
    })();
    return () => {
      live = false;
    };
  }, [state, slug]);

  useEffect(() => () => apiRef.current?.destroy(), []);

  return (
    <>
      <span className="dv-actions">
        <button type="button" className="btn" onClick={open}>
          <Table2 size={16} aria-hidden="true" />
          View data
        </button>
        <a className="btn btn-ghost" href={`/data/download/${slug}.csv`} download>
          <Download size={16} aria-hidden="true" />
          Download CSV
        </a>
        <a className="btn btn-ghost" href={`/data/download/${slug}.json`} download>
          JSON
        </a>
      </span>

      <dialog
        ref={dialogRef}
        className="dv-dialog"
        aria-labelledby={`dv-${slug}`}
        onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
      >
        <div className="dv-head">
          <div className="min-w-0">
            <h2 id={`dv-${slug}`} className="dv-title">
              {title}
            </h2>
            <p className="meta m-0">
              {state === "ready"
                ? `${shown.toLocaleString("en-US")} of ${total.toLocaleString("en-US")} rows · sort and filter any column`
                : state === "error"
                  ? "Couldn't load the data. Use the download instead."
                  : "Loading…"}
            </p>
          </div>
          <div className="dv-tools">
            <input
              type="search"
              className="field"
              placeholder="Search all columns"
              aria-label="Search all columns"
              disabled={state !== "ready"}
              onChange={(e) => apiRef.current?.setGridOption("quickFilterText", e.target.value)}
            />
            <a className="btn" href={`/data/download/${slug}.csv`} download>
              <Download size={16} aria-hidden="true" />
              CSV
            </a>
            <a className="btn btn-ghost" href={`/data/download/${slug}.json`} download>
              JSON
            </a>
            <button type="button" className="btn btn-ghost" aria-label="Close" onClick={() => dialogRef.current?.close()}>
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div ref={gridRef} className="dv-grid" />
      </dialog>
    </>
  );
}
