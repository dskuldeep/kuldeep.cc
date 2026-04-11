import contentData from "@/data/generated/content-data.json";

// List types (without content)
export interface CaseStudyListItem {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
}

export interface BlogPostListItem {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  tags: string[];
}

// Full types (with content)
export interface CaseStudy extends CaseStudyListItem {
  content: string;
}

export interface BlogPost extends BlogPostListItem {
  content: string;
}

export function getCaseStudies(): CaseStudyListItem[] {
  return contentData.caseStudies;
}

export function getCaseStudy(slug: string): CaseStudy | null {
  const study = contentData.caseStudies.find((s) => s.slug === slug);
  return study || null;
}

export function getBlogPosts(): BlogPostListItem[] {
  return contentData.blogPosts;
}

export function getBlogPost(slug: string): BlogPost | null {
  const post = contentData.blogPosts.find((p) => p.slug === slug);
  return post || null;
}
