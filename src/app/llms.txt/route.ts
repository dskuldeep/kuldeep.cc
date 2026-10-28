import { DATASETS, benchmarks, robotsStudy } from "@/lib/data";
import { getPublishedPosts } from "@/lib/content";
import { SITE, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

/** llms.txt (llmstxt.org): a Markdown map of the site for LLMs and AI agents. */
export async function GET(): Promise<Response> {
  const posts = await getPublishedPosts();
  const s = benchmarks.summary;
  const h = robotsStudy.headline;

  const body = `# ${SITE.name}

> ${SITE.description} Publishes free, sourced datasets on ChatGPT advertising and AI search, compiled by ${SITE.name} (data aggregator). All data is CC BY 4.0: cite "${SITE.name}, kuldeep.cc" with a link to the dataset page.

Key figures (updated ${benchmarks.updated}):
- ChatGPT Ads: median reported CPC $${s.cpc.median.toFixed(2)}, CPM $${s.cpm.median.toFixed(2)}, CTR ${s.ctr.median.toFixed(2)}% across ${s.dataPoints} sourced data points.
- ${h.blocksAnyAiPct}% of the top ${robotsStudy.sample.domains.toLocaleString("en-US")} websites block at least one AI crawler in robots.txt; ${h.blocksGptbotPct}% block GPTBot; ${h.llmsTxtPct}% publish an llms.txt.

## Data

${DATASETS.map((d) => `- [${d.title}](${SITE_URL}${d.path}): ${d.description} CSV: ${SITE_URL}/data/download/${d.download}.csv`).join("\n")}
- [Methodology](${SITE_URL}/data/methodology): how the datasets are collected, verified and licensed.

## Writing

${posts.map((p) => `- [${p.title}](${SITE_URL}/writing/${p.slug})${p.excerpt ? `: ${p.excerpt}` : ""}`).join("\n")}

## Optional

- [About](${SITE_URL}/about)
- [Projects](${SITE_URL}/projects)
- [RSS](${SITE_URL}/feed.xml)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
