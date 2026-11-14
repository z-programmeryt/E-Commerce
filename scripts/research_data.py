#!/usr/bin/env python3
"""
Research inputs for the SUPER Z SHOP business workbook.

EVIDENCE DISCIPLINE
-------------------
Every row carries a `status`:
  - VERIFIED   — a named person/organisation confirmed it, with a URL and date.
  - SECONDARY  — published by a third party (news, blog, directory); directionally
                 useful but not confirmed for our specific use.
  - ESTIMATE   — our own planning assumption. Always labelled.
  - NOT VERIFIED — nobody has confirmed it yet. Never presented as fact.

Supplier records deliberately contain no phone numbers or addresses we could not
verify. Where a market is known but a specific shop is not, the row says
"NOT VERIFIED" and the verification checklist explains what to collect.
"""

RESEARCH_DATE = "2026-11-13"

# ---------------------------------------------------------------------------
# Market evidence used in the business case
# ---------------------------------------------------------------------------
MARKET_EVIDENCE = [
    {
        "claim": "Bangladesh B2C e-commerce market size",
        "value": "USD 7.41 billion (2025 estimate); projected USD 9.65 billion by 2029",
        "status": "SECONDARY",
        "source": "ResearchAndMarkets — Bangladesh B2C Ecommerce Market Databook Q4 2025",
        "url": "https://www.researchandmarkets.com/reports/6191236/bangladesh-b2c-ecommerce-market-size-and-forecast",
        "date": "2025-11",
        "note": "Third-party databook. Figures are modelled, not measured transactions.",
    },
    {
        "claim": "Share of retail that happens online",
        "value": "Roughly 2% of total retail; one source cites 3–5%",
        "status": "SECONDARY",
        "source": "The Daily Star interview with Daraz Group CEO (2021); accio.com market summary",
        "url": "https://www.thedailystar.net/business/economy/e-commerce/news/e-commerce-can-be-10-20-times-bigger-five-years-2230241",
        "date": "2021-11-15",
        "note": "Older interview and newer secondary summary disagree on the exact figure. Both agree the share is small.",
    },
    {
        "claim": "Cash-on-delivery share of online orders",
        "value": "Commonly cited 65–75% of orders",
        "status": "SECONDARY",
        "source": "businesskoro.com merchant-account guide; accio.com market summary (75%)",
        "url": "https://businesskoro.com/blog/bkash-and-nagad-merchant-account-guide-for-online-business",
        "date": "2026-08-31",
        "note": "Two independent secondary sources agree on the range. Not measured for our store.",
    },
    {
        "claim": "Courier delivery charge, inside Dhaka, 1 kg",
        "value": "Pathao from ৳60 · Steadfast from ৳55 · RedX ৳60–৳70 (reported)",
        "status": "SECONDARY",
        "source": "banikh.com courier comparison; couriertrace.com RedX rate chart",
        "url": "https://banikh.com/en/blog/best-courier-for-online-business-bangladesh",
        "date": "2026-07-30",
        "note": "Aggregator blogs, not official rate cards. Confirm on the merchant panel before launch.",
    },
    {
        "claim": "COD collection fee",
        "value": "Steadfast 1% · Pathao 0.5% inside Dhaka / 1% outside · RedX 0% inside Dhaka City, 1% outside",
        "status": "SECONDARY",
        "source": "banikh.com Steadfast vs Pathao vs RedX comparison",
        "url": "https://banikh.com/en/blog/steadfast-vs-pathao-vs-redx",
        "date": "2026-07-30",
        "note": "Rate cards change frequently. Re-verify at onboarding.",
    },
    {
        "claim": "Delivery charge, Dhaka to district, 1 kg",
        "value": "Steadfast ৳115 flat · Pathao up to ৳180 for 2 kg inter-district",
        "status": "SECONDARY",
        "source": "banikh.com courier comparison",
        "url": "https://banikh.com/en/blog/best-courier-for-online-business-bangladesh",
        "date": "2026-07-30",
        "note": "We model ৳115 in the workbook as a mid case.",
    },
    {
        "claim": "bKash merchant transaction fee",
        "value": "Commonly cited 1.5%–1.85%",
        "status": "SECONDARY",
        "source": "techlandbd.com payment terms; eomsbd.com Nagad/bKash guide",
        "url": "https://www.techlandbd.com/payment-terms",
        "date": "2026-07-15",
        "note": "Depends on merchant agreement. We model 1.85% worst case.",
    },
    {
        "claim": "Nagad merchant transaction fee",
        "value": "Commonly cited 1.2%–1.5%",
        "status": "SECONDARY",
        "source": "eomsbd.com Nagad gateway guide",
        "url": "https://eomsbd.com/article/nagad-payment-gateway-integration-for-ecommerce-websites-in-bangladesh-%E2%80%94-complete-guide-2026/94",
        "date": "2026-08-17",
        "note": "Lower than bKash on every source found.",
    },
    {
        "claim": "Dhaka wholesale market locations for our categories",
        "value": "Chandni Chowk & New Market (fashion, jewellery, accessories), Gausia (women's fashion), Islampur (fabric), Bashundhara City (accessories/tech), Chawk Bazar (general)",
        "status": "SECONDARY",
        "source": "onevasco.com Bangladesh markets guide; reviseworld.com wholesale market guide",
        "url": "https://reviseworld.com/best-wholesale-market-in-bangladesh/",
        "date": "2025-06-15",
        "note": "Maps which market to visit per category. Individual shop pricing is NOT VERIFIED.",
    },
    {
        "claim": "Wholesale price band for basic womenswear and accessories",
        "value": "Garments from ~৳150+, accessories from ~৳80 (Chawk Bazar); cotton three-piece ৳100–৳600 in Kamrangirchar",
        "status": "SECONDARY",
        "source": "reviseworld.com wholesale market guide",
        "url": "https://reviseworld.com/best-wholesale-market-in-bangladesh/",
        "date": "2025-06-15",
        "note": "Wide, undated bands. Only used to sanity-check our estimates, never as a quote.",
    },
    {
        "claim": "Jewellery price band in Chandni Chowk",
        "value": "৳200–৳25,000 depending on material (gold-plated, German silver, beads from China/India)",
        "status": "SECONDARY",
        "source": "Grokipedia Chandni Chowk summary citing market reports",
        "url": "https://grokipedia.com/page/chandni_chowk_dhaka",
        "date": "2026-01-17",
        "note": "Encyclopaedic secondary source of mixed reliability. Treated as a range only.",
    },
    {
        "claim": "RMG wholesale platform with published per-piece prices",
        "value": "Everywear Bangladesh: t-shirts from USD 2.50, caps from USD 2.50, custom from 300 pcs / ready-to-ship from 50 pcs",
        "status": "SECONDARY",
        "source": "everywearbd.com published wholesale listings",
        "url": "https://everywearbd.com/",
        "date": "2026-11-13",
        "note": "Listing prices, not a quotation for our MOQ. Useful as a cost ceiling check.",
    },
]

