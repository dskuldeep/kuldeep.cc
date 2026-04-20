import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCaseStudy, getCaseStudies } from "@/lib/content";
import { MarkdownContent } from "@/components/markdown-content";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const caseStudies = await getCaseStudies();
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await getCaseStudy(slug);
  if (!caseStudy) return { title: "Case Study Not Found" };
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
      images: [
        { url: "/og-images/home.png", width: 1200, height: 630, alt: caseStudy.title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: caseStudy.title,
      description: caseStudy.description,
      creator: "@don_fedora",
      site: "@don_fedora",
      images: ["/og-images/home.png"],
    },
    alternates: { canonical: `https://kuldeep.cc/case-studies/${slug}` },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const caseStudy = await getCaseStudy(slug);
  if (!caseStudy) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: caseStudy.title,
    description: caseStudy.description,
    image: "https://kuldeep.cc/og-images/home.png",
    author: {
      "@type": "Person",
      name: "Kuldeep Paul",
      url: "https://kuldeep.cc",
      jobTitle: "Head of Marketing",
      worksFor: { "@type": "Organization", name: "Maxim AI" },
    },
    datePublished: caseStudy.date,
    keywords: caseStudy.tags.join(", "),
    publisher: { "@type": "Person", name: "Kuldeep Paul" },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://kuldeep.cc/case-studies/${slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="mx-auto w-full max-w-4xl px-4 pb-24 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <header className="mb-12 border-b border-[var(--ink)] pb-10">
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--ink-soft)] transition-colors hover:text-[var(--accent)]"
          >
            ← cd ../case-studies
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--ink-mute)] sm:text-[0.7rem] sm:tracking-[0.18em]">
            <span className="inline-block h-1.5 w-1.5 bg-[var(--accent)]" />
            case study · {caseStudy.date}
          </div>

          <h1 className="mt-4 font-display text-[2.1rem] font-semibold leading-[1] tracking-[-0.025em] text-[var(--ink)] sm:text-[3rem] lg:text-[3.5rem]">
            {caseStudy.title}
          </h1>

          <p className="mt-6 max-w-3xl text-[1.05rem] leading-[1.65] text-[var(--ink-soft)] sm:text-[1.15rem]">
            {caseStudy.description}
          </p>

          {caseStudy.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {caseStudy.tags.map((tag) => (
                <span key={tag} className="signal-chip">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <MarkdownContent content={caseStudy.content} />
      </article>
    </>
  );
}
