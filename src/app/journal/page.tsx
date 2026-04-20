import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Writing from Kuldeep Paul on AI-native marketing, product narratives, experimentation, and data science.",
  openGraph: { images: ["/og-images/home.png"] },
  twitter: { card: "summary_large_image", images: ["/og-images/home.png"] },
};

export const dynamic = "force-static";
export const revalidate = false;

export default async function JournalPage() {
  const posts = await getBlogPosts();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 pb-24 pt-12 sm:px-6 sm:pt-14 lg:px-8">
      {/* Header */}
      <section className="border-b border-[var(--ink)] pb-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--ink-mute)] sm:text-[0.7rem] sm:tracking-[0.18em]">
          <span className="inline-flex items-center gap-2 border border-[var(--ink)] bg-[var(--paper)] px-2.5 py-1 text-[var(--ink)]">
            <span className="inline-block h-1.5 w-1.5 bg-[var(--accent)]" />
            $ cat blog.md
          </span>
          <span>
            {posts.length.toString().padStart(2, "0")} ·{" "}
            {posts.length === 1 ? "post" : "posts"} · 2026
          </span>
        </div>
        <h1 className="max-w-5xl font-display text-[2.6rem] font-semibold leading-[0.98] tracking-[-0.03em] text-[var(--ink)] sm:text-[3.6rem] lg:text-[4.2rem]">
          Thoughts on{" "}
          <span className="relative inline-block">
            <span className="relative z-10">AI-native marketing</span>
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-1 -z-0 h-[42%] bg-[var(--highlight)]"
            />
          </span>
          , product narratives, and growth systems.
        </h1>
        <p className="mt-6 max-w-2xl text-[1.05rem] leading-[1.7] text-[var(--ink-soft)]">
          Practical notes on building marketing that keeps pace with AI product
          development. Strategy, positioning, evaluation frameworks, and
          lessons from fast-moving teams.
        </p>
      </section>

      {posts.length === 0 ? (
        <section className="py-16 text-center">
          <p className="font-mono text-[0.9rem] text-[var(--ink-soft)]">
            {"// no posts indexed yet"}
          </p>
        </section>
      ) : (
        <section className="border border-[var(--ink)] bg-[var(--paper)]">
          {/* header row */}
          <div className="hidden grid-cols-[110px_1fr_160px_60px] items-center gap-4 border-b border-[var(--ink)] bg-[var(--background-strong)] px-4 py-3 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-[var(--ink-mute)] sm:px-6 md:grid">
            <span>date</span>
            <span>title</span>
            <span>reading</span>
            <span className="text-right">→</span>
          </div>

          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/journal/${post.slug}`}
              className="group grid grid-cols-1 gap-3 border-b border-[var(--line-strong)] px-4 py-6 transition-colors last:border-b-0 hover:bg-[var(--background-strong)] sm:px-6 md:grid-cols-[110px_1fr_160px_60px] md:items-start md:gap-4"
            >
              <time className="font-mono text-[0.74rem] uppercase tracking-[0.12em] text-[var(--ink-mute)] md:pt-1">
                {post.date}
              </time>

              <div className="flex flex-col gap-2">
                <h3 className="font-display text-[1.25rem] font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)] group-hover:text-[var(--accent)]">
                  {post.title}
                </h3>
                <p className="line-clamp-2 text-[0.95rem] leading-[1.6] text-[var(--ink-soft)]">
                  {post.excerpt}
                </p>
                {post.tags?.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="signal-chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <span className="font-mono text-[0.74rem] uppercase tracking-[0.12em] text-[var(--ink-mute)] md:pt-1">
                {post.readingTime}
              </span>

              <span className="font-mono text-[1rem] text-[var(--accent)] md:pt-1 md:text-right">
                →
              </span>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
