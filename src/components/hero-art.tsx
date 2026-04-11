export function HeroArt() {
  return (
    <div className="relative lg:pt-10">
      <div className="section-frame relative overflow-hidden px-6 py-7 sm:px-8 sm:py-8">
        <div
          aria-hidden="true"
          className="absolute -left-8 bottom-10 h-24 w-24 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,125,77,0.16) 0%, rgba(255,125,77,0.04) 52%, transparent 78%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute right-8 top-0 h-20 w-20 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(169,140,255,0.14) 0%, rgba(169,140,255,0.04) 52%, transparent 78%)",
          }}
        />

        <div className="relative space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                Core capabilities
              </p>
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--coral)]" />
            </div>

            <h2 className="max-w-md font-display text-4xl font-semibold leading-[0.98] tracking-[-0.05em] text-[var(--foreground)] sm:text-5xl">
              Systems for AI-led growth
            </h2>

            <p className="max-w-md text-sm leading-7 text-[var(--ink-soft)] sm:text-base">
              Automation, experimentation, and predictive modeling designed to help lean teams
              make better decisions and scale without extra overhead.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-[1.25rem] border border-[var(--line)] bg-white/72 px-4 py-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  01
                </span>
                <span className="text-base font-semibold text-[var(--foreground)]">
                  Multi-agent workflows
                </span>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--orange)]" />
            </div>

            <div className="flex items-center justify-between rounded-[1.25rem] border border-[var(--line)] bg-white/72 px-4 py-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  02
                </span>
                <span className="text-base font-semibold text-[var(--foreground)]">
                  Data-driven systems
                </span>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--coral)]" />
            </div>

            <div className="flex items-center justify-between rounded-[1.25rem] border border-[var(--line)] bg-white/72 px-4 py-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  03
                </span>
                <span className="text-base font-semibold text-[var(--foreground)]">
                  Automated experimentation
                </span>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--violet)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
