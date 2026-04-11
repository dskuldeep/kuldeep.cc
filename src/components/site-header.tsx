import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/journal", label: "Blog" },
];

const socialLinks = [
  { href: "https://x.com/don_fedora", label: "Twitter", icon: "X" },
  { href: "https://www.linkedin.com/in/kuldeep-paul/", label: "LinkedIn", icon: "in" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--background)]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-5 lg:px-8">
        <Link href="/" className="group relative shrink-0" aria-label="Kuldeep Paul home">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 sm:hidden">
            <div className="flex items-baseline gap-0.5">
              <span className="font-display text-2xl font-bold tracking-tight text-[var(--foreground)]">
                K
              </span>
              <span className="font-hand text-lg italic text-[var(--orange)]">
                P
              </span>
            </div>
          </div>

          {/* Desktop logo */}
          <div className="relative hidden flex-col leading-none sm:flex">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-1 -top-2 font-display text-[2.7rem] font-bold tracking-[-0.12em] text-[rgba(32,24,29,0.06)] transition-transform duration-300 group-hover:-translate-y-0.5 sm:text-[3rem]"
              >
                K
              </span>

              <div className="relative z-10 flex items-end gap-1">
                <span className="font-display text-[1.9rem] font-semibold tracking-[-0.09em] text-[var(--foreground)] transition-colors duration-300 group-hover:text-[var(--charcoal)] sm:text-[2.15rem]">
                  Kuldeep
                </span>
                <span
                  aria-hidden="true"
                  className="mb-1 h-5 w-5 rounded-full border border-[rgba(32,24,29,0.08)] bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.65)_30%,rgba(255,125,77,0.92)_31%,rgba(255,125,77,0.82)_100%)] shadow-[0_10px_24px_rgba(255,125,77,0.2)] transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="relative z-10 -mt-1.5 flex items-center gap-2 pl-6">
                <span className="h-px w-7 bg-[linear-gradient(90deg,rgba(255,125,77,0),rgba(255,125,77,0.9),rgba(169,140,255,0.45))] transition-all duration-300 group-hover:w-9" />
                <span className="font-hand text-[1.05rem] italic text-[var(--orange)] transition-all duration-300 group-hover:translate-x-0.5 sm:text-[1.18rem]">
                  Paul
                </span>
              </div>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-2 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[var(--ink-soft)] transition-colors hover:text-[var(--foreground)] sm:px-3 sm:py-2 sm:text-xs sm:tracking-[0.15em]"
            >
              {item.label}
            </Link>
          ))}
          <div className="ml-1 flex items-center gap-1.5 border-l border-[var(--line)] pl-2 sm:ml-4 sm:gap-3 sm:pl-4">
            {socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line)] font-mono text-[0.65rem] text-[var(--ink-soft)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)] sm:h-8 sm:w-8 sm:text-xs"
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
