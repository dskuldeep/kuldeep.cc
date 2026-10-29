import type { Metadata } from "next";
import Link from "next/link";
import { AboutDataset } from "@/components/data/about-dataset";
import { Breadcrumbs } from "@/components/data/breadcrumbs";
import { HBarChart } from "@/components/data/charts";
import { CiteThis } from "@/components/data/cite-this";
import { DatacenterMap } from "@/components/data/datacenter-map";
import { DatasetHeader } from "@/components/data/dataset-header";
import { Faq } from "@/components/data/faq";
import { JsonLd } from "@/components/json-ld";
import { fmtNumber } from "@/lib/data";
import { dcExisting, dcTotals } from "@/lib/datacenters";
import { breadcrumbNode, datasetNode, faqNode, graph } from "@/lib/schema";
import { pageMeta } from "@/lib/site";

const PATH = "/data/datacenters/existing";
const t = dcTotals();
const rows = dcExisting.rows;
const TITLE = "Map of data centers worldwide: every mapped data center (2026)";
const DESC = `Interactive world map of ${fmtNumber(t.existing)} existing data centers in ${t.existingCountries} countries from OpenStreetMap, with operator, country and location. Free download.`;

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESC, path: PATH });

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Data", path: "/data" },
  { name: "Existing data centers", path: PATH },
];

