import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col items-center justify-center px-5 py-20 text-center sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-3 rounded-full border border-[var(--line)] bg-white/50 px-4 py-2">
          <span className="text-2xl">404</span>
          <span className="h-4 w-px bg-[var(--line)]" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">
            Not Found
          </span>
        </div>

        <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-6xl">
          This page doesn&apos;t exist.
        </h1>

        <p className="mx-auto max-w-lg text-lg leading-relaxed text-[var(--ink-soft)]">
          The page you&apos;re looking for might have been moved or doesn&apos;t exist yet.
        </p>

        <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row">
          <Link className="glass-button glass-button-primary" href="/">
            Back to home
          </Link>
          <Link className="glass-button glass-button-secondary" href="/journal">
            Browse journal
          </Link>
        </div>
      </div>
    </div>
  );
}
