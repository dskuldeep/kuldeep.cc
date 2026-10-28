import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/data/breadcrumbs";
import { CiteThis } from "@/components/data/cite-this";
import { CopyBlock } from "@/components/data/copy-block";
import { DatasetHeader } from "@/components/data/dataset-header";
import { Faq } from "@/components/data/faq";
import { JsonLd } from "@/components/json-ld";
import { AboutDataset, RelatedResearch } from "@/components/data/about-dataset";
import { referrerRegex, referrers, researchFor } from "@/lib/data";
import { breadcrumbNode, datasetNode, faqNode, graph } from "@/lib/schema";
import { pageMeta } from "@/lib/site";

const PATH = "/data/ai-search/referrers";
const TITLE = "AI referral traffic: referrer domains & GA4 regex";
const DESC = `Track AI referral traffic in GA4. ${referrers.rows.length} referrer hostnames for ChatGPT, Perplexity, Gemini, Copilot, Claude and more, plus a copy-paste regex and UTM notes.`;

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESC, path: PATH });

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Data", path: "/data" },
  { name: "AI Search Reference", path: "/data/ai-search" },
  { name: "AI referrers", path: PATH },
];

const FAQ = [
  {
    q: "How do I track ChatGPT traffic in GA4?",
    a: "In GA4, create a custom channel group with a channel called \"AI assistants\" whose condition is Session source matches regex, using the pattern on this page. Place it above Referral so AI sessions aren't counted there. ChatGPT also appends utm_source=chatgpt.com to cited links, so that source appears even when the referrer is stripped.",
  },
  {
    q: "Why does some AI traffic show up as direct?",
    a: "Mobile apps, in-app browsers (WhatsApp, Instagram, the ChatGPT and Gemini apps) and some desktop clients don't send a referrer. Those visits land in Direct. UTM tagging like ChatGPT's recovers part of it; the rest can only be estimated.",
  },
  {
    q: "Does Google AI Overviews or AI Mode traffic have its own referrer?",
    a: "No. Clicks from AI Overviews and AI Mode arrive as google.com and are reported with ordinary organic search traffic in GA4 and Search Console.",
  },
];

export default function ReferrersPage() {
  const regex = referrerRegex();

  const jsonLd = graph(
    datasetNode({
      research: researchFor("ai-referrers"),
      name: "AI referrer domains",
      description: DESC,
      path: PATH,
      keywords: ["AI referral traffic", "ChatGPT referral traffic GA4", "track AI traffic GA4", "AI traffic regex", "utm_source=chatgpt.com"],
      datePublished: "2026-10-29",
      dateModified: referrers.updated,
      downloads: [
        { format: "CSV", path: "/data/download/ai-referrers.csv" },
        { format: "JSON", path: "/data/download/ai-referrers.json" },
      ],
    }),
    faqNode(FAQ),
    breadcrumbNode(crumbs),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <Breadcrumbs crumbs={crumbs} />
      <DatasetHeader
        title="AI referrer domains"
        dek="The hostnames AI assistants send as referrers, so you can separate AI traffic from regular referrals in GA4, Looker Studio or any analytics tool."
        updated={referrers.updated}
        records={referrers.rows.length}
        recordLabel="referrer hosts"
        download="ai-referrers"
      />

      <section aria-labelledby="regex">
        <h2 id="regex" className="section-title mb-4">
          GA4 regex: all AI assistants
        </h2>
        <CopyBlock text={regex} label="Copy regex" />
        <p className="mt-4 max-w-[40rem] text-[0.95rem] text-[var(--muted)]">
          Use with <strong>Session source</strong> → <em>matches regex</em> in a custom channel
          group, ordered above Referral. UTM-tagged ChatGPT sessions report <code>chatgpt.com</code>{" "}
          as their source, so the same pattern catches them.
        </p>
      </section>

      <section className="mt-16" aria-labelledby="hosts">
        <h2 id="hosts" className="section-title mb-4">
          Referrer hosts
        </h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Referrer</th>
                <th>Product</th>
                <th>Operator</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {referrers.rows.map((r) => (
                <tr key={r.host}>
                  <td className="mono strong">{r.host}</td>
                  <td>{r.product}</td>
                  <td className="nowrap">{r.operator}</td>
                  <td className="text-[var(--muted)]">{r.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-10 text-[0.95rem]">
        See which{" "}
        <Link href="/data/ai-search" className="link">
          search index and crawlers
        </Link>{" "}
        sit behind each engine.
      </p>

      <section className="article mt-16">
        <h2>Setting up an AI channel in GA4</h2>
        <ol>
          <li>Go to <strong>Admin → Data display → Channel groups</strong> and copy the default channel group.</li>
          <li>Add a new channel named <em>AI assistants</em> with the condition <strong>Source</strong> matches regex, and paste the pattern above.</li>
          <li>Drag the new channel <strong>above Referral</strong>; GA4 assigns sessions to the first matching channel.</li>
          <li>Use the new group in Traffic acquisition reports and explorations. It applies retroactively to existing data.</li>
        </ol>
        <p>
          Google AI Overviews and AI Mode can&apos;t be separated this way: their clicks arrive as{" "}
          <code>google.com</code> and are counted as organic search.
        </p>
      </section>
      <AboutDataset
        download="ai-referrers"
        what={<p>Hostnames that AI assistants and answer engines send as the referrer when someone clicks a link in an answer, with the product and operator behind each.</p>}
        how={<p>Compiled from the operators&apos; documentation, analytics vendors&apos; AI-source lists and observed referrers, and cross-checked against the engine reference.</p>}
        limits={<p>Apps and in-app browsers often send no referrer, so some AI traffic always lands in Direct. Referrer policies change; re-check if a source suddenly drops to zero.</p>}
        fields={[
          { name: "host", description: "Referrer hostname (or host plus path) to match" },
          { name: "product", description: "AI product sending the traffic" },
          { name: "operator", description: "Company behind it" },
          { name: "note", description: "Caveats for analytics" },
        ]}
      />
      <Faq items={FAQ} />
      <RelatedResearch dataset="ai-referrers" />
      <CiteThis title="AI referrer domains" path={PATH} updated={referrers.updated} />
    </>
  );
}
