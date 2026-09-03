import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownContent } from "@/components/markdown-content";
import { getPublishedPostBySlug } from "@/lib/content";
import { formatDateLong } from "@/lib/format";
import { canonicalPath, pageMeta, SITE, SITE_URL } from "@/lib/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};
  return pageMeta({
    title: post.title,
    description: post.excerpt,
    path: `/writing/${post.slug}`,
    article: {
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
    },
  });
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    url: canonicalPath(`/writing/${post.slug}`),
    image: canonicalPath("/og.png"),
    author: { "@type": "Person", name: SITE.name, url: SITE_URL },
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-12">
        <h1 className="statement max-w-[20ch]">{post.title}</h1>
        <p className="meta mt-5">
          {formatDateLong(post.publishedAt)} · {post.readingTime}
        </p>
      </header>

      <div className="article">
        <MarkdownContent content={post.contentMd} />
      </div>

      <p className="mt-16">
        <Link href="/writing" className="link text-[0.95rem]">
          ← All writing
        </Link>
      </p>
    </article>
  );
}
