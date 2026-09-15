import {
  ALL_FORMATS,
  isBinaryFormat,
  isVisibility,
  MAX_ARTIFACT_BYTES,
  normalizeSlug,
  publishArtifact,
  slugError,
  verifySpaceKey,
  VISIBILITIES,
  type ArtifactFormat,
  type Visibility,
} from "@/lib/space";

export const dynamic = "force-dynamic";

interface PublishBody {
  slug?: unknown;
  title?: unknown;
  summary?: unknown;
  format?: unknown;
  content?: unknown;
  content_base64?: unknown;
  language?: unknown;
  filename?: unknown;
  visibility?: unknown;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function decodeBase64(input: string): Uint8Array | null {
  try {
    const clean = input.replace(/\s+/g, "");
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
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

  const rawFormat = str(body.format).toLowerCase();
  if (!(ALL_FORMATS as readonly string[]).includes(rawFormat)) {
    return Response.json(
      { ok: false, error: "invalid_format", allowed: ALL_FORMATS },
      { status: 400 },
    );
  }
  const format = rawFormat as ArtifactFormat;
  const binary = isBinaryFormat(format);

  const contentText = str(body.content);
  const contentBase64 = str(body.content_base64);

  let textContent: string | undefined;
  let binaryContent: Uint8Array | undefined;
  let sourceBytes: number;

  if (binary) {
    if (!contentBase64) {
      return Response.json(
        { ok: false, error: "content_base64_required", message: `format=${format} requires content_base64.` },
        { status: 400 },
      );
    }
    const decoded = decodeBase64(contentBase64);
    if (!decoded) {
      return Response.json({ ok: false, error: "invalid_base64" }, { status: 400 });
    }
    binaryContent = decoded;
    sourceBytes = decoded.byteLength;
  } else {
    if (contentBase64 && !contentText) {
      const decoded = decodeBase64(contentBase64);
      if (!decoded) {
        return Response.json({ ok: false, error: "invalid_base64" }, { status: 400 });
      }
      textContent = new TextDecoder().decode(decoded);
    } else {
      textContent = contentText;
    }
    if (!textContent?.trim()) {
      return Response.json({ ok: false, error: "content_required" }, { status: 400 });
    }
    sourceBytes = new TextEncoder().encode(textContent).byteLength;
  }

  if (sourceBytes > MAX_ARTIFACT_BYTES) {
    return Response.json(
      { ok: false, error: "content_too_large", max_bytes: MAX_ARTIFACT_BYTES },
      { status: 413 },
    );
  }

  const title = str(body.title).trim().slice(0, 200) || "Untitled";
  const slug = normalizeSlug(str(body.slug) || title);
  const invalid = slugError(slug);
  if (invalid) {
    return Response.json({ ok: false, error: "invalid_slug", message: invalid }, { status: 400 });
  }

  const language = str(body.language).trim().slice(0, 20) || undefined;
  const filename = str(body.filename).trim().slice(0, 200) || undefined;

  let visibility: Visibility = "public";
  if (body.visibility !== undefined && body.visibility !== "") {
    if (!isVisibility(body.visibility)) {
      return Response.json(
        { ok: false, error: "invalid_visibility", allowed: VISIBILITIES },
        { status: 400 },
      );
    }
    visibility = body.visibility;
  }

  let result;
  try {
    result = await publishArtifact({
      slug,
      title,
      summary: str(body.summary).trim().slice(0, 300),
      format,
      textContent,
      binaryContent,
      language,
      filename,
      publishedBy: key.label,
      visibility,
    });
  } catch (error) {
    console.error("space publish failed", error);
    return Response.json(
      {
        ok: false,
        error: "render_failed",
        message: error instanceof Error ? error.message : "Failed to render artifact.",
      },
      { status: 500 },
    );
  }

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
