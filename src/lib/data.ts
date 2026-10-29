import advertisersJson from "@/data/chatgpt-ads-advertisers.json";
import benchmarksJson from "@/data/chatgpt-ads-benchmarks.json";
import timelineJson from "@/data/chatgpt-ads-timeline.json";
import crawlersJson from "@/data/ai-crawlers.json";
import enginesJson from "@/data/ai-engines.json";
import referrersJson from "@/data/ai-referrers.json";
import robotsJson from "@/data/robots-study.json";
import usersJson from "@/data/ai-user-numbers.json";
import insightsJson from "@/data/insights.json";
import { dcExisting, dcNew } from "@/lib/datacenters";

/**
 * Datasets behind /data. Sources are versioned JSON in src/data, regenerated
 * from the research pipeline and shipped with the code, so pages render
 * without D1 and every number on a page matches the downloadable file.
 */

// ---------- types

export interface Benchmark {
  id: number;
  metric: string;
  value: string;
  low: number;
  high: number;
  currency: string | null;
  measuredBy: string;
  context: string;
  sourceType: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceDomain: string;
  published: string | null;
  citedBy: number;
}

export interface MetricSummary {
  median: number;
  n: number;
  min: number;
  max: number;
}

export interface TimelineEvent {
  id: number;
  date: string;
  title: string;
  detail: string;
  type: string;
  sourceUrl: string | null;
  sourceDomain: string;
}

export interface Advertiser {
  id: number;
  brand: string;
  category: string;
  market: string | null;
  evidence: string;
  sourceUrl: string;
  sourceDomain: string;
  firstReported: string | null;
  sources: number;
}

export interface Engine {
  slug: string;
  name: string;
  operator: string;
  kind: string;
  launched: string;
  search_launched?: string;
  index: string;
  index_sources: string[];
  crawlers: string[];
  referrers: string[];
  utm: string | null;
  utm_source: string | null;
  ads: string;
  ads_source: string | null;
  docs: string | null;
  citations: string;
  notes: string;
}

export interface UserNumber {
  engine: string;
  metric: string;
  value: string;
  asOf: string;
  statedBy: string;
  sourceUrl: string;
}

export interface Referrer {
  host: string;
  product: string;
  operator: string;
  note: string;
}

export interface Crawler {
  token: string;
  slug: string;
  operator: string;
  purpose: "training" | "search" | "user" | "agent" | "ads" | "mixed";
  product: string;
  respectsRobots: string;
  userAgent: string | null;
  ipList: string | null;
  docs: string | null;
  summary: string;
}

export interface RegistryCrawler {
  token: string;
  operator: string | null;
  function: string | null;
  respectsRobots: string | null;
}

export interface BotBlockStat {
  token: string;
  slug: string | null;
  explicit: number;
  blocked: number;
  allowed: number;
  blockedPct: number;
  blockedTop1k: number;
}

export interface TierStat {
  tier: string;
  sites: number;
  withRobots: number;
  blocksAnyAi: number;
  blocksAnyAiPct: number;
  llmsTxt: number;
  llmsTxtPct: number;
}

export interface SitePolicy {
  rank: number;
  domain: string;
  blocks: string[];
  allows: string[];
  llmsTxt: boolean;
}

export interface RobotsStudy {
  updated: string;
  fetchedAt: string;
  sample: {
    list: string;
    listDate: string;
    domains: number;
    withRobots: number;
    withLlmsTxt: number;
  };
  headline: {
    blocksAnyAiPct: number;
    blocksAnyAi: number;
    blocksGptbotPct: number;
    splitSearchTrainingPct: number;
    splitSearchTraining: number;
    llmsTxtPct: number;
    mentionsAnyAiPct: number;
  };
  bots: BotBlockStat[];
  tiers: TierStat[];
  topSites: SitePolicy[];
  llmsTxtSites: { rank: number; domain: string }[];
}

// ---------- data

