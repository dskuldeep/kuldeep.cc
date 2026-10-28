import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/data/breadcrumbs";
import { CiteThis } from "@/components/data/cite-this";
import { CopyBlock } from "@/components/data/copy-block";
import { Faq } from "@/components/data/faq";
import { JsonLd } from "@/components/json-ld";
import { SourceLink } from "@/components/data/source-link";
import { botStat, crawlers, engines, fmtMonth, getCrawler, PURPOSE_LABEL, robotsStudy, type Crawler } from "@/lib/data";
import { breadcrumbNode, faqNode, graph, PERSON_ID } from "@/lib/schema";
import { canonicalPath, pageMeta, SITE } from "@/lib/site";

interface Props {
  params: Promise<{ bot: string }>;
}

export function generateStaticParams() {
  return crawlers.featured.map((c) => ({ bot: c.slug }));
}

function titleFor(c: Crawler) {
  return `${c.token}: what it is, user agent & how to block it`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCrawler((await params).bot);
  if (!c) return {};
  const st = botStat(c.token);
  return pageMeta({
    title: titleFor(c),
    description: `${c.token} is ${c.operator}'s ${PURPOSE_LABEL[c.purpose].toLowerCase()} bot (${c.product}).${st ? ` ${st.blockedPct}% of the top ${robotsStudy.sample.domains.toLocaleString("en-US")} sites block it.` : ""} User-agent string, IP list and robots.txt rules.`,
    path: `/data/ai-search/crawlers/${c.slug}`,
  });
}

function faqFor(c: Crawler, blockedPct: number | null) {
  const items = [
    {
      q: `What is ${c.token}?`,
      a: `${c.token} is a ${PURPOSE_LABEL[c.purpose].toLowerCase()} bot operated by ${c.operator}, used for ${c.product}. ${c.summary}`,
    },
    {
      q: `How do I block ${c.token}?`,
      a: `Add "User-agent: ${c.token}" followed by "Disallow: /" to the robots.txt file at the root of each host you want to protect.${c.respectsRobots === "No" ? ` ${c.token} is reported not to honour robots.txt, so a firewall or bot-management rule is more reliable.` : ""}`,
    },
    {
      q: `Does ${c.token} respect robots.txt?`,
      a:
        c.respectsRobots === "Yes"
          ? `Yes. ${c.operator} documents that ${c.token} honours robots.txt directives.`
          : c.respectsRobots === "No"
            ? `Not reliably. ${c.token} is documented or widely reported as ignoring robots.txt.`
            : c.respectsRobots === "Partial"
              ? `Partly. Because ${c.token} acts on a user's request, ${c.operator} says robots.txt rules may not always apply.`
              : `${c.operator} has not clearly documented whether ${c.token} honours robots.txt.`,
    },
  ];
  if (blockedPct !== null) {
    items.push({
      q: `How many websites block ${c.token}?`,
      a: `In a ${fmtMonth(robotsStudy.fetchedAt)} analysis of the top ${robotsStudy.sample.domains.toLocaleString("en-US")} websites by Kuldeep Paul, ${blockedPct}% of sites with a robots.txt file fully disallowed ${c.token}.`,
    });
  }
  return items;
}

