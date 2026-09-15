import {
  MAX_ARTIFACT_BYTES,
  normalizeSlug,
  publishArtifact,
  slugError,
  verifySpaceKey,
  type ArtifactFormat,
} from "@/lib/space";

export const dynamic = "force-dynamic";

interface PublishBody {
  slug?: unknown;
  title?: unknown;
  summary?: unknown;
  format?: unknown;
  content?: unknown;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request): Promise<Response> {
  // 403 rather than 401: a 401 response crashes the vinext 0.0.41 dev proxy.
  const key = await verifySpaceKey(request);
  if (!key) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 403 });
  }

  let body: PublishBody;
  try {
    body = (await request.json()) as PublishBody;
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const content = str(body.content);
  if (!content.trim()) {
    return Response.json({ ok: false, error: "content_required" }, { status: 400 });
  }
  if (new TextEncoder().encode(content).byteLength > MAX_ARTIFACT_BYTES) {
    return Response.json(
      { ok: false, error: "content_too_large", max_bytes: MAX_ARTIFACT_BYTES },
      { status: 413 },
    );
  }

  const rawFormat = str(body.format).toLowerCase();
  if (rawFormat !== "html" && rawFormat !== "markdown") {
    return Response.json(
      { ok: false, error: "invalid_format", allowed: ["html", "markdown"] },
      { status: 400 },
    );
  }
  const format = rawFormat as ArtifactFormat;

  const title = str(body.title).trim().slice(0, 200) || "Untitled";
  const slug = normalizeSlug(str(body.slug) || title);
  const invalid = slugError(slug);
  if (invalid) {
    return Response.json({ ok: false, error: "invalid_slug", message: invalid }, { status: 400 });
  }

  const result = await publishArtifact({
    slug,
    title,
    summary: str(body.summary).trim().slice(0, 300),
    format,
    content,
    publishedBy: key.label,
  });

  if (!result.ok) {
    return Response.json(
      {
        ok: false,
        error: "slug_taken",
        slug,
        suggestions: result.suggestions,
        message: `"${slug}" is already published. Pick one of the suggestions and retry.`,
      },
      { status: 409 },
    );
  }

  return Response.json({ ok: true, slug: result.slug, url: result.url }, { status: 201 });
}
