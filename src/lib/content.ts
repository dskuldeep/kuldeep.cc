import fs from "fs";
import path from "path";
import matter from "gray-matter";
import contentData from "@/data/generated/content-data.json";

const contentDirectory = path.join(process.cwd(), "content");

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
  try {
    const fullPath = path.join(contentDirectory, "case-studies", `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title,
      description: data.description,
      date: data.date,
      tags: data.tags || [],
      content,
    };
  } catch {
    return null;
  }
}

export function getBlogPosts(): BlogPostListItem[] {
  return contentData.blogPosts;
}

export function getBlogPost(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(contentDirectory, "blog", `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const readingTime = `${Math.ceil(content.split(/\s+/).length / 200)} min read`;

    return {
      slug,
      title: data.title,
      excerpt: data.excerpt,
      date: data.date,
      readingTime,
      tags: data.tags || [],
      content,
    };
  } catch {
    return null;
  }
}
