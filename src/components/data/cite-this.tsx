import { CopyButton } from "@/components/data/copy-button";
import { fmtMonth } from "@/lib/data";
import { canonicalPath, SITE } from "@/lib/site";

/**
 * "Cite this dataset" block. Gives writers (and the LLMs drafting for them) a
 * ready-made attribution with a link, which is how a dataset earns citations.
 */
export function CiteThis({ title, path, updated }: { title: string; path: string; updated: string }) {
  const url = canonicalPath(path);
  const year = updated.slice(0, 4);
  const text = `${SITE.name} (${year}). ${title}. kuldeep.cc. Updated ${fmtMonth(updated)}. ${url}`;
  const html = `<a href="${url}">${title}</a> — data compiled by ${SITE.name}, kuldeep.cc`;
  return (
    <section className="mt-20" aria-labelledby="cite">
      <h2 id="cite" className="section-title mb-4">
        Cite this data
      </h2>
      <p className="text-[0.95rem] text-[var(--muted)]">
        Free to use under{" "}
        <a className="link" href="https://creativecommons.org/licenses/by/4.0/" rel="license">
          CC BY 4.0
        </a>
        . Please credit and link to this page.
      </p>
      <div className="cite-row mt-4">
        <p className="cite-text">{text}</p>
        <CopyButton text={text} label="Copy citation" />
      </div>
      <div className="cite-row mt-3">
        <p className="cite-text font-mono text-[0.8rem]">{html}</p>
        <CopyButton text={html} label="Copy HTML link" />
      </div>
    </section>
  );
}
