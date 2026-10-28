import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/data/breadcrumbs";
import { CiteThis } from "@/components/data/cite-this";
import { DatasetHeader } from "@/components/data/dataset-header";
import { JsonLd } from "@/components/json-ld";
import { SourceLink } from "@/components/data/source-link";
import { TableFilter } from "@/components/data/table-filter";
import { AboutDataset, RelatedResearch } from "@/components/data/about-dataset";
import { ColumnChart, LineChart } from "@/components/data/charts";
import { Faq } from "@/components/data/faq";
import { benchmarks, fmtMonth, insights, monthLabel, researchFor, type MetricSummary } from "@/lib/data";
import { breadcrumbNode, datasetNode, faqNode, graph } from "@/lib/schema";
import { pageMeta } from "@/lib/site";

const PATH = "/data/chatgpt-ads/benchmarks";
const s = benchmarks.summary;
const TITLE = `ChatGPT Ads benchmarks: CPM, CPC, CTR & ROAS (${s.dataPoints} data points)`;
const DESC = `Every public ChatGPT Ads benchmark in one table. Median CPC $${s.cpc.median.toFixed(2)}, CPM $${s.cpm.median.toFixed(2)}, CTR ${s.ctr.median.toFixed(2)}% from ${s.sources} sources, each linked and dated.`;

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESC, path: PATH });

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Data", path: "/data" },
  { name: "ChatGPT Ads Index", path: "/data/chatgpt-ads" },
  { name: "Benchmarks", path: PATH },
];

const FAQ = [
  {
    q: "What is the average CPC for ChatGPT ads?",
    a: `The median reported CPC is $${s.cpc.median.toFixed(2)} across ${s.cpc.n} published figures. It has stayed close to $4 every month since CPC bidding launched in April 2026, in the middle of OpenAI's recommended $3–$5 starting bid.`,
  },
  {
    q: "What is a good CTR for ChatGPT ads?",
    a: `The median reported CTR is ${s.ctr.median.toFixed(2)}%, and about nine in ten reported CTRs are below 2%. Anything above 1% is better than typical; above 2% is rare in public reports.`,
  },
  {
    q: "How much does it cost to advertise on ChatGPT?",
    a: `Self-serve campaigns start from a $25 daily budget in the US. Typical reported prices are a median $${s.cpc.median.toFixed(2)} per click or $${s.cpm.median.toFixed(2)} per thousand impressions. Launch-era pilots required $200,000–$250,000 commitments, which no longer apply.`,
  },
  {
    q: "Is CPM or CPC bidding cheaper on ChatGPT?",
    a: `At the median CPM ($${s.cpm.median.toFixed(2)}) and median CTR (${s.ctr.median.toFixed(2)}%), impression buying works out to about $${(s.cpm.median / (10 * s.ctr.median)).toFixed(2)} per click, within cents of the median CPC. If your CTR is above about 1%, CPM is usually cheaper per click; below it, CPC is.`,
  },
  {
    q: "Why do ChatGPT ads benchmarks disagree so much?",
    a: "Most figures come from single-account tests with small budgets, in different countries, industries and months, during a period when pricing, minimums and bidding options changed repeatedly. OpenAI does not publish official benchmarks. Medians across many reports are more reliable than any single test.",
  },
];

const METRIC_NOTES: Record<string, string> = {
  CPM: "Cost per thousand impressions",
  CPC: "Cost per click",
  CTR: "Click-through rate",
  CVR: "Conversion rate",
  CPA: "Cost per acquisition / lead",
  ROAS: "Return on ad spend",
  "Min. spend": "Minimum commitment or budget",
};

