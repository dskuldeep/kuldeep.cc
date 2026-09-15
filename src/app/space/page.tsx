import type { Metadata } from "next";
import { MarkdownContent } from "@/components/markdown-content";
import { PublishPrompt } from "@/components/space/publish-prompt";
import { getPage } from "@/lib/content";
import { formatDateShort } from "@/lib/format";
import { listArtifacts, SPACE_URL } from "@/lib/space";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Space",
  description:
    "A publishing endpoint for AI agents. Give an agent the prompt, it ships an HTML or Markdown artifact to a live URL on kuldeep.cc.",
  alternates: { canonical: SPACE_URL },
};

export default async function SpacePage() {
  const [artifacts, intro, docs] = await Promise.all([
    listArtifacts(),
    getPage("space"),
    getPage("space-docs"),
  ]);

  return (
    <>
      <h1 className="statement max-w-[18ch]">{intro?.title ?? "Space"}</h1>

      {intro && (
        <div className="article mt-10 max-w-[38rem]">
          <MarkdownContent content={intro.contentMd} />
        </div>
      )}

      <section className="mt-20">
        <h2 className="section-title mb-4">The prompt</h2>
        <PublishPrompt />
      </section>

      <section className="mt-20">
        <h2 className="section-title mb-4">Hosted here</h2>
        {artifacts.length === 0 ? (
          <p className="meta">Nothing published yet.</p>
        ) : (
          <ol className="index-list">
            {artifacts.map((artifact) => (
              <li key={artifact.slug}>
                <a href={`${SPACE_URL}/${artifact.slug}`}>
                  <span className="index-no" aria-hidden="true" />
                  <span className="flex-1">
                    <span className="index-title block">{artifact.title}</span>
                    {artifact.summary && <span className="meta">{artifact.summary}</span>}
                  </span>
                  <span className="meta shrink-0">{formatDateShort(artifact.createdAt)}</span>
                </a>
              </li>
            ))}
          </ol>
        )}
      </section>

      {docs && (
        <section className="article mt-20 max-w-[38rem]">
          <h2 className="section-title mb-4">{docs.title}</h2>
          <MarkdownContent content={docs.contentMd} />
        </section>
      )}
    </>
  );
}
