import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { getProjects } from "@/lib/content";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Projects",
  description: "Things I've built and work on.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <h1 className="statement">Projects</h1>

      {projects.length === 0 && <p className="mt-10 text-[var(--muted)]">Nothing here yet.</p>}

      <ol className="index-list mt-12">
        {projects.map((project) => {
          const inner = (
            <>
              <span className="index-no" aria-hidden="true" />
              <span className="flex-1">
                <span className="index-title block">{project.title}</span>
                {project.description && (
                  <span className="mt-1 block text-[0.95rem] leading-snug text-[var(--muted)]">
                    {project.description}
                  </span>
                )}
              </span>
              {project.year && <span className="meta shrink-0">{project.year}</span>}
            </>
          );
          return (
            <li key={project.id}>
              {project.url ? (
                <a
                  href={project.url}
                  target={project.url.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                >
                  {inner}
                </a>
              ) : (
                <div className="index-row">{inner}</div>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