function fmt(metric: string, v: number): string {
  if (metric === "CTR" || metric === "CVR") return `${v.toFixed(2)}%`;
  if (metric === "ROAS") return `${v.toFixed(1)}x`;
  return `$${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export default function BenchmarksPage() {
  const rows = benchmarks.rows;
  const summaryRows: [string, MetricSummary][] = [
    ["CPM", s.cpm],
    ["CPC", s.cpc],
    ["CTR", s.ctr],
    ["CVR", s.cvr],
  ];
  const mostCited = [...rows].sort((a, b) => b.citedBy - a.citedBy).slice(0, 8);

  const jsonLd = graph(
    faqNode(FAQ),
    datasetNode({
      research: researchFor("chatgpt-ads-benchmarks"),
      name: "ChatGPT Ads benchmarks",
      description: DESC,
      path: PATH,
      keywords: ["ChatGPT ads benchmarks", "ChatGPT ads CPM", "ChatGPT ads CPC", "ChatGPT ads CTR", "ChatGPT ads cost", "ChatGPT ads ROAS"],
      datePublished: "2026-10-29",
      dateModified: benchmarks.updated,
      temporalCoverage: "2026-01/2026-10",
      variableMeasured: ["CPM", "CPC", "CTR", "Conversion rate", "CPA", "ROAS", "Minimum spend"],
      downloads: [
        { format: "CSV", path: "/data/download/chatgpt-ads-benchmarks.csv" },
        { format: "JSON", path: "/data/download/chatgpt-ads-benchmarks.json" },
      ],
    }),
    breadcrumbNode(crumbs),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <Breadcrumbs crumbs={crumbs} />
      <DatasetHeader
        title="ChatGPT Ads benchmarks"
        dek={`OpenAI doesn't publish benchmarks, so advertisers compare notes. This table collects ${s.dataPoints} distinct figures from ${s.sources} sources: agency tests, platform data, trade press and OpenAI itself. Each one is deduplicated and linked to where it was reported.`}
        updated={benchmarks.updated}
        records={rows.length}
        recordLabel="data points"
        download="chatgpt-ads-benchmarks"
      />

      <section aria-labelledby="summary">
        <h2 id="summary" className="section-title mb-4">
          Summary
        </h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th className="num">Median</th>
                <th className="num">Lowest</th>
                <th className="num">Highest</th>
                <th className="num">Reports</th>
              </tr>
            </thead>
            <tbody>
              {summaryRows.map(([m, v]) => (
                <tr key={m}>
                  <td>
                    <span className="strong">{m}</span>{" "}
                    <span className="text-[var(--muted)]">{METRIC_NOTES[m]}</span>
                  </td>
                  <td className="num strong">{fmt(m, v.median)}</td>
                  <td className="num">{fmt(m, v.min)}</td>
                  <td className="num">{fmt(m, v.max)}</td>
                  <td className="num">{v.n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="meta mt-3">
          USD figures only for cost metrics. Ranges count at their midpoint, and ranges wider than
          3× are excluded from medians. CTR above 5% is treated as an outlier.
        </p>
      </section>

      <section className="article mt-16">
        <h2>What the numbers say</h2>
        <p>
          <strong>Prices fell fast.</strong> ChatGPT Ads launched at a reported $60 CPM in February
          2026. By April, buyers were reporting $25–$45, and OpenAI added CPC bidding with a
          recommended $3–$5 starting bid. The median reported CPC is now ${s.cpc.median.toFixed(2)}.
        </p>
        <p>
          <strong>Clicks are scarce.</strong> The median reported CTR is {s.ctr.median.toFixed(2)}%.
          Most reports fall between 0.6% and 1.5%, a fraction of typical search-ad CTRs: the ad sits
          below a complete answer, so fewer people need to click.
        </p>
        <p>
          <strong>Conversions are the open question.</strong> Only {s.cvr.n} sources report a
          conversion rate, with a median of {s.cvr.median.toFixed(1)}%. Case studies range from
          near-zero to strong ROAS, and early CPA figures vary by more than an order of magnitude.
        </p>
      </section>

      <LineChart
        title="Median reported CPC by month (USD)"
        points={insights.ads.cpcByMonth.map((m) => ({ label: monthLabel(m.month), value: m.median }))}
        format={(v) => `$${v.toFixed(2)}`}
        max={8}
        caption="Grouped by month of publication; months with fewer than two reports are blank. CPC has stayed near $4 since bidding launched."
        source="ChatGPT Ads benchmarks"
      />
      <ColumnChart
        title="Distribution of reported CTRs"
        items={insights.ads.ctrDistribution.map((b) => ({ label: b.label, value: b.count, highlight: ["0.5–0.75%", "0.75–1%", "1–1.5%"].includes(b.label) }))}
        caption="Number of published CTR figures in each band. Most fall between 0.5% and 1.5%."
        source="ChatGPT Ads benchmarks"
      />

      <section className="mt-16" aria-labelledby="most-cited">
        <h2 id="most-cited" className="section-title mb-4">
          Most-repeated figures
        </h2>
        <p className="mb-4 max-w-[40rem] text-[0.95rem] text-[var(--muted)]">
          The same handful of numbers recur across hundreds of articles. These are the figures
          quoted by the most independent sources, and who originally measured them.
        </p>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Figure</th>
                <th>Metric</th>
                <th>Measured by</th>
                <th className="num">Sources repeating it</th>
              </tr>
            </thead>
            <tbody>
              {mostCited.map((r) => (
                <tr key={r.id}>
                  <td className="strong">{r.value}</td>
                  <td>{r.metric}</td>
                  <td>{r.measuredBy}</td>
                  <td className="num">{r.citedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-16" aria-labelledby="all">
        <h2 id="all" className="section-title mb-4">
          All {rows.length} data points
        </h2>
        <TableFilter tableId="benchmarks" placeholder="Filter by metric, source, industry…" total={rows.length} />
      </section>
      <div className="bleed table-wrap">
        <table id="benchmarks" className="data-table">
          <caption>ChatGPT Ads benchmarks, sorted by metric, then by how widely each figure is cited.</caption>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Reported value</th>
              <th>Measured by</th>
              <th>Context</th>
              <th>Source</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="nowrap strong">{r.metric}</td>
                <td>{r.value}</td>
                <td>{r.measuredBy}</td>
                <td className="text-[var(--muted)]">{r.context || "—"}</td>
                <td>
                  <SourceLink url={r.sourceUrl} />
                  <span className="block text-[0.78rem] text-[var(--muted)]">{r.sourceType}</span>
                </td>
                <td className="nowrap">{fmtMonth(r.published)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-10 text-[0.95rem]">
        Related:{" "}
        <Link href="/data/chatgpt-ads/advertisers" className="link">
          brands advertising on ChatGPT
        </Link>{" "}
        ·{" "}
        <Link href="/data/chatgpt-ads/timeline" className="link">
          ChatGPT Ads timeline
        </Link>
      </p>

      <AboutDataset
        download="chatgpt-ads-benchmarks"
        what={<p>Every numeric ChatGPT Ads price or performance figure found in public reporting from January to October 2026: CPM, CPC, CTR, conversion rate, CPA, ROAS and minimum spend. {s.mentionsReviewed} mentions across {s.sources} sources reduce to {s.dataPoints} distinct figures.</p>}
        how={<p>Sources were found with around 30 systematic searches, figures extracted to a fixed schema, normalised to numbers and currencies, and deduplicated. Identical figures reported by several outlets become one row that keeps the most authoritative source and counts how many domains repeated it. Comparison figures for Google, Meta and other platforms were removed.</p>}
        limits={<p>Most figures are single-account tests with small budgets. Values are as reported; context (industry, country, sample) is only as complete as the source. &ldquo;Measured by&rdquo; is who the source credits, which may be the platform rather than the party that ran the test.</p>}
        fields={[
          { name: "metric", description: "CPM, CPC, CTR, CVR, CPA, ROAS or Min. spend" },
          { name: "value", description: "The figure exactly as reported, with units" },
          { name: "low / high", description: "Parsed numeric value; equal unless the source gave a range" },
          { name: "currency", description: "USD, EUR or GBP for cost metrics; empty for rates" },
          { name: "measuredBy", description: "Who the source credits with the figure" },
          { name: "context", description: "Industry, region and sample size where stated" },
          { name: "sourceType", description: "official, trade press, or agency / vendor" },
          { name: "sourceUrl / sourceDomain / sourceTitle", description: "Where the figure was reported" },
          { name: "published", description: "Publication date of the source" },
          { name: "citedBy", description: "Number of distinct domains reporting the same figure" },
        ]}
      />
      <Faq items={FAQ} />
      <RelatedResearch dataset="chatgpt-ads-benchmarks" />
      <CiteThis title="ChatGPT Ads benchmarks" path={PATH} updated={benchmarks.updated} />
    </>
  );
}
