import { requireAuth } from "@/lib/auth";
import { appEnv } from "@/lib/env";
import { deleteImage } from "@/app/admin/actions";

interface ImageRow {
  key: string;
  filename: string;
  content_type: string;
  size: number;
  created_at: string;
}

export default async function AdminImagesPage() {
  await requireAuth();
  const { results } = await appEnv.DB.prepare(
    "SELECT key, filename, content_type, size, created_at FROM images ORDER BY created_at DESC",
  ).all<ImageRow>();

  return (
    <>
      <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
        Images
      </h1>
      <p className="meta mt-2">
        Upload by dropping or pasting images inside the post editor. URLs are copyable below.
      </p>

      {results.length === 0 && <p className="meta mt-8">No images uploaded yet.</p>}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {results.map((image) => (
          <figure key={image.key} className="flex flex-col gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/media/${image.key}`}
              alt={image.filename}
              className="aspect-square w-full rounded-md border border-[var(--rule)] object-cover"
            />
            <figcaption className="meta break-all text-[0.75rem]">{image.filename}</figcaption>
            <div className="flex items-center gap-2">
              <input className="field text-[0.75rem]" readOnly value={`/media/${image.key}`} />
              <form action={deleteImage}>
                <input type="hidden" name="key" value={image.key} />
                <button type="submit" className="btn-danger btn text-[0.75rem]">
                  ✕
                </button>
              </form>
            </div>
          </figure>
        ))}
      </div>
    </>
  );
}
