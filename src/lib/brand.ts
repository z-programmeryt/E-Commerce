export const BRAND = {
  name: "SUPER Z SHOP",
  tagline: "Premium Everyday Essentials",
  taglineBn: "প্রিমিয়াম এভরিডে এসেনশিয়ালস",
  currency: "BDT",
  currencySymbol: "৳",
  phone: "+880 1700 000000",
  whatsapp: "+880 1700 000000",
  email: "hello@superzshop.bd",
  supportHours: "Sat–Thu, 10:00–19:00 (BST)",
  address: "Level 3, House 12, Road 7, Dhanmondi, Dhaka 1205",
  social: {
    facebook: "https://facebook.com/superzshop.bd",
    instagram: "https://instagram.com/superzshop.bd",
    youtube: "https://youtube.com/@superzshopbd",
    tiktok: "https://tiktok.com/@superzshop.bd",
  },
  freeDeliveryThreshold: 2500,
  deliveryFees: { insideDhaka: 70, outsideDhaka: 130 },
} as const;

export function formatBdt(amount: number): string {
  return `${BRAND.currencySymbol}${Math.round(amount).toLocaleString("en-US")}`;
}

export function formatDate(iso: string): string {
  // SQLite stores "YYYY-MM-DD HH:MM:SS" in UTC.
  const normalized = iso.includes("T") ? iso : iso.replace(" ", "T") + "Z";
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  const normalized = iso.includes("T") ? iso : iso.replace(" ", "T") + "Z";
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
