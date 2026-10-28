import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/data/breadcrumbs";
import { CiteThis } from "@/components/data/cite-this";
import { DatasetHeader } from "@/components/data/dataset-header";
import { Faq } from "@/components/data/faq";
import { JsonLd } from "@/components/json-ld";
import { SourceLink } from "@/components/data/source-link";
import { AboutDataset, RelatedResearch } from "@/components/data/about-dataset";
import { ColumnChart } from "@/components/data/charts";
import { engines, fmtMonth, getEngine, researchFor, userNumbers } from "@/lib/data";
import { breadcrumbNode, datasetNode, faqNode, graph } from "@/lib/schema";
import { pageMeta } from "@/lib/site";

const PATH = "/data/ai-search/user-numbers";
const TITLE = "How many people use ChatGPT, Gemini & AI Overviews? (2026)";
const DESC =
  "Official user numbers for AI assistants and AI search: ChatGPT 1.2 billion weekly users, Gemini 950 million monthly, AI Overviews 2.5 billion monthly, AI Mode 1 billion. Dated and sourced.";

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESC, path: PATH });

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Data", path: "/data" },
  { name: "AI Search Reference", path: "/data/ai-search" },
  { name: "User numbers", path: PATH },
];

const FAQ = [
  {
    q: "How many people use ChatGPT?",
    a: "More than 1.2 billion people use ChatGPT each week, according to OpenAI in October 2026. That is up from 400 million weekly users in February 2025 and 800 million in October 2025.",
  },
  {
    q: "How many people use Gemini?",
    a: "Google reported 950 million monthly active users for the Gemini app in its Q2 2026 earnings (July 2026), up from 450 million a year earlier.",
  },
  {
    q: "How many people see Google AI Overviews?",
    a: "Google says AI Overviews reach more than 2.5 billion monthly users (2026), and AI Mode passed 1 billion monthly users by Google I/O in May 2026.",
  },
];

export default function UserNumbersPage() {
  const order = engines.rows.map((e) => e.slug);
  const rows = [...userNumbers.rows].sort(
    (a, b) => order.indexOf(a.engine) - order.indexOf(b.engine) || b.asOf.localeCompare(a.asOf),
  );

  const jsonLd = graph(
    datasetNode({
      research: researchFor("ai-user-numbers"),
      name: "AI assistant user numbers",
      description: DESC,
      path: PATH,
      keywords: ["ChatGPT users", "how many people use ChatGPT", "ChatGPT weekly active users", "Gemini users", "AI Overviews users", "AI Mode users"],
      datePublished: "2026-10-29",
      dateModified: userNumbers.updated,
      temporalCoverage: "2025-02/2026-10",
      variableMeasured: ["Weekly active users", "Monthly active users", "Queries", "Subscribers"],
      downloads: [
        { format: "CSV", path: "/data/download/ai-user-numbers.csv" },
        { format: "JSON", path: "/data/download/ai-user-numbers.json" },
      ],
    }),
    faqNode(FAQ),
    breadcrumbNode(crumbs),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <Breadcrumbs crumbs={crumbs} />
      <DatasetHeader
        title="AI assistant user numbers"
        dek="Usage figures stated by the companies themselves, in earnings calls, keynotes and official posts, rather than third-party traffic estimates. Each figure is dated, since these numbers move every quarter."
        updated={userNumbers.updated}
        records={rows.length}
        recordLabel="figures"
        download="ai-user-numbers"
      />

      <section className="stats" aria-label="Latest figures">
        <div>
          <span className="stat-value">1.2B</span>
          <span className="stat-label">ChatGPT weekly users (Oct 2026)</span>
        </div>
        <div>
          <span className="stat-value">2.5B+</span>
          <span className="stat-label">AI Overviews monthly users (2026)</span>
        </div>
        <div>
          <span className="stat-value">1B+</span>
          <span className="stat-label">AI Mode monthly users (May 2026)</span>
        </div>
        <div>
          <span className="stat-value">950M</span>
          <span className="stat-label">Gemini monthly users (Jul 2026)</span>
        </div>
      </section>

      <ColumnChart
        title="ChatGPT weekly active users (millions)"
        items={userNumbers.rows
          .filter((u) => u.engine === "chatgpt" && u.metric === "Weekly active users")
          .sort((a, b) => a.asOf.localeCompare(b.asOf))
          .map((u) => ({ label: fmtMonth(u.asOf), value: parseFloat(u.value) * (u.value.includes("billion") ? 1000 : 1) }))}
        format={(v) => v.toLocaleString("en-US")}
        caption="ChatGPT tripled its weekly users in 20 months."
        source="OpenAI"
      />
      <ColumnChart
        title="Gemini app monthly active users (millions)"
        items={userNumbers.rows
          .filter((u) => u.engine === "gemini")
          .sort((a, b) => a.asOf.localeCompare(b.asOf))
          .map((u) => ({ label: fmtMonth(u.asOf), value: parseFloat(u.value) }))}
        format={(v) => v.toLocaleString("en-US")}
        caption="Gemini more than doubled between July 2025 and July 2026."
        source="Alphabet earnings calls"
      />

      <div className="bleed table-wrap mt-14">
        <table className="data-table">
          <caption>Weekly and monthly figures aren&apos;t comparable: a weekly count is always smaller than the monthly count for the same product.</caption>
          <thead>
            <tr>
              <th>Engine</th>
              <th>Metric</th>
              <th className="num">Value</th>
              <th>As of</th>
              <th>Stated by</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={`${u.engine}${u.metric}${u.asOf}`}>
                <td className="nowrap">
                  <Link href={`/data/ai-search/${u.engine}`} className="link">
                    {getEngine(u.engine)?.name ?? u.engine}
                  </Link>
                </td>
                <td>{u.metric}</td>
                <td className="num strong">{u.value}</td>
                <td className="nowrap">{fmtMonth(u.asOf)}</td>
                <td>{u.statedBy}</td>
                <td>
                  <SourceLink url={u.sourceUrl} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="meta mt-3">
        Where an official figure was only available via secondary reporting, the linked source is
        the article that quoted it.
      </p>

      <AboutDataset
        download="ai-user-numbers"
        what={<p>Usage figures for AI assistants and AI search features, as stated by the companies that run them: weekly and monthly active users, queries, subscribers and paid seats.</p>}
        how={<p>Figures come from earnings calls, keynotes, official blog posts and executive statements. Third-party traffic estimates are deliberately excluded. Where an official figure was only found in secondary reporting, the linked source is that report.</p>}
        limits={<p>Companies choose which metric to disclose, so figures aren&apos;t comparable across products: weekly users are always fewer than monthly users for the same product, and some figures count reach rather than active use.</p>}
        fields={[
          { name: "engine", description: "Engine slug (see the engine reference)" },
          { name: "metric", description: "What the number counts" },
          { name: "value", description: "Figure as stated" },
          { name: "asOf", description: "Month the figure refers to" },
          { name: "statedBy", description: "Who stated it" },
          { name: "sourceUrl", description: "Where it was reported" },
        ]}
      />
      <Faq items={FAQ} />
      <RelatedResearch dataset="ai-user-numbers" />
      <CiteThis title="AI assistant user numbers" path={PATH} updated={userNumbers.updated} />
    </>
  );
}
