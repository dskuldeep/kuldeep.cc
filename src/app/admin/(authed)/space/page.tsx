import Link from "next/link";
import { deleteSpaceArtifact, revokeSpaceKeyAction } from "@/app/admin/actions";
import { SpaceKeyForm } from "@/components/admin/space-key-form";
import { requireAuth } from "@/lib/auth";
import { formatDateShort } from "@/lib/format";
import { listArtifacts, listSpaceKeys, SPACE_URL } from "@/lib/space";

export const dynamic = "force-dynamic";

export default async function AdminSpacePage() {
  await requireAuth();
  const [artifacts, keys] = await Promise.all([listArtifacts(), listSpaceKeys()]);

  return (
    <>
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Space
        </h1>
        <Link href="/admin/pages/space" className="link meta">
          Edit page copy
        </Link>
      </div>

      <section className="mt-6">
        <h2 className="section-title mb-2">Publish keys</h2>
        <SpaceKeyForm />

        <ul className="mt-6 divide-y divide-[var(--rule)]">
          {keys.map((key) => (
            <li key={key.id} className="flex items-baseline gap-4 py-3">
              <span className="flex-1 font-medium">{key.label}</span>
              <code className="meta shrink-0">{key.keyPrefix}…</code>
              <span className="meta w-32 shrink-0 text-right">
                {key.lastUsedAt ? `used ${formatDateShort(key.lastUsedAt)}` : "never used"}
              </span>
              <span className="meta w-20 shrink-0 text-right">
                {formatDateShort(key.createdAt)}
              </span>
              <form action={revokeSpaceKeyAction} className="shrink-0">
                <input type="hidden" name="id" value={key.id} />
                <button type="submit" className="btn-danger btn">
                  Revoke
                </button>
              </form>
            </li>
          ))}
          {keys.length === 0 && (
            <li className="meta py-6">No keys yet — nobody can publish until you create one.</li>
          )}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="section-title mb-2">Artifacts</h2>
        <ul className="divide-y divide-[var(--rule)]">
          {artifacts.map((artifact) => (
            <li key={artifact.slug} className="flex items-baseline gap-4 py-3">
              <span className="flex-1">
                <a
                  href={`${SPACE_URL}/${artifact.slug}`}
                  className="link font-medium"
                  target="_blank"
                  rel="noreferrer"
                >
                  {artifact.title}
                </a>
                <span className="meta ml-2">/{artifact.slug}</span>
              </span>
              {artifact.publishedBy && <span className="meta shrink-0">{artifact.publishedBy}</span>}
              <span className="meta shrink-0">{artifact.format}</span>
              <span className="meta shrink-0">{Math.ceil(artifact.size / 1024)} KB</span>
              <span className="meta w-20 shrink-0 text-right">
                {formatDateShort(artifact.createdAt)}
              </span>
              <form action={deleteSpaceArtifact} className="shrink-0">
                <input type="hidden" name="slug" value={artifact.slug} />
                <button type="submit" className="btn-danger btn">
                  Delete
                </button>
              </form>
            </li>
          ))}
          {artifacts.length === 0 && <li className="meta py-6">Nothing published yet.</li>}
        </ul>
      </section>
    </>
  );
}
