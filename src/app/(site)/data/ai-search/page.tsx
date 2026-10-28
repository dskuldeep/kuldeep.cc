import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/data/breadcrumbs";
import { CiteThis } from "@/components/data/cite-this";
import { DatasetHeader } from "@/components/data/dataset-header";
import { Faq } from "@/components/data/faq";
import { JsonLd } from "@/components/json-ld";
import { crawlers, crawlerSlug, engines, robotsStudy } from "@/lib/data";
import { breadcrumbNode, datasetNode, faqNode, graph } from "@/lib/schema";
import { pageMeta } from "@/lib/site";

const PATH = "/data/ai-search";
const TITLE = "AI search engine reference: indexes, crawlers & referrers";
const DESC = `Which search index each AI engine uses, which crawlers feed it, how its traffic shows up in analytics and whether it runs ads. ${engines.rows.length} engines including ChatGPT, Gemini, AI Overviews, Perplexity, Claude and Copilot.`;

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESC, path: PATH });

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Data", path: "/data" },
  { name: "AI Search Reference", path: PATH },
];

const FAQ = [
  {
    q: "Where does ChatGPT get its information?",
    a: "From two places: its training data, and live web search. For search, ChatGPT uses OpenAI's own index, built by the OAI-SearchBot crawler, plus results from third-party search providers. Bing historically supplied results, and in 2025 reporting showed Google results reaching ChatGPT via SerpApi. When a user shares a link or asks it to read a page, the ChatGPT-User agent fetches it directly.",
  },
  {
    q: "Does ChatGPT use Bing?",
    a: "Partly. Bing powered ChatGPT's browsing from 2023, and Bing results still feed its search. OpenAI now also runs its own crawler, OAI-SearchBot, and its own index. To appear in ChatGPT search, a site must allow OAI-SearchBot in robots.txt; being in Bing is not enough.",
  },
  {
    q: "What search engine does Claude use?",
    a: "When Claude added web search in March 2025, its results matched Brave Search, and Brave was listed as a subprocessor. Anthropic also operates Claude-SearchBot to index pages for search quality, and Claude-User to fetch pages on request.",
  },
  {
    q: "What search engine does Perplexity use?",
    a: "Its own. PerplexityBot builds an index covering hundreds of billions of pages, served on Vespa, which Perplexity also sells as a Search API. Perplexity-User fetches pages live for user queries and, per Perplexity's docs, generally ignores robots.txt.",
  },
  {
    q: "Can I block AI Overviews without leaving Google Search?",
    a: "Not with robots.txt. AI Overviews and AI Mode are built from Google's Search index, so the only crawler-level opt-out is blocking Googlebot, which also removes you from Search. Google-Extended only controls Gemini training and grounding. Page-level nosnippet and max-snippet directives limit what can be quoted.",
  },
  {
    q: "How do I see AI traffic in Google Analytics 4?",
    a: "Create a custom channel group or exploration filter on session source matching the AI referrer domains (chatgpt.com, perplexity.ai, gemini.google.com, copilot.microsoft.com, claude.ai and others). ChatGPT also tags citation links with utm_source=chatgpt.com. A ready-made regex is on the AI referrers page.",
  },
];

export default function AiSearchHub() {
  const rows = engines.rows;

  const jsonLd = graph(
    datasetNode({
      name: "AI search engine reference",
      description: DESC,
      path: PATH,
      keywords: ["AI search engines", "which search engine does ChatGPT use", "where does ChatGPT get its information", "AI crawlers", "generative engine optimization", "AI referral traffic"],
      datePublished: "2026-10-29",
      dateModified: engines.updated,
      variableMeasured: ["Search index", "Crawlers", "Referrer domains", "UTM parameters", "Ads"],
      downloads: [
        { format: "CSV", path: "/data/download/ai-engines.csv" },
        { format: "JSON", path: "/data/download/ai-engines.json" },
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
        title="AI search engine reference"
        dek="How each AI engine finds pages, which bots it sends, how its clicks show up in your analytics, and whether it sells ads. One table, sourced from official documentation and verified reporting."
        updated={engines.updated}
        records={rows.length}
        recordLabel="engines"
        download="ai-engines"
      />

      <div className="bleed table-wrap">
        <table className="data-table">
          <caption>AI engines compared. Select an engine for its full profile and sources.</caption>
          <thead>
            <tr>
              <th>Engine</th>
              <th>Where answers come from</th>
              <th>Crawlers</th>
              <th>Referrer</th>
              <th>Ads</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.slug}>
                <td>
                  <Link href={`/data/ai-search/${e.slug}`} className="link strong">
                    {e.name}
                  </Link>
                  <span className="block text-[0.78rem] text-[var(--muted)]">{e.operator}</span>
                </td>
                <td className="min-w-[18rem]">{e.index.split(". ")[0].replace(/\.$/, "")}.</td>
                <td>
                  {e.crawlers.map((c) => {
                    const slug = crawlerSlug(c);
                    return (
                      <span key={c} className="block">
                        {slug ? (
                          <Link href={`/data/ai-search/crawlers/${slug}`} className="link mono">
                            {c}
                          </Link>
                        ) : (
                          <code>{c}</code>
                        )}
                      </span>
                    );
                  })}
                </td>
                <td>
                  {e.referrers.slice(0, 2).map((r) => (
                    <code key={r} className="block">
                      {r}
                    </code>
                  ))}
                </td>
                <td className="min-w-[10rem]">{e.ads.split(". ")[0].replace(/\.$/, "")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-20">
        <h2 className="section-title mb-3">More in this reference</h2>
        <ol className="index-list">
          <li>
            <Link href="/data/ai-search/robots-txt-study">
              <span className="index-no" aria-hidden="true" />
              <span className="flex-1">
                <span className="index-title block">Who blocks AI crawlers? A study of the top 10,000 sites</span>
                <span className="mt-1 block text-[0.95rem] text-[var(--muted)]">
                  {robotsStudy.headline.blocksAnyAiPct}% block at least one AI bot. Original data.
                </span>
              </span>
            </Link>
          </li>
          <li>
            <Link href="/data/ai-search/crawlers">
              <span className="index-no" aria-hidden="true" />
              <span className="flex-1">
                <span className="index-title block">AI crawler directory</span>
                <span className="mt-1 block text-[0.95rem] text-[var(--muted)]">
                  {crawlers.featured.length + crawlers.registry.length} bots and user agents, with user-agent strings and IP lists.
                </span>
              </span>
            </Link>
          </li>
          <li>
            <Link href="/data/ai-search/referrers">
              <span className="index-no" aria-hidden="true" />
              <span className="flex-1">
                <span className="index-title block">AI referrer domains and GA4 regex</span>
                <span className="mt-1 block text-[0.95rem] text-[var(--muted)]">Track ChatGPT, Perplexity, Gemini and Copilot traffic.</span>
              </span>
            </Link>
          </li>
          <li>
            <Link href="/data/ai-search/user-numbers">
              <span className="index-no" aria-hidden="true" />
              <span className="flex-1">
                <span className="index-title block">AI assistant user numbers</span>
                <span className="mt-1 block text-[0.95rem] text-[var(--muted)]">How many people use ChatGPT, Gemini, AI Overviews and AI Mode.</span>
              </span>
            </Link>
          </li>
        </ol>
      </section>

      <Faq items={FAQ} />
      <CiteThis title="AI search engine reference" path={PATH} updated={engines.updated} />
    </>
  );
}
