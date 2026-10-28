import Link from "next/link";
import type { Crumb } from "@/lib/schema";

/** Visible breadcrumb trail. The matching BreadcrumbList goes in the page's JSON-LD graph. */
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="meta mb-8">
      <ol className="crumbs">
        {crumbs.map((c, i) => (
          <li key={c.path}>
            {i < crumbs.length - 1 ? (
              <Link href={c.path} className="link">
                {c.name}
              </Link>
            ) : (
              <span aria-current="page">{c.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
