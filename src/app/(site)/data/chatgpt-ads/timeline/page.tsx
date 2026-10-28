import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/data/breadcrumbs";
import { CiteThis } from "@/components/data/cite-this";
import { DatasetHeader } from "@/components/data/dataset-header";
import { JsonLd } from "@/components/json-ld";
import { SourceLink } from "@/components/data/source-link";
import { fmtMonth, timeline } from "@/lib/data";
import { breadcrumbNode, datasetNode, graph } from "@/lib/schema";
import { pageMeta } from "@/lib/site";

const PATH = "/data/chatgpt-ads/timeline";
const TITLE = "ChatGPT Ads timeline: every launch, price change & update";
const DESC = `A dated changelog of ads in ChatGPT, from OpenAI's first ad job listings to 89 countries and 100,000+ advertisers. ${timeline.rows.length} milestones, each sourced.`;

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESC, path: PATH });

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Data", path: "/data" },
  { name: "ChatGPT Ads Index", path: "/data/chatgpt-ads" },
  { name: "Timeline", path: PATH },
];

export default function TimelinePage() {
  const rows = [...timeline.rows].sort((a, b) => b.date.localeCompare(a.date));
  const byYear = new Map<string, typeof rows>();
  for (const r of rows) byYear.set(r.date.slice(0, 4), [...(byYear.get(r.date.slice(0, 4)) ?? []), r]);

  const jsonLd = graph(
    datasetNode({
      name: "ChatGPT Ads timeline",
      description: DESC,
      path: PATH,
      keywords: ["ChatGPT ads timeline", "ChatGPT ads changelog", "ChatGPT ads launch date", "ChatGPT ads countries", "ChatGPT ads updates"],
      datePublished: "2026-10-29",
      dateModified: timeline.updated,
      temporalCoverage: `${timeline.rows[0].date}/${timeline.updated}`,
      downloads: [
        { format: "CSV", path: "/data/download/chatgpt-ads-timeline.csv" },
        { format: "JSON", path: "/data/download/chatgpt-ads-timeline.json" },
      ],
    }),
    {
      "@type": "ItemList",
      name: "ChatGPT Ads milestones",
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: rows.length,
      itemListElement: rows.map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${r.date}: ${r.title}`,
        description: r.detail,
      })),
    },
    breadcrumbNode(crumbs),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <Breadcrumbs crumbs={crumbs} />
      <DatasetHeader
        title="ChatGPT Ads timeline"
        dek="Everything that has changed about advertising in ChatGPT, newest first: announcements, pricing, minimum spend, country launches, ad formats, tools, partners and policy."
        updated={timeline.updated}
        records={rows.length}
        recordLabel="milestones"
        download="chatgpt-ads-timeline"
      />

      {[...byYear.entries()].map(([year, events]) => (
        <section key={year} className="mt-12" aria-labelledby={`y${year}`}>
          <h2 id={`y${year}`} className="section-title mb-6">
            {year}
          </h2>
          <ol className="timeline">
            {events.map((e) => (
              <li key={e.id} id={`e${e.id}`}>
                <p className="meta">
                  <time dateTime={e.date}>{fmtMonth(e.date)}</time> · {e.type}
                </p>
                <h3 className="index-title mt-1">{e.title}</h3>
                <p className="mt-1 text-[1rem] leading-relaxed">{e.detail}</p>
                <p className="meta mt-1">
                  Source: <SourceLink url={e.sourceUrl} />
                </p>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <p className="mt-6 text-[0.95rem]">
        Related:{" "}
        <Link href="/data/chatgpt-ads/benchmarks" className="link">
          ChatGPT Ads benchmarks
        </Link>{" "}
        ·{" "}
        <Link href="/data/chatgpt-ads/advertisers" className="link">
          brands advertising on ChatGPT
        </Link>
      </p>

      <CiteThis title="ChatGPT Ads timeline" path={PATH} updated={timeline.updated} />
    </>
  );
}
