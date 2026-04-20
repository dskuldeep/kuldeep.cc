import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-start justify-center px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="w-full space-y-8">
        <div className="term">
          <div className="term-bar">
            <span className="bb" style={{ background: "#e8573d" }} />
            <span className="bb" style={{ background: "#f0d66c" }} />
            <span className="bb" style={{ background: "#9fc57a" }} />
            <span className="ml-2 hidden text-white/45 sm:inline">/dev/null — bash</span>
          </div>
          <div className="term-body min-h-[180px] sm:min-h-[220px]">
            <span className="term-line">
              <span style={{ color: "#e8573d" }}>kuldeep@marketing</span>
              <span style={{ color: "#9fc57a" }}> ~</span> $ cd {"<that page>"}
            </span>
            <span className="term-line r">
              → bash: no such file or directory (404)
            </span>
            <span className="term-line m">&nbsp;</span>
            <span className="term-line">
              <span style={{ color: "#e8573d" }}>kuldeep@marketing</span>
              <span style={{ color: "#9fc57a" }}> ~</span> $ ls recommended/
            </span>
            <span className="term-line y">home · case-studies · journal</span>
            <span className="term-line m">&nbsp;</span>
            <span className="term-line">
              <span style={{ color: "#e8573d" }}>kuldeep@marketing</span>
              <span style={{ color: "#9fc57a" }}> ~</span> $ <span className="term-cursor" />
            </span>
          </div>
        </div>

        <div>
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--ink-mute)]">
            error 404
          </p>
          <h1 className="mt-3 font-display text-[2rem] font-semibold leading-[1] tracking-[-0.025em] text-[var(--ink)] sm:text-[3rem]">
            This page doesn&apos;t exist.
          </h1>
          <p className="mt-5 max-w-lg text-[1.02rem] leading-[1.65] text-[var(--ink-soft)]">
            The page you&apos;re looking for might have been moved, renamed, or
            never shipped to production.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link className="glass-button glass-button-primary" href="/">
            ← back to home
          </Link>
          <Link className="glass-button glass-button-secondary" href="/journal">
            browse journal
          </Link>
        </div>
      </div>
    </div>
  );
}
