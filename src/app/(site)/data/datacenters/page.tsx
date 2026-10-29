import type { Metadata } from "next";
import { AboutDataset } from "@/components/data/about-dataset";
import { Breadcrumbs } from "@/components/data/breadcrumbs";
import { ColumnChart, HBarChart } from "@/components/data/charts";
import { CiteThis } from "@/components/data/cite-this";
import { DatacenterMap } from "@/components/data/datacenter-map";
import { DatasetHeader } from "@/components/data/dataset-header";
import { Faq } from "@/components/data/faq";
import { SourceLink } from "@/components/data/source-link";
import { TableFilter } from "@/components/data/table-filter";
import { JsonLd } from "@/components/json-ld";
import { fmtNumber } from "@/lib/data";
import { dcExisting, dcNew, dcTotals, groupSum, type DcProject } from "@/lib/datacenters";
import { breadcrumbNode, datasetNode, faqNode, graph } from "@/lib/schema";
import { pageMeta } from "@/lib/site";

const PATH = "/data/datacenters";
const t = dcTotals();
const gw = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: n >= 100 ? 0 : 1 });
const usd = (bn: number) => (bn >= 1000 ? `$${(bn / 1000).toFixed(1)}T` : `$${Math.round(bn)}B`);
const TITLE = "Data center map: every data center and new AI campus (2026)";
const DESC = `Interactive world map of ${fmtNumber(t.existing)} existing data centers and ${fmtNumber(t.projects)} new AI and hyperscale data center projects since 2024, with developer, MW, investment, status and sources.`;

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESC, path: PATH });

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Data", path: "/data" },
  { name: "Data center map", path: PATH },
];

const live = dcNew.rows.filter((p) => p.status !== "cancelled");
const byCountry = groupSum(live, (p) => p.country, (p) => p.capacityMw ?? 0);
const byOperator = groupSum(live, (p) => p.operator, (p) => p.capacityMw ?? 0);
const countByCountry = groupSum(dcNew.rows, (p) => p.country, () => 1);
const existingByCountry = [...dcExisting.rows.reduce((m, r) => m.set(r[4] || "Unknown", (m.get(r[4] || "Unknown") ?? 0) + 1), new Map<string, number>())]
  .filter(([c]) => c !== "Unknown")
  .sort((a, b) => b[1] - a[1]);
const usShare = Math.round(((byCountry.find(([c]) => c === "United States")?.[1] ?? 0) / (t.gw * 1000)) * 100);
const largest = dcNew.rows.find((p) => p.capacityMw);
const STATUS_LABEL: Record<DcProject["status"], string> = {
  announced: "Announced",
  planned: "Planned",
  "under construction": "Under construction",
  operational: "Operational",
  paused: "Paused",
  cancelled: "Cancelled",
};

const announcedByYear = (() => {
  const m = new Map<string, number>();
  for (const p of dcNew.rows) {
    const y = p.announced?.slice(0, 4);
    if (y && y >= "2024") m.set(y, (m.get(y) ?? 0) + 1);
  }
  return [...m.entries()].sort();
})();

const FAQ = [
  {
    q: "How many data centers are there in the world?",
    a: `OpenStreetMap maps ${fmtNumber(t.existing)} data center buildings and sites across ${t.existingCountries} countries; this map shows all of them. Industry estimates of the true total run higher (often cited at 10,000 to 12,000 colocation and cloud facilities), because many enterprise and hyperscale buildings are not mapped.`,
  },
  {
    q: "How many new data centers are being built?",
    a: `This dataset tracks ${fmtNumber(t.projects)} data center projects announced, planned or under construction since 2024 in ${t.countries} countries, adding up to about ${gw(t.gw)} GW of stated planned capacity where a figure was published.`,
  },
  {
    q: "Which country is building the most data center capacity?",
    a: `The United States, by a wide margin: ${usShare}% of the stated planned capacity in this dataset, led by gigawatt-scale AI campuses in Texas, Louisiana, Ohio, Pennsylvania and Wyoming. ${byCountry
      .slice(1, 4)
      .map(([c]) => c)
      .join(", ")} follow.`,
  },
  {
    q: "What is the largest data center being built?",
    a: largest
      ? `The largest stated capacity in the dataset is ${largest.name} (${largest.operator}) in ${[largest.city, largest.region, largest.country].filter(Boolean).join(", ")}, at ${gw(largest.capacityMw! / 1000)} GW planned. Announced capacities are plans, not built power: most gigawatt campuses come online in phases over several years.`
      : "",
  },
];

