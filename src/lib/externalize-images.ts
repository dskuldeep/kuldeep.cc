// Client-side helper: replaces inline base64 images (typically from pasting a
// blog out of Google Docs, Notion, Word, etc.) with uploaded /media/* URLs.
// Without this, one screenshot inlines megabytes of base64 into the markdown
// and blows past the server-action body limit.

const DATA_IMG_RE = /data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,[A-Za-z0-9+/=]+/g;

export function hasInlineImages(md: string): boolean {
  return md.includes("data:image/");
}

export async function externalizeImages(
  md: string,
): Promise<{ md: string; uploaded: number }> {
  const matches = [...new Set(md.match(DATA_IMG_RE) ?? [])];
  let out = md;
  let uploaded = 0;

  for (const dataUrl of matches) {
    const blob = await (await fetch(dataUrl)).blob();
    const ext = (blob.type.split("/")[1] ?? "png").replace("+xml", "").replace("jpeg", "jpg");
    const form = new FormData();
    form.append("file", new File([blob], `pasted-${uploaded + 1}.${ext}`, { type: blob.type }));
    const res = await fetch("/api/admin/images", { method: "POST", body: form });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Image upload failed (${res.status}) ${body}`.trim());
    }
    const { url } = (await res.json()) as { url: string };
    out = out.split(dataUrl).join(url);
    uploaded++;
  }

  return { md: out, uploaded };
}