function countBy(key: (r: (typeof rows)[number]) => string) {
  const m = new Map<string, number>();
  for (const r of rows) {
    const k = key(r);
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

/** Operator names vary in case and suffix ("Equinix", "Equinix, Inc."); group on a normalised key, show the commonest spelling. */
const opKey = (s: string) =>
  s
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\b(inc|llc|ltd|limited|corp|corporation|gmbh|ag|sa|plc|bv|nv|co)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
const operators = (() => {
  const label = new Map<string, Map<string, number>>();
  for (const r of rows) {
    const k = opKey(r[3]);
    if (!k) continue;
    const spellings = label.get(k) ?? new Map<string, number>();
    spellings.set(r[3], (spellings.get(r[3]) ?? 0) + 1);
    label.set(k, spellings);
  }
  return [...label.values()]
    .map((sp) => [[...sp.entries()].sort((a, b) => b[1] - a[1])[0][0], [...sp.values()].reduce((a, b) => a + b, 0)] as const)
    .sort((a, b) => b[1] - a[1]);
})();

const byCountry = countBy((r) => r[4]);
const pct = (n: number) => Math.round((n / rows.length) * 100);
const withOperator = rows.filter((r) => r[3]).length;
const [topCountry, topCount] = byCountry[0];
const [topOp, topOpCount] = operators[0];

const FAQ = [
  {
    q: "How many data centers are there in the world?",
    a: `OpenStreetMap maps ${fmtNumber(t.existing)} data center buildings and sites across ${t.existingCountries} countries, all shown on this map. Industry estimates of the true total run higher, often cited at 10,000 to 12,000 colocation and cloud facilities, because many enterprise and hyperscale buildings are not mapped.`,
  },
  {
    q: "Which country has the most data centers?",
    a: `${topCountry}, with ${fmtNumber(topCount)} mapped data centers, ${pct(topCount)}% of all mapped sites. ${byCountry
      .slice(1, 4)
      .map(([c, n]) => `${c} (${fmtNumber(n)})`)
      .join(", ")} follow.`,
  },
  {
    q: "Which company operates the most data centers?",
    a: `Among sites with an operator tagged in OpenStreetMap, ${topOp} has the most, with ${topOpCount}. ${operators
      .slice(1, 4)
      .map(([o, n]) => `${o} (${n})`)
      .join(", ")} follow. Only ${pct(withOperator)}% of mapped sites name an operator, so treat these as lower bounds.`,
  },
  {
    q: "Where can I download a list of data centers?",
    a: `The full list of ${fmtNumber(t.existing)} sites, with name, operator, country and coordinates, downloads as CSV or JSON from this page under the Open Database License.`,
  },
];

export default function ExistingDatacentersPage() {
  const jsonLd = graph(
    datasetNode({
      name: "Map of existing data centers",
      description: DESC,
      path: PATH,
      keywords: ["data center map", "map of data centers", "data centers near me", "list of data centers", "how many data centers in the world", "data centers by country"],
      datePublished: dcExisting.updated,
      dateModified: dcExisting.updated,
      spatialCoverage: "Worldwide",
      variableMeasured: ["Location", "Operator", "Country"],
      isBasedOn: ["https://www.openstreetmap.org/copyright"],
      license: {
        url: "https://opendatacommons.org/licenses/odbl/1-0/",
        notice: "© OpenStreetMap contributors. Available under the Open Database License (ODbL 1.0).",
      },
      downloads: [
        { format: "CSV", path: "/data/download/datacenters-osm.csv" },
        { format: "JSON", path: "/data/download/datacenters-osm.json" },
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
        title="Map of existing data centers"
        dek="Every data center mapped in OpenStreetMap, on one interactive world map: who operates it, which country it is in and exactly where it stands."
        updated={dcExisting.updated}
        records={t.existing}
        recordLabel="data centers"
        download="datacenters-osm"
      />

      <section className="stats" aria-label="Headline numbers">
        <div>
          <span className="stat-value">{fmtNumber(t.existing)}</span>
          <span className="stat-label">data centers mapped</span>
        </div>
        <div>
          <span className="stat-value">{t.existingCountries}</span>
          <span className="stat-label">countries</span>
        </div>
        <div>
          <span className="stat-value">{pct(topCount)}%</span>
          <span className="stat-label">are in {topCountry === "United States" ? "the United States" : topCountry}</span>
        </div>
        <div>
          <span className="stat-value">{pct(withOperator)}%</span>
          <span className="stat-label">name their operator</span>
        </div>
      </section>

      <div className="mt-12">
        <DatacenterMap projects={[]} existingUrl="/data/datacenters/existing.json" existingCount={t.existing} />
      </div>
      <p className="meta mt-3">
        For campuses being built now, see the{" "}
        <Link href="/data/datacenters" className="link">
          map of {fmtNumber(t.projects)} new data center projects
        </Link>
        .
      </p>

      <HBarChart
        title="Mapped data centers by country"
        items={byCountry.slice(0, 15).map(([label, value]) => ({ label, value }))}
        format={(v) => fmtNumber(v)}
        caption="Counts reflect OpenStreetMap coverage, which is densest in North America and Europe."
        source="OpenStreetMap contributors"
      />
      <HBarChart
        title="Operators with the most mapped data centers"
        items={operators.slice(0, 15).map(([label, value]) => ({ label: label.length > 30 ? `${label.slice(0, 29)}…` : label, value }))}
        format={(v) => fmtNumber(v)}
        labelWidth={230}
        caption={`Only sites with an operator tag (${pct(withOperator)}% of the total).`}
        source="OpenStreetMap contributors"
      />

      <section className="mt-16" aria-labelledby="by-country">
        <h2 id="by-country" className="section-title mb-4">
          Data centers by country
        </h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Country</th>
                <th className="num">Data centers</th>
                <th className="num">Share</th>
                <th>Largest operators</th>
              </tr>
            </thead>
            <tbody>
              {byCountry.map(([c, n]) => {
                const ops = new Map<string, number>();
                for (const r of rows) if (r[4] === c && r[3]) ops.set(r[3], (ops.get(r[3]) ?? 0) + 1);
                const top = [...ops.entries()]
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([o]) => o);
                return (
                  <tr key={c}>
                    <td>{c}</td>
                    <td className="num">{fmtNumber(n)}</td>
                    <td className="num">{((n / rows.length) * 100).toFixed(1)}%</td>
                    <td>{top.join(", ") || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <AboutDataset
        download="datacenters-osm"
        what={
          <p>
            Every OpenStreetMap feature tagged as a data center: {fmtNumber(t.existing)} buildings and sites in {t.existingCountries}{" "}
            countries, from hyperscale campuses to single colocation buildings and telecom hubs.
          </p>
        }
        how={
          <p>
            All features tagged <code>telecom=data_center</code>, <code>building=data_center</code> or{" "}
            <code>industrial=data_center</code> were pulled from the OpenStreetMap planet, disused and demolished buildings were
            dropped, and buildings drawn in several parts were merged into one point. Countries come from Natural Earth borders,
            with OpenStreetMap Nominatim for points on coastlines and reclaimed land.
          </p>
        }
        limits={
          <p>
            OpenStreetMap is mapped by volunteers, so coverage is uneven: it is densest in North America and Europe and under-counts
            Asia, Africa and Latin America. Many hyperscale and enterprise buildings are unmapped or untagged, and only{" "}
            {pct(withOperator)}% of sites name an operator. Use it as a map of known sites, not a census.
          </p>
        }
        fields={[
          { name: "name", description: "Site name as mapped (may be empty)" },
          { name: "operator", description: "Operator, brand or owner tag (may be empty)" },
          { name: "country", description: "Country the site is in" },
          { name: "lat / lng", description: "Coordinates (building centre)" },
          { name: "osm", description: "OpenStreetMap feature URL" },
        ]}
      />
      <p className="meta mt-6">
        Data © <a className="link" href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>, available under the
        Open Database License. Country outlines: Natural Earth (public domain).
      </p>
      <Faq items={FAQ} />
      <CiteThis title="Map of existing data centers" path={PATH} updated={dcExisting.updated} odbl />
    </>
  );
}
