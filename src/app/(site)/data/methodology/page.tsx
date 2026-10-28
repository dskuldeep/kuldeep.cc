import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/data/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { benchmarks, DATASETS, fmtMonth, fmtNumber, robotsStudy } from "@/lib/data";
import { AUTHOR_ROLE, breadcrumbNode, graph, PERSON_ID } from "@/lib/schema";
import { canonicalPath, pageMeta, SITE } from "@/lib/site";

const PATH = "/data/methodology";
const TITLE = "Data methodology, sources & licence";
const DESC =
  "How the kuldeep.cc datasets are collected, extracted, verified and updated, who compiles them, and how to reuse and cite them (CC BY 4.0).";

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESC, path: PATH });

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Data", path: "/data" },
  { name: "Methodology", path: PATH },
];

export default function MethodologyPage() {
  const jsonLd = graph(
    {
      "@type": "AboutPage",
      "@id": `${canonicalPath(PATH)}#webpage`,
      url: canonicalPath(PATH),
      name: TITLE,
      description: DESC,
      author: { "@id": PERSON_ID },
      mainEntity: { "@id": PERSON_ID },
    },
    breadcrumbNode(crumbs),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <Breadcrumbs crumbs={crumbs} />
      <h1 className="statement max-w-[18ch]">Methodology</h1>
      <p className="lede mt-6 max-w-[40rem]">
        How the datasets on this site are built, what they can and can&apos;t tell you, and how
        to reuse them.
      </p>

      <div className="article mt-12">
        <h2>Who compiles this data</h2>
        <p>
          Every dataset is compiled, cleaned and analysed by{" "}
          <Link href="/about" rel="author">
            {SITE.name}
          </Link>
          , {AUTHOR_ROLE.toLowerCase()}. I&apos;m Head of Marketing at Maxim AI and work on AI
          search, generative engine optimization and growth. Questions and corrections:{" "}
          <a href={SITE.social.email}>mail@kuldeep.cc</a>.
        </p>

        <h2>Two kinds of data</h2>
        <p>
          <strong>Primary data</strong> is collected directly. The{" "}
          <Link href="/data/ai-search/robots-txt-study">robots.txt study</Link> fetched{" "}
          {fmtNumber(robotsStudy.sample.domains)} sites myself on {fmtMonth(robotsStudy.fetchedAt)}.
        </p>
        <p>
          <strong>Aggregated data</strong> brings together figures that are scattered across
          press coverage, official documentation, earnings calls, agency case studies and vendor
          reports. That covers the ChatGPT Ads benchmarks, advertisers and timeline, the AI engine
          reference and the user numbers. The value is in the coverage, the deduplication and the
          links back to sources, not in any single figure.
        </p>

        <h2>Collection</h2>
        <ol>
          <li>
            <strong>Systematic search.</strong> For each dataset I run a fixed set of
            queries (around 30 per topic, covering metrics, industries, regions and phrasing
            variants) through a neural web search API, restricted to recent publication dates and
            excluding social platforms.
          </li>
          <li>
            <strong>Structured extraction.</strong> Each result page is read against a fixed
            schema (for example metric, value, who measured it, sample and period) so every figure
            arrives with its context.
          </li>
          <li>
            <strong>Normalisation.</strong> Values are parsed to numbers and currencies, metric
            names mapped to a standard set, and obvious mis-extractions removed: comparison figures
            for other ad platforms, relative lifts reported as rates, and out-of-range values.
          </li>
          <li>
            <strong>Deduplication.</strong> Identical figures reported by several outlets
            collapse to one row. The row keeps the most authoritative source (official, then trade
            press, then agency or vendor) and records how many independent domains repeated it. For
            the benchmarks, {fmtNumber(benchmarks.summary.mentionsReviewed)} figure mentions reduced
            to {fmtNumber(benchmarks.summary.dataPoints)} distinct data points.
          </li>
          <li>
            <strong>Review.</strong> Every timeline event, engine profile and crawler entry is
            written by hand from official documentation where it exists. Advertisers are kept only
            when a source says the brand ran ads, not merely that it was mentioned or recommended by
            ChatGPT.
          </li>
        </ol>

        <h2>Summary statistics</h2>
        <p>
          Headline benchmark figures are medians of distinct reported values. Ranges count at
          their midpoint; ranges wider than 3× are excluded from medians; cost metrics use USD
          figures only; CTRs above 5% are treated as outliers. Medians are used because single
          tests vary widely and the mean is pulled by small, unusual campaigns.
        </p>

        <h2>Limitations</h2>
        <ul>
          <li>
            Aggregated figures are only as good as their sources. Many are single-account tests
            with small budgets, and OpenAI does not publish official benchmarks.
          </li>
          <li>
            Public reporting over-represents large brands and English-language markets.
          </li>
          <li>
            robots.txt shows intent, not enforcement. Sites also block bots at the firewall, and
            some bots ignore robots.txt.
          </li>
          <li>Usage numbers from different companies measure different things (weekly vs monthly, users vs visits).</li>
        </ul>

        <h2>Updates</h2>
        <p>
          Datasets are refreshed on a rolling basis, and each page shows its last update. Every
          page shows the data that is in its CSV/JSON download, generated from the same file.
        </p>

        <h2>Licence and citation</h2>
        <p>
          All datasets are published under{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/" rel="license">
            Creative Commons Attribution 4.0
          </a>
          . You can copy, chart, republish and build on them commercially. Please credit{" "}
          <em>{SITE.name}, kuldeep.cc</em> and link to the dataset page you used. Each page has a
          ready-made citation. The crawler registry incorporates the MIT-licensed{" "}
          <a href="https://github.com/ai-robots-txt/ai.robots.txt">ai.robots.txt</a> project.
        </p>
      </div>

      <section className="mt-16">
        <h2 className="section-title mb-3">Datasets</h2>
        <ol className="index-list">
          {DATASETS.map((d) => (
            <li key={d.slug}>
              <Link href={d.path}>
                <span className="index-no" aria-hidden="true" />
                <span className="index-title flex-1">{d.title}</span>
                <span className="meta shrink-0">{fmtNumber(d.records)} records</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
