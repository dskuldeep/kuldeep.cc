import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/data/breadcrumbs";
import { CiteThis } from "@/components/data/cite-this";
import { DatasetHeader } from "@/components/data/dataset-header";
import { JsonLd } from "@/components/json-ld";
import { SourceLink } from "@/components/data/source-link";
import { TableFilter } from "@/components/data/table-filter";
import { advertisers, fmtMonth } from "@/lib/data";
import { breadcrumbNode, datasetNode, graph } from "@/lib/schema";
import { pageMeta } from "@/lib/site";

const PATH = "/data/chatgpt-ads/advertisers";
const n = advertisers.rows.length;
const TITLE = `Brands advertising on ChatGPT: ${n} known advertisers`;
const DESC = `Which companies run ChatGPT ads? ${n} advertisers named in public reporting, including Target, Adobe, Expedia and Best Buy, with category, market and source.`;

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESC, path: PATH });

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Data", path: "/data" },
  { name: "ChatGPT Ads Index", path: "/data/chatgpt-ads" },
  { name: "Advertisers", path: PATH },
];

export default function AdvertisersPage() {
  const rows = advertisers.rows;
  const byCat = new Map<string, number>();
  for (const r of rows) byCat.set(r.category, (byCat.get(r.category) ?? 0) + 1);
  const cats = [...byCat.entries()].sort((a, b) => b[1] - a[1]);

  const jsonLd = graph(
    datasetNode({
      name: "Brands advertising on ChatGPT",
      description: DESC,
      path: PATH,
      keywords: ["brands advertising on ChatGPT", "ChatGPT advertisers", "who advertises on ChatGPT", "ChatGPT ads examples"],
      datePublished: "2026-10-29",
      dateModified: advertisers.updated,
      variableMeasured: ["Brand", "Category", "Market", "Source"],
      downloads: [
        { format: "CSV", path: "/data/download/chatgpt-ads-advertisers.csv" },
        { format: "JSON", path: "/data/download/chatgpt-ads-advertisers.json" },
      ],
    }),
    {
      "@type": "ItemList",
      name: "Brands advertising on ChatGPT",
      numberOfItems: n,
      itemListElement: rows.slice(0, 50).map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@type": "Organization", name: r.brand },
      })),
    },
    breadcrumbNode(crumbs),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <Breadcrumbs crumbs={crumbs} />
      <DatasetHeader
        title="Brands advertising on ChatGPT"
        dek="Companies that have been reported running ads in ChatGPT, from launch partners like Target and Adobe to category leaders spotted in ad-tracking panels. Sorted by how many independent sources report them."
        updated={advertisers.updated}
        records={n}
        recordLabel="advertisers"
        download="chatgpt-ads-advertisers"
      />

      <section aria-labelledby="by-category">
        <h2 id="by-category" className="section-title mb-4">
          By category
        </h2>
        <div className="table-wrap">
          <table className="data-table">
            <tbody>
              {cats.map(([c, count]) => (
                <tr key={c}>
                  <td className="w-48">{c}</td>
                  <td className="w-full">
                    <span className="bar" aria-hidden="true">
                      <span style={{ width: `${(count / cats[0][1]) * 100}%` }} />
                    </span>
                  </td>
                  <td className="num">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="meta mt-3">
          OpenAI says more than 100,000 advertisers have used the platform. This list only includes
          brands named in public reporting, so it skews toward large and early advertisers.
        </p>
      </section>

      <section className="mt-16" aria-labelledby="all">
        <h2 id="all" className="section-title mb-4">
          All advertisers
        </h2>
        <TableFilter tableId="advertisers" placeholder="Filter by brand, category, market…" total={n} />
      </section>
      <div className="bleed table-wrap">
        <table id="advertisers" className="data-table">
          <caption>Advertisers reported running ChatGPT ads.</caption>
          <thead>
            <tr>
              <th>Brand</th>
              <th>Category</th>
              <th>Market</th>
              <th>What was reported</th>
              <th>Source</th>
              <th className="num">Sources</th>
              <th>First reported</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="strong">{r.brand}</td>
                <td className="nowrap">{r.category}</td>
                <td className="nowrap">{r.market ?? "—"}</td>
                <td className="text-[var(--muted)]">{r.evidence}</td>
                <td>
                  <SourceLink url={r.sourceUrl} />
                </td>
                <td className="num">{r.sources}</td>
                <td className="nowrap">{fmtMonth(r.firstReported)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-10 text-[0.95rem]">
        Related:{" "}
        <Link href="/data/chatgpt-ads/benchmarks" className="link">
          ChatGPT Ads benchmarks
        </Link>{" "}
        ·{" "}
        <Link href="/data/chatgpt-ads/timeline" className="link">
          ChatGPT Ads timeline
        </Link>
      </p>

      <CiteThis title="Brands advertising on ChatGPT" path={PATH} updated={advertisers.updated} />
    </>
  );
}
