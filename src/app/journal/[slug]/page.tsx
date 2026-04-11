import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPost, getBlogPosts } from "@/lib/content";
import { MarkdownContent } from "@/components/markdown-content";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

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
      images: [
        {
          url: `/journal/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      creator: "@don_fedora",
      site: "@don_fedora",
      images: [`/journal/${slug}/opengraph-image`],
    },
    alternates: {
      canonical: `https://kuldeep.cc/journal/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: `https://kuldeep.cc/journal/${slug}/opengraph-image`,
    author: {
      "@type": "Person",
      name: "Kuldeep Paul",
      url: "https://kuldeep.cc",
      jobTitle: "Head of Marketing",
      worksFor: {
        "@type": "Organization",
        name: "Maxim AI",
      },
    },
    datePublished: post.date,
    keywords: post.tags.join(", "),
    publisher: {
      "@type": "Person",
      name: "Kuldeep Paul",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://kuldeep.cc/journal/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto w-full max-w-4xl px-5 pb-20 pt-12 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12 border-b border-[var(--line)] pb-8">
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 font-mono text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--foreground)]"
        >
          ← Back to Blog
        </Link>

        <h1 className="mt-8 font-display text-5xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-6xl">
          {post.title}
        </h1>

        <p className="mt-6 text-xl leading-relaxed text-[var(--ink-soft)]">
          {post.excerpt}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <time className="font-mono text-sm text-[var(--ink-soft)]">
            {post.date}
          </time>
          <span className="font-mono text-sm text-[var(--ink-soft)]">
            {post.readingTime}
          </span>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="signal-chip">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <MarkdownContent content={post.content} />
    </article>
    </>
  );
}
