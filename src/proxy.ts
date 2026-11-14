import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";

/**
 * Route-level gate for the admin area. Verifies the signed session cookie
 * before the request ever reaches a dashboard page, so unauthenticated visitors
 * get a real 307 to the login screen instead of a rendered redirect.
 *
 * This is defence in depth: every admin page and server action also calls
 * requireAdmin() on the server.
 */
export const config = {
  matcher: ["/admin/:path*", "/api/export/:path*"],
};

const COOKIE = "szs_admin";
const SECRET = process.env.ADMIN_SESSION_SECRET ?? "superz-local-demo-secret-change-me";

function validSession(raw: string | undefined): boolean {
  if (!raw) return false;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return false;
  const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { exp?: number };
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const isAuthed = validSession(request.cookies.get(COOKIE)?.value);
  if (isAuthed) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Admin session required" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url, 307);
}
