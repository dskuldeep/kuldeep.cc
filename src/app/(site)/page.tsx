import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { MarkdownContent } from "@/components/markdown-content";
import { getPage, getPublishedPosts } from "@/lib/content";
import { DATASETS } from "@/lib/data";
import { formatDateShort } from "@/lib/format";
import { PERSON_ID, WEBSITE_ID } from "@/lib/schema";
import { pageMeta, SITE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = pageMeta({ path: "/" });

export default async function Home() {
  const [home, posts] = await Promise.all([getPage("home"), getPublishedPosts()]);
  const recent = posts.slice(0, 5);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/#profile`,
    url: `${SITE_URL}/`,
    name: SITE.title,
    description: SITE.description,
    mainEntity: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
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

      <section className="mt-20">
        <h2 className="section-title mb-4">Data</h2>
        <ol className="index-list">
          {DATASETS.slice(0, 6).map((d) => (
            <li key={d.slug}>
              <Link href={d.path}>
                <span className="index-no" aria-hidden="true" />
                <span className="index-title flex-1">{d.title}</span>
                <span className="meta shrink-0">{d.records.toLocaleString("en-US")}</span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-6">
          <Link href="/data" className="link text-[0.95rem]">
            All datasets →
          </Link>
        </p>
      </section>
    </>
  );
}
