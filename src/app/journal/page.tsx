import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Writing from Kuldeep Paul on AI-native marketing, product narratives, experimentation, and data science.",
};

export default async function JournalPage() {
  const posts = await getBlogPosts();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 pb-20 pt-12 sm:px-6 lg:px-8">
      {/* Magazine-style header */}
      <section className="border-b border-[var(--line)] pb-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">
              Blog
            </span>
            <span className="text-sm text-[var(--ink-soft)]">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </span>
          </div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">
            2026
          </span>
        </div>
        <h1 className="relative max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-tight text-[var(--foreground)] sm:text-6xl lg:text-7xl">
          Thoughts on{" "}
          <span className="relative inline-block">
            AI-native marketing
            <span className="absolute -top-6 right-0 hidden font-hand text-xl italic text-[var(--orange)] opacity-50 sm:inline sm:-top-8 sm:text-2xl">
              my favorite topic ↓
            </span>
          </span>
          , product narratives, and growth systems
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--ink-soft)]">
          Practical notes on building marketing that matches the pace of AI
          product development. Strategy, positioning, evaluation frameworks, and
          lessons from working in fast-moving teams.
        </p>
      </section>

      {/* Blog Posts */}
      {posts.length === 0 ? (
        <section className="py-16 text-center">
          <p className="text-lg text-[var(--ink-soft)]">
            No blog posts yet. Check back soon!
          </p>
          <p className="mt-4 text-sm text-[var(--ink-soft)]">
            To add a blog post, create a new .md file in the <code className="rounded bg-gray-100 px-2 py-1">content/blog/</code> directory.
          </p>
        </section>
      ) : (
        <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/journal/${post.slug}`}
              className="section-frame tape-strip group flex flex-col overflow-hidden px-0 py-0 transition-transform hover:scale-[1.02]"
            >
              <div className="dark-panel rounded-t-[1.5rem] rounded-b-none border-x-0 border-t-0 px-6 py-4 shadow-none">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/56">
                    {post.date} / {post.readingTime}
                  </p>
                  <span className="micro-label micro-label-dark">blog</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-5 px-6 py-7">
                <h3 className="font-display text-3xl leading-tight tracking-[-0.04em] transition-colors group-hover:text-[var(--orange)]">
                  {post.title}
                </h3>
                <p className="text-base leading-8 text-[var(--ink-soft)]">
                  {post.excerpt}
                </p>

                <div className="mt-auto flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="signal-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
