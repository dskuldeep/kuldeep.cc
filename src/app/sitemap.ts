import type { MetadataRoute } from "next";
import contentData from "@/data/generated/content-data.json";
import { getBlogPosts, getCaseStudies } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getBlogPosts();
  const caseStudies = getCaseStudies();
  const lastContentUpdate = new Date(contentData.generatedAt);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: lastContentUpdate,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/journal`,
      lastModified: lastContentUpdate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/case-studies`,
      lastModified: lastContentUpdate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const journalRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/journal/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  const caseStudyRoutes: MetadataRoute.Sitemap = caseStudies.map((study) => ({
    url: `${SITE_URL}/case-studies/${study.slug}`,
    lastModified: new Date(study.date),
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...journalRoutes, ...caseStudyRoutes];
}
