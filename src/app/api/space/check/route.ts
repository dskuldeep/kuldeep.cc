import { getArtifact, normalizeSlug, slugError, suggestSlugs, verifySpaceKey } from "@/lib/space";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  // 403 rather than 401: a 401 response crashes the vinext 0.0.41 dev proxy.
  if (!(await verifySpaceKey(request))) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 403 });
  }

  const slug = normalizeSlug(new URL(request.url).searchParams.get("slug") ?? "");
  const invalid = slugError(slug);
  if (invalid) {
    return Response.json({ ok: false, error: "invalid_slug", message: invalid }, { status: 400 });
  }

  const existing = await getArtifact(slug);
  if (!existing) {
    return Response.json({ ok: true, slug, available: true });
  }

  return Response.json({
    ok: true,
    slug,
    available: false,
    suggestions: await suggestSlugs(slug),
  });
}
