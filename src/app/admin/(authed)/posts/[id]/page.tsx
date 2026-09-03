import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getPostById } from "@/lib/content";
import { PostEditor } from "@/components/admin/post-editor";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();
  const { id } = await params;
  const post = await getPostById(Number(id));
  if (!post) notFound();

  return <PostEditor post={post} />;
}
