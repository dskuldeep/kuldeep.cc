import { requireAuth } from "@/lib/auth";
import { getProjects } from "@/lib/content";
import { deleteProject, saveProject } from "@/app/admin/actions";

function ProjectForm({
  defaults,
  submitLabel,
}: {
  defaults?: {
    id: number;
    title: string;
    url: string | null;
    description: string;
    year: number | null;
    sortOrder: number;
  };
  submitLabel: string;
}) {
  return (
    <form action={saveProject} className="grid gap-2 sm:grid-cols-[2fr_2fr_3fr_1fr_1fr_auto]">
      {defaults && <input type="hidden" name="id" value={defaults.id} />}
      <input
        className="field"
        name="title"
        placeholder="Title"
        required
        defaultValue={defaults?.title}
      />
      <input className="field" name="url" placeholder="URL" defaultValue={defaults?.url ?? ""} />
      <input
        className="field"
        name="description"
        placeholder="One-line description"
        defaultValue={defaults?.description}
      />
      <input
        className="field"
        name="year"
        placeholder="Year"
        inputMode="numeric"
        defaultValue={defaults?.year ?? ""}
      />
      <input
        className="field"
        name="sort_order"
        placeholder="Order"
        inputMode="numeric"
        defaultValue={defaults?.sortOrder ?? 0}
      />
      <button type="submit" className="btn-ghost btn">
        {submitLabel}
      </button>
    </form>
  );
}

export default async function AdminProjectsPage() {
  await requireAuth();
  const projects = await getProjects();

  return (
    <>
      <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
        Projects
      </h1>

      <div className="mt-6 flex flex-col gap-4">
        {projects.map((project) => (
          <div key={project.id} className="flex items-center gap-2">
            <div className="flex-1">
              <ProjectForm defaults={project} submitLabel="Save" />
            </div>
            <form action={deleteProject}>
              <input type="hidden" name="id" value={project.id} />
              <button type="submit" className="btn-danger btn">
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>

      <h2 className="section-title mb-3 mt-10">Add project</h2>
      <ProjectForm submitLabel="Add" />
    </>
  );
}
