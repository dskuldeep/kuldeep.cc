import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/content";
import { crawlers, DATASETS, engines } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();

  const staticPages: MetadataRoute.Sitemap = [
    // Trailing slash matches the homepage's canonical URL exactly.
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/writing`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/projects`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const lastMod = (iso: string) => new Date(`${iso}T00:00:00Z`);
  const dataPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/data`, changeFrequency: "weekly", priority: 0.95 },
    { url: `${SITE_URL}/data/chatgpt-ads`, lastModified: lastMod(DATASETS[0].updated), changeFrequency: "weekly", priority: 0.95 },
    { url: `${SITE_URL}/data/methodology`, changeFrequency: "monthly", priority: 0.5 },
    ...DATASETS.filter((d) => d.path !== "/data/chatgpt-ads").map((d) => ({
      url: `${SITE_URL}${d.path}`,
      lastModified: lastMod(d.updated),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...engines.rows.map((e) => ({
      url: `${SITE_URL}/data/ai-search/${e.slug}`,
      lastModified: lastMod(engines.updated),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...crawlers.featured.map((c) => ({
      url: `${SITE_URL}/data/ai-search/crawlers/${c.slug}`,
      lastModified: lastMod(crawlers.updated),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/writing/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : undefined,
    changeFrequency: "yearly",
    priority: 0.8,
  }));

  return [...staticPages, ...dataPages, ...postPages];
}
