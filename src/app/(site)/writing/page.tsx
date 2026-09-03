import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { getPublishedPosts, type PostListItem } from "@/lib/content";
import { formatDateShort, yearOf } from "@/lib/format";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Writing",
  description: "Essays and notes on AI-native marketing, distribution, and growth systems.",
  path: "/writing",
});

export default async function WritingPage() {
  const posts = await getPublishedPosts();

  const byYear = new Map<number, PostListItem[]>();
  for (const post of posts) {
    const year = yearOf(post.publishedAt);
    byYear.set(year, [...(byYear.get(year) ?? []), post]);
  }
  const years = [...byYear.keys()].sort((a, b) => b - a);

  return (
    <>
      <h1 className="statement">Writing</h1>

      {posts.length === 0 && <p className="mt-10 text-[var(--muted)]">Nothing here yet.</p>}

      {years.map((year) => (
        <section key={year} className="mt-14">
          <h2 className="section-title mb-3">{year}</h2>
          <ol className="index-list">
            {byYear.get(year)!.map((post) => (
              <li key={post.slug}>
                <Link href={`/writing/${post.slug}`}>
                  <span className="index-no" aria-hidden="true" />
                  <span className="flex-1">
                    <span className="index-title block">{post.title}</span>
                    {post.excerpt && (
                      <span className="mt-1 block text-[0.95rem] leading-snug text-[var(--muted)]">
                        {post.excerpt}
                      </span>
                    )}
                  </span>
                  <span className="meta shrink-0">{formatDateShort(post.publishedAt)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </>
  );
}