export default function DatacentersPage() {
  const jsonLd = graph(
    datasetNode({
      name: "New data center projects",
      description: DESC,
      path: PATH,
      keywords: ["data center map", "data centers near me", "new data centers", "AI data centers", "hyperscale data center projects", "Stargate data centers", "gigawatt data center"],
      datePublished: dcNew.updated,
      dateModified: dcNew.updated,
      temporalCoverage: "2024-01/2026-10",
      spatialCoverage: "Worldwide",
      variableMeasured: ["Planned capacity (MW)", "Investment (USD)", "Project status", "Location"],
      isBasedOn: ["https://www.openstreetmap.org/copyright"],
      downloads: [
        { format: "CSV", path: "/data/download/datacenter-projects.csv" },
        { format: "JSON", path: "/data/download/datacenter-projects.json" },
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
        title="Data center map"
        dek="Every data center mapped in OpenStreetMap, plus the AI and hyperscale campuses announced or under construction since 2024: who is building them, where, how many megawatts and how much money, each linked to its sources."
        updated={dcNew.updated}
        records={t.projects}
        recordLabel="new projects"
        download="datacenter-projects"
      />

      <section className="stats" aria-label="Headline numbers">
        <div>
          <span className="stat-value">{fmtNumber(t.projects)}</span>
          <span className="stat-label">new data center projects since 2024</span>
        </div>
        <div>
          <span className="stat-value">{gw(t.gw)}</span>
          <span className="stat-label">GW of stated planned capacity ({t.withMw} projects)</span>
        </div>
        <div>
          <span className="stat-value">{usd(t.usdBn)}</span>
          <span className="stat-label">stated investment ({t.withUsd} projects)</span>
        </div>
        <div>
          <span className="stat-value">{fmtNumber(t.existing)}</span>
          <span className="stat-label">existing data centers mapped</span>
        </div>
      </section>

      <div className="mt-12">
        <DatacenterMap projects={dcNew.rows} existingUrl={`${PATH}/existing.json`} existingCount={t.existing} />
      </div>

      <HBarChart
        title="Planned new capacity by country (GW)"
        items={byCountry.slice(0, 12).map(([label, mw]) => ({ label, value: mw / 1000 }))}
        format={(v) => gw(v)}
        caption={`The United States accounts for ${usShare}% of stated planned capacity.`}
        source="kuldeep.cc data center projects"
      />
      <HBarChart
        title="Largest developers by planned capacity (GW)"
        items={byOperator.slice(0, 12).map(([label, mw]) => ({ label: label.length > 30 ? `${label.slice(0, 29)}…` : label, value: mw / 1000 }))}
        format={(v) => gw(v)}
        labelWidth={230}
        caption="Joint ventures are credited to the developer named first in the source."
        source="kuldeep.cc data center projects"
      />
      <ColumnChart
        title="New data center projects by year announced"
        items={announcedByYear.map(([label, value]) => ({ label, value }))}
        format={(v) => fmtNumber(v)}
        caption="Projects with a known announcement date. The current year is partial."
        source="kuldeep.cc data center projects"
      />

      <section className="mt-16" aria-labelledby="projects">
        <h2 id="projects" className="section-title mb-4">
          All new data center projects
        </h2>
        <TableFilter tableId="dc-table" placeholder="Filter by developer, place or status" total={dcNew.rows.length} />
        <div className="bleed table-wrap">
          <table className="data-table" id="dc-table">
            <caption>Sorted by planned capacity. Capacity and investment are as stated by developers or reporters, not verified build-outs.</caption>
            <thead>
              <tr>
                <th>Project</th>
                <th>Developer</th>
                <th>Location</th>
                <th>Status</th>
                <th className="num">MW</th>
                <th className="num">$B</th>
                <th>Announced</th>
                <th>Source</th>
                <th>Map</th>
              </tr>
            </thead>
            <tbody>
              {dcNew.rows.map((p) => (
                <tr key={p.id}>
                  <td className="strong">{p.name}</td>
                  <td>{p.operator}</td>
                  <td>{[p.city, p.region, p.country].filter(Boolean).join(", ")}</td>
                  <td className="nowrap">{STATUS_LABEL[p.status]}</td>
                  <td className="num">{p.capacityMw ? fmtNumber(p.capacityMw) : "—"}</td>
                  <td className="num">{p.investmentUsdBn ? p.investmentUsdBn.toLocaleString("en-US", { maximumFractionDigits: 1 }) : "—"}</td>
                  <td className="nowrap">{p.announced ?? "—"}</td>
                  <td>
                    <SourceLink url={p.sources[0]?.url ?? null} />
                    {p.sources.length > 1 && <span className="meta"> +{p.sources.length - 1}</span>}
                  </td>
                  <td>
                    <a href="#map" className="link" data-dc-focus={p.id}>
                      Map
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-16" aria-labelledby="by-country">
        <h2 id="by-country" className="section-title mb-4">
          By country
        </h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Country</th>
                <th className="num">Existing (mapped)</th>
                <th className="num">New projects</th>
                <th className="num">Planned GW</th>
              </tr>
            </thead>
            <tbody>
              {existingByCountry.slice(0, 30).map(([c, n]) => (
                <tr key={c}>
                  <td>{c}</td>
                  <td className="num">{fmtNumber(n)}</td>
                  <td className="num">{countByCountry.find(([x]) => x === c)?.[1] ?? 0}</td>
                  <td className="num">{gw((byCountry.find(([x]) => x === c)?.[1] ?? 0) / 1000)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="meta mt-3">
          Top 30 countries by mapped facilities. Existing counts reflect OpenStreetMap coverage, which is densest in Europe and North America.{" "}
          <a className="link" href="/data/download/datacenters-osm.csv" download>
            Download all {fmtNumber(t.existing)} existing sites (CSV, ODbL)
          </a>
        </p>
      </section>

      <AboutDataset
        download="datacenter-projects"
        what={
          <>
            <p>
              Two layers. <strong>New builds</strong>: {fmtNumber(t.projects)} data center projects announced, planned, under construction,
              completed, paused or cancelled since January 2024, from AI training campuses to colocation facilities. <strong>Existing</strong>:{" "}
              {fmtNumber(t.existing)} sites tagged as data centers in OpenStreetMap.
            </p>
          </>
        }
        how={
          <>
            <p>
              New builds were found with systematic web searches by country, U.S. state and developer, covering press releases,
              trade press, local news and planning coverage from 2024 onward. A language model extracted each project into a fixed
              schema (developer, location, MW, investment, status, dates) using only figures stated on the page. Mentions of the same
              project across sources were merged, the latest source decides the status, and each location was geocoded to its town or
              county with OpenStreetMap Nominatim.
            </p>
            <p>
              Existing sites are every OpenStreetMap feature tagged <code>telecom=data_center</code>, <code>building=data_center</code>{" "}
              or <code>industrial=data_center</code>, with countries assigned from Natural Earth borders.
            </p>
          </>
        }
        limits={
          <p>
            Map points for new builds are town-level, not site-level. Capacity and investment figures are announcements, often for
            multi-phase builds over many years, and some are never built. Joint ventures can be reported under different developers
            in different sources. OpenStreetMap coverage is uneven: it under-counts data centers in Asia, Africa and Latin America and
            does not include most enterprise server rooms.
          </p>
        }
        fields={[
          { name: "id", description: "Stable project identifier" },
          { name: "name", description: "Project or campus name as reported" },
          { name: "operator", description: "Developer, owner or operator" },
          { name: "tenant", description: "Anchor tenant, where reported" },
          { name: "city / region / country", description: "Location as reported" },
          { name: "lat / lng", description: "Town-level coordinates (Nominatim)" },
          { name: "capacityMw", description: "Stated planned capacity in megawatts" },
          { name: "investmentUsdBn", description: "Stated investment, billions of US dollars" },
          { name: "status", description: "announced, planned, under construction, operational, paused or cancelled" },
          { name: "purpose", description: "AI, hyperscale cloud, colocation, enterprise or crypto/HPC conversion" },
          { name: "announced / expectedOnline", description: "Dates as reported" },
          { name: "sources", description: "Source URLs, latest first" },
        ]}
      />
      <p className="meta mt-6">
        Existing data center locations © <a className="link" href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>,
        available under the Open Database License. Country outlines: Natural Earth (public domain).
      </p>
      <Faq items={FAQ} />
      <CiteThis title="Data center map" path={PATH} updated={dcNew.updated} />
    </>
  );
}
