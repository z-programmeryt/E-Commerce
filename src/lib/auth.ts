import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { one } from "./db";

/**
 * DEMONSTRATION AUTHENTICATION ONLY.
 *
 * Passwords are hashed with scrypt and stored in the local database, and the
 * session cookie is HMAC-signed, which is better than a plaintext demo login.
 * But this is still not production-grade security:
 *  - the signing secret lives in an env file,
 *  - there is no rate limiting, lockout, MFA or password reset,
 *  - sessions cannot be revoked server-side,
 *  - everything runs over plain HTTP on localhost.
 * Do not reuse this for a public store without replacing it with a reviewed
 * auth provider or a hardened first-party implementation.
 */

const COOKIE = "szs_admin";
const SECRET = process.env.ADMIN_SESSION_SECRET ?? "superz-local-demo-secret-change-me";
const MAX_AGE = 60 * 60 * 8; // 8 hours

export type AdminSession = { id: number; email: string; name: string; role: string };

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return crypto.timingSafeEqual(candidate, expected);
}

export async function createSession(admin: AdminSession) {
  const payload = Buffer.from(
    JSON.stringify({ ...admin, exp: Date.now() + MAX_AGE * 1000 }),
  ).toString("base64url");
  const jar = await cookies();
  jar.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as AdminSession & { exp: number };
    if (!data.exp || data.exp < Date.now()) return null;
    return { id: data.id, email: data.email, name: data.name, role: data.role };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function authenticate(email: string, password: string): Promise<AdminSession | null> {
  const row = one<{ id: number; email: string; name: string; password_hash: string; role: string }>(
    `SELECT id, email, name, password_hash, role FROM admin_users WHERE LOWER(email) = LOWER(?)`,
    [email.trim()],
  );
  if (!row) return null;
  if (!verifyPassword(password, row.password_hash)) return null;
  return { id: row.id, email: row.email, name: row.name, role: row.role };
}
