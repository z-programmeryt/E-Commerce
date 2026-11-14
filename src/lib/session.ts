import "server-only";
import { cookies } from "next/headers";
import crypto from "node:crypto";

const CART_COOKIE = "szs_cart";
const WISHLIST_COOKIE = "szs_wishlist";
const YEAR = 60 * 60 * 24 * 365;

/**
 * Stable anonymous identifiers for the demo. A real storefront would tie these
 * to an authenticated account; here they simply let a browser keep a cart and
 * wishlist across reloads without a login.
 */
export async function cartToken(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(CART_COOKIE)?.value;
  if (existing) return existing;
  const token = crypto.randomBytes(16).toString("hex");
  jar.set(CART_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: YEAR });
  return token;
}

export async function cartTokenReadOnly(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(CART_COOKIE)?.value ?? null;
}

export async function wishlistKey(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(WISHLIST_COOKIE)?.value;
  if (existing) return existing;
  const key = crypto.randomBytes(16).toString("hex");
  jar.set(WISHLIST_COOKIE, key, { httpOnly: true, sameSite: "lax", path: "/", maxAge: YEAR });
  return key;
}

export async function wishlistKeyReadOnly(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(WISHLIST_COOKIE)?.value ?? null;
}
