import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/data/breadcrumbs";
import { CiteThis } from "@/components/data/cite-this";
import { DatasetHeader } from "@/components/data/dataset-header";
import { Faq } from "@/components/data/faq";
import { JsonLd } from "@/components/json-ld";
import { TableFilter } from "@/components/data/table-filter";
import { AboutDataset, RelatedResearch } from "@/components/data/about-dataset";
import { GroupedHBarChart, HBarChart } from "@/components/data/charts";
import { botStat, crawlerSlug, fmtMonth, fmtNumber, insights, researchFor, robotsStudy as R } from "@/lib/data";
import { breadcrumbNode, datasetNode, faqNode, graph, PERSON_ID } from "@/lib/schema";
import { canonicalPath, pageMeta } from "@/lib/site";

const PATH = "/data/ai-search/robots-txt-study";
const H = R.headline;
const N = fmtNumber(R.sample.domains);
const TITLE = `Who blocks AI crawlers? robots.txt study of the top ${N} sites`;
const DESC = `${H.blocksAnyAiPct}% of the top ${N} websites block at least one AI crawler in robots.txt and ${H.blocksGptbotPct}% block GPTBot, but ${H.splitSearchTrainingPct}% of GPTBot blockers still allow ChatGPT search. ${H.llmsTxtPct}% publish an llms.txt. Original data, ${fmtMonth(R.fetchedAt)}.`;

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESC, path: PATH });

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Data", path: "/data" },
  { name: "AI Search Reference", path: "/data/ai-search" },
  { name: "robots.txt study", path: PATH },
];

const I = insights.robots;
const pct = (t: string) => botStat(t)?.blockedPct ?? 0;

const FAQ = [
  {
    q: "Does blocking GPTBot keep my content out of AI training?",
    a: `Not on its own. Half (${I.leak.anyMajorOpenPct}%) of the sites that block GPTBot leave at least one other major training crawler, such as ClaudeBot, Google-Extended, CCBot, Meta-ExternalAgent or Applebot-Extended, unblocked. Only ${fmtNumber(I.blocksAllMajorTraining.n)} sites (${I.blocksAllMajorTraining.pctOfRobots}%) block all eight major training crawlers.`,
  },
  {
    q: "Which websites block AI crawlers the most?",
    a: `By country domain, French (.fr, ${I.tld.find((t) => t.tld === ".fr")?.blocksAnyPct}%) and German (.de, ${I.tld.find((t) => t.tld === ".de")?.blocksAnyPct}%) sites block AI most, against ${I.tld.find((t) => t.tld === ".com")?.blocksAnyPct}% of .com sites. Universities (.edu) and governments (.gov) block least. The largest sites block more: ${R.tiers[0].blocksAnyAiPct}% of the top 1,000.`,
  },
  {
    q: "What percentage of websites block AI crawlers?",
    a: `Among the top ${N} websites (Tranco list, ${fmtMonth(R.fetchedAt)}), ${H.blocksAnyAiPct}% of sites with a robots.txt file explicitly block at least one AI crawler, and ${H.mentionsAnyAiPct}% name at least one AI bot. Among the top 1,000 the rate rises to ${R.tiers[0].blocksAnyAiPct}%.`,
  },
  {
    q: "Which AI crawler is blocked the most?",
    a: `${R.bots[0].token} is the most-blocked AI crawler, disallowed by ${R.bots[0].blockedPct}% of sites with a robots.txt, followed by ${R.bots[1].token} (${R.bots[1].blockedPct}%) and ${R.bots[2].token} (${R.bots[2].blockedPct}%).`,
  },
  {
    q: "How many websites block GPTBot?",
    a: `${H.blocksGptbotPct}% of top-${N} sites with a robots.txt block GPTBot. Of those, ${H.splitSearchTrainingPct}% still allow OAI-SearchBot, so they opt out of OpenAI training while staying visible in ChatGPT search.`,
  },
  {
    q: "How many websites have an llms.txt file?",
    a: `${fmtNumber(R.sample.withLlmsTxt)} of the top ${N} domains (${H.llmsTxtPct}%) served a valid llms.txt file at the site root, rising to ${R.tiers[0].llmsTxtPct}% among the top 1,000.`,
  },
];

