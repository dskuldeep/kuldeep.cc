import { appEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
): Promise<Response> {
  const { key } = await params;
  const objectKey = key.join("/");
  if (!objectKey || objectKey.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const object = await appEnv.MEDIA.get(objectKey);
  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers({
    // Keys are UUID-based and immutable — cache forever.
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
  });
  if (object.httpEtag) headers.set("ETag", object.httpEtag);

  return new Response(object.body, { headers });
}
