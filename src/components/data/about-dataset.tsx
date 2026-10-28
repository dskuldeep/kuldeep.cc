import Link from "next/link";
import { RESEARCH } from "@/lib/data";

export interface Field {
  name: string;
  description: string;
}

/**
 * "About this dataset": what it covers, how it was built, its limits, and a
 * column dictionary for the CSV/JSON download.
 */
export function AboutDataset({
  what,
  how,
  limits,
  fields,
  download,
}: {
  what: React.ReactNode;
  how: React.ReactNode;
  limits: React.ReactNode;
  fields: Field[];
  download?: string;
}) {
  return (
    <section className="mt-20" aria-labelledby="about-dataset">
      <h2 id="about-dataset" className="section-title mb-4">
        About this dataset
      </h2>
      <div className="article">
        <h3>What it covers</h3>
        {what}
        <h3>How it was built</h3>
        {how}
        <h3>Limitations</h3>
        {limits}
        <h3>Columns{download ? ` in ${download}.csv` : ""}</h3>
      </div>
      <dl className="facts mt-4">
        {fields.map((f) => (
          <div key={f.name} className="contents">
            <dt className="mono">{f.name}</dt>
            <dd>{f.description}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Research posts on /writing that analyse a given dataset. */
export function RelatedResearch({ dataset }: { dataset: string }) {
  const posts = RESEARCH.filter((r) => r.datasets.includes(dataset));
  if (posts.length === 0) return null;
  return (
    <section className="mt-20" aria-labelledby="research">
      <h2 id="research" className="section-title mb-3">
        Analysis using this data
      </h2>
      <ol className="index-list">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/writing/${p.slug}`}>
              <span className="index-no" aria-hidden="true" />
              <span className="flex-1">
                <span className="index-title block">{p.title}</span>
                <span className="mt-1 block text-[0.95rem] leading-snug text-[var(--muted)]">{p.summary}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
