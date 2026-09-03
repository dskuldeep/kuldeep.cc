import { isAuthenticated } from "@/lib/auth";
import { appEnv } from "@/lib/env";

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request): Promise<Response> {
  if (!(await isAuthenticated())) {
    // 403 rather than 401: a 401 response crashes the vinext 0.0.41 dev proxy.
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Missing file" }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return Response.json({ error: `Unsupported type: ${file.type}` }, { status: 415 });
  }
  if (file.size > MAX_SIZE) {
    return Response.json({ error: "File exceeds 10 MB" }, { status: 413 });
  }

  const now = new Date();
  const prefix = `posts/${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const key = `${prefix}/${crypto.randomUUID()}.${ext}`;

  await appEnv.MEDIA.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });
  await appEnv.DB.prepare(
    "INSERT INTO images (key, filename, content_type, size) VALUES (?1, ?2, ?3, ?4)",
  )
    .bind(key, file.name || key, file.type, file.size)
    .run();

  return Response.json({ url: `/media/${key}` });
}
