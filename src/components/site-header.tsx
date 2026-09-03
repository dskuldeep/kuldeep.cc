import Link from "next/link";
import { SITE } from "@/lib/site";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  { href: "/writing", label: "Writing" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="col flex items-baseline justify-between pb-16 pt-8 sm:pb-24 sm:pt-10">
      <Link
        href="/"
        className="font-display text-[1.05rem] font-bold tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {SITE.name}
      </Link>
      <nav className="flex items-center gap-5 sm:gap-7">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="link text-[0.95rem]">
            {item.label}
          </Link>
        ))}
        <ThemeToggle />
      </nav>
    </header>
  );
}
