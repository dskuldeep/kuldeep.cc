export const SITE_URL = "https://kuldeep.cc";

/** Pathname for `alternates.canonical` (resolved via layout `metadataBase`). */
export function canonicalPath(path = "/"): string {
  if (!path || path === "/") return "/";
  return path.startsWith("/") ? path : `/${path}`;
}
