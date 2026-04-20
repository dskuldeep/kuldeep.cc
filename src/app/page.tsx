import Link from "next/link";
import { HeroArt } from "@/components/hero-art";
import { getBlogPosts, getCaseStudies } from "@/lib/content";

const tickerItems = [
  "AI-native growth",
  "Marketing systems",
  "Product narrative",
  "Data-aware funnels",
  "Evaluation-first",
  "Automation",
  "MSc · applied data science",
];

const capabilities = [
  {
    no: "01",
    title: "Multi-agent workflows",
    note: "Planner + researcher + editor loops that ship real marketing artifacts.",
  },
  {
    no: "02",
    title: "Data-driven systems",
    note: "Warehouse-backed activation — every channel instrumented.",
  },
  {
    no: "03",
    title: "Automated experimentation",
    note: "Statistical rigor applied to copy, creative, and channel mix.",
  },
  {
    no: "04",
    title: "Product narrative",
    note: "Positioning that reads the market and the model weights.",
  },
];

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

      {/* Ticker */}
      <div className="ticker">
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <span key={idx} className="ticker-item">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 pb-24 pt-12 sm:px-6 sm:pt-14 lg:gap-24 lg:px-8">
        {/* ========== HERO ========== */}
        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div className="flex flex-col justify-center gap-9">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-mute)]">
                <span className="inline-flex items-center gap-2 border border-[var(--ink)] bg-[var(--paper)] px-2.5 py-1">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse bg-[var(--accent)]" />
                  kuldeep paul
                </span>
                <span>/</span>
                <span>head of marketing · maxim ai</span>
              </div>

              <h1 className="max-w-4xl font-display text-[2.25rem] font-semibold leading-[0.98] tracking-[-0.035em] text-[var(--ink)] sm:text-[3.4rem] lg:text-[4rem]">
                Building{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">data-driven</span>
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-1 -z-0 h-[42%] bg-[var(--highlight)]"
                  />
                </span>{" "}
                marketing systems that scale with{" "}
                <span className="text-[var(--accent)]">AI</span>
                <span aria-hidden="true" className="headline-cursor" />
              </h1>
            </div>

            <p className="max-w-2xl text-[1.05rem] leading-[1.7] text-[var(--ink-soft)] sm:text-[1.12rem]">
              I build scalable, AI-powered marketing systems focused on organic inbound growth.
              Combining a data science background (MSc, University of Essex) with 5+ years in
              product and marketing, I create automated workflows that enable small teams to
              drive big impact and measurable revenue growth.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link className="glass-button glass-button-primary" href="/case-studies">
                view case studies →
              </Link>
              <Link className="glass-button glass-button-secondary" href="/journal">
                read the blog
              </Link>
            </div>

            {/* inline stat strip */}
            <div className="mt-2 grid grid-cols-1 gap-0 border-y border-[var(--ink)] font-mono sm:grid-cols-3">
              {[
                { k: "5+", v: "years shipping" },
                { k: "MSc", v: "applied data sci" },
                { k: "∞", v: "curiosity debt" },
              ].map((s, i) => (
                <div
                  key={s.k}
                  className={`flex flex-col gap-1 py-4 ${i !== 0 ? "border-t border-[var(--ink)] sm:border-l sm:border-t-0 sm:pl-4" : ""}`}
                >
                  <span className="text-[1.5rem] font-semibold tracking-tight text-[var(--ink)]">
                    {s.k}
                  </span>
                  <span className="text-[0.65rem] uppercase tracking-[0.16em] text-[var(--ink-mute)]">
                    {s.v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <HeroArt />
        </section>

        {/* ========== CAPABILITIES ========== */}
        <section className="space-y-8">
          <SectionHeader
            kicker="$ ls ~/capabilities"
            title="Systems for AI-led growth"
            note="Automation, experimentation, and predictive modeling for lean teams."
          />

          <div className="grid grid-cols-1 gap-0 border border-[var(--ink)] bg-[var(--paper)] sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((c, idx) => (
              <div
                key={c.no}
                className={`flex flex-col gap-4 p-6 sm:p-7 ${
                  idx > 0 ? "border-t border-[var(--ink)] sm:border-l sm:border-t-0" : ""
                } ${
                  idx === 2
                    ? "sm:border-t sm:border-l lg:border-t-0 lg:border-l"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[0.75rem] tracking-[0.14em] text-[var(--ink-mute)]">
                    {c.no}
                  </span>
                  <span className="inline-block h-2 w-2 bg-[var(--accent)]" />
                </div>
                <h3 className="font-display text-[1.15rem] font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)]">
                  {c.title}
                </h3>
                <p className="text-[0.92rem] leading-relaxed text-[var(--ink-soft)]">
                  {c.note}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ========== CASE STUDIES ========== */}
        {caseStudies.length > 0 && (
          <section className="space-y-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeader
                kicker="$ cat case-studies/ | head -3"
                title="Recent work"
                note="Shipped systems, measurable outcomes, decisions documented."
              />
              <Link
                href="/case-studies"
                className="self-start font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--ink-soft)] underline decoration-[var(--accent)] decoration-2 underline-offset-4 transition-colors hover:text-[var(--accent)]"
              >
                see all →
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {caseStudies.map((study, idx) => (
                <Link
                  key={study.slug}
                  href={`/case-studies/${study.slug}`}
                  className="section-frame group flex flex-col"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-[var(--ink)] bg-[var(--background-strong)] px-4 py-2.5">
                    <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                      #{String(idx + 1).padStart(2, "0")} · {study.date}
                    </span>
                    <span className="micro-label">case</span>
                  </div>

                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <h3 className="font-display text-[1.35rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                      {study.title}
                    </h3>
                    <p className="line-clamp-3 text-[0.92rem] leading-relaxed text-[var(--ink-soft)]">
                      {study.description}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-[var(--accent)]">
                      read case <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ========== BLOG ========== */}
        {blogPosts.length > 0 && (
          <section className="space-y-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeader
                kicker="$ tail -3 journal.log"
                title="Latest posts"
                note="Notes on AI-native marketing, product storytelling, and growth systems."
              />
              <Link
                href="/journal"
                className="self-start font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--ink-soft)] underline decoration-[var(--accent)] decoration-2 underline-offset-4 transition-colors hover:text-[var(--accent)]"
              >
                see all →
              </Link>
            </div>

            <div className="border border-[var(--ink)] bg-[var(--paper)]">
              {/* header row */}
              <div className="hidden grid-cols-[100px_1fr_140px_60px] items-center gap-4 border-b border-[var(--ink)] bg-[var(--background-strong)] px-5 py-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[var(--ink-mute)] md:grid">
                <span>date</span>
                <span>title</span>
                <span>reading</span>
                <span className="text-right">→</span>
              </div>
              {blogPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/journal/${post.slug}`}
                  className="group grid grid-cols-1 gap-2 border-b border-[var(--line-strong)] px-5 py-5 transition-colors last:border-b-0 hover:bg-[var(--background-strong)] md:grid-cols-[100px_1fr_140px_60px] md:items-center md:gap-4"
                >
                  <time className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-[var(--ink-mute)]">
                    {post.date}
                  </time>
                  <div className="flex flex-col gap-1">
                    <span className="font-display text-[1.05rem] font-semibold leading-tight tracking-[-0.015em] text-[var(--ink)] group-hover:text-[var(--accent)]">
                      {post.title}
                    </span>
                    <span className="line-clamp-1 text-[0.86rem] text-[var(--ink-soft)]">
                      {post.excerpt}
                    </span>
                  </div>
                  <span className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-[var(--ink-mute)]">
                    {"readingTime" in post && post.readingTime ? post.readingTime : "—"}
                  </span>
                  <span className="font-mono text-[1rem] text-[var(--accent)] md:text-right">→</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ========== FINAL CTA ========== */}
        <section className="border border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]">
          <div className="flex flex-col gap-6 p-8 sm:p-12 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--highlight)]">
                $ start ./conversation
              </p>
              <h2 className="font-display text-[2rem] font-semibold leading-[1] tracking-[-0.02em] sm:text-[2.6rem]">
                If you&apos;re shipping AI-native products, let&apos;s talk.
              </h2>
              <p className="text-[0.98rem] leading-relaxed text-white/70">
                Partnerships, speaking, hiring, or a problem you can&apos;t quite name yet.
                My inbox is open.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="https://www.linkedin.com/in/kuldeep-paul/"
                target="_blank"
                rel="noreferrer"
                className="glass-button"
                style={{
                  background: "var(--accent)",
                  color: "var(--paper)",
                  border: "1px solid var(--accent)",
                  boxShadow: "4px 4px 0 0 var(--highlight)",
                }}
              >
                LinkedIn →
              </a>
              <a
                href="https://x.com/don_fedora"
                target="_blank"
                rel="noreferrer"
                className="glass-button"
                style={{
                  background: "transparent",
                  color: "var(--paper)",
                  border: "1px solid var(--paper)",
                  boxShadow: "4px 4px 0 0 var(--paper)",
                }}
              >
                @don_fedora
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function SectionHeader({
  kicker,
  title,
  note,
}: {
  kicker: string;
  title: string;
  note?: string;
}) {
  return (
    <div className="space-y-3">
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--ink-mute)]">
        {kicker}
      </p>
      <h2 className="max-w-3xl font-display text-[2rem] font-semibold leading-[1.05] tracking-[-0.025em] text-[var(--ink)] sm:text-[2.6rem]">
        {title}
      </h2>
      {note && (
        <p className="max-w-2xl text-[0.98rem] leading-relaxed text-[var(--ink-soft)]">
          {note}
        </p>
      )}
    </div>
  );
}
