"use client";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="col flex min-h-screen flex-col justify-center py-16">
      <p className="section-title mb-4">Error</p>
      <h1 className="statement max-w-[16ch]">Something went wrong.</h1>
      <p className="mt-6 max-w-[38rem] text-[var(--muted)]">
        {error.message || "An unexpected error occurred."}
      </p>
      <p className="mt-8 flex gap-4">
        <button type="button" className="btn" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="link self-center text-[0.95rem]">
          Back home
        </Link>
      </p>
    </div>
  );
}
