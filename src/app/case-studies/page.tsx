import type { Metadata } from "next";
import Link from "next/link";
import { getCaseStudies } from "@/lib/content";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Real-world case studies of AI-powered marketing systems, data-driven growth experiments, and scalable automation.",
  openGraph: { images: ["/og-images/home.png"] },
  twitter: { card: "summary_large_image", images: ["/og-images/home.png"] },
};

export const dynamic = "force-static";
export const revalidate = false;

export default async function CaseStudiesPage() {
  const caseStudies = await getCaseStudies();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 pb-24 pt-12 sm:px-6 sm:pt-14 lg:px-8">
      {/* Header */}
      <section className="border-b border-[var(--ink)] pb-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--ink-mute)] sm:text-[0.7rem] sm:tracking-[0.18em]">
          <span className="inline-flex items-center gap-2 border border-[var(--ink)] bg-[var(--paper)] px-2.5 py-1 text-[var(--ink)]">
            <span className="inline-block h-1.5 w-1.5 bg-[var(--accent)]" />
            $ ls work/
          </span>
          <span>
            {caseStudies.length.toString().padStart(2, "0")} ·{" "}
            {caseStudies.length === 1 ? "study" : "studies"}
          </span>
        </div>
        <h1 className="max-w-5xl font-display text-[2.6rem] font-semibold leading-[0.98] tracking-[-0.03em] text-[var(--ink)] sm:text-[3.6rem] lg:text-[4.2rem]">
          Real-world results from{" "}
          <span className="relative inline-block">
            <span className="relative z-10">AI-powered</span>
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-1 -z-0 h-[42%] bg-[var(--highlight)]"
            />
          </span>{" "}
          marketing systems.
        </h1>
        <p className="mt-6 max-w-2xl text-[1.05rem] leading-[1.7] text-[var(--ink-soft)]">
          Case studies showing how I build scalable, data-driven marketing
          systems that let small teams drive measurable growth.
        </p>
      </section>

      {/* List */}
      {caseStudies.length === 0 ? (
        <section className="py-16 text-center">
          <p className="font-mono text-[0.9rem] text-[var(--ink-soft)]">
            {"// no case studies indexed yet"}
          </p>
        </section>
      ) : (
        <section className="grid gap-8 md:grid-cols-2">
          {caseStudies.map((study, idx) => (
            <Link
              key={study.slug}
              href={`/case-studies/${study.slug}`}
              className="section-frame group flex flex-col"
            >
              <div className="flex items-center justify-between gap-3 border-b border-[var(--ink)] bg-[var(--background-strong)] px-5 py-2.5">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  #{String(idx + 1).padStart(2, "0")} · {study.date}
                </span>
                <span className="micro-label">case study</span>
              </div>

              <div className="flex flex-1 flex-col gap-5 p-6 sm:p-7">
                <h3 className="font-display text-[1.45rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)] sm:text-[1.65rem]">
                  {study.title}
                </h3>
                <p className="text-[0.98rem] leading-[1.7] text-[var(--ink-soft)]">
                  {study.description}
                </p>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <div className="flex flex-wrap gap-2">
                    {study.tags.map((tag) => (
                      <span key={tag} className="signal-chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--accent)]">
                    read →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
