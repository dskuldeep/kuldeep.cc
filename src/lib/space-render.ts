import { marked } from "marked";

export type ArtifactFormat =
  | "html"
  | "markdown"
  | "text"
  | "code"
  | "json"
  | "csv"
  | "pdf"
  | "docx"
  | "xlsx";

export const TEXT_FORMATS: readonly ArtifactFormat[] = [
  "html",
  "markdown",
  "text",
  "code",
  "json",
  "csv",
];

export const BINARY_FORMATS: readonly ArtifactFormat[] = ["pdf", "docx", "xlsx"];

export const ALL_FORMATS: readonly ArtifactFormat[] = [...TEXT_FORMATS, ...BINARY_FORMATS];

/** MIME type for the *original* source of an artifact, used on download. */
export function mimeForFormat(format: ArtifactFormat, language?: string | null): string {
  switch (format) {
    case "html":
      return "text/html; charset=utf-8";
    case "markdown":
      return "text/markdown; charset=utf-8";
    case "text":
      return "text/plain; charset=utf-8";
    case "code":
      return `text/plain; charset=utf-8${language ? `; x-language=${language}` : ""}`;
    case "json":
      return "application/json; charset=utf-8";
    case "csv":
      return "text/csv; charset=utf-8";
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }
}

/** File extension for the source file that gets stored in R2 and offered for download. */
export function extensionForFormat(format: ArtifactFormat, language?: string | null): string {
  switch (format) {
    case "html":
      return "html";
    case "markdown":
      return "md";
    case "text":
      return "txt";
    case "code":
      return language && /^[a-z0-9]+$/i.test(language) ? language.toLowerCase() : "txt";
    case "json":
      return "json";
    case "csv":
      return "csv";
    case "pdf":
      return "pdf";
    case "docx":
      return "docx";
    case "xlsx":
      return "xlsx";
  }
}