export const benchmarks = benchmarksJson as {
  updated: string;
  summary: {
    cpm: MetricSummary;
    cpc: MetricSummary;
    ctr: MetricSummary;
    cvr: MetricSummary;
    dataPoints: number;
    sources: number;
    mentionsReviewed: number;
  };
  rows: Benchmark[];
};
export const timeline = timelineJson as { updated: string; rows: TimelineEvent[] };
export const advertisers = advertisersJson as { updated: string; rows: Advertiser[] };
export const engines = enginesJson as { updated: string; rows: Engine[] };
export const userNumbers = usersJson as { updated: string; rows: UserNumber[] };
export const referrers = referrersJson as { updated: string; rows: Referrer[] };
export const crawlers = crawlersJson as {
  updated: string;
  featured: Crawler[];
  registry: RegistryCrawler[];
  registrySource: string;
};
export const robotsStudy = robotsJson as RobotsStudy;

export interface Insights {
  ads: {
    cpcByMonth: { month: string; median: number | null; n: number }[];
    cpmByMonth: { month: string; median: number | null; n: number }[];
    ctrDistribution: { label: string; count: number }[];
    countriesByMonth: { month: string; countries: number }[];
    advertisersFirstReported: { month: string; count: number }[];
    minimumSpend: { date: string; label: string; usd: number }[];
  };
  robots: {
    leak: { gptBlockers: number; openPct: Record<string, number>; anyMajorOpenPct: number };
    blocksAllMajorTraining: { n: number; pctOfRobots: number; pctOfGptBlockers: number };
    typology: Record<string, number>;
    tld: { tld: string; n: number; blocksAnyPct: number; gptPct: number }[];
    contentSignal: { sites: number; pct: number; values: Record<string, number> };
    llmsContradiction: { llmsWithRobots: number; blockGPTBot: number; blockAnyTraining: number; baselineBlockGPTBot: number; examples: string[] };
    listLength: { n: number; median: number; p90: number; max: number; dist: Record<string, number> };
    templateShare: number;
    legacyInLists: number;
    zombieStrict: { n: number; pct: number; examples: string[] };
    nonAsciiTokens: { sites: number; examples: string[] };
    starBlock: { n: number; pct: number };
    googleExtended: { blockers: number; googlebotAlsoBlocked: number };
    topTemplate: { size: number; sites: number };
  };
}
export const insights = insightsJson as Insights;

