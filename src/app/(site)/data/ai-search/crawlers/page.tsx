import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/data/breadcrumbs";
import { CiteThis } from "@/components/data/cite-this";
import { DatasetHeader } from "@/components/data/dataset-header";
import { Faq } from "@/components/data/faq";
import { JsonLd } from "@/components/json-ld";
import { TableFilter } from "@/components/data/table-filter";
import { botStat, crawlers, PURPOSE_LABEL, robotsStudy } from "@/lib/data";
import { breadcrumbNode, datasetNode, faqNode, graph } from "@/lib/schema";
import { pageMeta } from "@/lib/site";

const PATH = "/data/ai-search/crawlers";
const total = crawlers.featured.length + crawlers.registry.length;
const TITLE = `AI crawler list: ${total} AI bots & user agents (GPTBot, ClaudeBot…)`;
const DESC = `Every known AI crawler in one directory: GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Bytespider and ${total - 6} more, with operator, purpose, robots.txt behaviour and how many top sites block each.`;

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESC, path: PATH });

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Data", path: "/data" },
  { name: "AI Search Reference", path: "/data/ai-search" },
  { name: "AI crawlers", path: PATH },
];

const FAQ = [
  {
    q: "What is the difference between GPTBot, OAI-SearchBot and ChatGPT-User?",
    a: "GPTBot collects content that may be used to train OpenAI's models. OAI-SearchBot builds the index that ChatGPT search cites. ChatGPT-User fetches a page only when a user asks for it. Each is controlled separately in robots.txt, so you can block training while staying visible in ChatGPT search.",
  },
  {
    q: "Should I block AI crawlers?",
    a: "Block training crawlers (GPTBot, ClaudeBot, Google-Extended, CCBot, Applebot-Extended, Meta-ExternalAgent) if you don't want your content used for model training. Allow search and user-triggered agents (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot) if you want to be cited in AI answers. Blocking those removes you from those engines.",
  },
  {
    q: "Do AI crawlers respect robots.txt?",
    a: "The documented crawlers from OpenAI, Anthropic, Google, Apple, Amazon, Perplexity (PerplexityBot) and Common Crawl say they do. User-triggered fetchers such as Perplexity-User, Meta-ExternalFetcher and Google-Agent may not, because a person initiated the request. Bytespider and DeepSeekBot are widely reported to ignore it.",
  },
  {
    q: "How do I verify a crawler is real?",
    a: "Match the request IP against the operator's published IP list (OpenAI, Perplexity, Google, Bing, Common Crawl and DuckDuckGo publish JSON files) or use reverse DNS. User-agent strings alone are easy to spoof.",
  },
];

export default function CrawlersPage() {
  const featured = [...crawlers.featured].sort(
    (a, b) => (botStat(b.token)?.blocked ?? 0) - (botStat(a.token)?.blocked ?? 0),
  );

  const jsonLd = graph(
    datasetNode({
      name: "AI crawler directory",
      description: DESC,
      path: PATH,
      keywords: ["AI crawlers list", "AI bots list", "AI user agents", "GPTBot", "ClaudeBot", "PerplexityBot", "block AI crawlers robots.txt"],
      datePublished: "2026-10-29",
      dateModified: crawlers.updated,
      variableMeasured: ["User agent", "Operator", "Purpose", "Respects robots.txt", "IP list", "Share of top sites blocking"],
      isBasedOn: [crawlers.registrySource],
      downloads: [
        { format: "CSV", path: "/data/download/ai-crawlers.csv" },
        { format: "JSON", path: "/data/download/ai-crawlers.json" },
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
        title="AI crawler directory"
        dek={`The bots AI companies send to your site: what each one is for, who runs it, whether it obeys robots.txt, and how many of the top ${robotsStudy.sample.domains.toLocaleString("en-US")} websites block it.`}
        updated={crawlers.updated}
        records={total}
        recordLabel="bots and user agents"
        download="ai-crawlers"
      />

      <section aria-labelledby="documented">
        <h2 id="documented" className="section-title mb-4">
          Documented AI crawlers ({crawlers.featured.length})
        </h2>
        <TableFilter tableId="featured" placeholder="Filter by bot, operator, purpose…" total={featured.length} />
      </section>
      <div className="bleed table-wrap">
        <table id="featured" className="data-table">
          <caption>
            Sorted by the share of the top {robotsStudy.sample.domains.toLocaleString("en-US")} sites that fully block each bot in robots.txt (
            <Link href="/data/ai-search/robots-txt-study" className="link">
              study
            </Link>
            ).
          </caption>
          <thead>
            <tr>
              <th>User agent</th>
              <th>Operator</th>
              <th>Purpose</th>
              <th>Used for</th>
              <th>Obeys robots.txt</th>
              <th className="num">Top sites blocking</th>
            </tr>
          </thead>
          <tbody>
            {featured.map((c) => {
              const st = botStat(c.token);
              return (
                <tr key={c.slug}>
                  <td>
                    <Link href={`/data/ai-search/crawlers/${c.slug}`} className="link mono strong">
                      {c.token}
                    </Link>
                  </td>
                  <td className="nowrap">{c.operator}</td>
                  <td className="nowrap">{PURPOSE_LABEL[c.purpose]}</td>
                  <td>{c.product}</td>
                  <td>{c.respectsRobots}</td>
                  <td className="num">{st ? `${st.blockedPct}%` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="mt-20" aria-labelledby="registry">
        <h2 id="registry" className="section-title mb-4">
          Full registry ({crawlers.registry.length} more)
        </h2>
        <p className="mb-4 max-w-[40rem] text-[0.95rem] text-[var(--muted)]">
          Less common AI crawlers, scrapers, data providers and coding agents. Descriptions come
          from the community-maintained{" "}
          <a className="link" href={crawlers.registrySource} rel="noopener" target="_blank">
            ai.robots.txt
          </a>{" "}
          project (MIT licence), cross-referenced against the robots.txt study.
        </p>
        <TableFilter tableId="registry-table" placeholder="Filter the registry…" total={crawlers.registry.length} />
      </section>
      <div className="bleed table-wrap">
        <table id="registry-table" className="data-table">
          <thead>
            <tr>
              <th>User agent</th>
              <th>Operator</th>
              <th>Function</th>
              <th>Obeys robots.txt</th>
              <th className="num">Top sites blocking</th>
            </tr>
          </thead>
          <tbody>
            {crawlers.registry.map((c) => {
              const st = botStat(c.token);
              return (
                <tr key={c.token}>
                  <td className="mono">{c.token}</td>
                  <td>{c.operator ?? "Unknown"}</td>
                  <td className="text-[var(--muted)]">{c.function ?? "—"}</td>
                  <td>{c.respectsRobots ?? "Unclear"}</td>
                  <td className="num">{st ? `${st.blockedPct}%` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Faq items={FAQ} />
      <CiteThis title="AI crawler directory" path={PATH} updated={crawlers.updated} />
    </>
  );
}