export function isBinaryFormat(format: ArtifactFormat): boolean {
  return BINARY_FORMATS.includes(format);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const SHELL_CSS = `
:root{--bg:#fff;--fg:#0a0a0a;--muted:#737373;--faint:#a3a3a3;--rule:#e5e5e5;--code-bg:#f5f5f5;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--bg:#0a0a0a;--fg:#f5f5f5;--muted:#969696;--faint:#6b6b6b;--rule:#262626;--code-bg:#171717;color-scheme:dark}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font-family:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;font-size:1.125rem;line-height:1.7;-webkit-font-smoothing:antialiased}
main{width:100%;max-width:44rem;margin:0 auto;padding:4rem 1.25rem 7rem}
main.wide{max-width:64rem}
h1,h2,h3,h4{font-family:'Inter Tight','Inter',system-ui,sans-serif;letter-spacing:-0.02em;text-wrap:balance}
h1{font-size:clamp(2rem,5vw,2.75rem);font-weight:700;line-height:1.1;margin:0 0 2rem}
h2{font-size:1.6rem;font-weight:700;line-height:1.2;margin:2.75rem 0 .9rem}
h3{font-size:1.25rem;font-weight:650;line-height:1.3;margin:2.25rem 0 .75rem}
p{margin:1.1rem 0}
a{color:inherit;text-decoration:underline;text-decoration-color:var(--faint);text-underline-offset:3px}
a:hover{text-decoration-color:var(--fg)}
strong{font-weight:650}
ul,ol{margin:1.1rem 0;padding-left:1.4rem}
li{margin:.45rem 0}
li::marker{color:var(--muted)}
blockquote{margin:1.75rem 0;padding-left:1.25rem;border-left:3px solid var(--fg);font-weight:500}
code{font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:.85em;background:var(--code-bg);padding:.15em .4em;border-radius:4px}
pre{margin:1.75rem 0;padding:1.1rem 1.25rem;background:var(--code-bg);border-radius:8px;overflow-x:auto;font-size:.85rem;line-height:1.65}
pre code{background:none;padding:0}
img{display:block;margin:2rem auto;max-width:100%;height:auto;border-radius:6px}
hr{margin:3rem 0;border:0;border-top:1px solid var(--rule)}
table{width:100%;margin:1.75rem 0;border-collapse:collapse;font-size:.95rem}
th{text-align:left;font-weight:650;border-bottom:2px solid var(--fg);padding:.5rem .75rem .5rem 0}
td{border-bottom:1px solid var(--rule);padding:.5rem .75rem .5rem 0;vertical-align:top}
.doc-header{margin-bottom:2.5rem;padding-bottom:1.5rem;border-bottom:1px solid var(--rule)}
.doc-header h1{margin:0}
.doc-meta{margin-top:.5rem;color:var(--muted);font-size:.9rem}
.doc-meta a{margin-left:1rem}
.pdf-frame{width:100%;height:calc(100vh - 8rem);min-height:36rem;border:1px solid var(--rule);border-radius:8px;background:var(--code-bg)}
`.trim();

interface ShellOptions {
  wide?: boolean;
  extraHead?: string;
  extraBodyEnd?: string;
  headerHtml?: string;
}

function wrapInShell(title: string, bodyHtml: string, options: ShellOptions = {}): string {
  const mainClass = options.wide ? "wide" : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap">
<style>${SHELL_CSS}</style>
${options.extraHead ?? ""}
</head>
<body>
<main${mainClass ? ` class="${mainClass}"` : ""}>
${options.headerHtml ?? ""}
${bodyHtml}
</main>
${options.extraBodyEnd ?? ""}
</body>
</html>`;
}

function docHeader(title: string, downloadHref: string, downloadLabel: string): string {
  return `<div class="doc-header"><h1>${escapeHtml(title)}</h1><div class="doc-meta"><a href="${downloadHref}" download>Download ${escapeHtml(downloadLabel)}</a></div></div>`;
}

const PRISM_VERSION = "1.29.0";
const PRISM_HEAD = `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/${PRISM_VERSION}/themes/prism.min.css">`;
const PRISM_BODY_END = `<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/${PRISM_VERSION}/prism.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/${PRISM_VERSION}/plugins/autoloader/prism-autoloader.min.js" data-autoloader-path="https://cdnjs.cloudflare.com/ajax/libs/prism/${PRISM_VERSION}/components/"></script>`;

function safeLanguage(language: string | null | undefined, fallback = "plaintext"): string {
  if (!language) return fallback;
  return /^[a-z0-9+-]{1,20}$/i.test(language) ? language.toLowerCase() : fallback;
}

/** Parse CSV per RFC 4180 with tolerant handling of stray CR/LF and unquoted fields. */
function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      if (ch === "\r" && input[i + 1] === "\n") i++;
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ""));
}

