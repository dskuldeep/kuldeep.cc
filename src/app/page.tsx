import Link from "next/link";
import { HeroArt } from "@/components/hero-art";
import { getBlogPosts, getCaseStudies } from "@/lib/content";

export default async function Home() {
  const [allCaseStudies, allBlogPosts] = await Promise.all([
    getCaseStudies(),
    getBlogPosts(),
  ]);
  const caseStudies = allCaseStudies.slice(0, 3);
  const blogPosts = allBlogPosts.slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Kuldeep Paul",
    url: "https://kuldeep.cc",
    image: "https://kuldeep.cc/opengraph-image",
    jobTitle: "Head of Marketing",
    worksFor: {
      "@type": "Organization",
      name: "Maxim AI",
      url: "https://www.getmaxim.ai",
    },
    alumniOf: {
      "@type": "EducationalOrganization",
      name: "University of Essex",
    },
    description:
      "Building scalable, AI-powered marketing systems. MSc in Applied Data Science from University of Essex. Focused on automation, experimentation, and data-driven growth.",
    sameAs: [
      "https://x.com/don_fedora",
      "https://www.linkedin.com/in/kuldeep-paul/",
      "https://www.getmaxim.ai",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-5 pb-20 pt-12 sm:px-6 lg:gap-20 lg:px-8">
      {/* Hero Section */}
      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
        <div className="space-y-8">
          <div className="relative space-y-8">
            <div className="space-y-4">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                Kuldeep Paul / Head of Marketing at Maxim AI
              </p>
              <h1 className="relative max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-tight text-[var(--foreground)] sm:text-6xl lg:text-7xl">
                Building{" "}
                <span className="relative inline-block">
                  <span className="text-[var(--orange)]">data-driven</span>
                  <span className="absolute -bottom-2 left-0 hidden font-hand text-xl italic text-[var(--orange)] opacity-60 sm:inline sm:text-2xl">
                    (the only way)
                  </span>
                </span>{" "}
                marketing systems that scale with AI
              </h1>
            </div>
            <p className="max-w-2xl text-lg leading-relaxed text-[var(--ink-soft)] sm:text-xl">
              I build scalable, AI-powered marketing systems focused on organic inbound growth.
              Combining a data science background (MSc, University of Essex) with 5+ years in
              product and marketing, I create automated workflows that enable small teams to
              drive big impact and measurable revenue growth.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link className="glass-button glass-button-primary" href="/case-studies">
              View case studies →
            </Link>
            <Link className="glass-button glass-button-secondary" href="/journal">
              Read blog
            </Link>
          </div>
        </div>

        <HeroArt />
      </section>

      {/* Case Studies Section */}
      {caseStudies.length > 0 && (
        <section className="space-y-8">
          <div className="relative">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">
              Case Studies
            </p>
            <h2 className="relative mt-2 font-display text-4xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-5xl">
              Recent work
              <span className="absolute -right-2 -top-2 hidden font-hand text-2xl italic text-[var(--orange)] opacity-50 lg:inline lg:-right-8 lg:text-3xl">
                ← check these out
              </span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map((study) => (
              <Link
                key={study.slug}
                href={`/case-studies/${study.slug}`}
                className="section-frame tape-strip group flex flex-col overflow-hidden px-0 py-0"
              >
                <div className="rounded-t-[1.5rem] bg-[linear-gradient(90deg,rgba(255,125,77,0.18),rgba(169,140,255,0.18),rgba(27,217,255,0.18))] px-6 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                      {study.date}
                    </p>
                    <span className="micro-label">case study</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-4 px-6 py-7">
                  <h3 className="font-display text-2xl leading-tight tracking-[-0.04em]">
                    {study.title}
                  </h3>
                  <p className="line-clamp-3 text-sm leading-relaxed text-[var(--ink-soft)]">
                    {study.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Blog Section */}
      {blogPosts.length > 0 && (
        <section className="space-y-8">
          <div className="relative">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">
              Blog
            </p>
            <h2 className="relative mt-2 font-display text-4xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-5xl">
              Latest posts
              <span className="absolute -bottom-4 left-0 hidden font-hand text-xl italic text-[var(--ink-soft)] opacity-60 md:inline md:text-2xl">
                thoughts on AI marketing →
              </span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/journal/${post.slug}`}
                className="section-frame tape-strip group flex flex-col overflow-hidden px-0 py-0"
              >
                <div className="dark-panel rounded-t-[1.5rem] rounded-b-none border-x-0 border-t-0 px-6 py-4 shadow-none">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/56">
                      {post.date}
                    </p>
                    <span className="micro-label micro-label-dark">blog</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-4 px-6 py-7">
                  <h3 className="font-display text-2xl leading-tight tracking-[-0.04em]">
                    {post.title}
                  </h3>
                  <p className="line-clamp-3 text-sm leading-relaxed text-[var(--ink-soft)]">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
    </>
  );
}
