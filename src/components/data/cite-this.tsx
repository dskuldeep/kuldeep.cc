import Link from "next/link";
import { CopyButton } from "@/components/data/copy-button";
import { fmtMonth } from "@/lib/data";
import { canonicalPath, SITE } from "@/lib/site";

const LICENSE = "https://creativecommons.org/licenses/by/4.0/";

/** Citation strings for a dataset page, in the formats writers and researchers ask for. */
export function citations(title: string, path: string, updated: string) {
  const url = canonicalPath(path);
  const year = updated.slice(0, 4);
  const d = new Date(`${updated}T00:00:00Z`);
  const long = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const key = `paul${year}${path.split("/").filter(Boolean).pop()?.replace(/[^a-z0-9]/gi, "") ?? "data"}`;
  return {
    apa: `Paul, K. (${year}). ${title} [Data set]. kuldeep.cc. ${url}`,
    mla: `Paul, Kuldeep. "${title}." kuldeep.cc, ${long}, ${url}.`,
    chicago: `Paul, Kuldeep. ${year}. "${title}." Dataset. kuldeep.cc. Updated ${fmtMonth(updated)}. ${url}.`,
    bibtex: `@misc{${key},\n  author = {Paul, Kuldeep},\n  title = {${title}},\n  year = {${year}},\n  howpublished = {\\url{${url}}},\n  note = {Dataset, CC BY 4.0, updated ${updated}}\n}`,
    html: `<a href="${url}">${title}</a> (data: ${SITE.name}, kuldeep.cc)`,
    inline: `according to ${SITE.name}'s ${title} (kuldeep.cc)`,
  };
}

/**
 * Citation rules plus ready-made citations. Gives writers, researchers and
 * the LLMs drafting for them an attribution with a link back, which is how a
 * dataset earns citations.
 */
export function CiteThis({ title, path, updated }: { title: string; path: string; updated: string }) {
  const c = citations(title, path, updated);
  const formats: [string, string][] = [
    ["APA", c.apa],
    ["MLA", c.mla],
    ["Chicago", c.chicago],
    ["BibTeX", c.bibtex],
    ["HTML link", c.html],
  ];
  return (
    <section className="mt-20" aria-labelledby="cite">
      <h2 id="cite" className="section-title mb-4">
        How to cite this data
      </h2>
      <div className="article">
        <p>
          This dataset is free to use, including commercially, under{" "}
          <a href={LICENSE} rel="license">
            Creative Commons Attribution 4.0
          </a>
          . The one rule is attribution:
        </p>
        <ol>
          <li>
            <strong>Credit the source</strong> as &ldquo;{SITE.name}, kuldeep.cc&rdquo; wherever you
            use a figure, chart or table from it.
          </li>
          <li>
            <strong>Link to this page</strong> ({canonicalPath(path)}), not to the download file, so
            readers can check the source of every number.
          </li>
          <li>
            <strong>Include the date.</strong> These figures change; say &ldquo;as of{" "}
            {fmtMonth(updated)}&rdquo; or link to the version you used.
          </li>
          <li>
            <strong>Mark changes.</strong> If you filter, recalculate or chart the data yourself,
            say so (&ldquo;analysis based on data from…&rdquo;).
          </li>
          <li>
            <strong>Cite the original source for single figures</strong> when you quote one
            reported number; it is linked in every row.
          </li>
        </ol>
        <p>
          In running text: <em>{c.inline}</em>. More in the{" "}
          <Link href="/data/methodology#licence">methodology</Link>.
        </p>
      </div>
      {formats.map(([label, text]) => (
        <div key={label} className="cite-row">
          <div className="flex-1 min-w-0">
            <p className="meta mb-1">{label}</p>
            <p className="cite-format">{text}</p>
          </div>
          <CopyButton text={text} label="Copy" />
        </div>
      ))}
    </section>
  );
}
