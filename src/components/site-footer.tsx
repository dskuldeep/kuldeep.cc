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
  {
    href: "https://x.com/don_fedora",
    label: "X",
    iconSrc: "/social/x.svg",
    iconAlt: "X",
  },
  {
    href: "https://www.linkedin.com/in/kuldeep-paul/",
    label: "LinkedIn",
    iconSrc: "/social/linkedin.svg",
    iconAlt: "LinkedIn",
  },
] as const;

function FooterNavLink({ href, label }: { href: string; label: string }) {
  const className =
    "inline-flex items-center text-[0.98rem] text-white/78 transition-colors duration-200 hover:text-white";

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {label}
    </a>
  );
}

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.065),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.045),transparent_24%)]" />
      <div className="footer-noise pointer-events-none absolute inset-0 opacity-[0.055]" />

      <div className="relative mx-auto max-w-[1600px] border-x border-white/10">
        <div className="grid xl:min-h-[820px] xl:grid-cols-[1fr_1fr_1.1fr_0.95fr]">
          {footerColumns.map((column, index) => (
            <section
              key={column.title}
              className={`relative z-10 flex min-h-[250px] flex-col gap-8 border-white/10 px-5 py-8 sm:px-8 sm:py-10 xl:min-h-[820px] xl:px-10 xl:py-9 ${
                index === 0 ? "" : "border-t xl:border-l xl:border-t-0"
              }`}
            >
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-white/28">
                {column.title}
              </p>
              <nav className="flex flex-col items-start gap-5">
                {column.links.map((link) => (
                  <FooterNavLink key={link.label} href={link.href} label={link.label} />
                ))}
              </nav>
            </section>
          ))}

          <section className="relative z-10 flex min-h-[320px] flex-col border-t border-white/10 px-5 py-8 sm:px-8 sm:py-10 xl:min-h-[820px] xl:border-l xl:border-t-0 xl:px-0 xl:py-0">
            <div className="border border-white/10 bg-white/[0.025] xl:border-x-0 xl:border-t-0">
              <a
                href="https://www.linkedin.com/in/kuldeep-paul/"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between px-6 py-5 text-sm text-white/40 transition-colors duration-200 hover:text-white/72 xl:px-8"
              >
                <span>Start a conversation</span>
                <ArrowIcon />
              </a>
            </div>

            <div className="flex flex-1 flex-col justify-between border-t border-white/10 xl:border-t-0">
              <div className="space-y-8 px-1 pt-8 xl:px-8 xl:pt-14">
                <div>
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-white/28">
                    Elsewhere
                  </p>
                  <div className="mt-6 flex flex-wrap gap-4">
                    {socialLinks.map((link) => {
                      const isInternal = link.href.startsWith("/");
                      const classes =
                        "flex h-16 w-16 items-center justify-center rounded-full border border-white/16 bg-white text-[#050505] transition-transform duration-200 hover:-translate-y-0.5";

                      return isInternal ? (
                        <Link
                          key={link.label}
                          href={link.href}
                          aria-label={link.label}
                          className={classes}
                        >
                          <Image
                            src={link.iconSrc}
                            alt={link.iconAlt}
                            width={50}
                            height={50}
                            className="h-[50px] w-[50px] object-contain"
                          />
                        </Link>
                      ) : (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={link.label}
                          className={classes}
                        >
                          <Image
                            src={link.iconSrc}
                            alt={link.iconAlt}
                            width={50}
                            height={50}
                            className="h-[50px] w-[50px] object-contain"
                          />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10">
                <div className="flex items-center justify-between gap-4 px-4 py-5 text-white/45 sm:px-6 xl:px-8">
                  <div className="flex items-center gap-3 text-sm">
                    <ScreenIcon />
                    <span>Remote / IST</span>
                  </div>
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/28">
                    {currentYear}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div
          aria-hidden="true"
          className="footer-wordmark pointer-events-none absolute inset-x-0 bottom-[-1.4rem] overflow-hidden px-3 text-[clamp(7rem,28vw,25rem)] font-black leading-none tracking-[-0.09em] text-white/[0.075] sm:bottom-[-2rem] sm:px-6 xl:px-8"
        >
          <span className="block">Kuldeep</span>
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
      className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
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

function ScreenIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="12" rx="1.75" />
      <path d="M9 20h6" />
      <path d="M12 16v4" />
    </svg>
  );
}
