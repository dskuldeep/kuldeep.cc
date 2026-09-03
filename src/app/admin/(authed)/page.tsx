import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getAllPosts } from "@/lib/content";
import { formatDateShort } from "@/lib/format";
import { createDraftPost } from "@/app/admin/actions";

export default async function AdminPostsPage() {
  await requireAuth();
  const posts = await getAllPosts();

  return (
    <>
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Posts
        </h1>
        <form action={createDraftPost}>
          <button type="submit" className="btn">
            New post
          </button>
        </form>
      </div>

      <ul className="mt-6 divide-y divide-[var(--rule)]">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/admin/posts/${post.id}`}
              className="flex items-baseline gap-4 py-3 hover:bg-[var(--code-bg)]"
            >
              <span
                className={`meta w-20 shrink-0 ${post.status === "draft" ? "" : "font-semibold"}`}
              >
                {post.status}
              </span>
              <span className="flex-1 font-medium">{post.title}</span>
              <span className="meta shrink-0">
                {formatDateShort(post.publishedAt ?? post.updatedAt)}
              </span>
            </Link>
          </li>
        ))}
        {posts.length === 0 && <li className="meta py-6">No posts yet.</li>}
      </ul>
    </>
  );
}
