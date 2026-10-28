import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/data/breadcrumbs";
import { CiteThis } from "@/components/data/cite-this";
import { DatasetHeader } from "@/components/data/dataset-header";
import { JsonLd } from "@/components/json-ld";
import { SourceLink } from "@/components/data/source-link";
import { AboutDataset, RelatedResearch } from "@/components/data/about-dataset";
import { HBarChart, LineChart } from "@/components/data/charts";
import { Faq } from "@/components/data/faq";
import { fmtMonth, insights, monthLabel, researchFor, timeline } from "@/lib/data";
import { breadcrumbNode, datasetNode, faqNode, graph } from "@/lib/schema";
import { pageMeta } from "@/lib/site";

const PATH = "/data/chatgpt-ads/timeline";
const TITLE = "ChatGPT Ads timeline: every launch, price change & update";
const DESC = `A dated changelog of ads in ChatGPT, from OpenAI's first ad job listings to 89 countries and 100,000+ advertisers. ${timeline.rows.length} milestones, each sourced.`;

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESC, path: PATH });

const FAQ = [
  {
    q: "When did ads launch in ChatGPT?",
    a: "OpenAI announced ads on 16 January 2026 and began showing them to logged-in adult Free and Go users in the United States on 9 February 2026.",
  },
  {
    q: "Which countries have ChatGPT ads?",
    a: "As of 21 October 2026, ChatGPT Ads are available in 89 countries, including the US, Canada, Australia, New Zealand, the UK, 31 European countries, India, Japan, South Korea, Brazil, Mexico and much of Latin America, the Middle East, Africa and Southeast Asia.",
  },
  {
    q: "When did ChatGPT Ads Manager launch?",
    a: "A self-serve Ads Manager was tested with partners from March 2026, quietly opened to some advertisers in April, and launched as a broad US beta on 5 May 2026 with CPC bidding, a pixel and a Conversions API.",
  },
  {
    q: "What ad formats does ChatGPT offer?",
    a: "Text-and-image units below answers, product ads with prices and ratings, product carousels, multi-image ads, and Sponsored Agents, which open a conversation with the brand's own AI agent.",
  },
];

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
    faqNode(FAQ),
    datasetNode({
      research: researchFor("chatgpt-ads-timeline"),
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

      <LineChart
        title="Countries where ChatGPT Ads are available"
        points={insights.ads.countriesByMonth.map((m) => ({ label: monthLabel(m.month), value: m.countries }))}
        format={(v) => `${Math.round(v)}`}
        step
        max={100}
        caption="End-of-month count, 2026."
        source="OpenAI announcements"
      />
      <HBarChart
        title="Minimum spend to advertise in ChatGPT"
        items={insights.ads.minimumSpend.map((m) => ({ label: `${fmtMonth(m.date)} · ${m.label}`, value: Math.log10(m.usd) }))}
        format={(v) => `$${Math.round(10 ** v).toLocaleString("en-US")}${v < 2 ? " a day" : ""}`}
        max={5.8}
        labelWidth={250}
        caption="Bars on a log scale: the price of entry fell 10,000x in four months."
        source="CNBC, Adweek, Digiday, OpenAI Help Center"
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

      <AboutDataset
        download="chatgpt-ads-timeline"
        what={<p>Dated milestones for advertising in ChatGPT: announcements, pilot terms, pricing and minimum-spend changes, country launches, ad formats, tools, partners and policy, from OpenAI&apos;s first ad job listings in September 2025 to the latest expansion.</p>}
        how={<p>Events were extracted from news coverage, OpenAI announcements and help-center changelogs, then written by hand. Each event keeps the most authoritative source available, preferring OpenAI and trade press.</p>}
        limits={<p>Dates are when an event was announced or first reported, which can lag the actual rollout by days. Gradual rollouts are dated to their announcement.</p>}
        fields={[
          { name: "date", description: "Date announced or first reported (YYYY-MM-DD)" },
          { name: "title", description: "One-line summary of the change" },
          { name: "detail", description: "What changed, with figures where reported" },
          { name: "type", description: "announcement, launch, pricing, expansion, format, tooling, partners, policy, measurement, milestone" },
          { name: "sourceUrl / sourceDomain", description: "Where it was reported" },
        ]}
      />
      <Faq items={FAQ} />
      <RelatedResearch dataset="chatgpt-ads-timeline" />
      <CiteThis title="ChatGPT Ads timeline" path={PATH} updated={timeline.updated} />
    </>
  );
}
