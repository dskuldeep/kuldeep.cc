#!/usr/bin/env tsx
/**
 * Build script to generate content data from markdown files.
 * This allows content to be bundled with the app for Cloudflare Workers deployment.
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  tags: string[];
  content: string;
}

interface CaseStudy {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string;
}

const contentDirectory = path.join(process.cwd(), "content");

function generateBlogPosts(): BlogPost[] {
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
        excerpt: data.excerpt || data.description,
        date: data.date,
        readingTime,
        tags: data.tags || [],
        content,
      };
    });

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

function generateCaseStudies(): CaseStudy[] {
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

// Generate the data
const blogPosts = generateBlogPosts();
const caseStudies = generateCaseStudies();

// Write to generated directory
const generatedDir = path.join(process.cwd(), "src", "data", "generated");
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

const output = {
  blogPosts,
  caseStudies,
  generatedAt: new Date().toISOString(),
};

fs.writeFileSync(
  path.join(generatedDir, "content-data.json"),
  JSON.stringify(output, null, 2)
);

console.log(`✓ Generated content data:`);
console.log(`  - ${blogPosts.length} blog posts`);
console.log(`  - ${caseStudies.length} case studies`);
