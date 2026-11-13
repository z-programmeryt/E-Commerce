/**
 * Long-form page copy. Kept in one module so policy language is reviewable in a
 * single place rather than scattered across JSX.
 *
 * These policies are written for a Bangladesh COD store and are working drafts.
 * They must be reviewed by the business owner (and ideally a lawyer) before use.
 */

export type PageContent = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  updated: string;
  sections: { heading: string; body: string[]; list?: string[] }[];
  notice?: string;
};

const UPDATED = "13 November 2026";

export const PAGES: PageContent[] = [
  {
    slug: "about-us",
    title: "About SUPER Z SHOP",
    eyebrow: "Our story",
    description:
      "SUPER Z SHOP is a Bangladesh-based online store selling premium everyday essentials — clothing, jewellery, watches, bags, tech accessories and gifting.",
    updated: UPDATED,
    sections: [
      {
        heading: "What we are building",
        body: [
          "SUPER Z SHOP started from a simple frustration: shopping online in Bangladesh usually means choosing between cheap products with no quality control, or imported brands priced for a different market. We want a third option — a curated catalogue of everyday pieces that are sensibly priced, checked before dispatch, and supported by a real person in Dhaka.",
          "The catalogue is deliberately finite. Rather than listing thousands of SKUs, we list 225 products across 15 categories. Each one is selected for a specific use, and each is described honestly — including what we have not yet verified.",
        ],
      },
      {
        heading: "How we work",
        body: [
          "Two people run the operation. The founder handles the website, marketing, customer communication and strategy. A Dhaka sourcing partner handles supplier conversations, purchasing, quality checking, packing and courier handover.",
          "That structure keeps the feedback loop short: a customer complaint on Monday changes what we buy on Wednesday.",
        ],
        list: [
          "Sourcing is done in Dhaka wholesale markets and verified supplier platforms.",
          "Every order is quality checked and packed before it leaves us.",
          "Delivery is through Pathao, Steadfast or RedX, depending on the route.",
          "Cash on delivery is available nationwide, so customers are not asked to pay upfront.",
        ],
      },
      {
        heading: "What this website is, right now",
        body: [
          "This storefront runs on a self-contained product and order database that the team can reset while the launch range is finalised. No payment gateway is connected yet: every order is placed as cash on delivery and confirmed by phone before dispatch.",
          "Wholesale costs and retail prices in the catalogue are planning estimates recorded from Dhaka market price bands. They are labelled as unverified throughout the site until a supplier invoice confirms them. Catalogue photography is our own studio photography and is used as category-representative imagery; per-SKU supplier photographs are being added as each product is verified.",
        ],
      },
      {
        heading: "Where we are going",
        body: [
          "The first milestone is a small, verified launch range — 15 to 25 SKUs with confirmed supplier pricing and real photography — before expanding to the full catalogue. You can read the full sourcing and unit-economics research in the business workbook linked from the research page.",
        ],
      },
    ],
    notice:
      "This page describes a business in its launch phase. No company registration, trade licence or VAT registration is claimed here.",
  },
  {
    slug: "contact-us",
    title: "Contact us",
    eyebrow: "We reply within one working day",
    description: "Reach SUPER Z SHOP by phone, WhatsApp, email or the contact form.",
    updated: UPDATED,
    sections: [
      {
        heading: "How to reach us",
        body: [
          "The fastest route is WhatsApp or a phone call during support hours. For order-specific questions, include your order number (it looks like SZS-20261001).",
        ],
        list: [
          "Phone / WhatsApp: +880 1700 000000",
          "Email: hello@superzshop.bd",
          "Support hours: Saturday–Thursday, 10:00–19:00 (Bangladesh Standard Time)",
          "Office: Level 3, House 12, Road 7, Dhanmondi, Dhaka 1205",
        ],
      },
      {
        heading: "Before you write",
        body: [
          "For delivery delays, check the tracking page first — it shows the current status recorded against your order. For returns, read the return and refund policy so your message includes everything we need to process it in one go.",
        ],
      },
      {
        heading: "About the contact form",
        body: [
          "The contact form on this page records your message in our support queue, where it is picked up during support hours. It does not send an automatic email reply — the fastest route for anything urgent is WhatsApp or a call.",
        ],
      },
    ],
    notice: "The phone number and email above are the launch contact details. We will publish a landline and showroom address once the Dhaka outlet opens.",
  },
  {
    slug: "faq",
    title: "Frequently asked questions",
    eyebrow: "Help centre",
    description: "Answers to the questions we get most about ordering, delivery, payment and returns.",
    updated: UPDATED,
    sections: [
      {
        heading: "Ordering",
        body: [],
        list: [
          "Do I need an account? No. You can check out as a guest. Enter the same email next time to see your order history.",
          "Can I change my order after placing it? Yes, if it has not been packed. Call or WhatsApp us with your order number as soon as possible.",
          "How do I know my order went through? You will land on a confirmation page with a unique order number. Write it down — it is the fastest way for us to find your order.",
          "Can I order from outside Bangladesh? Not yet. Delivery is limited to Bangladeshi districts.",
        ],
      },
      {
        heading: "Payment",
        body: [],
        list: [
          "What payment methods do you accept? Cash on delivery, nationwide. Card, bKash and Nagad are listed as planned methods and are not connected yet.",
          "Do you take advance payment? No. Nothing is charged before the parcel reaches you.",
          "Is cash on delivery available everywhere? Yes, across all 64 districts through our courier partners, subject to their coverage in remote unions.",
        ],
      },
      {
        heading: "Delivery",
        body: [
          "Inside Dhaka, orders typically arrive in 1–3 working days after dispatch. Outside Dhaka, allow 2–5 working days. Delivery is ৳70 inside Dhaka and ৳130 outside, and free on orders over ৳2,500. The exact figure is shown at checkout before you confirm.",
        ],
        list: [
          "Which couriers do you use? Pathao, Steadfast and RedX, chosen by route.",
          "Can I track my parcel? Yes — use the tracking page with your order number.",
          "What if I miss the delivery? The courier will attempt redelivery; repeated failures may return the parcel to us.",
        ],
      },
      {
        heading: "Returns and stock",
        body: [],
        list: [
          "What is the return window? 7 days from delivery for eligible items, with the item unworn and in original packaging.",
          "Which items cannot be returned? Innerwear, cosmetics, pierced jewellery and any item marked final sale.",
          "What if an item is out of stock? Stock is live from our database. If the last unit sells while it is in your cart, checkout will stop you with a clear message.",
          "Are the prices final? Prices come from Dhaka market price bands and are being re-confirmed supplier by supplier. Each product page states clearly when a price is still pending a supplier quote.",
        ],
      },
    ],
    notice: "Orders are confirmed by phone before dispatch, so you can change or cancel anything that has not been packed.",
  },
  {
    slug: "shipping-delivery-policy",
    title: "Shipping & delivery policy",
    eyebrow: "Policies",
    description: "Delivery charges, timelines, coverage and courier partners for SUPER Z SHOP orders.",
    updated: UPDATED,
    sections: [
      {
        heading: "Charges",
        body: [
          "Delivery is charged by destination, not by item count. Orders over the free-delivery threshold pay nothing for delivery.",
        ],
        list: [
          "Inside Dhaka: ৳70",
          "Outside Dhaka: ৳130",
          "Free delivery: orders of ৳2,500 or more, or with a valid FREESHIP coupon",
          "Cash-on-delivery handling: included in the delivery charge, with no separate COD fee",
        ],
      },
      {
        heading: "Timelines",
        body: [
          "We dispatch within 1–2 working days of order confirmation. Fridays and public holidays are not working days.",
        ],
        list: [
          "Inside Dhaka: 1–3 working days after dispatch",
          "Outside Dhaka (district towns): 2–5 working days after dispatch",
          "Remote upazilas: up to 7 working days, depending on courier coverage",
        ],
      },
      {
        heading: "Courier partners",
        body: [
          "We work with three couriers and route each order to whichever is strongest for that destination. Tracking references are issued when a parcel is handed over, and courier consignment numbers are added to your order page as soon as the booking is confirmed.",
        ],
        list: [
          "Pathao Courier — strong Dhaka coverage, published rate card",
          "Steadfast — predictable flat rates and payouts on request",
          "RedX — zero COD charge inside Dhaka City, deep upazila reach",
        ],
      },
      {
        heading: "Failed deliveries",
        body: [
          "If a delivery attempt fails because the address or phone number is unreachable, the courier will try again. After repeated failures the parcel returns to us. We will contact you to arrange redelivery; a second delivery charge may apply.",
        ],
      },
      {
        heading: "Damaged parcels",
        body: [
          "Please check the parcel in front of the delivery agent where possible. If the outer packaging is clearly damaged, you may refuse delivery. Report any issue within 48 hours with photographs of the parcel and product.",
        ],
      },
    ],
    notice: "Delivery charges follow our published rate card and are shown in full at checkout before you confirm.",
  },
  {
    slug: "return-refund-policy",
    title: "Return & refund policy",
    eyebrow: "Policies",
    description: "How returns, replacements and refunds work for SUPER Z SHOP orders.",
    updated: UPDATED,
    sections: [
      {
        heading: "Eligibility",
        body: [
          "You may request a return or replacement within 7 days of delivery if the item is unused, unwashed, with tags attached and in its original packaging. The following cannot be returned for hygiene or safety reasons.",
        ],
        list: [
          "Innerwear, socks and nightwear",
          "Cosmetics, skincare tools and hair accessories that have been opened",
          "Pierced jewellery and earrings",
          "Items marked final sale or clearance",
          "Gift cards",
        ],
      },
      {
        heading: "Defective or wrong items",
        body: [
          "If you receive a defective item or the wrong product, we cover return delivery and send a replacement or full refund. Contact us within 48 hours of delivery with your order number and photographs showing the issue.",
        ],
      },
      {
        heading: "Change of mind",
        body: [
          "For a change-of-mind return on an eligible item, the customer covers the return delivery charge. Once we receive and inspect the item, we refund the product value; the original delivery charge is not refunded.",
        ],
      },
      {
        heading: "Refund method and timing",
        body: [
          "Because orders in this store are paid by cash on delivery, refunds are issued by bKash, Nagad or bank transfer after we receive the returned item. Allow 5–7 working days after inspection.",
        ],
        list: [
          "Refund is limited to the amount actually paid for the returned item.",
          "Coupon discounts are not refunded in cash.",
          "Refunds are paid to the phone number or bank account the order was placed with. We will confirm the details with you before sending anything.",
        ],
      },
      {
        heading: "How to start a return",
        body: [
          "Message us on WhatsApp or email with your order number, the product name and the reason. We will confirm eligibility and arrange a pickup where applicable. Do not send anything back before we confirm, as unannounced returns cannot be matched to an order.",
        ],
      },
    ],
    notice: "This policy is written for a Bangladesh cash-on-delivery store and is under legal review before trading begins.",
  },
  {
    slug: "privacy-policy",
    title: "Privacy policy",
    eyebrow: "Policies",
    description: "What data SUPER Z SHOP collects, why we collect it, and how it is stored and protected.",
    updated: UPDATED,
    sections: [
      {
        heading: "What we collect",
        body: ["We collect only what is needed to process an order or answer a question."],
        list: [
          "Name, email address and mobile number",
          "Delivery address, area and district",
          "Order contents, order value and delivery notes",
          "Any message you send through the contact form",
          "Newsletter email address, if you subscribe",
        ],
      },
      {
        heading: "How we store your data",
        body: [
          "Order, contact and newsletter records live in our own database, hosted on infrastructure we control. There is no third-party analytics service and no advertising tracker on this site. Cart and wishlist identifiers are stored in browser cookies so your selections survive a page reload, and they contain no personal data.",
        ],
      },
      {
        heading: "What we do not do",
        body: [],
        list: [
          "We do not sell or rent personal data.",
          "We do not run advertising or behavioural tracking pixels.",
          "We only email you if you subscribe to the newsletter, and every message carries a one-click unsubscribe.",
          "We do not process or store card details, because no card payment gateway is connected — orders are paid in cash on delivery.",
        ],
      },
      {
        heading: "Your choices",
        body: [
          "You can ask us to delete your order history, contact messages and newsletter subscription at any time by emailing hello@superzshop.bd. We action deletion requests within 7 working days, except where we are required to retain an invoice record.",
        ],
      },
      {
        heading: "Our commitments",
        body: [
          "Customer data is transmitted over HTTPS and stored with access limited to the two people who run the store. We keep records only as long as they are needed to fulfil an order and meet our accounting obligations, and this policy will be reviewed against Bangladesh data-protection guidance before we begin trading.",
        ],
      },
    ],
    notice: "This policy is under legal review before trading begins. It is not legal advice.",
  },
  {
    slug: "terms-conditions",
    title: "Terms & conditions",
    eyebrow: "Policies",
    description: "The terms that apply when you order from or browse the SUPER Z SHOP storefront.",
    updated: UPDATED,
    sections: [
      {
        heading: "Using this site",
        body: [
          "This site is operated by SUPER Z SHOP. By browsing the catalogue or placing an order you agree to these terms, to our delivery policy and to our return policy. Where those policies and these terms disagree, the specific policy wins.",
        ],
      },
      {
        heading: "Product information",
        body: [
          "Product names, descriptions and specifications are prepared by our sourcing team. Prices, costs and stock figures are estimates until a supplier invoice confirms them, and they change without notice. Catalogue photography is our own studio photography and our terms do not represent it as a photograph of the exact unit you will receive.",
        ],
      },
      {
        heading: "Orders and pricing",
        body: [
          "An order is an offer to buy. We may decline or cancel an order if stock is unavailable, if a price was displayed in error, or if the delivery address is outside our coverage. The amount you pay is the amount confirmed at checkout and repeated by our team on the confirmation call.",
        ],
      },
      {
        heading: "Intellectual property",
        body: [
          "The SUPER Z SHOP name, logo, page copy and the photography used on this site belong to SUPER Z SHOP. Third-party brand names mentioned in research material belong to their respective owners and are referenced for comparison only.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "To the extent permitted by law, our liability for any order is limited to the amount you paid for it. Nothing in these terms limits liability for death, personal injury or fraud, or any liability that cannot be excluded under Bangladeshi law.",
        ],
      },
      {
        heading: "Governing law",
        body: [
          "These terms are governed by the laws of Bangladesh, and the courts of Dhaka have exclusive jurisdiction over any dispute.",
        ],
      },
    ],
    notice: "These terms are under legal review before trading begins.",
  },
];

export function getPage(slug: string): PageContent | undefined {
  return PAGES.find((p) => p.slug === slug);
}
