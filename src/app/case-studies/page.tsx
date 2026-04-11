import type { Metadata } from "next";
import Link from "next/link";
import { getCaseStudies } from "@/lib/content";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Real-world case studies of AI-powered marketing systems, data-driven growth experiments, and scalable automation.",
  openGraph: {
    images: ["/og-images/home.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-images/home.png"],
  },
};

// Force static generation at build time
export const dynamic = 'force-static';
export const revalidate = false;

export default async function CaseStudiesPage() {
  const caseStudies = await getCaseStudies();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 pb-20 pt-12 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="border-b border-[var(--line)] pb-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">
              Case Studies
            </span>
            <span className="text-sm text-[var(--ink-soft)]">
              {caseStudies.length} {caseStudies.length === 1 ? 'case study' : 'case studies'}
            </span>
          </div>
        </div>
        <h1 className="relative max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-tight text-[var(--foreground)] sm:text-6xl lg:text-7xl">
          Real-world results from{" "}
          <span className="relative inline-block">
            AI-powered
            <span className="absolute -bottom-3 left-0 hidden font-hand text-2xl italic text-[var(--orange)] opacity-50 sm:inline sm:text-3xl">
              (& data-backed)
            </span>
          </span>{" "}
          marketing systems
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--ink-soft)]">
          Case studies showcasing how I build scalable, data-driven marketing systems
          that enable small teams to drive measurable growth.
        </p>
      </section>

      {/* Case Studies Grid */}
      {caseStudies.length === 0 ? (
        <section className="py-16 text-center">
          <p className="text-lg text-[var(--ink-soft)]">
            No case studies yet. Check back soon!
          </p>
          <p className="mt-4 text-sm text-[var(--ink-soft)]">
            To add a case study, create a new .md file in the <code className="rounded bg-gray-100 px-2 py-1">content/case-studies/</code> directory.
          </p>
        </section>
      ) : (
        <section className="grid gap-8 md:grid-cols-2">
          {caseStudies.map((study) => (
            <Link
              key={study.slug}
              href={`/case-studies/${study.slug}`}
              className="section-frame tape-strip group flex flex-col overflow-hidden px-0 py-0 transition-transform hover:scale-[1.02]"
            >
              <div className="rounded-t-[1.5rem] bg-[linear-gradient(90deg,rgba(255,125,77,0.18),rgba(169,140,255,0.18),rgba(27,217,255,0.18))] px-6 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                    {study.date}
                  </p>
                  <span className="micro-label">case study</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-5 px-6 py-7">
                <h3 className="font-display text-3xl leading-tight tracking-[-0.04em] transition-colors group-hover:text-[var(--orange)]">
                  {study.title}
                </h3>
                <p className="text-base leading-8 text-[var(--ink-soft)]">
                  {study.description}
                </p>

                <div className="mt-auto flex flex-wrap gap-2">
                  {study.tags.map((tag) => (
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
