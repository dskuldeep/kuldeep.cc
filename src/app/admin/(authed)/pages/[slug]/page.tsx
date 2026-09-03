import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getPage } from "@/lib/content";
import { PageEditor } from "@/components/admin/page-editor";

const EDITABLE: Record<string, { label: string; titleHint: string }> = {
  home: { label: "Home", titleHint: "Statement headline (shown huge on the homepage)" },
  about: { label: "About", titleHint: "Page title" },
};

export default async function EditSitePage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAuth();
  const { slug } = await params;
  if (!EDITABLE[slug]) notFound();
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <>
      <nav className="mb-6 flex gap-4">
        {Object.entries(EDITABLE).map(([s, meta]) => (
          <Link
            key={s}
            href={`/admin/pages/${s}`}
            className={`link text-[0.9rem] ${s === slug ? "font-bold" : ""}`}
          >
            {meta.label}
          </Link>
        ))}
      </nav>
      <PageEditor key={slug} page={page} titleHint={EDITABLE[slug].titleHint} />
    </>
  );
}
