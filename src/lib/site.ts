export const SITE_URL = "https://kuldeep.cc";

export const SITE = {
  name: "Kuldeep Paul",
  title: "Kuldeep Paul",
  tagline: "Marketing, AI, and systems that compound.",
  description:
    "Kuldeep Paul is Head of Marketing at Maxim AI. Writing on AI-native marketing, distribution, and data-driven growth systems.",
  twitterHandle: "@don_fedora",
  social: {
    x: "https://x.com/don_fedora",
    linkedin: "https://www.linkedin.com/in/kuldeep-paul/",
    email: "mailto:mail@kuldeep.cc",
  },
} as const;

export function canonicalPath(path: string = "/"): string {
  return new URL(path, SITE_URL).toString();
}

interface PageMetaInput {
  title?: string;
  description?: string;
  path: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
  };
}

/**
 * Consistent per-page SEO tags. Next.js replaces `alternates`, `openGraph`,
 * and `twitter` wholesale on override (no deep merge), so every page that
 * customizes any of them must go through this helper or it silently loses
 * the og:image, RSS alternate link, and site-level Twitter attribution.
 */
export function pageMeta({ title, description, path, article }: PageMetaInput) {
  const url = canonicalPath(path);
  const desc = description ?? SITE.description;
  const ogTitle = title ?? SITE.title;
  return {
    ...(title ? { title } : {}),
    description: desc,
    alternates: {
      canonical: url,
      types: {
        "application/rss+xml": "/feed.xml",
      },
    },
    openGraph: {
      type: article ? ("article" as const) : ("website" as const),
      url,
      siteName: SITE.name,
      locale: "en_US",
      title: ogTitle,
      description: desc,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE.name }],
      ...(article
        ? { publishedTime: article.publishedTime, modifiedTime: article.modifiedTime, authors: [SITE.name] }
        : {}),
    },
    twitter: {
      card: "summary_large_image" as const,
      site: SITE.twitterHandle,
      creator: SITE.twitterHandle,
      title: ogTitle,
      description: desc,
      images: ["/og.png"],
    },
  };
}
