import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/data/breadcrumbs";
import { CiteThis } from "@/components/data/cite-this";
import { DatasetHeader } from "@/components/data/dataset-header";
import { Faq } from "@/components/data/faq";
import { JsonLd } from "@/components/json-ld";
import { SourceLink } from "@/components/data/source-link";
import { engines, fmtMonth, getEngine, userNumbers } from "@/lib/data";
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

      <Faq items={FAQ} />
      <CiteThis title="AI assistant user numbers" path={PATH} updated={userNumbers.updated} />
    </>
  );
}