/** Short month label ("Apr") for a YYYY-MM key. */
export function monthLabel(ym: string): string {
  return new Date(`${ym}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
}

export function researchFor(dataset: string): string[] {
  return RESEARCH.filter((r) => r.datasets.includes(dataset)).map((r) => r.slug);
}

/** Research posts (stored in D1, listed here) that analyse the datasets. */
export const RESEARCH: { slug: string; title: string; summary: string; datasets: string[] }[] = [
  {
    slug: "who-blocks-ai-crawlers-robots-txt-study",
    title: "Who blocks AI crawlers? What 10,000 robots.txt files reveal",
    summary: "Publishers block training, not answers; half of all blocklists leak; Cloudflare writes the most common AI policy.",
    datasets: ["robots-txt-study", "ai-crawlers"],
  },
  {
    slug: "chatgpt-ads-the-4-dollar-click",
    title: "The $4 click: what 184 data points reveal about ChatGPT Ads",
    summary: "CPC anchored to OpenAI's recommended bid, CPM and CPC converging, and a $250K club turned $25-a-day long tail.",
    datasets: ["chatgpt-ads-benchmarks", "chatgpt-ads-advertisers", "chatgpt-ads-timeline"],
  },
  {
    slug: "ai-search-opt-out-asymmetry",
    title: "The opt-out asymmetry: you can block the small AI engines, not the big one",
    summary: "The AI surfaces with the most users are the ones publishers can't refuse and can't measure.",
    datasets: ["ai-engines", "ai-user-numbers", "robots-txt-study", "ai-referrers", "ai-crawlers"],
  },
];

export function getEngine(slug: string): Engine | undefined {
  return engines.rows.find((e) => e.slug === slug);
}

export function getCrawler(slug: string): Crawler | undefined {
  return crawlers.featured.find((c) => c.slug === slug);
}

/** Crawler page slug for a token, if a dedicated page exists. */
export function crawlerSlug(token: string): string | null {
  const hit = crawlers.featured.find((c) => c.token.toLowerCase() === token.toLowerCase());
  return hit ? hit.slug : null;
}

export function botStat(token: string): BotBlockStat | undefined {
  return robotsStudy.bots.find((b) => b.token.toLowerCase() === token.toLowerCase());
}

export const PURPOSE_LABEL: Record<Crawler["purpose"], string> = {
  training: "Model training",
  search: "AI search index",
  user: "User-triggered fetch",
  agent: "AI agent",
  ads: "Ad verification",
  mixed: "Mixed / general",
};

/** GA4 / Looker regex matching every referrer host in the dataset. */
export function referrerRegex(): string {
  const hosts = referrers.rows
    .map((r) => r.host.split("/")[0])
    .filter((h, i, all) => all.indexOf(h) === i)
    .map((h) => h.replace(/\./g, "\\."));
  return `^(.*\\.)?(${hosts.join("|")})$`;
}

// ---------- registry of datasets (drives /data, sitemap, llms.txt, downloads)

export interface DatasetEntry {
  slug: string;
  path: string;
  title: string;
  description: string;
  records: number;
  updated: string;
  group: "ChatGPT Ads Index" | "AI Search Reference" | "AI Infrastructure";
  download?: string;
  /** Downloads default to CC BY 4.0; set for data that keeps its upstream licence. */
  license?: string;
}

export const DATASETS: DatasetEntry[] = [
  {
    slug: "chatgpt-ads-benchmarks",
    path: "/data/chatgpt-ads/benchmarks",
    title: "ChatGPT Ads benchmarks",
    description:
      "Every publicly reported ChatGPT Ads CPM, CPC, CTR, conversion rate, ROAS and minimum spend, deduplicated and linked to its source.",
    records: benchmarks.rows.length,
    updated: benchmarks.updated,
    group: "ChatGPT Ads Index",
    download: "chatgpt-ads-benchmarks",
  },
  {
    slug: "chatgpt-ads-timeline",
    path: "/data/chatgpt-ads/timeline",
    title: "ChatGPT Ads timeline",
    description:
      "Dated changelog of ads in ChatGPT: announcements, pricing changes, country launches, formats, tools and policy.",
    records: timeline.rows.length,
    updated: timeline.updated,
    group: "ChatGPT Ads Index",
    download: "chatgpt-ads-timeline",
  },
  {
    slug: "chatgpt-ads-advertisers",
    path: "/data/chatgpt-ads/advertisers",
    title: "Brands advertising on ChatGPT",
    description:
      "Advertisers publicly reported as running ChatGPT ads, with category, market and the source that reported them.",
    records: advertisers.rows.length,
    updated: advertisers.updated,
    group: "ChatGPT Ads Index",
    download: "chatgpt-ads-advertisers",
  },
  {
    slug: "ai-engines",
    path: "/data/ai-search",
    title: "AI search engine reference",
    description:
      "How ChatGPT, Gemini, AI Overviews, AI Mode, Perplexity, Claude, Copilot and 11 more AI engines find, cite and send traffic.",
    records: engines.rows.length,
    updated: engines.updated,
    group: "AI Search Reference",
    download: "ai-engines",
  },
  {
    slug: "ai-crawlers",
    path: "/data/ai-search/crawlers",
    title: "AI crawler directory",
    description:
      "Every known AI crawler and user agent: operator, purpose, robots.txt behaviour, user-agent string and IP list.",
    records: crawlers.featured.length + crawlers.registry.length,
    updated: crawlers.updated,
    group: "AI Search Reference",
    download: "ai-crawlers",
  },
  {
    slug: "robots-txt-study",
    path: "/data/ai-search/robots-txt-study",
    title: "Who blocks AI crawlers? robots.txt study",
    description:
      "Original analysis of the robots.txt and llms.txt files of the 10,000 most popular websites.",
    records: robotsStudy.sample.domains,
    updated: robotsStudy.updated,
    group: "AI Search Reference",
    download: "robots-txt-study",
  },
  {
    slug: "ai-referrers",
    path: "/data/ai-search/referrers",
    title: "AI referrer domains for analytics",
    description:
      "Referrer hostnames and UTM parameters for AI assistants, with a ready-to-paste GA4 regex.",
    records: referrers.rows.length,
    updated: referrers.updated,
    group: "AI Search Reference",
    download: "ai-referrers",
  },
  {
    slug: "ai-user-numbers",
    path: "/data/ai-search/user-numbers",
    title: "AI assistant user numbers",
    description:
      "Officially stated user counts for ChatGPT, Gemini, AI Overviews, AI Mode and other AI engines, dated and sourced.",
    records: userNumbers.rows.length,
    updated: userNumbers.updated,
    group: "AI Search Reference",
    download: "ai-user-numbers",
  },
  {
    slug: "datacenter-projects",
    path: "/data/datacenters",
    title: "New data center projects",
    description:
      "AI and hyperscale data center campuses announced or under construction worldwide since 2024: developer, location, MW, investment, status and sources.",
    records: dcNew.rows.length,
    updated: dcNew.updated,
    group: "AI Infrastructure",
    download: "datacenter-projects",
  },
  {
    slug: "datacenters-osm",
    path: "/data/datacenters/existing",
    title: "Map of existing data centers",
    description:
      "Every data center mapped in OpenStreetMap, with operator and country, on one interactive world map.",
    records: dcExisting.rows.length,
    updated: dcExisting.updated,
    group: "AI Infrastructure",
    download: "datacenters-osm",
    license: "ODbL 1.0, © OpenStreetMap contributors — https://opendatacommons.org/licenses/odbl/1-0/",
  },
];

export function datasetBySlug(slug: string): DatasetEntry | undefined {
  return DATASETS.find((d) => d.slug === slug);
}

/** Flat rows for CSV/JSON downloads, keyed by DatasetEntry.download. */
export function downloadRows(slug: string): Record<string, unknown>[] | null {
  switch (slug) {
    case "chatgpt-ads-benchmarks":
      return benchmarks.rows.map((r) => ({ ...r }));
    case "chatgpt-ads-timeline":
      return timeline.rows.map((r) => ({ ...r }));
    case "chatgpt-ads-advertisers":
      return advertisers.rows.map((r) => ({ ...r }));
    case "ai-engines":
      return engines.rows.map((e) => ({
        slug: e.slug,
        name: e.name,
        operator: e.operator,
        kind: e.kind,
        launched: e.launched,
        searchIndex: e.index,
        crawlers: e.crawlers.join(" "),
        referrers: e.referrers.join(" "),
        utm: e.utm ?? "",
        ads: e.ads,
        docs: e.docs ?? "",
        sources: e.index_sources.join(" "),
      }));
    case "ai-crawlers":
      return [
        ...crawlers.featured.map((c) => ({
          token: c.token,
          operator: c.operator,
          purpose: c.purpose,
          product: c.product,
          respectsRobots: c.respectsRobots,
          userAgent: c.userAgent ?? "",
          ipList: c.ipList ?? "",
          docs: c.docs ?? "",
          source: "kuldeep.cc (official documentation)",
        })),
        ...crawlers.registry.map((c) => ({
          token: c.token,
          operator: c.operator ?? "",
          purpose: c.function ?? "",
          product: "",
          respectsRobots: c.respectsRobots ?? "",
          userAgent: "",
          ipList: "",
          docs: "",
          source: "ai.robots.txt (MIT)",
        })),
      ];
    case "robots-txt-study":
      return robotsStudy.topSites.map((s) => ({
        rank: s.rank,
        domain: s.domain,
        blocks: s.blocks.join(" "),
        allows: s.allows.join(" "),
        llmsTxt: s.llmsTxt,
      }));
    case "ai-referrers":
      return referrers.rows.map((r) => ({ ...r }));
    case "ai-user-numbers":
      return userNumbers.rows.map((r) => ({ ...r }));
    case "datacenter-projects":
      return dcNew.rows.map(({ sources, ...p }) => ({
        ...p,
        sources: sources.map((x) => x.url).join(" "),
      }));
    case "datacenters-osm":
      // Named sites first within each country, so the file doesn't open on a run of blank names
      return [...dcExisting.rows]
        .sort((a, b) => a[4].localeCompare(b[4]) || Number(!a[2]) - Number(!b[2]) || a[2].localeCompare(b[2]))
        .map(([lng, lat, name, operator, country, osm]) => ({
        name,
        operator,
        country,
        lat,
        lng,
        osm: `https://www.openstreetmap.org/${osm}`,
      }));
    default:
      return null;
  }
}

// ---------- formatting helpers

export function fmtMonth(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!m) return y;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d || 1)));
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    ...(d ? { day: "numeric" } : {}),
    timeZone: "UTC",
  });
}

export function fmtNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