# ---------------------------------------------------------------------------
# Supplier / sourcing directory
# ---------------------------------------------------------------------------
SUPPLIERS = [
    {
        "id": "S-01", "name": "Chandni Chowk wholesale cluster", "type": "Physical market cluster",
        "area": "Azimpur / New Market, Dhaka 1205", "categories": "Womenswear, jewellery, accessories, bags",
        "contact_status": "NOT VERIFIED",
        "contact": "No individual shop verified. Verify in person and record shop name, owner, phone.",
        "moq_observed": "Mixed — often 6–12 pcs per design; bargaining expected",
        "price_evidence": "Jewellery reported ৳200–৳25,000; garments ৳400–৳15,000 per item",
        "source": "https://reviseworld.com/best-wholesale-market-in-bangladesh/",
        "status": "SECONDARY",
        "next_step": "Visit with the verification checklist; photograph price tags; collect 3 quotes per SKU.",
    },
    {
        "id": "S-02", "name": "New Market (Dhaka New Market)", "type": "Physical market",
        "area": "Mirpur Road, Dhaka 1205", "categories": "Clothing, jewellery, bags, stationery, home goods",
        "contact_status": "NOT VERIFIED",
        "contact": "Market-level only. Closed Tuesdays.",
        "moq_observed": "Retail and semi-wholesale; fixed prices rare",
        "price_evidence": "No category-specific quote verified",
        "source": "https://blog.onevasco.com/markets/bangladesh",
        "status": "SECONDARY",
        "next_step": "Price-check the 20 shortlisted SKUs across at least three shops each.",
    },
    {
        "id": "S-03", "name": "Gausia Market", "type": "Physical market",
        "area": "New Market area, Dhaka 1205", "categories": "Women's fashion: saree, three-piece, kurti; men's panjabi",
        "contact_status": "NOT VERIFIED",
        "contact": "Market-level only. Closed Tuesdays.",
        "moq_observed": "Reported bulk-friendly for retailers",
        "price_evidence": "No quote verified for our SKUs",
        "source": "https://reviseworld.com/best-wholesale-market-in-bangladesh/",
        "status": "SECONDARY",
        "next_step": "Best first stop for the festive/eid shortlist.",
    },
    {
        "id": "S-04", "name": "Islampur wholesale market", "type": "Wholesale market",
        "area": "Islampur Road, Old Dhaka 1100", "categories": "Fabric, dupatta, scarves, salwar kameez sets",
        "contact_status": "NOT VERIFIED",
        "contact": "Market-level only. Closed Fridays.",
        "moq_observed": "Fabric sold per yard; sets in bulk",
        "price_evidence": "BDT 40–250+ per yard",
        "source": "https://reviseworld.com/best-wholesale-market-in-bangladesh/",
        "status": "SECONDARY",
        "next_step": "Relevant only if we move into made-to-order or fabric bundles.",
    },
    {
        "id": "S-05", "name": "Bashundhara City (Level 4–8)", "type": "Shopping complex / wholesale floors",
        "area": "Panthapath, Dhaka 1215", "categories": "Phone accessories, watches, gadgets, gifts",
        "contact_status": "NOT VERIFIED",
        "contact": "Individual shops not identified or contacted.",
        "moq_observed": "Mostly retail; some shops wholesale on request",
        "price_evidence": "No quote verified",
        "source": "Local market knowledge — requires physical verification",
        "status": "NOT VERIFIED",
        "next_step": "Use for tech-accessory cost baselines, then compare against online wholesale.",
    },
    {
        "id": "S-06", "name": "Everywear Bangladesh Ltd", "type": "Online RMG wholesale platform",
        "area": "Dhaka (company)", "categories": "T-shirts, polos, hoodies, caps, socks, jackets",
        "contact_status": "SECONDARY — public listings only",
        "contact": "Listed publicly on everywearbd.com; not contacted by us",
        "moq_observed": "Ready-to-ship from 50 pcs; custom from 300 pcs",
        "price_evidence": "T-shirts from USD 2.50, caps from USD 2.50",
        "source": "https://everywearbd.com/",
        "status": "SECONDARY",
        "next_step": "Request a formal quote for 50 pcs of our top 3 apparel SKUs.",
    },
    {
        "id": "S-07", "name": "Kamrangirchar wholesale cluster", "type": "Wholesale cluster",
        "area": "Kamrangirchar, Dhaka", "categories": "Basic everyday wear, cotton three-piece",
        "contact_status": "NOT VERIFIED",
        "contact": "Cluster-level only.",
        "moq_observed": "Bulk, aimed at resellers",
        "price_evidence": "BDT 100–600 per piece",
        "source": "https://reviseworld.com/best-wholesale-market-in-bangladesh/",
        "status": "SECONDARY",
        "next_step": "Lowest-cost apparel option; check stitching quality before ordering.",
    },
    {
        "id": "S-08", "name": "Chawk Bazar wholesale market", "type": "Wholesale market",
        "area": "Old Dhaka", "categories": "Garments, general accessories, household",
        "contact_status": "NOT VERIFIED",
        "contact": "Market-level only.",
        "moq_observed": "Bulk",
        "price_evidence": "Garments from ~৳150, accessories from ~৳80",
        "source": "https://reviseworld.com/best-wholesale-market-in-bangladesh/",
        "status": "SECONDARY",
        "next_step": "Use for gift-box and stationery cost checks.",
    },
    {
        "id": "S-09", "name": "Online wholesale (Daraz/Alibaba-class platforms)",
        "type": "Online marketplace",
        "area": "National / international", "categories": "Tech accessories, watches, small goods",
        "contact_status": "NOT VERIFIED",
        "contact": "Supplier identities change per listing; no stable supplier record.",
        "moq_observed": "Varies 1–100 pcs",
        "price_evidence": "Landed cost must include duty and 20–40 day lead time",
        "source": "General knowledge — no specific listing verified for our SKUs",
        "status": "NOT VERIFIED",
        "next_step": "Only after local sourcing is proven too slow or too costly.",
    },
]

