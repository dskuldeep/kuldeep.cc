import { NextResponse, type NextRequest } from "next/server";

// Keep in sync with SESSION_COOKIE in src/lib/auth.ts (not imported to keep
// the proxy bundle free of cloudflare:workers / next/headers).
const SESSION_COOKIE = "kc_session";

/**
 * Paths that keep their own meaning on the space host instead of being read
 * as an artifact slug. Mirrored by RESERVED_SLUGS in src/lib/space.ts.
 */
const SPACE_PASSTHROUGH = [
  "/_next/",
  "/_vinext/",
  "/admin",
  "/api/",
  "/favicon",
  "/media/",
  "/robots.txt",
  "/sitemap.xml",
];

function isSpaceHost(host: string): boolean {
  const name = host.split(":")[0].toLowerCase();
  return name === "space.kuldeep.cc" || name === "space.localhost";
}

/**
 * Two jobs:
 *   1. Map the space host onto the /space route tree — space.kuldeep.cc serves
 *      the hub and space.kuldeep.cc/<slug> serves a published artifact.
 *   2. Optimistic gate for /admin: bounce to login when the session cookie is
 *      absent. NOT the security boundary — every admin page, server action and
 *      /api/admin handler verifies the signed session itself via requireAuth().
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    isSpaceHost(request.headers.get("host") ?? "") &&
    !SPACE_PASSTHROUGH.some((prefix) => pathname.startsWith(prefix))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/space" : `/space${pathname}`;
    return NextResponse.rewrite(url);
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!request.cookies.has(SESSION_COOKIE)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|_vinext/).*)"],
};
