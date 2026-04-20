import Link from "next/link";

const navItems = [
  { href: "/", label: "home", cmd: "cd ~" },
  { href: "/case-studies", label: "work", cmd: "ls work/" },
  { href: "/journal", label: "blog", cmd: "cat blog.md" },
];

const socialLinks = [
  { href: "https://x.com/don_fedora", label: "Twitter", icon: "X" },
  { href: "https://www.linkedin.com/in/kuldeep-paul/", label: "LinkedIn", icon: "in" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--ink)] bg-[var(--background)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-3 sm:flex-nowrap sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
        <Link
          href="/"
          className="group flex min-w-0 shrink items-center gap-2.5 font-mono"
          aria-label="Kuldeep Paul home"
        >
          <span className="grid h-7 w-7 place-items-center bg-[var(--ink)] text-[0.7rem] font-bold text-[var(--paper)]">
            K
          </span>
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink)] sm:text-[0.78rem]">
            kuldeep<span className="text-[var(--accent)]">.</span>cc
          </span>
          <span className="hidden items-center gap-1.5 border-l border-[var(--line-strong)] pl-2.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[var(--ink-mute)] sm:flex">
            <span className="inline-block h-1.5 w-1.5 animate-pulse bg-[var(--accent)]" />
            online
          </span>
        </Link>

        <nav className="ml-auto flex flex-wrap items-center justify-end gap-0.5 font-mono sm:gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative border border-transparent px-1.5 py-1 text-[0.62rem] uppercase tracking-[0.12em] text-[var(--ink-soft)] transition-colors hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] sm:px-3 sm:py-2 sm:text-[0.75rem] sm:tracking-[0.14em]"
              title={item.cmd}
            >
              {item.label}
            </Link>
          ))}
          <div className="ml-0.5 flex items-center gap-1 border-l border-[var(--line-strong)] pl-1.5 sm:ml-3 sm:gap-2 sm:pl-3">
            {socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-6 w-6 place-items-center border border-[var(--line-strong)] font-mono text-[0.62rem] font-medium text-[var(--ink-soft)] transition-colors hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] sm:h-8 sm:w-8 sm:text-[0.72rem]"
                aria-label={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
