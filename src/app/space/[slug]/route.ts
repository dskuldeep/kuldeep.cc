import { appEnv } from "@/lib/env";
import { getArtifact, SPACE_URL } from "@/lib/space";

export const dynamic = "force-dynamic";

/**
 * Injected into every artifact at serve time rather than at publish time, so
 * the badge can change without republishing. Styles are inline and exhaustive
 * because the surrounding document is arbitrary agent-authored HTML.
 */
const BADGE = `<a href="${SPACE_URL}" target="_blank" rel="noopener noreferrer" style="position:fixed;right:16px;bottom:16px;z-index:2147483647;display:inline-flex;align-items:center;gap:7px;padding:7px 12px;margin:0;border:1px solid #0a0a0a;border-radius:999px;background:#ffffff;color:#0a0a0a;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;font-size:12px;font-weight:500;line-height:1;letter-spacing:-0.01em;text-decoration:none;text-transform:none;opacity:0.92"><span style="display:block;width:6px;height:6px;border-radius:50%;background:#0a0a0a"></span>hosted on kuldeep.cc</a>`;

function notFound(slug: string): Response {
  const body = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Not found</title>
<style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff;color:#0a0a0a;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif}
@media(prefers-color-scheme:dark){body{background:#0a0a0a;color:#f5f5f5}}
div{text-align:center;padding:1.5rem}p{color:#737373;font-size:.95rem}a{color:inherit}</style></head>
<body><div><h1>Nothing at /${slug}</h1><p>This artifact doesn't exist or was removed. <a href="${SPACE_URL}">See what's here →</a></p></div></body></html>`;
  return new Response(body, {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const artifact = await getArtifact(slug);
  if (!artifact) return notFound(slug);

  const object = await appEnv.MEDIA.get(artifact.r2Key);
  if (!object) return notFound(slug);

  const response = new Response(object.body, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });

  return new HTMLRewriter()
    .on("body", {
      element(element) {
        element.append(BADGE, { html: true });
      },
    })
    .transform(response);
}
