import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/data/breadcrumbs";
import { CiteThis } from "@/components/data/cite-this";
import { DatasetHeader } from "@/components/data/dataset-header";
import { Faq } from "@/components/data/faq";
import { JsonLd } from "@/components/json-ld";
import { SourceLink } from "@/components/data/source-link";
import { RelatedResearch } from "@/components/data/about-dataset";
import { LineChart } from "@/components/data/charts";
import { advertisers, benchmarks, fmtMonth, insights, monthLabel, researchFor, timeline } from "@/lib/data";
import { breadcrumbNode, datasetNode, faqNode, graph } from "@/lib/schema";
import { pageMeta } from "@/lib/site";

const PATH = "/data/chatgpt-ads";
const TITLE = "ChatGPT Ads Index: costs, benchmarks & advertisers (2026)";
const s = benchmarks.summary;
const DESC = `What ChatGPT ads cost and how they perform: median CPC $${s.cpc.median.toFixed(2)}, CPM $${s.cpm.median.toFixed(2)}, CTR ${s.ctr.median.toFixed(2)}% across ${s.dataPoints} sourced data points, plus ${advertisers.rows.length} known advertisers and a dated timeline.`;

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESC, path: PATH });

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Data", path: "/data" },
  { name: "ChatGPT Ads Index", path: PATH },
];

const OPENAI_BASICS = "https://help.openai.com/en/articles/20001207-ads-in-chatgpt-the-basics";
const OPENAI_26 = "https://openai.com/index/chatgpt-ads-expands-26-new-countries/";

const FAQ = [
  {
    q: "Does ChatGPT have ads?",
    a: "Yes. OpenAI began testing ads in ChatGPT in the United States on 9 February 2026. Ads appear below ChatGPT's answers for logged-in adults on the Free and Go plans. Plus, Pro, Business and Enterprise accounts, and users identified as under 18, do not see ads. As of 21 October 2026, ChatGPT Ads were available in 89 countries.",
  },
  {
    q: "How much do ChatGPT ads cost?",
    a: `Across ${s.dataPoints} publicly reported data points, the median reported CPC is $${s.cpc.median.toFixed(2)} and the median CPM is $${s.cpm.median.toFixed(2)}. CPMs launched around $60 in February 2026 and fell to $25–$45 by April as CPC bidding arrived. OpenAI recommends starting CPC bids at $3–$5.`,
  },
  {
    q: "What is the minimum spend for ChatGPT ads?",
    a: "At launch, OpenAI asked pilot advertisers for commitments of roughly $200,000–$250,000. That fell to $50,000 in April 2026, and the self-serve minimum was removed in May 2026. US self-serve campaigns now start from a $25 daily budget; in India the minimum daily budget is ₹725.",
  },
  {
    q: "What is the average CTR of ChatGPT ads?",
    a: `The median click-through rate across ${s.ctr.n} reported figures is ${s.ctr.median.toFixed(2)}%, with most reports between 0.6% and 1.5%. That is well below typical Google Search ad CTRs; ads sit beneath the answer rather than above it.`,
  },
  {
    q: "How do you run ads on ChatGPT?",
    a: "Through ChatGPT Ads Manager (self-serve, at ads.openai.com), through OpenAI's Ads Solutions sales team, or through agency and technology partners such as Criteo, StackAdapt, Adobe, Kargo, Pacvue and the major holding companies. Campaigns are organised as campaign, ad group and ad. Billing is per impression (CPM) or per click (CPC), with conversion-optimised bidding.",
  },
  {
    q: "What do ChatGPT ads look like?",
    a: "A labelled unit under the answer showing the advertiser name, favicon, headline, description, image and landing page. Product ads add price and star ratings. OpenAI has since tested product carousels, multi-image ads and Sponsored Agents, which open a chat with the brand's own AI agent.",
  },
  {
    q: "Which brands advertise on ChatGPT?",
    a: `Early advertisers included Target, Adobe, Expedia, Williams-Sonoma, Best Buy, Ford, Audible and Mazda. This index tracks ${advertisers.rows.length} brands named in public reporting; OpenAI says more than 100,000 advertisers have run campaigns.`,
  },
];

