import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDirectory = path.join(process.cwd(), "content");

export interface CaseStudy {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  tags: string[];
  content: string;
}

export function getCaseStudies(): CaseStudy[] {
  const caseStudiesDirectory = path.join(contentDirectory, "case-studies");

  if (!fs.existsSync(caseStudiesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(caseStudiesDirectory);
  const caseStudies = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(caseStudiesDirectory, fileName);
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
    });

  return caseStudies.sort((a, b) => (a.date > b.date ? -1 : 1));
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

export function getBlogPosts(): BlogPost[] {
  const blogDirectory = path.join(contentDirectory, "blog");

  if (!fs.existsSync(blogDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(blogDirectory);
  const posts = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(blogDirectory, fileName);
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
    });

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
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
