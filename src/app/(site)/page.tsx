import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { MarkdownContent } from "@/components/markdown-content";
import { getPage, getPublishedPosts } from "@/lib/content";
import { formatDateShort } from "@/lib/format";
import { pageMeta, SITE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = pageMeta({ path: "/" });

export default async function Home() {
  const [home, posts] = await Promise.all([getPage("home"), getPublishedPosts()]);
  const recent = posts.slice(0, 5);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    url: SITE_URL,
    jobTitle: "Head of Marketing",
    worksFor: {
      "@type": "Organization",
      name: "Maxim AI",
      url: "https://www.getmaxim.ai",
    },
    description: SITE.description,
    sameAs: [SITE.social.x, SITE.social.linkedin],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="statement max-w-[16ch]">{home?.title ?? SITE.tagline}</h1>

      {home && (
        <div className="article mt-10 max-w-[38rem]">
          <MarkdownContent content={home.contentMd} />
        </div>
      )}

      {recent.length > 0 && (
        <section className="mt-20">
          <h2 className="section-title mb-4">Writing</h2>
          <ol className="index-list">
            {recent.map((post) => (
              <li key={post.slug}>
                <Link href={`/writing/${post.slug}`}>
                  <span className="index-no" aria-hidden="true" />
                  <span className="index-title flex-1">{post.title}</span>
                  <span className="meta shrink-0">{formatDateShort(post.publishedAt)}</span>
                </Link>
              </li>
            ))}
          </ol>
          <p className="mt-6">
            <Link href="/writing" className="link text-[0.95rem]">
              All writing →
            </Link>
          </p>
        </section>
      )}
    </>
  );
}