export default async function CrawlerPage({ params }: Props) {
  const c = getCrawler((await params).bot);
  if (!c) notFound();

  const path = `/data/ai-search/crawlers/${c.slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Data", path: "/data" },
    { name: "AI crawlers", path: "/data/ai-search/crawlers" },
    { name: c.token, path },
  ];
  const st = botStat(c.token);
  const faq = faqFor(c, st ? st.blockedPct : null);
  const usedBy = engines.rows.filter((e) => e.crawlers.some((t) => t.toLowerCase() === c.token.toLowerCase()));
  const siblings = crawlers.featured.filter((x) => x.operator === c.operator && x.slug !== c.slug);
  const blockingSites = robotsStudy.topSites
    .filter((s) => s.blocks.some((b) => b.toLowerCase() === c.token.toLowerCase()))
    .slice(0, 24);

  const jsonLd = graph(
    {
      "@type": "TechArticle",
      "@id": `${canonicalPath(path)}#article`,
      headline: titleFor(c),
      url: canonicalPath(path),
      dateModified: crawlers.updated,
      datePublished: "2026-10-29",
      author: { "@id": PERSON_ID },
      publisher: { "@id": PERSON_ID },
      about: { "@type": "SoftwareApplication", name: c.token, applicationCategory: "Web crawler", author: { "@type": "Organization", name: c.operator } },
      ...(c.docs ? { citation: [c.docs] } : {}),
    },
    faqNode(faq),
    breadcrumbNode(crumbs),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <Breadcrumbs crumbs={crumbs} />
      <header className="mb-12">
        <p className="section-title mb-3">
          {PURPOSE_LABEL[c.purpose]} · {c.operator}
        </p>
        <h1 className="statement max-w-[20ch] break-words" style={{ fontFamily: "var(--font-mono)", letterSpacing: "-0.04em" }}>
          {c.token}
        </h1>
        <p className="lede mt-6 max-w-[40rem]">{c.summary}</p>
        <p className="meta mt-6">
          Compiled by{" "}
          <Link href="/about" className="link" rel="author">
            {SITE.name}
          </Link>{" "}
          · Updated {fmtMonth(crawlers.updated)}
        </p>
      </header>

      {st && (
        <section className="stats mb-14" aria-label={`${c.token} in the robots.txt study`}>
          <div>
            <span className="stat-value">{st.blockedPct}%</span>
            <span className="stat-label">of top sites fully block {c.token}</span>
          </div>
          <div>
            <span className="stat-value">{st.blocked.toLocaleString("en-US")}</span>
            <span className="stat-label">sites blocking, of {robotsStudy.sample.withRobots.toLocaleString("en-US")} with robots.txt</span>
          </div>
          <div>
            <span className="stat-value">{st.blockedTop1k}</span>
            <span className="stat-label">of the top 1,000 block it</span>
          </div>
        </section>
      )}

      <dl className="facts">
        <dt>Operator</dt>
        <dd>{c.operator}</dd>
        <dt>Purpose</dt>
        <dd>{PURPOSE_LABEL[c.purpose]}</dd>
        <dt>Used for</dt>
        <dd>{c.product}</dd>
        <dt>Obeys robots.txt</dt>
        <dd>{c.respectsRobots}</dd>
        <dt>robots.txt token</dt>
        <dd>
          <code className="mono">{c.token}</code>
        </dd>
        <dt>User-agent string</dt>
        <dd>{c.userAgent ? <code className="mono break-all">{c.userAgent}</code> : "Not published by the operator"}</dd>
        <dt>IP list</dt>
        <dd>{c.ipList ? <SourceLink url={c.ipList} label={c.ipList.replace(/^https?:\/\//, "")} /> : "Not published"}</dd>
        <dt>Official docs</dt>
        <dd>{c.docs ? <SourceLink url={c.docs} /> : "None published"}</dd>
        {usedBy.length > 0 && (
          <>
            <dt>Feeds</dt>
            <dd>
              {usedBy.map((e, i) => (
                <span key={e.slug}>
                  <Link href={`/data/ai-search/${e.slug}`} className="link">
                    {e.name}
                  </Link>
                  {i < usedBy.length - 1 ? ", " : ""}
                </span>
              ))}
            </dd>
          </>
        )}
      </dl>

      <section className="mt-14">
        <h2 className="section-title mb-4">Block {c.token} in robots.txt</h2>
        <CopyBlock text={`User-agent: ${c.token}\nDisallow: /`} label="Copy rule" />
        {c.purpose === "search" || c.purpose === "user" ? (
          <p className="mt-4 max-w-[40rem] text-[0.95rem] text-[var(--muted)]">
            Blocking a search or user-triggered bot removes your pages from that assistant&apos;s
            answers. To opt out of model training only, block the operator&apos;s training crawler
            instead.
          </p>
        ) : null}
      </section>

      {blockingSites.length > 0 && (
        <section className="mt-14">
          <h2 className="section-title mb-4">Well-known sites that block {c.token}</h2>
          <p className="text-[1rem] leading-relaxed">
            {blockingSites.map((s, i) => (
              <span key={s.domain}>
                {s.domain}
                <span className="text-[var(--faint)]"> #{s.rank}</span>
                {i < blockingSites.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
          <p className="meta mt-3">
            Ranks from the Tranco list. Full per-site data in the{" "}
            <Link href="/data/ai-search/robots-txt-study" className="link">
              robots.txt study
            </Link>
            .
          </p>
        </section>
      )}

      {siblings.length > 0 && (
        <section className="mt-14">
          <h2 className="section-title mb-3">Other {c.operator} bots</h2>
          <p>
            {siblings.map((s, i) => (
              <span key={s.slug}>
                <Link href={`/data/ai-search/crawlers/${s.slug}`} className="link mono">
                  {s.token}
                </Link>{" "}
                <span className="text-[var(--muted)]">({PURPOSE_LABEL[s.purpose].toLowerCase()})</span>
                {i < siblings.length - 1 ? " · " : ""}
              </span>
            ))}
          </p>
        </section>
      )}

      <Faq items={faq} />
      <p className="mt-10">
        <Link href="/data/ai-search/crawlers" className="link text-[0.95rem]">
          ← All AI crawlers
        </Link>
      </p>
      <CiteThis title={`${c.token} — AI crawler directory`} path={path} updated={crawlers.updated} />
    </>
  );
}
