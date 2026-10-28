import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { MarkdownContent } from "@/components/markdown-content";
import { getPage } from "@/lib/content";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "About",
  description:
    "About Kuldeep Paul: Head of Marketing at Maxim AI, working on AI search, generative engine optimization and data-driven growth, and the data aggregator behind the kuldeep.cc datasets.",
  path: "/about",
});

export default async function AboutPage() {
  const page = await getPage("about");
  if (!page) notFound();

  return (
    <>
      <h1 className="statement">{page.title}</h1>
      <div className="article mt-10">
        <MarkdownContent content={page.contentMd} />
      </div>
    </>
  );
}
