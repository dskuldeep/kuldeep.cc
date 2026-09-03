import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { appEnv } from "@/lib/env";

export const SESSION_COOKIE = "kc_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const SIG_PREFIX = "v1.";

const encoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacSign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(appEnv.SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(SIG_PREFIX + payload));
  return toBase64Url(sig);
}

/** Constant-time-ish comparison over fixed-length SHA-256 digests. */
async function digestsMatch(a: string, b: string): Promise<boolean> {
  const [da, db] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);
  const va = new Uint8Array(da);
  const vb = new Uint8Array(db);
  let diff = 0;
  for (let i = 0; i < va.length; i++) diff |= va[i] ^ vb[i];
  return diff === 0;
}

export async function verifyPassword(candidate: string): Promise<boolean> {
  if (!appEnv.ADMIN_PASSWORD) return false;
  return digestsMatch(candidate, appEnv.ADMIN_PASSWORD);
}

export async function createSessionToken(): Promise<string> {
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS);
  const sig = await hmacSign(exp);
  return `${exp}.${sig}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(exp)) return false;
  if (Number(exp) < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmacSign(exp);
  return digestsMatch(sig, expected);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
} as const;

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/**
 * The real security boundary. Call at the top of every admin page,
 * every admin server action, and every /api/admin route handler —
 * the proxy cookie check is optimistic only.
 */
export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }
}
