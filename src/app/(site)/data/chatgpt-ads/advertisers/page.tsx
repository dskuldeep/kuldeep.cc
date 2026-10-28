import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/data/breadcrumbs";
import { CiteThis } from "@/components/data/cite-this";
import { DatasetHeader } from "@/components/data/dataset-header";
import { JsonLd } from "@/components/json-ld";
import { SourceLink } from "@/components/data/source-link";
import { TableFilter } from "@/components/data/table-filter";
import { AboutDataset, RelatedResearch } from "@/components/data/about-dataset";
import { ColumnChart } from "@/components/data/charts";
import { Faq } from "@/components/data/faq";
import { advertisers, fmtMonth, insights, monthLabel, researchFor } from "@/lib/data";
import { breadcrumbNode, datasetNode, faqNode, graph } from "@/lib/schema";
import { pageMeta } from "@/lib/site";

const PATH = "/data/chatgpt-ads/advertisers";
const n = advertisers.rows.length;
const TITLE = `Brands advertising on ChatGPT: ${n} known advertisers`;
const DESC = `Which companies run ChatGPT ads? ${n} advertisers named in public reporting, including Target, Adobe, Expedia and Best Buy, with category, market and source.`;

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESC, path: PATH });

const FAQ = [
  {
    q: "Which brands advertise on ChatGPT?",
    a: "Launch-era advertisers included Target, Adobe, Expedia, Williams-Sonoma, Best Buy, Ford, Audible, Mazda, Albertsons and Mrs. Meyer's. By mid-2026 Booking Holdings, Intuit, Home Depot and L.L.Bean were among the largest by estimated spend.",
  },
  {
    q: "How many advertisers use ChatGPT ads?",
    a: "OpenAI said in October 2026 that more than 100,000 advertisers have run campaigns. Panel estimates earlier in the year counted about 300 active advertisers in April and over 820 in July.",
  },
  {
    q: "What industries advertise most on ChatGPT?",
    a: "Among brands named in public reporting, software, finance, retail, travel and insurance lead. These are considered purchases, where people ask ChatGPT to compare options before buying.",
  },
];

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
    faqNode(FAQ),
    datasetNode({
      research: researchFor("chatgpt-ads-advertisers"),
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

      <ColumnChart
        title="Advertisers by month first reported"
        items={insights.ads.advertisersFirstReported.map((m) => ({ label: monthLabel(m.month), value: m.count }))}
        caption="When each brand was first named in public reporting as a ChatGPT advertiser, 2026."
        source="Brands advertising on ChatGPT"
      />

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

      <AboutDataset
        download="chatgpt-ads-advertisers"
        what={<p>Brands publicly reported as running ads in ChatGPT: launch partners, case studies, and advertisers observed by ad-tracking panels and journalists, with a category, market and the source that reported each one.</p>}
        how={<p>Brand names were extracted from public reporting, then reviewed by hand. Agencies, ad-tech vendors and media outlets were removed, as were brands that were only recommended in ChatGPT answers rather than advertising. Name variants were merged.</p>}
        limits={<p>This is a list of advertisers named in public, not a census: it over-represents large, US and early advertisers. Market is filled in only where the source says where the ads ran.</p>}
        fields={[
          { name: "brand", description: "Advertiser name" },
          { name: "category", description: "Industry, assigned by hand" },
          { name: "market", description: "Country or region where ads were reported, if stated" },
          { name: "evidence", description: "What the source says about the brand advertising" },
          { name: "sourceUrl / sourceDomain", description: "Most authoritative source reporting it" },
          { name: "firstReported", description: "Earliest publication date naming the brand" },
          { name: "sources", description: "Number of distinct domains reporting the brand" },
        ]}
      />
      <Faq items={FAQ} />
      <RelatedResearch dataset="chatgpt-ads-advertisers" />
      <CiteThis title="Brands advertising on ChatGPT" path={PATH} updated={advertisers.updated} />
    </>
  );
}
