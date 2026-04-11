import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getCaseStudy, getCaseStudies } from "@/lib/content";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const caseStudies = await getCaseStudies();
  return caseStudies.map((study) => ({
    slug: study.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await getCaseStudy(slug);

  if (!caseStudy) {
    return {
      title: "Case Study Not Found",
    };
  }

  return {
    title: caseStudy.title,
    description: caseStudy.description,
    keywords: caseStudy.tags.join(", "),
    authors: [{ name: "Kuldeep Paul", url: "https://kuldeep.cc" }],
    creator: "Kuldeep Paul",
    publisher: "Kuldeep Paul",
    openGraph: {
      title: caseStudy.title,
      description: caseStudy.description,
      type: "article",
      publishedTime: caseStudy.date,
      authors: ["Kuldeep Paul"],
      tags: caseStudy.tags,
      url: `https://kuldeep.cc/case-studies/${slug}`,
      siteName: "Kuldeep Paul",
    },
    twitter: {
      card: "summary_large_image",
      title: caseStudy.title,
      description: caseStudy.description,
      creator: "@don_fedora",
      site: "@don_fedora",
    },
    alternates: {
      canonical: `https://kuldeep.cc/case-studies/${slug}`,
    },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const caseStudy = await getCaseStudy(slug);

  if (!caseStudy) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: caseStudy.title,
    description: caseStudy.description,
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
    datePublished: caseStudy.date,
    keywords: caseStudy.tags.join(", "),
    publisher: {
      "@type": "Person",
      name: "Kuldeep Paul",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://kuldeep.cc/case-studies/${slug}`,
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
          href="/case-studies"
          className="inline-flex items-center gap-2 font-mono text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--foreground)]"
        >
          ← Back to Case Studies
        </Link>

        <h1 className="mt-8 font-display text-5xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-6xl">
          {caseStudy.title}
        </h1>

        <p className="mt-6 text-xl leading-relaxed text-[var(--ink-soft)]">
          {caseStudy.description}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <time className="font-mono text-sm text-[var(--ink-soft)]">
            {caseStudy.date}
          </time>
          <div className="flex flex-wrap gap-2">
            {caseStudy.tags.map((tag) => (
              <span key={tag} className="signal-chip">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="mb-6 mt-12 font-display text-4xl font-semibold leading-tight tracking-tight text-[var(--foreground)] first:mt-0">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="mb-4 mt-10 font-display text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)]">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="mb-3 mt-8 font-display text-2xl font-semibold leading-tight tracking-tight text-[var(--foreground)]">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="mb-4 leading-relaxed text-[var(--foreground)]">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="mb-6 list-disc space-y-2 pl-6 text-[var(--foreground)]">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-6 list-decimal space-y-2 pl-6 text-[var(--foreground)]">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-[var(--orange)] underline decoration-[var(--orange)]/30 underline-offset-4 transition-colors hover:decoration-[var(--orange)]"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            code: ({ children }) => (
              <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-[var(--foreground)]">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="mb-6 overflow-x-auto rounded-lg border border-[var(--line)] bg-gray-50 p-4">
                {children}
              </pre>
            ),
          }}
        >
          {caseStudy.content}
        </ReactMarkdown>
      </div>
    </article>
    </>
  );
}