export default function RobotsStudyPage() {
  const bots = R.bots.filter((b) => b.blocked > 0).slice(0, 40);
  const max = bots[0]?.blockedPct ?? 1;
  const top = R.topSites.filter((s) => s.blocks.length > 0 || s.llmsTxt);

  const jsonLd = graph(
    datasetNode({
      research: researchFor("robots-txt-study"),
      name: `AI crawler blocking in robots.txt: top ${N} websites`,
      description: DESC,
      path: PATH,
      keywords: ["websites blocking AI crawlers", "robots.txt AI bots", "GPTBot blocked", "block AI crawlers", "llms.txt adoption", "AI crawler statistics"],
      datePublished: R.fetchedAt,
      dateModified: R.updated,
      temporalCoverage: R.fetchedAt,
      variableMeasured: ["Share of sites blocking each AI crawler", "llms.txt presence", "Explicit Allow rules"],
      isBasedOn: ["https://tranco-list.eu/"],
      downloads: [
        { format: "CSV", path: "/data/download/robots-txt-study.csv" },
        { format: "JSON", path: "/data/download/robots-txt-study.json" },
      ],
    }),
    {
      "@type": "Article",
      "@id": `${canonicalPath(PATH)}#article`,
      headline: TITLE,
      description: DESC,
      url: canonicalPath(PATH),
      datePublished: R.fetchedAt,
      dateModified: R.updated,
      author: { "@id": PERSON_ID },
      publisher: { "@id": PERSON_ID },
      image: canonicalPath("/og.png"),
    },
    faqNode(FAQ),
    breadcrumbNode(crumbs),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <Breadcrumbs crumbs={crumbs} />
      <DatasetHeader
        title="Who blocks AI crawlers?"
        dek={`I fetched the robots.txt and llms.txt files of the ${N} most popular websites and checked how each one treats ${fmtNumber(R.bots.length)} AI crawlers and user agents. Original data, collected ${fmtMonth(R.fetchedAt)}.`}
        updated={R.updated}
        records={R.sample.domains}
        recordLabel="domains analysed"
        download="robots-txt-study"
      />

      <section className="stats" aria-label="Key findings">
        <div>
          <span className="stat-value">{H.blocksAnyAiPct}%</span>
          <span className="stat-label">block at least one AI crawler</span>
        </div>
        <div>
          <span className="stat-value">{H.blocksGptbotPct}%</span>
          <span className="stat-label">block GPTBot</span>
        </div>
        <div>
          <span className="stat-value">{H.splitSearchTrainingPct}%</span>
          <span className="stat-label">of GPTBot blockers still allow ChatGPT search</span>
        </div>
        <div>
          <span className="stat-value">{H.llmsTxtPct}%</span>
          <span className="stat-label">publish an llms.txt</span>
        </div>
      </section>
      <p className="meta mt-4">
        Shares of the {fmtNumber(R.sample.withRobots)} domains that served a valid robots.txt, except
        llms.txt, which is a share of all {N}.
      </p>

      <section className="article mt-16">
        <h2>Key findings</h2>
        <ol>
          <li>
            <strong>About one in five big sites blocks AI.</strong> {H.blocksAnyAiPct}% of top sites
            with a robots.txt explicitly disallow at least one AI crawler, and {H.mentionsAnyAiPct}%
            name one. The largest sites block most: {R.tiers[0].blocksAnyAiPct}% of the top 1,000
            versus {R.tiers[2].blocksAnyAiPct}% of sites ranked 5,001–10,000.
          </li>
          <li>
            <strong>Training data is the target, not visibility.</strong> The most-blocked bots
            are dataset and training crawlers: {R.bots[0].token} ({R.bots[0].blockedPct}%),{" "}
            {R.bots[1].token} ({R.bots[1].blockedPct}%), {R.bots[2].token} ({R.bots[2].blockedPct}%)
            and {R.bots[3].token} ({R.bots[3].blockedPct}%).
          </li>
          <li>
            <strong>Most GPTBot blockers want to stay in ChatGPT.</strong> {fmtNumber(H.splitSearchTraining)}{" "}
            sites ({H.splitSearchTrainingPct}% of GPTBot blockers) block training but leave
            OAI-SearchBot open, the split OpenAI&apos;s documentation recommends.
          </li>
          <li>
            <strong>llms.txt is real but early.</strong> {fmtNumber(R.sample.withLlmsTxt)} domains (
            {H.llmsTxtPct}%) serve one, mostly SaaS, developer and e-commerce brands.
          </li>
        </ol>
      </section>

      <section className="mt-16" aria-labelledby="by-bot">
        <h2 id="by-bot" className="section-title mb-4">
          Most-blocked AI crawlers
        </h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>User agent</th>
                <th className="w-full">Share of sites blocking</th>
                <th className="num">%</th>
                <th className="num">Sites</th>
                <th className="num">Top 1k</th>
                <th className="num">Named</th>
              </tr>
            </thead>
            <tbody>
              {bots.map((b) => {
                const slug = crawlerSlug(b.token);
                return (
                  <tr key={b.token}>
                    <td className="nowrap">
                      {slug ? (
                        <Link href={`/data/ai-search/crawlers/${slug}`} className="link mono">
                          {b.token}
                        </Link>
                      ) : (
                        <span className="mono">{b.token}</span>
                      )}
                    </td>
                    <td>
                      <span className="bar" aria-hidden="true">
                        <span style={{ width: `${(b.blockedPct / max) * 100}%` }} />
                      </span>
                    </td>
                    <td className="num strong">{b.blockedPct}%</td>
                    <td className="num">{fmtNumber(b.blocked)}</td>
                    <td className="num">{b.blockedTop1k}</td>
                    <td className="num">{fmtNumber(b.explicit)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="meta mt-3">
          &ldquo;Blocking&rdquo; means the group that applies to the bot (its own, or{" "}
          <code>*</code> if it isn&apos;t named) disallows <code>/</code>. &ldquo;Named&rdquo; counts
          sites that mention the bot at all, including to allow it.
        </p>
      </section>

      <section className="mt-16" aria-labelledby="tiers">
        <h2 id="tiers" className="section-title mb-4">
          By popularity
        </h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th className="num">Domains</th>
                <th className="num">With robots.txt</th>
                <th className="num">Block any AI</th>
                <th className="num">llms.txt</th>
              </tr>
            </thead>
            <tbody>
              {R.tiers.map((t) => (
                <tr key={t.tier}>
                  <td className="strong">{t.tier}</td>
                  <td className="num">{fmtNumber(t.sites)}</td>
                  <td className="num">{fmtNumber(t.withRobots)}</td>
                  <td className="num">{t.blocksAnyAiPct}%</td>
                  <td className="num">{t.llmsTxtPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-16" aria-labelledby="deeper">
        <h2 id="deeper" className="section-title mb-4">
          Deeper findings
        </h2>
      </section>
      <GroupedHBarChart
        title="Training crawlers are blocked about twice as often as answer crawlers"
        series={["Training", "Search / index", "User-triggered"]}
        groups={[
          { label: "OpenAI", values: [pct("GPTBot"), pct("OAI-SearchBot"), pct("ChatGPT-User")] },
          { label: "Anthropic", values: [pct("ClaudeBot"), pct("Claude-SearchBot"), pct("Claude-User")] },
          { label: "Perplexity", values: [null, pct("PerplexityBot"), pct("Perplexity-User")] },
          { label: "Meta", values: [pct("Meta-ExternalAgent"), pct("meta-webindexer"), pct("Meta-ExternalFetcher")] },
          { label: "Mistral", values: [pct("MistralAI-Training"), pct("MistralAI-Index"), pct("MistralAI-User")] },
        ]}
        format={(v) => `${v}%`}
        caption="Share of sites blocking each operator's bots. Publishers refuse to be training data far more often than they refuse to be cited."
      />
      <HBarChart
        title={`Of ${fmtNumber(I.leak.gptBlockers)} sites blocking GPTBot, share leaving each other training crawler open`}
        items={Object.entries(I.leak.openPct)
          .sort((a, b) => b[1] - a[1])
          .map(([label, value]) => ({ label, value }))}
        format={(v) => `${v}%`}
        max={100}
        labelWidth={230}
        caption="Excludes sites that block every bot with a wildcard rule."
      />
      <HBarChart
        title="Share of sites blocking at least one AI crawler, by top-level domain"
        items={I.tld.map((t) => ({ label: `${t.tld} (n=${t.n})`, value: t.blocksAnyPct, highlight: [".fr", ".de"].includes(t.tld) }))}
        format={(v) => `${v}%`}
        labelWidth={150}
        caption="Top-level domains with at least 60 sites in the sample."
      />
      <HBarChart
        title={`How ${fmtNumber(R.sample.withRobots)} robots.txt files treat AI`}
        items={Object.entries(I.typology)
          .sort((a, b) => b[1] - a[1])
          .map(([label, value]) => ({ label, value }))}
        format={(v) => `${fmtNumber(v)} · ${((100 * v) / R.sample.withRobots).toFixed(1)}%`}
        labelWidth={280}
      />
      <div className="article">
        <h3>Most AI blocklists are copied</h3>
        <p>
          {I.templateShare}% of AI blocklists with five or more entries are shared, character for
          character, by at least three sites. The most common one, a {I.topTemplate.size}-bot
          list on {fmtNumber(I.topTemplate.sites)} sites, is Cloudflare&apos;s managed robots.txt: the
          web&apos;s most widely deployed AI policy is a CDN default. {fmtNumber(I.contentSignal.sites)}{" "}
          sites ({I.contentSignal.pct}%) publish Cloudflare-style <code>Content-Signal</code> lines,
          most often <code>search=yes</code> and <code>ai-train=no</code>.
        </p>
        <h3>Many rules target bots that no longer exist</h3>
        <p>
          {I.legacyInLists}% of AI blocklists with three or more entries include a legacy Anthropic
          token (<code>anthropic-ai</code> or <code>Claude-Web</code>). {I.zombieStrict.n} sites
          block a legacy token but leave ClaudeBot, Anthropic&apos;s current crawler, open, including{" "}
          {I.zombieStrict.examples.slice(0, 5).join(", ")}. {I.nonAsciiTokens.sites} sites, including
          chatgpt.com and academia.edu, write <code>Perplexity‑User</code> with a non-breaking hyphen
          (U+2011), so the rule never matches.
        </p>
        <h3>llms.txt sites rarely block AI</h3>
        <p>
          Only {I.llmsContradiction.blockGPTBot}% of sites that publish an llms.txt block GPTBot,
          against {I.llmsContradiction.baselineBlockGPTBot}% of all sites. The web is splitting into
          publishers who build walls and product companies who lay out welcome mats.
        </p>
        <h3>Google-Extended doesn&apos;t do what most sites think</h3>
        <p>
          {fmtNumber(I.googleExtended.blockers)} sites block Google-Extended;{" "}
          {I.googleExtended.googlebotAlsoBlocked} of them also blocks Googlebot. Google-Extended
          controls Gemini training and grounding, not AI Overviews or AI Mode, so almost all of
          those sites still appear in Google&apos;s AI answers.
        </p>
      </div>

      <section className="mt-16" aria-labelledby="sites">
        <h2 id="sites" className="section-title mb-4">
          AI policies of the top 1,000 sites
        </h2>
        <TableFilter tableId="sites-table" placeholder="Find a domain or bot…" total={top.length} />
      </section>
      <div className="bleed table-wrap">
        <table id="sites-table" className="data-table">
          <caption>Top-1,000 domains that block at least one AI crawler or publish an llms.txt.</caption>
          <thead>
            <tr>
              <th className="num">Rank</th>
              <th>Domain</th>
              <th>Blocks</th>
              <th>Explicitly allows</th>
              <th>llms.txt</th>
            </tr>
          </thead>
          <tbody>
            {top.map((s) => (
              <tr key={s.domain}>
                <td className="num">{s.rank}</td>
                <td className="strong">{s.domain}</td>
                <td className="mono text-[0.78rem]">
                  {s.blocks.length > 12 ? `${s.blocks.slice(0, 12).join(", ")} +${s.blocks.length - 12} more` : s.blocks.join(", ") || "—"}
                </td>
                <td className="mono text-[0.78rem]">{s.allows.join(", ") || "—"}</td>
                <td>{s.llmsTxt ? "Yes" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="article mt-16">
        <h2>Method</h2>
        <p>
          The sample is the top {N} domains of the Tranco research ranking, downloaded{" "}
          {fmtMonth(R.sample.listDate)}. For each domain I requested <code>/robots.txt</code> and{" "}
          <code>/llms.txt</code> over HTTPS (falling back to <code>www.</code>), with a clearly
          identified research user agent. {fmtNumber(R.sample.withRobots)} domains returned a valid
          robots.txt; the rest are mostly API, CDN and tracking hostnames that serve no website.
        </p>
        <p>
          Files were parsed per RFC 9309: a bot is governed by the group naming it (version
          suffixes ignored), otherwise by the <code>*</code> group, and counts as blocked when that
          group disallows <code>/</code> without a root-level Allow. An llms.txt counts only when it
          returns 200 at the exact path, is not HTML, and contains Markdown structure. The bot list
          combines my documented crawler set with the{" "}
          <a href="https://github.com/ai-robots-txt/ai.robots.txt">ai.robots.txt</a> registry.
          More in the <Link href="/data/methodology">methodology</Link>.
        </p>
      </section>

      <AboutDataset
        download="robots-txt-study"
        what={<p>The robots.txt and llms.txt files of the {N} most popular domains in the Tranco research ranking, fetched on {fmtMonth(R.fetchedAt)}, and how each file treats {fmtNumber(R.bots.length)} AI crawlers and user agents. The download lists the AI policy of every top-1,000 site that blocks an AI bot or publishes an llms.txt; the per-bot and per-tier aggregates are on this page.</p>}
        how={<p>Each domain was requested over HTTPS (with a <code>www.</code> fallback) using an identified research user agent. Files were parsed per RFC 9309: a bot follows the group naming it (version suffixes ignored), otherwise the <code>*</code> group, and is blocked when that group disallows <code>/</code> without a root-level Allow.</p>}
        limits={<p>robots.txt states intent; it doesn&apos;t enforce anything, and many sites also block bots at the firewall. {fmtNumber(R.sample.domains - R.sample.withRobots)} domains returned no valid robots.txt, mostly API, CDN and tracking hostnames. Partial blocks (specific paths only) are not counted as blocks.</p>}
        fields={[
          { name: "rank", description: "Position in the Tranco list" },
          { name: "domain", description: "Registered domain" },
          { name: "blocks", description: "AI crawler tokens the site explicitly and fully disallows" },
          { name: "allows", description: "Documented AI crawlers the site names without blocking" },
          { name: "llmsTxt", description: "Whether the site serves a valid llms.txt" },
        ]}
      />
      <Faq items={FAQ} />
      <RelatedResearch dataset="robots-txt-study" />
      <CiteThis title={`Who blocks AI crawlers? robots.txt study of the top ${N} sites`} path={PATH} updated={R.updated} />
    </>
  );
}