export default function ChatGptAdsHub() {
  const recent = [...timeline.rows].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const topAdvertisers = advertisers.rows.slice(0, 12);

  const jsonLd = graph(
    datasetNode({
      research: researchFor("chatgpt-ads-benchmarks"),
      name: "ChatGPT Ads Index",
      description: DESC,
      path: PATH,
      keywords: ["ChatGPT ads", "ChatGPT ads cost", "ChatGPT ads CPM", "ChatGPT ads CPC", "ChatGPT ads benchmarks", "OpenAI advertising"],
      datePublished: "2026-10-29",
      dateModified: benchmarks.updated,
      temporalCoverage: "2025-09/2026-10",
      variableMeasured: ["CPM", "CPC", "CTR", "Conversion rate", "ROAS", "Minimum spend"],
      downloads: [
        { format: "CSV", path: "/data/download/chatgpt-ads-benchmarks.csv" },
        { format: "JSON", path: "/data/download/chatgpt-ads-benchmarks.json" },
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
        title="ChatGPT Ads Index"
        dek="What ads in ChatGPT cost, how they perform, who is buying them and how the platform has changed since launch, compiled from every public source I could find."
        updated={benchmarks.updated}
        records={s.dataPoints + advertisers.rows.length + timeline.rows.length}
      />

      <section className="stats" aria-label="Headline benchmarks">
        <div>
          <span className="stat-value">${s.cpc.median.toFixed(2)}</span>
          <span className="stat-label">median CPC ({s.cpc.n} reports)</span>
        </div>
        <div>
          <span className="stat-value">${s.cpm.median.toFixed(0)}</span>
          <span className="stat-label">median CPM ({s.cpm.n} reports)</span>
        </div>
        <div>
          <span className="stat-value">{s.ctr.median.toFixed(2)}%</span>
          <span className="stat-label">median CTR ({s.ctr.n} reports)</span>
        </div>
        <div>
          <span className="stat-value">{s.cvr.median.toFixed(1)}%</span>
          <span className="stat-label">median conversion rate ({s.cvr.n} reports)</span>
        </div>
      </section>
      <p className="meta mt-4">
        Medians of distinct reported values in USD; ranges use their midpoint. See{" "}
        <Link href="/data/chatgpt-ads/benchmarks" className="link">
          all {s.dataPoints} data points
        </Link>
        .
      </p>

      <LineChart
        title="Median reported CPM by month (USD)"
        points={insights.ads.cpmByMonth.map((m) => ({ label: monthLabel(m.month), value: m.median }))}
        format={(v) => `$${Math.round(v)}`}
        max={90}
        caption="CPMs fell from the $60 launch price within two months; October reflects cheaper newer markets."
        source="ChatGPT Ads benchmarks"
      />

      <section className="mt-16">
        <h2 className="section-title mb-4">ChatGPT Ads at a glance</h2>
        <dl className="facts">
          <dt>Launched</dt>
          <dd>9 February 2026 (US pilot); announced 16 January 2026</dd>
          <dt>Availability</dt>
          <dd>
            89 countries as of 21 October 2026 · <SourceLink url={OPENAI_26} />
          </dd>
          <dt>Who sees ads</dt>
          <dd>
            Logged-in adults on Free and Go plans. Plus, Pro, Business, Enterprise and under-18
            accounts are ad-free · <SourceLink url={OPENAI_BASICS} />
          </dd>
          <dt>Placement</dt>
          <dd>Below the answer, clearly labelled; not shown near health, mental-health or political conversations</dd>
          <dt>Buying</dt>
          <dd>CPM (Views), CPC (Clicks) and conversion-optimised CPC via a relevance-weighted second-price auction</dd>
          <dt>Recommended bid</dt>
          <dd>
            $3–$5 starting CPC · <SourceLink url={OPENAI_BASICS} />
          </dd>
          <dt>Minimum</dt>
          <dd>$25 daily budget for self-serve (US); launch-era commitments were $200K+</dd>
          <dt>Advertisers</dt>
          <dd>
            100,000+ have run campaigns · <SourceLink url={OPENAI_26} />
          </dd>
          <dt>Revenue</dt>
          <dd>$1B annualised run rate within 200 days of launch (OpenAI, Sept 2026)</dd>
          <dt>Measurement</dt>
          <dd>ChatGPT pixel, Conversions API, UTM parameters; landing pages are checked by OAI-AdsBot</dd>
        </dl>
      </section>

      <section className="mt-20">
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2 className="section-title">Latest changes</h2>
          <Link href="/data/chatgpt-ads/timeline" className="link meta">
            Full timeline →
          </Link>
        </div>
        <ol className="index-list">
          {recent.map((e) => (
            <li key={e.id}>
              <div className="index-row">
                <span className="meta w-24 shrink-0">{fmtMonth(e.date)}</span>
                <span className="flex-1">
                  <span className="index-title block text-[1.05rem]">{e.title}</span>
                  <span className="mt-1 block text-[0.95rem] leading-snug text-[var(--muted)]">{e.detail}</span>
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-20">
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2 className="section-title">Most-reported advertisers</h2>
          <Link href="/data/chatgpt-ads/advertisers" className="link meta">
            All {advertisers.rows.length} →
          </Link>
        </div>
        <p className="text-[1.05rem]">
          {topAdvertisers.map((a, i) => (
            <span key={a.id}>
              <strong>{a.brand}</strong>
              <span className="text-[var(--muted)]"> ({a.category})</span>
              {i < topAdvertisers.length - 1 ? ", " : "."}
            </span>
          ))}
        </p>
      </section>

      <section className="mt-20">
        <h2 className="section-title mb-3">In this index</h2>
        <ol className="index-list">
          <li>
            <Link href="/data/chatgpt-ads/benchmarks">
              <span className="index-no" aria-hidden="true" />
              <span className="index-title flex-1">ChatGPT Ads benchmarks: CPM, CPC, CTR, ROAS</span>
              <span className="meta shrink-0">{s.dataPoints}</span>
            </Link>
          </li>
          <li>
            <Link href="/data/chatgpt-ads/advertisers">
              <span className="index-no" aria-hidden="true" />
              <span className="index-title flex-1">Brands advertising on ChatGPT</span>
              <span className="meta shrink-0">{advertisers.rows.length}</span>
            </Link>
          </li>
          <li>
            <Link href="/data/chatgpt-ads/timeline">
              <span className="index-no" aria-hidden="true" />
              <span className="index-title flex-1">ChatGPT Ads timeline and changelog</span>
              <span className="meta shrink-0">{timeline.rows.length}</span>
            </Link>
          </li>
          <li>
            <Link href="/data/ai-search/crawlers/oai-adsbot">
              <span className="index-no" aria-hidden="true" />
              <span className="index-title flex-1">OAI-AdsBot: the crawler that reviews your landing pages</span>
            </Link>
          </li>
        </ol>
      </section>

      <Faq items={FAQ} />
      <RelatedResearch dataset="chatgpt-ads-benchmarks" />
      <CiteThis title="ChatGPT Ads Index" path={PATH} updated={benchmarks.updated} />
    </>
  );
}
