import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/content";
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

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/writing/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : undefined,
    changeFrequency: "yearly",
    priority: 0.8,
  }));

  return [...staticPages, ...postPages];
}
