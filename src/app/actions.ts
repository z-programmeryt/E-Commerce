"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  addToCart, cartLines, clearCart, getOrCreateCart, getVariant, placeOrder,
  removeCartLine, setCartQty, toggleWishlist,
} from "@/lib/repo";
import { cartToken, wishlistKey } from "@/lib/session";
import { run } from "@/lib/db";

type ActionResult = { ok: boolean; error?: string; message?: string };

export async function addToCartAction(variantOrProductId: number, qty = 1, variantId?: number): Promise<ActionResult> {
  try {
    const token = await cartToken();
    const cartId = getOrCreateCart(token);
    let resolvedVariant = variantId;
    if (!resolvedVariant) {
      // The product card only knows the product; pick its first in-stock variant.
      const candidate = getVariant(variantOrProductId);
      if (candidate) resolvedVariant = candidate.id;
    }
    if (!resolvedVariant) {
      const { all } = await import("@/lib/db");
      const rows = all<{ id: number }>(
        `SELECT id FROM product_variants WHERE product_id = ? AND stock > 0 ORDER BY id LIMIT 1`,
        [variantOrProductId],
      );
      resolvedVariant = rows[0]?.id;
    }
    if (!resolvedVariant) return { ok: false, error: "Out of stock" };
    addToCart(cartId, resolvedVariant, qty);
    revalidatePath("/cart");
    revalidatePath("/");
    return { ok: true, message: "Added to cart" };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not add to cart" };
  }
}

export async function addVariantToCartAction(variantId: number, qty: number): Promise<ActionResult> {
  try {
    const token = await cartToken();
    const cartId = getOrCreateCart(token);
    addToCart(cartId, variantId, qty);
    revalidatePath("/cart");
    return { ok: true, message: "Added to cart" };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not add to cart" };
  }
}

export async function updateCartQtyAction(variantId: number, qty: number): Promise<ActionResult> {
  try {
    const token = await cartToken();
    const cartId = getOrCreateCart(token);
    setCartQty(cartId, variantId, qty);
    revalidatePath("/cart");
    revalidatePath("/checkout");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not update quantity" };
  }
}

export async function removeCartLineAction(variantId: number): Promise<ActionResult> {
  try {
    const token = await cartToken();
    const cartId = getOrCreateCart(token);
    removeCartLine(cartId, variantId);
    revalidatePath("/cart");
    revalidatePath("/checkout");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not remove item" };
  }
}

export async function toggleWishlistAction(productId: number): Promise<ActionResult & { active?: boolean }> {
  try {
    const key = await wishlistKey();
    const active = toggleWishlist(key, productId);
    revalidatePath("/wishlist");
    return { ok: true, active };
  } catch {
    return { ok: false, error: "Could not update wishlist" };
  }
}

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+?880|0)1[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number (e.g. 01712345678)"),
  address: z.string().trim().min(8, "Enter your full delivery address").max(240),
  area: z.string().trim().min(2, "Select your area"),
  district: z.string().trim().min(2, "Select your district"),
  postcode: z.string().trim().max(6).optional().or(z.literal("")),
  notes: z.string().trim().max(400).optional().or(z.literal("")),
  coupon: z.string().trim().max(24).optional().or(z.literal("")),
});

export type CheckoutState = {
  ok: boolean;
  errors?: Record<string, string>;
  message?: string;
};

export async function placeOrderAction(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const parsed = checkoutSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors, message: "Please check the highlighted fields." };
  }

  const data = parsed.data;
  const token = await cartToken();
  const cartId = getOrCreateCart(token);
  const lines = cartLines(cartId);
  if (lines.length === 0) return { ok: false, message: "Your cart is empty." };

  const result = placeOrder({
    cartId,
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    area: data.area,
    district: data.district,
    postcode: data.postcode || "",
    notes: data.notes || "",
    couponCode: data.coupon || null,
  });

  if (!result.ok) return { ok: false, message: result.error };

  revalidatePath("/cart");
  revalidatePath("/admin/orders");
  redirect(`/order/confirmation/${result.orderNumber}`);
}

export async function newsletterAction(_prev: { ok: boolean; message: string }, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) return { ok: false, message: "Enter a valid email address." };
  try {
    run(`INSERT INTO newsletter_subscribers (email) VALUES (?) ON CONFLICT(email) DO NOTHING`, [email.toLowerCase()]);
    return { ok: true, message: "You are on the list. Look out for the first launch email." };
  } catch {
    return { ok: false, message: "Could not subscribe right now." };
  }
}

export async function contactAction(_prev: { ok: boolean; message: string }, formData: FormData) {
  const schema = z.object({
    name: z.string().trim().min(2, "Enter your name"),
    email: z.string().trim().email("Enter a valid email"),
    phone: z.string().trim().max(20).optional().or(z.literal("")),
    subject: z.string().trim().min(3, "Add a subject"),
    message: z.string().trim().min(10, "Tell us a little more (10+ characters)"),
  });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const d = parsed.data;
  run(`INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)`, [
    d.name, d.email, d.phone ?? "", d.subject, d.message,
  ]);
  return { ok: true, message: "Thanks — your message is in our support queue. We reply within one working day." };
}

/** Shared helper used by the order tracking page and admin order actions. */
export async function clearCartAction() {
  const token = await cartToken();
  const cartId = getOrCreateCart(token);
  clearCart(cartId);
  revalidatePath("/cart");
}
