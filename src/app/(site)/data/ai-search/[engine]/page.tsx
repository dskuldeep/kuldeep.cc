import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/data/breadcrumbs";
import { CiteThis } from "@/components/data/cite-this";
import { JsonLd } from "@/components/json-ld";
import { SourceLink } from "@/components/data/source-link";
import { RelatedResearch } from "@/components/data/about-dataset";
import { ColumnChart } from "@/components/data/charts";
import { Faq } from "@/components/data/faq";
import { botStat, crawlerSlug, engines, fmtMonth, getEngine, userNumbers } from "@/lib/data";
import { breadcrumbNode, faqNode, graph, PERSON_ID } from "@/lib/schema";
import { canonicalPath, pageMeta, SITE } from "@/lib/site";

interface Props {
  params: Promise<{ engine: string }>;
}

export function generateStaticParams() {
  return engines.rows.map((e) => ({ engine: e.slug }));
}

function titleFor(name: string) {
  return `${name}: search index, crawlers, referrer & ads`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = getEngine((await params).engine);
  if (!e) return {};
  return pageMeta({
    title: titleFor(e.name),
    description: `How ${e.name} finds and cites the web: ${e.index.split(". ")[0]}. Crawlers: ${e.crawlers.join(", ") || "none documented"}. Referrer: ${e.referrers[0] ?? "none"}.`.slice(0, 300),
    path: `/data/ai-search/${e.slug}`,
  });
}

