import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPost, getBlogPosts } from "@/lib/content";
import { MarkdownContent } from "@/components/markdown-content";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags.join(", "),
    authors: [{ name: "Kuldeep Paul", url: "https://kuldeep.cc" }],
    creator: "Kuldeep Paul",
    publisher: "Kuldeep Paul",
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: ["Kuldeep Paul"],
      tags: post.tags,
      url: `https://kuldeep.cc/journal/${slug}`,
      siteName: "Kuldeep Paul",
      images: [{ url: "/og-images/home.png", width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      creator: "@don_fedora",
      site: "@don_fedora",
      images: ["/og-images/home.png"],
    },
    alternates: { canonical: `https://kuldeep.cc/journal/${slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: "https://kuldeep.cc/og-images/home.png",
    author: {
      "@type": "Person",
      name: "Kuldeep Paul",
      url: "https://kuldeep.cc",
      jobTitle: "Head of Marketing",
      worksFor: { "@type": "Organization", name: "Maxim AI" },
    },
    datePublished: post.date,
    keywords: post.tags.join(", "),
    publisher: { "@type": "Person", name: "Kuldeep Paul" },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://kuldeep.cc/journal/${slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="mx-auto w-full max-w-4xl px-4 pb-24 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <header className="mb-12 border-b border-[var(--ink)] pb-10">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--ink-soft)] transition-colors hover:text-[var(--accent)]"
          >
            ← cd ../journal
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--ink-mute)] sm:gap-3 sm:text-[0.7rem] sm:tracking-[0.18em]">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 bg-[var(--accent)]" />
              post · {post.date}
            </span>
            <span>·</span>
            <span>{post.readingTime}</span>
          </div>

          <h1 className="mt-4 font-display text-[2.1rem] font-semibold leading-[1] tracking-[-0.025em] text-[var(--ink)] sm:text-[3rem] lg:text-[3.5rem]">
            {post.title}
          </h1>

          <p className="mt-6 max-w-3xl text-[1.05rem] leading-[1.65] text-[var(--ink-soft)] sm:text-[1.15rem]">
            {post.excerpt}
          </p>

          {post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="signal-chip">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <MarkdownContent content={post.content} />
      </article>
    </>
  );
}
