import { canonicalPath, SITE, SITE_URL } from "@/lib/site";

/**
 * schema.org builders. Every page that emits JSON-LD references the same
 * Person and WebSite nodes by @id, so search engines and LLM crawlers resolve
 * one consistent author entity across posts and datasets.
 */

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const AUTHOR_ROLE = "Data aggregator and data scientist";

export function personNode() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE.name,
    url: SITE_URL,
    image: canonicalPath("/og.png"),
    jobTitle: "Head of Marketing",
    worksFor: { "@type": "Organization", name: "Maxim AI", url: "https://www.getmaxim.ai" },
    description: SITE.description,
    knowsAbout: [
      "Generative engine optimization",
      "AI search",
      "ChatGPT advertising",
      "Growth marketing",
      "Marketing data analysis",
      "Web crawlers",
    ],
    sameAs: [SITE.social.x, SITE.social.linkedin],
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE.name,
    description: SITE.description,
    inLanguage: "en-US",
    publisher: { "@id": PERSON_ID },
  };
}

/** Site-wide graph emitted once from the site layout. */
export function siteGraph() {
  return { "@context": "https://schema.org", "@graph": [personNode(), websiteNode()] };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbNode(crumbs: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: canonicalPath(c.path),
    })),
  };
}

export interface DatasetSchemaInput {
  name: string;
  description: string;
  path: string;
  keywords: string[];
  dateModified: string;
  datePublished: string;
  variableMeasured?: string[];
  temporalCoverage?: string;
  spatialCoverage?: string;
  downloads?: { format: "CSV" | "JSON"; path: string }[];
  isBasedOn?: string[];
  /** /writing slugs of research posts built on this dataset. */
  research?: string[];
  /** Upstream licence for data republished as-is (default: CC BY 4.0). */
  license?: { url: string; notice: string };
}

export function datasetNode(d: DatasetSchemaInput) {
  return {
    "@type": "Dataset",
    "@id": `${canonicalPath(d.path)}#dataset`,
    name: d.name,
    description: d.description,
    url: canonicalPath(d.path),
    keywords: d.keywords,
    datePublished: d.datePublished,
    dateModified: d.dateModified,
    inLanguage: "en-US",
    isAccessibleForFree: true,
    license: d.license?.url ?? "https://creativecommons.org/licenses/by/4.0/",
    creditText: `${SITE.name}, kuldeep.cc — ${d.name}`,
    copyrightHolder: { "@id": PERSON_ID },
    copyrightNotice: d.license?.notice ?? `© ${d.dateModified.slice(0, 4)} ${SITE.name}. Licensed under CC BY 4.0.`,
    usageInfo: canonicalPath("/data/methodology#licence"),
    creator: { "@id": PERSON_ID },
    author: { "@id": PERSON_ID },
    maintainer: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    includedInDataCatalog: {
      "@type": "DataCatalog",
      name: `${SITE.name} — Data`,
      url: canonicalPath("/data"),
    },
    ...(d.variableMeasured ? { variableMeasured: d.variableMeasured } : {}),
    ...(d.temporalCoverage ? { temporalCoverage: d.temporalCoverage } : {}),
    ...(d.spatialCoverage ? { spatialCoverage: d.spatialCoverage } : {}),
    ...(d.isBasedOn ? { isBasedOn: d.isBasedOn } : {}),
    ...(d.research?.length
      ? { subjectOf: d.research.map((slug) => ({ "@type": "BlogPosting", "@id": `${canonicalPath(`/writing/${slug}`)}#article`, url: canonicalPath(`/writing/${slug}`) })) }
      : {}),
    ...(d.downloads
      ? {
          distribution: d.downloads.map((x) => ({
            "@type": "DataDownload",
            encodingFormat: x.format === "CSV" ? "text/csv" : "application/json",
            contentUrl: canonicalPath(x.path),
          })),
        }
      : {}),
  };
}

export function faqNode(items: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