# ---------------------------------------------------------------------------
# Cost assumptions used by the workbook's calculators
# ---------------------------------------------------------------------------
ASSUMPTIONS = {
    "courier_dhaka": 60,          # Pathao/RedX inside Dhaka, 1 kg, secondary evidence
    "courier_outside": 115,       # Steadfast flat Dhaka→district, secondary evidence
    "cod_fee_pct": 0.01,          # Steadfast 1% (worst case of our couriers)
    "packaging_per_order": 25,    # poly mailer + tape + label + thank-you card (estimate)
    "inbound_transport_pct": 0.03,  # rickshaw/CNG/Pathao from market to home (estimate)
    "return_reserve_pct": 0.045,  # 4.5% of revenue set aside for returns/defects (estimate)
    "ad_cost_per_delivered_order": 95,  # Facebook/Instagram CAC at small spend (estimate)
    "bkash_fee_pct": 0.0185,      # bKash merchant, worst case of secondary range
    "nagad_fee_pct": 0.015,       # Nagad merchant
    "inside_dhaka_order_share": 0.6,  # planning assumption
    "return_rate_conservative": 0.10,
    "return_rate_moderate": 0.06,
    "return_rate_optimistic": 0.03,
}

# ---------------------------------------------------------------------------
# Launch shortlist: 20 SKUs to sample before buying deep
# ---------------------------------------------------------------------------
LAUNCH_TIERS = [
    # slug, tier, why  — tier A fills ৳3k first, then B, C, D as capital allows
    ("gold-plated-choker-set", "A", "Highest ticket among light, low-return items; gift and wedding demand."),
    ("silk-scrunchies-3-pack", "A", "Low cost, sells as an add-on, lifts basket size above the delivery threshold."),
    ("large-claw-clip", "A", "Trending accessory, strong repeat purchase, near-zero courier weight."),
    ("pearl-hair-pins-set", "A", "Cheap to stock, photographs well, low return risk."),
    ("9h-tempered-glass-protector", "A", "Fast-moving phone accessory with the best margin band in the catalogue."),
    ("finger-ring-phone-holder", "A", "Impulse add-on; cheapest unit in the launch range."),
    ("bamboo-detangling-comb", "A", "Light, non-returnable-hygiene-safe, good bundle partner."),
    ("sticky-note-set", "A", "Back-to-school and office demand at a low unit cost."),
    ("sport-wrist-sweatband", "B", "Cheap unisex accessory; tests the accessories category."),
    ("couple-anniversary-card-set", "B", "Occasion gifting entry price; pairs with the bracelet."),
    ("silicone-protective-phone-case", "B", "High volume potential; model-specific SKUs limit depth at launch."),
    ("cotton-twill-baseball-cap", "B", "Consistent summer seller; verifies fit-related returns."),
    ("bifold-leather-wallet", "C", "Evergreen men's gift; easy QC, low defect risk."),
    ("embroidered-cotton-kurti", "C", "Workhorse women's apparel; validates the size curve and return rate."),
    ("classic-oxford-cotton-shirt", "C", "Core menswear test at a mid ticket."),
    ("insulated-steel-bottle-750-ml", "C", "Lifestyle staple with a low return rate."),
    ("couple-bracelet-pair", "D", "Gift occasion demand; light but higher unit cost."),
    ("tws-wireless-earbuds", "D", "Higher ticket but higher defect risk — sample before scaling."),
    ("minimal-leather-strap-watch", "D", "Anchor product at ৳2,690; proves premium positioning."),
    ("premium-gift-hamper", "D", "Tests gifting basket size; margin depends on packaging cost control."),
]
SHORTLIST = [(slug, tier, why) for slug, tier, why in LAUNCH_TIERS]