export default async function EnginePage({ params }: Props) {
  const e = getEngine((await params).engine);
  if (!e) notFound();

  const path = `/data/ai-search/${e.slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Data", path: "/data" },
    { name: "AI Search Reference", path: "/data/ai-search" },
    { name: e.name, path },
  ];
  const users = userNumbers.rows.filter((u) => u.engine === e.slug).sort((a, b) => a.asOf.localeCompare(b.asOf));
  const others = engines.rows.filter((x) => x.slug !== e.slug);
  const faq = [
    {
      q: `What search engine does ${e.name} use?`,
      a: e.index,
    },
    {
      q: `Which crawlers does ${e.name} use?`,
      a: e.crawlers.length
        ? `${e.name} relies on ${e.crawlers.join(", ")}. ${e.notes}`.trim()
        : `${e.operator} has not documented a crawler for ${e.name}.`,
    },
    {
      q: `How do I track ${e.name} traffic in analytics?`,
      a: e.referrers.length
        ? `Clicks from ${e.name} arrive with the referrer ${e.referrers.join(" or ")}.${e.utm ? ` ${e.utm}` : ""} Add it to an AI channel in GA4 using a source regex.`
        : `${e.name} does not send its own referrer, so its clicks can't be separated from the host site's traffic.`,
    },
    { q: `Does ${e.name} show ads?`, a: e.ads },
  ];
  const chartable = users.filter((u) => /active users|monthly users/i.test(u.metric) && /million|billion/.test(u.value));

  const jsonLd = graph(
    {
      "@type": "WebPage",
      "@id": `${canonicalPath(path)}#webpage`,
      url: canonicalPath(path),
      name: titleFor(e.name),
      dateModified: engines.updated,
      author: { "@id": PERSON_ID },
      about: {
        "@type": "SoftwareApplication",
        name: e.name,
        applicationCategory: "SearchApplication",
        operatingSystem: "Web",
        author: { "@type": "Organization", name: e.operator },
        datePublished: e.launched,
      },
      citation: e.index_sources,
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
          {e.kind} · {e.operator}
        </p>
        <h1 className="statement max-w-[20ch]">{e.name}</h1>
        <p className="lede mt-6 max-w-[40rem]">{e.index}</p>
        <p className="meta mt-6">
          Compiled by{" "}
          <Link href="/about" className="link" rel="author">
            {SITE.name}
          </Link>{" "}
          · Updated {fmtMonth(engines.updated)}
        </p>
      </header>

      <dl className="facts">
        <dt>Operator</dt>
        <dd>{e.operator}</dd>
        <dt>Launched</dt>
        <dd>
          {fmtMonth(e.launched)}
          {e.search_launched ? ` · web search ${fmtMonth(e.search_launched)}` : ""}
        </dd>
        <dt>Search index</dt>
        <dd>
          {e.index}
          <span className="block mt-1 meta">
            Sources:{" "}
            {e.index_sources.map((u, i) => (
              <span key={u}>
                <SourceLink url={u} />
                {i < e.index_sources.length - 1 ? ", " : ""}
              </span>
            ))}
          </span>
        </dd>
        <dt>Crawlers</dt>
        <dd>
          {e.crawlers.length === 0 && "None documented"}
          {e.crawlers.map((c) => {
            const slug = crawlerSlug(c);
            const stat = botStat(c);
            return (
              <span key={c} className="block">
                {slug ? (
                  <Link href={`/data/ai-search/crawlers/${slug}`} className="link mono">
                    {c}
                  </Link>
                ) : (
                  <code className="mono">{c}</code>
                )}
                {stat && stat.blocked > 0 && (
                  <span className="text-[var(--muted)]"> — blocked by {stat.blockedPct}% of top sites</span>
                )}
              </span>
            );
          })}
        </dd>
        <dt>Referrer in analytics</dt>
        <dd>
          {e.referrers.length ? e.referrers.map((r) => <code key={r} className="mono block">{r}</code>) : "No referrer (traffic arrives as direct or via the host site)"}
        </dd>
        <dt>UTM tagging</dt>
        <dd>
          {e.utm ?? "None added"}
          {e.utm_source && (
            <span className="meta block mt-1">
              Source: <SourceLink url={e.utm_source} />
            </span>
          )}
        </dd>
        <dt>Ads</dt>
        <dd>
          {e.ads}
          {e.ads_source && (
            <span className="meta block mt-1">
              Source: <SourceLink url={e.ads_source} />
            </span>
          )}
        </dd>
        <dt>Citations</dt>
        <dd>{e.citations}</dd>
        {e.docs && (
          <>
            <dt>Official docs</dt>
            <dd>
              <SourceLink url={e.docs} />
            </dd>
          </>
        )}
      </dl>

      {e.notes && (
        <section className="article mt-12">
          <h2>What this means for visibility</h2>
          <p>{e.notes}</p>
        </section>
      )}

      {users.length > 0 && (
        <section className="mt-14" aria-labelledby="users">
          <h2 id="users" className="section-title mb-4">
            Usage, as stated
          </h2>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>As of</th>
                  <th>Metric</th>
                  <th className="num">Value</th>
                  <th>Stated by</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={`${u.metric}${u.asOf}`}>
                    <td className="nowrap">{fmtMonth(u.asOf)}</td>
                    <td>{u.metric}</td>
                    <td className="num strong">{u.value}</td>
                    <td>{u.statedBy}</td>
                    <td>
                      <SourceLink url={u.sourceUrl} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {chartable.length >= 2 && (
        <ColumnChart
          title={`${e.name} users over time (millions)`}
          items={chartable.map((u) => ({
            label: fmtMonth(u.asOf),
            value: parseFloat(u.value.replace(/,/g, "")) * (u.value.includes("billion") ? 1000 : 1),
          }))}
          format={(v) => v.toLocaleString("en-US")}
          caption={chartable.map((u) => u.metric).filter((m, i, a) => a.indexOf(m) === i).join(" / ")}
          source={`${e.operator}, as stated`}
        />
      )}

      <Faq items={faq} />
      <RelatedResearch dataset="ai-engines" />

      <section className="mt-16">
        <h2 className="section-title mb-3">Other AI engines</h2>
        <p className="text-[1rem] leading-relaxed">
          {others.map((o, i) => (
            <span key={o.slug}>
              <Link href={`/data/ai-search/${o.slug}`} className="link">
                {o.name}
              </Link>
              {i < others.length - 1 ? " · " : ""}
            </span>
          ))}
        </p>
      </section>

      <CiteThis title={`${e.name} — AI search engine reference`} path={path} updated={engines.updated} />
    </>
  );
}
