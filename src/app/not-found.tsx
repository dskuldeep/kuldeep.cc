import Link from "next/link";

export default function NotFound() {
  return (
    <div className="col flex min-h-screen flex-col justify-center py-16">
      <p className="section-title mb-4">404</p>
      <h1 className="statement max-w-[16ch]">This page doesn&apos;t exist.</h1>
      <p className="mt-8">
        <Link href="/" className="link">
          ← Back home
        </Link>
      </p>
    </div>
  );
}
