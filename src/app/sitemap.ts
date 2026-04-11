import { MetadataRoute } from "next";
import { getBlogPosts, getCaseStudies } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://kuldeep.cc";

  // Get all blog posts and case studies
  const blogPosts = await getBlogPosts();
  const caseStudies = await getCaseStudies();

  // Generate blog post URLs
  const blogUrls = blogPosts.map((post) => ({
    url: `${baseUrl}/journal/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Generate case study URLs
  const caseStudyUrls = caseStudies.map((study) => ({
    url: `${baseUrl}/case-studies/${study.slug}`,
    lastModified: new Date(study.date),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Static pages
  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/journal`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/case-studies`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
  ];

  return [...staticUrls, ...blogUrls, ...caseStudyUrls];
}
