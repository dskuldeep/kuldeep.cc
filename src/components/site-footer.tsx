import Image from "next/image";
import Link from "next/link";

const footerColumns = [
  {
    title: "Focus",
    links: [
      { href: "/", label: "AI Marketing Systems" },
      { href: "/case-studies", label: "Growth Playbooks" },
      { href: "/journal", label: "Editorial Strategy" },
      { href: "/journal", label: "Automation Notes" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: "/", label: "Home" },
      { href: "/case-studies", label: "Case Studies" },
      { href: "/journal", label: "Journal" },
      { href: "https://www.getmaxim.ai", label: "Maxim AI" },
    ],
  },
  {
    title: "Connect",
    links: [
      { href: "https://www.linkedin.com/in/kuldeep-paul/", label: "LinkedIn" },
      { href: "https://x.com/don_fedora", label: "Twitter / X" },
      { href: "https://www.getmaxim.ai", label: "Currently at Maxim AI" },
      { href: "/journal", label: "Latest Writing" },
      { href: "/case-studies", label: "Selected Work" },
    ],
  },
] as const;

const socialLinks = [
  { href: "https://x.com/don_fedora", label: "X", iconSrc: "/social/x.svg", iconAlt: "X" },
  { href: "https://www.linkedin.com/in/kuldeep-paul/", label: "LinkedIn", iconSrc: "/social/linkedin.svg", iconAlt: "LinkedIn" },
] as const;

function FooterNavLink({ href, label }: { href: string; label: string }) {
  const className =
    "group inline-flex max-w-full items-start gap-2 text-[0.92rem] text-white/75 transition-colors duration-150 hover:text-white";
  const prefix = (
    <span aria-hidden="true" className="mt-0.5 font-mono text-[0.7rem] text-[var(--accent)] opacity-70 transition-opacity group-hover:opacity-100">
      →
    </span>
  );
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {prefix}
        <span className="break-words">{label}</span>
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {prefix}
      <span className="break-words">{label}</span>
    </a>
  );
}

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-[var(--ink)] bg-[#0d0c08] text-white">
      <div className="footer-noise pointer-events-none absolute inset-0 opacity-[0.05]" />

      {/* Terminal bar */}
      <div className="relative flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#17160f] px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/55 sm:px-8 sm:py-2.5 sm:text-[0.7rem] sm:tracking-[0.18em]">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#e8573d" }} />
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#f0d66c" }} />
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#9fc57a" }} />
          <span className="ml-2 hidden text-white/40 sm:inline">~/kuldeep.cc — bash</span>
        </div>
        <span className="text-white/40">utf-8 · {currentYear}</span>
      </div>

      <div className="relative mx-auto max-w-[1600px] border-x border-white/10">
        <div className="grid xl:min-h-[560px] xl:grid-cols-[1fr_1fr_1.1fr_1fr]">
          {footerColumns.map((column, index) => (
            <section
              key={column.title}
              className={`relative z-10 flex min-h-[220px] flex-col gap-6 border-white/10 px-4 py-7 sm:px-8 sm:py-10 xl:min-h-[560px] xl:px-10 xl:py-10 ${
                index === 0 ? "" : "border-t xl:border-l xl:border-t-0"
              }`}
            >
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-white/40">
                ## {column.title}
              </p>
              <nav className="flex flex-col items-start gap-4">
                {column.links.map((link) => (
                  <FooterNavLink key={link.label} href={link.href} label={link.label} />
                ))}
              </nav>
            </section>
          ))}

          <section className="relative z-10 flex min-h-[220px] flex-col border-t border-white/10 px-4 py-7 sm:px-8 sm:py-10 xl:min-h-[560px] xl:border-l xl:border-t-0 xl:px-10 xl:py-10">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-white/40">
              ## Signal
            </p>

            <a
              href="https://www.linkedin.com/in/kuldeep-paul/"
              target="_blank"
              rel="noreferrer"
              className="group mt-6 flex items-center justify-between border border-white/15 bg-white/[0.03] px-4 py-3 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-white/70 transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white sm:px-5 sm:py-4 sm:text-[0.8rem] sm:tracking-[0.14em]"
            >
              <span>Start a conversation</span>
              <ArrowIcon />
            </a>

            <div className="mt-8 flex flex-wrap gap-2.5 sm:gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  className="grid h-11 w-11 place-items-center border border-white/20 bg-white text-[#0d0c08] transition-transform duration-150 hover:-translate-y-0.5 hover:border-[var(--accent)] sm:h-12 sm:w-12"
                >
                  <Image
                    src={link.iconSrc}
                    alt={link.iconAlt}
                    width={28}
                    height={28}
                    className="h-[24px] w-[24px] object-contain sm:h-[28px] sm:w-[28px]"
                  />
                </a>
              ))}
            </div>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-white/50">
              <div className="flex items-center gap-2.5 font-mono text-[0.7rem] uppercase tracking-[0.14em]">
                <span className="inline-block h-1.5 w-1.5 animate-pulse bg-[var(--accent)]" />
                Remote · IST
              </div>
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/40">
                © {currentYear}
              </span>
            </div>
          </section>
        </div>

        <div
          aria-hidden="true"
          className="footer-wordmark pointer-events-none absolute inset-x-0 bottom-[-1.4rem] overflow-hidden px-4 font-mono text-[clamp(5rem,20vw,16rem)] font-bold leading-none tracking-[-0.06em] text-white/[0.05] sm:bottom-[-2rem] sm:px-8"
        >
          <span className="block">kuldeep.cc</span>
        </div>
      </div>
    </footer>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 transition-transform duration-150 group-hover:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}
