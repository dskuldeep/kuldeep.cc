import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE } from "@/lib/site";

export default function SpaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="col flex items-baseline justify-between pb-16 pt-8 sm:pb-20 sm:pt-10">
        <Link
          href="/"
          className="text-[1.05rem] font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          space
        </Link>
        <nav className="flex items-center gap-5 sm:gap-7">
          <a href="https://kuldeep.cc" className="link text-[0.95rem]">
            {SITE.name}
          </a>
          <ThemeToggle />
        </nav>
      </header>
      <main className="col flex-1">{children}</main>
      <footer className="col pb-12 pt-24">
        <hr className="rule mb-6" />
        <p className="meta">
          A corner of{" "}
          <a href="https://kuldeep.cc" className="link">
            kuldeep.cc
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
