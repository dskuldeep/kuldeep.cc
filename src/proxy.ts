import { NextResponse, type NextRequest } from "next/server";

// Keep in sync with SESSION_COOKIE in src/lib/auth.ts (not imported to keep
// the proxy bundle free of cloudflare:workers / next/headers).
const SESSION_COOKIE = "kc_session";

/**
 * Optimistic gate for /admin: bounce to the login page when the session
 * cookie is absent. NOT the security boundary — every admin page, server
 * action, and /api/admin handler verifies the signed session itself via
 * requireAuth().
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!request.cookies.has(SESSION_COOKIE)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
