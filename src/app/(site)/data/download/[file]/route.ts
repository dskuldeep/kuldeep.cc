import { datasetBySlug, downloadRows } from "@/lib/data";

function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : Array.isArray(value) ? value.join(" ") : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const cols = Object.keys(rows[0]);
  return [cols.join(","), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(","))].join("\r\n") + "\r\n";
}

/** /data/download/<dataset>.csv|json — the same rows the dataset page renders. */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const m = /^([a-z0-9-]+)\.(csv|json)$/.exec(file);
  const entry = m ? datasetBySlug(m[1]) : undefined;
  const rows = m && entry ? downloadRows(m[1]) : null;
  if (!m || !entry || !rows) return new Response("Not found", { status: 404 });

  const headers = {
    "Cache-Control": "public, max-age=3600",
    "Content-Disposition": `inline; filename="${file}"`,
    Link: `<https://kuldeep.cc${entry.path}>; rel="canonical"`,
    "X-Robots-Tag": "noindex",
    "Access-Control-Allow-Origin": "*",
  };

  if (m[2] === "csv") {
    return new Response(toCsv(rows), { headers: { ...headers, "Content-Type": "text/csv; charset=utf-8" } });
  }
  const body = {
    dataset: entry.title,
    url: `https://kuldeep.cc${entry.path}`,
    creator: "Kuldeep Paul (kuldeep.cc)",
    license: entry.license ?? "CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/",
    updated: entry.updated,
    rows,
  };
  return Response.json(body, { headers });
}
