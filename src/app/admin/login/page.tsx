import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { login } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAuthenticated()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <div className="col flex min-h-screen max-w-sm flex-col justify-center py-16">
      <h1 className="statement text-[2rem]">Sign in</h1>
      <form action={login} className="mt-8 flex flex-col gap-3">
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          required
          className="field"
        />
        {error && <p className="text-sm text-[var(--muted)]">Wrong password. Try again.</p>}
        <button type="submit" className="btn mt-2">
          Sign in
        </button>
      </form>
    </div>
  );
}
