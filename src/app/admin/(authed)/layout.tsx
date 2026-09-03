import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { logout } from "@/app/admin/actions";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const nav = [
  { href: "/admin", label: "Posts" },
  { href: "/admin/pages/home", label: "Pages" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/images", label: "Images" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5">
      <header className="flex items-baseline justify-between border-b border-[var(--rule)] pb-4 pt-6">
        <div className="flex items-baseline gap-6">
          <Link href="/admin" className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            Admin
          </Link>
          <nav className="flex gap-4">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="link text-[0.9rem]">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/" className="link meta">
            View site
          </Link>
          <form action={logout}>
            <button type="submit" className="link meta cursor-pointer">
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 py-8">{children}</main>
    </div>
  );
}