function csvToHtml(rows: string[][]): string {
  if (rows.length === 0) return "<p><em>Empty CSV.</em></p>";
  const [head, ...body] = rows;
  const headHtml = head.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("");
  const bodyHtml = body
    .map((r) => `<tr>${r.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("");
  return `<div style="overflow-x:auto"><table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`;
}

async function renderDocx(bytes: Uint8Array): Promise<string> {
  const mod = (await import("mammoth")) as unknown as {
    default?: { convertToHtml: MammothConvert };
    convertToHtml?: MammothConvert;
  };
  const convertToHtml = mod.convertToHtml ?? mod.default?.convertToHtml;
  if (!convertToHtml) throw new Error("mammoth.convertToHtml not found on import");
  // Pass both keys so we work with either the Node build (accepts `buffer`) or
  // the browser build (accepts `arrayBuffer`), depending on how Vite resolves.
  const arrayBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  const { value } = await convertToHtml({ arrayBuffer, buffer: bytes });
  return value;
}

type MammothConvert = (input: {
  arrayBuffer?: ArrayBuffer;
  buffer?: Uint8Array;
}) => Promise<{ value: string; messages: unknown[] }>;

async function renderXlsx(bytes: Uint8Array): Promise<string> {
  const XLSX = (await import("xlsx")) as unknown as {
    read: (data: Uint8Array, opts: { type: "array" }) => { SheetNames: string[]; Sheets: Record<string, unknown> };
    utils: { sheet_to_html: (sheet: unknown, opts?: { header?: string }) => string };
  };
  const wb = XLSX.read(bytes, { type: "array" });
  const parts = wb.SheetNames.map((name) => {
    // sheet_to_html defaults to a full HTML document; strip everything but the
    // <table> so we can inline into the shell.
    const full = XLSX.utils.sheet_to_html(wb.Sheets[name]);
    const tableMatch = /<table[\s\S]*?<\/table>/i.exec(full);
    const table = tableMatch ? tableMatch[0] : "";
    return `<section><h2>${escapeHtml(name)}</h2>${table}</section>`;
  });
  return parts.join("\n");
}

interface RenderInput {
  format: ArtifactFormat;
  title: string;
  slug: string;
  language?: string | null;
  textContent?: string;
  binaryContent?: Uint8Array;
}

/**
 * Rendered viewer HTML plus a hint of what MIME the *source* download will be.
 * The source itself is stored separately, keyed off `space/<slug>/source.<ext>`.
 */
export async function renderViewer(input: RenderInput): Promise<string> {
  const { format, title, slug, language } = input;
  const downloadHref = `/${slug}?download=1`;
  const ext = extensionForFormat(format, language);

  if (format === "html") {
    const html = input.textContent ?? "";
    return /<html[\s>]/i.test(html) ? html : wrapInShell(title, html);
  }

  if (format === "markdown") {
    const html = await marked.parse(input.textContent ?? "", { gfm: true });
    return wrapInShell(title, String(html));
  }

  if (format === "text") {
    const body = `<pre>${escapeHtml(input.textContent ?? "")}</pre>`;
    return wrapInShell(title, body, { headerHtml: docHeader(title, downloadHref, `.${ext}`) });
  }

  if (format === "code") {
    const lang = safeLanguage(language);
    const body = `<pre><code class="language-${lang}">${escapeHtml(input.textContent ?? "")}</code></pre>`;
    return wrapInShell(title, body, {
      wide: true,
      headerHtml: docHeader(title, downloadHref, `.${ext}`),
      extraHead: PRISM_HEAD,
      extraBodyEnd: PRISM_BODY_END,
    });
  }

  if (format === "json") {
    let pretty = input.textContent ?? "";
    try {
      pretty = JSON.stringify(JSON.parse(pretty), null, 2);
    } catch {
      // Leave as-is if not parseable — still useful to view.
    }
    const body = `<pre><code class="language-json">${escapeHtml(pretty)}</code></pre>`;
    return wrapInShell(title, body, {
      wide: true,
      headerHtml: docHeader(title, downloadHref, ".json"),
      extraHead: PRISM_HEAD,
      extraBodyEnd: PRISM_BODY_END,
    });
  }

  if (format === "csv") {
    const table = csvToHtml(parseCsv(input.textContent ?? ""));
    return wrapInShell(title, table, {
      wide: true,
      headerHtml: docHeader(title, downloadHref, ".csv"),
    });
  }

  if (format === "pdf") {
    const rawHref = `/${slug}?raw=1`;
    const body = `<iframe class="pdf-frame" src="${rawHref}" title="${escapeHtml(title)}"></iframe><p class="doc-meta" style="text-align:center;margin-top:1rem"><a href="${downloadHref}" download>Download .pdf</a></p>`;
    return wrapInShell(title, body, { wide: true, headerHtml: `<h1>${escapeHtml(title)}</h1>` });
  }

  if (format === "docx") {
    const bytes = input.binaryContent;
    if (!bytes) throw new Error("docx requires binary content");
    const body = await renderDocx(bytes);
    return wrapInShell(title, body, { headerHtml: docHeader(title, downloadHref, ".docx") });
  }

  if (format === "xlsx") {
    const bytes = input.binaryContent;
    if (!bytes) throw new Error("xlsx requires binary content");
    const body = await renderXlsx(bytes);
    return wrapInShell(title, body, {
      wide: true,
      headerHtml: docHeader(title, downloadHref, ".xlsx"),
    });
  }

  throw new Error(`Unknown format: ${format as string}`);
}
