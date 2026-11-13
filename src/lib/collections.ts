export type Collection = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  query: { flag?: string; tag?: string; category?: string; onSale?: boolean; sort?: string };
};

export const COLLECTIONS: Collection[] = [
  {
    slug: "featured",
    title: "Featured collection",
    eyebrow: "Buying team picks",
    description: "A cross-category edit of pieces with the strongest supplier confidence and the widest size availability.",
    query: { flag: "featured" },
  },
  {
    slug: "eid-edit",
    title: "Eid edit",
    eyebrow: "Festive",
    description: "Panjabi, saree, three-piece sets and gifting for Eid — organised so one order covers the family.",
    query: { tag: "eid" },
  },
  {
    slug: "gifting",
    title: "Gifting",
    eyebrow: "Ready to give",
    description: "Pre-packed hampers, boxed sets and small gifts. Everything ships with the option of a handwritten card.",
    query: { tag: "gift" },
  },
  {
    slug: "couple-collections",
    title: "Couple collections",
    eyebrow: "For two",
    description: "Matched pairs — apparel, jewellery, mugs and travel sets designed as a single gift.",
    query: { tag: "couple" },
  },
  {
    slug: "wedding-season",
    title: "Wedding season",
    eyebrow: "Occasion",
    description: "Bridal jewellery, suits, sarees and gifts for the wedding months.",
    query: { tag: "wedding" },
  },
  {
    slug: "winter-edit",
    title: "Winter edit",
    eyebrow: "Seasonal",
    description: "Hoodies, mufflers, shawls and thermals for the short but sharp Dhaka winter.",
    query: { tag: "winter" },
  },
  {
    slug: "everyday-office",
    title: "Everyday office",
    eyebrow: "Workwear",
    description: "Shirts, chinos, watches, bags and desk pieces that make a weekday easier.",
    query: { tag: "office" },
  },
  {
    slug: "travel-ready",
    title: "Travel ready",
    eyebrow: "On the move",
    description: "Luggage, organisers, comfort items and adapters for the next trip.",
    query: { tag: "travel" },
  },
];