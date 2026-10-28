import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/data/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/data/faq";
import { benchmarks, DATASETS, fmtMonth, fmtNumber, RESEARCH, robotsStudy, type DatasetEntry } from "@/lib/data";
import { breadcrumbNode, faqNode, graph, PERSON_ID } from "@/lib/schema";
import { canonicalPath, pageMeta, SITE } from "@/lib/site";

const TITLE = "Data: ChatGPT Ads & AI Search datasets";
const DESC =
  "Free, sourced datasets on ChatGPT advertising and AI search: ad benchmarks, advertisers, AI crawlers, referrers, user numbers and an original robots.txt study of the top 10,000 sites.";

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESC, path: "/data" });

const FAQ = [
  {
    q: "Is this data free to use?",
    a: "Yes. Every dataset is published under Creative Commons Attribution 4.0, which allows any use, including commercial, as long as you credit Kuldeep Paul, kuldeep.cc and link to the dataset page.",
  },
  {
    q: "Where does the data come from?",
    a: "The robots.txt study is primary data I collected by fetching the top 10,000 websites. The other datasets aggregate public reporting, official documentation and company statements, with every figure linked to its source.",
  },
  {
    q: "How often is the data updated?",
    a: "On a rolling basis. Each dataset shows its last update date, and the CSV and JSON downloads always match what the page shows.",
  },
  {
    q: "Can I download the data?",
    a: "Yes. Every dataset page has CSV and JSON downloads, and each file includes the licence and a link back to its page.",
  },
];

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Data", path: "/data" },
];

export default function DataIndex() {
  const groups = ["ChatGPT Ads Index", "AI Search Reference"] as const;
  const total = DATASETS.reduce((n, d) => n + d.records, 0);

  const jsonLd = graph(
    {
      "@type": "DataCatalog",
      "@id": `${canonicalPath("/data")}#catalog`,
      name: `${SITE.name} — Data`,
      description: DESC,
      url: canonicalPath("/data"),
      creator: { "@id": PERSON_ID },
      publisher: { "@id": PERSON_ID },
      license: "https://creativecommons.org/licenses/by/4.0/",
      dataset: DATASETS.map((d) => ({
        "@type": "Dataset",
        "@id": `${canonicalPath(d.path)}#dataset`,
        name: d.title,
        description: d.description,
        url: canonicalPath(d.path),
      })),
    },
    faqNode(FAQ),
    breadcrumbNode(crumbs),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <Breadcrumbs crumbs={crumbs} />
      <h1 className="statement max-w-[18ch]">Data</h1>
      <p className="lede mt-6 max-w-[40rem]">
        Open datasets on ChatGPT advertising and AI search. Every number links to where it came
        from, every table downloads as CSV or JSON, and everything is free to reuse with
        attribution.
      </p>
      <p className="meta mt-6">
        Compiled and analysed by{" "}
        <Link href="/about" className="link" rel="author">
          {SITE.name}
        </Link>{" "}
        · {fmtNumber(total)} records · <Link href="/data/methodology" className="link">Methodology</Link>
      </p>

      <section className="stats mt-14" aria-label="Headline numbers">
        <div>
          <span className="stat-value">${benchmarks.summary.cpc.median.toFixed(2)}</span>
          <span className="stat-label">median reported ChatGPT Ads CPC</span>
        </div>
        <div>
          <span className="stat-value">{benchmarks.summary.ctr.median.toFixed(2)}%</span>
          <span className="stat-label">median reported ChatGPT Ads CTR</span>
        </div>
        <div>
          <span className="stat-value">{robotsStudy.headline.blocksAnyAiPct}%</span>
          <span className="stat-label">of top-10k sites block at least one AI crawler</span>
        </div>
        <div>
          <span className="stat-value">{robotsStudy.headline.llmsTxtPct}%</span>
          <span className="stat-label">of top-10k sites publish an llms.txt</span>
        </div>
      </section>

      {groups.map((g) => (
        <section key={g} className="mt-20">
          <h2 className="section-title mb-3">{g}</h2>
          <ol className="index-list">
            {DATASETS.filter((d) => d.group === g).map((d: DatasetEntry) => (
              <li key={d.slug}>
                <Link href={d.path}>
                  <span className="index-no" aria-hidden="true" />
                  <span className="flex-1">
                    <span className="index-title block">{d.title}</span>
                    <span className="mt-1 block text-[0.95rem] leading-snug text-[var(--muted)]">
                      {d.description}
                    </span>
                  </span>
                  <span className="meta shrink-0 text-right">
                    {fmtNumber(d.records)}
                    <br />
                    {fmtMonth(d.updated)}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <section className="mt-20">
        <h2 className="section-title mb-3">Research</h2>
        <ol className="index-list">
          {RESEARCH.map((r) => (
            <li key={r.slug}>
              <Link href={`/writing/${r.slug}`}>
                <span className="index-no" aria-hidden="true" />
                <span className="flex-1">
                  <span className="index-title block">{r.title}</span>
                  <span className="mt-1 block text-[0.95rem] leading-snug text-[var(--muted)]">{r.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-20 article">
        <h2>How this data is built</h2>
        <p>
          Secondary datasets are assembled from public reporting, official documentation and
          practitioner case studies. Sources are searched systematically, figures are extracted
          into a fixed schema, deduplicated, and linked back to the earliest or most
          authoritative source. Primary datasets, such as the robots.txt study, are collected
          directly. The full process is documented in the{" "}
          <Link href="/data/methodology">methodology</Link>.
        </p>
      </section>

      <Faq items={FAQ} />
    </>
  );
}
