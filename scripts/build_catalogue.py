#!/usr/bin/env python3
"""
SUPER Z SHOP — catalogue source of truth.

Generates data/catalogue/products.json + categories.json from compact Python
definitions. Both the Next.js seed script and the business workbook read the
generated JSON, so store copy and workbook copy can never drift apart.

Pricing note: wholesale costs are *indicative Dhaka market estimates* recorded
from market-visit price bands (New Market / Chandni Chowk / Gausia / Islampur /
Bashundhara City / online wholesale platforms). Every price row carries
`priceStatus: "unverified"` until a supplier invoice confirms it.
"""
import json
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "data", "catalogue")

# ---------------------------------------------------------------------------
# Categories: slug, name, bangla name, blurb, icon key
# ---------------------------------------------------------------------------
CATEGORIES = [
    ("mens-fashion", "Men's Fashion", "পুরুষদের ফ্যাশন", "Shirts, panjabi, denim and tailoring built for Bangladeshi weather.", "shirt"),
    ("womens-fashion", "Women's Fashion", "মহিলাদের ফ্যাশন", "Saree, three-piece, kurti and modern ready-to-wear.", "dress"),
    ("unisex-accessories", "Unisex Accessories", "ইউনিসেক্স অ্যাক্সেসরিজ", "Caps, belts, eyewear and daily carry essentials.", "cap"),
    ("jewellery", "Jewellery", "গহনা", "Gold-plated, kundan and oxidised pieces for everyday and weddings.", "gem"),
    ("watches", "Watches", "ঘড়ি", "Minimal, classic and sport watches with local warranty support.", "watch"),
    ("bags-wallets", "Bags & Wallets", "ব্যাগ ও ওয়ালেট", "Leather wallets, backpacks, sling bags and laptop carry.", "bag"),
    ("phone-tech", "Phone & Tech Accessories", "ফোন ও টেক অ্যাক্সেসরিজ", "Chargers, audio, cases and desk tech.", "phone"),
    ("hair-beauty", "Hair & Beauty Accessories", "চুল ও বিউটি", "Styling tools, clips and beauty rituals.", "scissors"),
    ("couple-collections", "Couple Collections", "কাপল কালেকশন", "Matching sets made for two.", "heart"),
    ("gifts", "Gifts", "গিফট", "Ready-to-give boxes with cards and wrapping.", "gift"),
    ("travel-accessories", "Travel Accessories", "ট্রাভেল অ্যাক্সেসরিজ", "Luggage, organisers and travel comfort.", "plane"),
    ("lifestyle", "Lifestyle", "লাইফস্টাইল", "Fitness, hydration and everyday wellness.", "bottle"),
    ("desk-stationery", "Desk & Stationery", "ডেস্ক ও স্টেশনারি", "Journals, pens and workspace order.", "pen"),
    ("home-decor", "Home & Decor", "হোম ও ডেকোর", "Bedsheets, cushions and small decor.", "home"),
    ("seasonal-collections", "Seasonal Collections", "সিজনাল কালেকশন", "Eid, winter, monsoon and festive edits.", "sun"),
]

PALETTE = {
    "apparel": ["Black", "White", "Navy", "Olive", "Maroon", "Beige"],
    "ethnic": ["Maroon", "Deep Green", "Royal Blue", "Black", "Off-White", "Mustard"],
    "metal": ["Gold", "Silver", "Rose Gold"],
    "neutral": ["Black", "Tan", "Brown", "Charcoal"],
    "tech": ["Black", "White", "Navy"],
    "home": ["Ivory", "Sage", "Terracotta", "Grey"],
}

SIZES = {
    "apparel-men": ["S", "M", "L", "XL", "XXL"],
    "apparel-women": ["XS", "S", "M", "L", "XL"],
    "one": ["One Size"],
    "shoe": ["39", "40", "41", "42", "43"],
    "none": [],
}

# ---------------------------------------------------------------------------
# Product rows
# (name, name_bn, subcategory, wholesale, retail, short copy, colour key, size key, tags)
# ---------------------------------------------------------------------------
ROWS = {}

ROWS["mens-fashion"] = [
    ("Classic Oxford Cotton Shirt", "ক্লাসিক অক্সফোর্ড কটন শার্ট", "Shirts", 1150, 2190,
     "Yarn-dyed cotton oxford with a soft roll collar and a clean, tapered body.", "apparel", "apparel-men", ["office", "cotton", "solid"]),
    ("Premium Cotton Panjabi", "প্রিমিয়াম কটন পাঞ্জাবি", "Panjabi", 1450, 2990,
     "Hand-finished placket and mandarin collar in breathable slub cotton for Eid and Fridays.", "ethnic", "apparel-men", ["eid", "festive", "cotton"]),
    ("Slim Fit Stretch Chino", "স্লিম ফিট স্ট্রেচ চিনো", "Trousers", 1050, 1990,
     "Cotton-twill chino with 2% elastane so it holds shape through a full workday.", "neutral", "apparel-men", ["office", "casual"]),
    ("Oversized Heavyweight Tee", "ওভারসাইজড হেভিওয়েট টি-শার্ট", "T-Shirts", 520, 1190,
     "240 GSM combed cotton with a boxy drop-shoulder cut and ribbed neck tape.", "apparel", "apparel-men", ["streetwear", "cotton"]),
    ("Drop-Shoulder Pique Polo", "ড্রপ-শোল্ডার পিকে পোলো", "Polo Shirts", 640, 1290,
     "Breathable pique knit polo with a two-button placket and side vents.", "apparel", "apparel-men", ["casual", "summer"]),
    ("Washed Denim Trucker Jacket", "ওয়াশড ডেনিম ট্রাকার জ্যাকেট", "Jackets", 1750, 3490,
     "Mid-weight 12 oz denim, stone-washed with copper rivets and twin chest pockets.", "neutral", "apparel-men", ["winter", "denim"]),
    ("Two-Piece Formal Suit", "টু-পিস ফরমাল স্যুট", "Suits", 4200, 7990,
     "Poly-viscose suiting with a half-canvas front, satin lining and matching trousers.", "neutral", "apparel-men", ["wedding", "formal"]),
    ("Brushed Fleece Hoodie", "ব্রাশড ফ্লিস হুডি", "Hoodies", 950, 1890,
     "320 GSM brushed fleece with kangaroo pocket and double-layer hood.", "apparel", "apparel-men", ["winter", "streetwear"]),
    ("Utility Cargo Jogger", "ইউটিলিটি কার্গো জগার", "Trousers", 890, 1690,
     "Tapered jogger in ripstop cotton with six pockets and elastic cuffs.", "apparel", "apparel-men", ["casual", "streetwear"]),
    ("Cotton Kurta Set", "কটন কুর্তা সেট", "Kurta Sets", 1350, 2690,
     "Straight-cut kurta with matching pyjama in soft cotton cambric.", "ethnic", "apparel-men", ["festive", "eid"]),
    ("Leather-Trim Bomber Jacket", "লেদার-ট্রিম বোম্বার জ্যাকেট", "Jackets", 2400, 4590,
     "Water-resistant shell with faux-leather trims and quilted lining.", "neutral", "apparel-men", ["winter", "premium"]),
    ("Linen Blend Summer Shirt", "লিনেন ব্লেন্ড সামার শার্ট", "Shirts", 980, 1890,
     "55% linen blend that breathes in Dhaka humidity and softens with every wash.", "apparel", "apparel-men", ["summer", "office"]),
    ("Combed Cotton Boxer Brief (3-Pack)", "কটন বক্সার ব্রিফ (৩ প্যাক)", "Innerwear", 480, 990,
     "Tagless waistband, moisture-wicking combed cotton, three colours per pack.", "apparel", "apparel-men", ["innerwear", "cotton"]),
    ("Wool-Blend Winter Muffler", "উল-ব্লেন্ড শীতের মাফলার", "Winter Wear", 420, 890,
     "Soft wool-blend muffler with fringed ends; light enough for a Dhaka winter.", "neutral", "one", ["winter", "gift"]),
    ("Ethnic Nehru Waistcoat", "এথনিক নেহরু ওয়েস্টকোট", "Waistcoats", 1250, 2490,
     "Jacquard waistcoat that layers over any panjabi for weddings and Eid.", "ethnic", "apparel-men", ["wedding", "festive"]),
]

ROWS["womens-fashion"] = [
    ("Muslin Cotton Three-Piece", "মসলিন কটন থ্রি-পিস", "Three-Piece", 1650, 3290,
     "Unstitched-feel printed muslin set with kameez, salwar and dupatta.", "ethnic", "apparel-women", ["festive", "cotton"]),
    ("Kantha-Stitch Cotton Saree", "কাঁথা স্টিচ কটন শাড়ি", "Saree", 1250, 2790,
     "Hand kantha-stitched cotton saree with a contrast woven border.", "ethnic", "one", ["handloom", "festive"]),
    ("Georgette Party Saree", "জর্জেট পার্টি শাড়ি", "Saree", 2100, 4290,
     "Fluid georgette with sequin scattered border and matching blouse piece.", "ethnic", "one", ["party", "wedding"]),
    ("Embroidered Cotton Kurti", "এমব্রয়ডারি কটন কুর্তি", "Kurti", 890, 1790,
     "Straight kurti with thread embroidery at the yoke and side slits.", "ethnic", "apparel-women", ["casual", "office"]),
    ("Floral Print Maxi Dress", "ফ্লোরাল ম্যাক্সি ড্রেস", "Dresses", 1150, 2390,
     "Flowy viscose maxi with smocked waist and adjustable straps.", "apparel", "apparel-women", ["summer", "party"]),
    ("Wide-Leg Palazzo Pants", "ওয়াইড-লেগ পালাজো", "Bottoms", 640, 1390,
     "Crepe palazzo with drawstring waist; pairs with kurti or shirt.", "ethnic", "apparel-women", ["casual", "comfort"]),
    ("Cotton Nightwear Set", "কটন নাইটওয়্যার সেট", "Nightwear", 780, 1590,
     "Two-piece night set in printed cotton lawn with elastic waist.", "apparel", "apparel-women", ["comfort", "cotton"]),
    ("Denim Shirt Dress", "ডেনিম শার্ট ড্রেস", "Dresses", 1350, 2690,
     "Belted shirt dress in washed denim with roll-up sleeves.", "neutral", "apparel-women", ["casual", "denim"]),
    ("Chiffon Dupatta", "শিফন ওড়না", "Dupatta", 380, 890,
     "Lightweight chiffon dupatta with hand-finished scalloped edges.", "ethnic", "one", ["festive", "everyday"]),
    ("Silk-Blend Winter Shawl", "সিল্ক-ব্লেন্ড শাল", "Shawls", 1450, 2990,
     "Woven silk-blend shawl with a soft fall and reversible two-tone border.", "ethnic", "one", ["winter", "gift"]),
    ("Ruffle Neck Blouse", "রাফল নেক ব্লাউজ", "Tops", 950, 1990,
     "Satin-finish blouse with ruffle neckline and covered buttons.", "apparel", "apparel-women", ["office", "party"]),
    ("Printed Cotton Co-ord Set", "প্রিন্টেড কটন কো-অর্ড সেট", "Co-ord Sets", 1250, 2590,
     "Relaxed shirt and trouser set cut from the same print for effortless styling.", "apparel", "apparel-women", ["casual", "summer"]),
    ("Semi-Formal Lehenga", "সেমি-ফরমাল লেহেঙ্গা", "Bridal", 6500, 12900,
     "Net lehenga with hand work on the bodice and a soft kanchan-style flare.", "ethnic", "apparel-women", ["wedding", "bridal"]),
    ("Pleated Midi Skirt", "প্লিটেড মিডি স্কার্ট", "Bottoms", 890, 1890,
     "Knife-pleated midi with elasticated waist and matte finish.", "apparel", "apparel-women", ["office", "party"]),
    ("Embroidered Salwar Kameez", "এমব্রয়ডারি সালোয়ার কামিজ", "Three-Piece", 1850, 3690,
     "Kameez with mirror-work yoke, matching salwar and printed dupatta.", "ethnic", "apparel-women", ["festive", "eid"]),
]

ROWS["unisex-accessories"] = [
    ("Cotton Twill Baseball Cap", "কটন বেসবল ক্যাপ", "Caps & Hats", 320, 690,
     "Six-panel cotton cap with brass slider and curved visor.", "apparel", "one", ["summer", "everyday"]),
    ("Ribbed Knit Beanie", "রিবড নিট বিনি", "Caps & Hats", 290, 650,
     "Stretch acrylic-wool beanie with folded cuff; fits all head sizes.", "neutral", "one", ["winter"]),
    ("UV400 Aviator Sunglasses", "ইউভি৪০০ এভিয়েটর সানগ্লাস", "Eyewear", 450, 1090,
     "Metal-frame aviators with polarised UV400 lenses and spring hinges.", "metal", "one", ["summer", "uv"]),
    ("Classic Wayfarer Sunglasses", "ওয়েফেয়ারার সানগ্লাস", "Eyewear", 380, 890,
     "Acetate-look wayfarer with scratch-resistant grey lenses.", "tech", "one", ["summer", "everyday"]),
    ("Bandana Print Cotton Scarf", "ব্যান্ডানা কটন স্কার্ফ", "Scarves", 280, 690,
     "Square cotton scarf that works as head tie, bandana or neck wear.", "apparel", "one", ["summer"]),
    ("Cushioned Ankle Socks (5-Pack)", "কুশনড অ্যাঙ্কল সকস (৫ প্যাক)", "Socks", 320, 750,
     "Combed cotton socks with reinforced heel, five pairs per pack.", "apparel", "one", ["everyday"]),
    ("Full-Grain Leather Belt", "ফুল-গ্রেইন লেদার বেল্ট", "Belts", 620, 1390,
     "Full-grain leather belt with brushed pin buckle; trim-to-fit.", "neutral", "one", ["office", "leather"]),
    ("Reusable Cotton Face Mask (3-Pack)", "কটন ফেস মাস্ক (৩ প্যাক)", "Everyday Wear", 180, 450,
     "Three-layer cotton mask with adjustable ear loops; machine washable.", "apparel", "one", ["health"]),
    ("Touchscreen Knit Gloves", "টাচস্ক্রিন নিট গ্লাভস", "Gloves", 260, 590,
     "Conductive fingertips for phone use, thermal knit back.", "neutral", "one", ["winter"]),
    ("Auto-Open Compact Umbrella", "অটো-ওপেন আম্ব্রেলা", "Umbrella", 620, 1390,
     "Windproof eight-rib frame with auto-open and a 95 cm canopy.", "tech", "one", ["monsoon"]),
    ("Packable Rain Poncho", "প্যাকেবল রেইন পঞ্চো", "Rainwear", 340, 790,
     "Reusable EVA poncho that folds into its own pouch bag.", "tech", "one", ["monsoon"]),
    ("Unisex Bucket Hat", "ইউনিসেক্স বাকেট হ্যাট", "Caps & Hats", 360, 790,
     "Washed cotton bucket hat with a soft, packable brim.", "apparel", "one", ["summer", "streetwear"]),
    ("Sport Wrist Sweatband", "স্পোর্ট রিস্টব্যান্ড", "Sport", 150, 390,
     "Terry-cotton sweatband pair with four-way stretch.", "apparel", "one", ["fitness"]),
    ("Lanyard with Card Holder", "ল্যানিয়ার্ড সহ কার্ড হোল্ডার", "Everyday Wear", 220, 490,
     "Printed lanyard with a retractable badge clip for office ID cards.", "tech", "one", ["office"]),
    ("Cotton Handloom Stole", "হ্যান্ডলুম কটন স্টোল", "Scarves", 420, 990,
     "Handwoven stole from Bangladeshi handloom weavers with fringed ends.", "ethnic", "one", ["handloom", "gift"]),
]

ROWS["jewellery"] = [
    ("Gold-Plated Choker Set", "গোল্ড-প্লেটেড চোকার সেট", "Necklace Sets", 820, 1990,
     "Gold-plated choker with matching earrings in an anti-tarnish finish.", "metal", "one", ["wedding", "party"]),
    ("Kundan Necklace Set", "কুন্দন নেকলেস সেট", "Necklace Sets", 1450, 3490,
     "Kundan-work choker with pearl drops, earrings and maang tikka.", "metal", "one", ["bridal", "wedding"]),
    ("Pearl Drop Earrings", "পার্ল ড্রপ ইয়ারিংস", "Earrings", 320, 790,
     "Freshwater-look pearl drops on gold-tone hooks.", "metal", "one", ["office", "gift"]),
    ("Oxidised Silver Jhumka", "অক্সিডাইজড সিলভার ঝুমকা", "Earrings", 380, 890,
     "Oxidised silver-finish jhumka with light ghungroo detail.", "metal", "one", ["festive", "ethnic"]),
    ("Adjustable Ring Set (5-Piece)", "অ্যাডজাস্টেবল রিং সেট (৫ পিস)", "Rings", 260, 650,
     "Five stacking rings in mixed metals; free-size bands.", "metal", "one", ["gift", "everyday"]),
    ("Meenakari Bangle Set", "মিনাকারি বাঙ্গল সেট", "Bangles", 540, 1290,
     "Hand-painted enamel bangles, set of six with a velvet pouch.", "metal", "one", ["festive", "gift"]),
    ("Sterling Silver Chain Pendant", "স্টার্লিং সিলভার চেইন পেন্ডেন্ট", "Necklaces", 690, 1590,
     "92.5 silver-plated chain with a cubic zirconia pendant.", "metal", "one", ["gift", "minimal"]),
    ("American Diamond Studs", "আমেরিকান ডায়মন্ড স্টাডস", "Earrings", 420, 990,
     "AD studs with screw-back closure for all-day comfort.", "metal", "one", ["office", "party"]),
    ("Terracotta Handpainted Earrings", "টেরাকোটা ইয়ারিংস", "Earrings", 220, 590,
     "Handpainted terracotta earrings made by local artisan clusters.", "home", "one", ["handmade", "gift"]),
    ("Bridal Maang Tikka", "ব্রাইডাল মাং টিকা", "Bridal", 720, 1790,
     "Kundan maang tikka with adjustable chain for bridal styling.", "metal", "one", ["bridal"]),
    ("Nose Pin Set (3-Piece)", "নোজ পিন সেট", "Everyday", 180, 450,
     "Hypoallergenic nose pins in three sizes with screw backs.", "metal", "one", ["everyday", "gift"]),
    ("Silver-Finish Anklet Pair", "সিলভার অ্যাঙ্কলেট পেয়ার", "Anklets", 340, 790,
     "Adjustable anklet pair with tiny bell charms.", "metal", "one", ["festive"]),
    ("Crystal Brooch Pin", "ক্রিস্টাল ব্রোচ পিন", "Brooches", 380, 890,
     "Crystal brooch that finishes a saree, blazer or panjabi.", "metal", "one", ["wedding", "gift"]),
    ("Layered Coin Necklace", "লেয়ারড কয়েন নেকলেস", "Necklaces", 460, 1090,
     "Two-layer coin necklace in antique-gold finish.", "metal", "one", ["trending", "party"]),
    ("Resin Floral Earrings", "রেজিন ফ্লোরাল ইয়ারিংস", "Earrings", 240, 590,
     "Hand-cast resin florals with hypoallergenic posts.", "home", "one", ["summer", "handmade"]),
]

ROWS["watches"] = [
    ("Minimal Leather Strap Watch", "মিনিমাল লেদার স্ট্র্যাপ ওয়াচ", "Classic", 1150, 2690,
     "36 mm case, Japanese quartz movement and a genuine leather strap.", "neutral", "one", ["office", "minimal"]),
    ("Steel Chronograph Watch", "স্টিল ক্রোনোগ্রাফ ওয়াচ", "Chronograph", 2350, 4990,
     "42 mm stainless-steel chronograph with luminous hands and 5 ATM splash resistance.", "metal", "one", ["premium", "gift"]),
    ("Ceramic Bracelet Women's Watch", "সিরামিক ব্রেসলেট ওয়াচ", "Women", 1650, 3590,
     "Ceramic-link bracelet watch with mother-of-pearl dial.", "neutral", "one", ["party", "gift"]),
    ("Milanese Mesh Watch", "মিলানিজ মেশ ওয়াচ", "Minimal", 1250, 2790,
     "Slim mesh-bracelet watch with magnetic clasp and 38 mm dial.", "metal", "one", ["office", "minimal"]),
    ("Digital Sports Watch", "ডিজিটাল স্পোর্টস ওয়াচ", "Sport", 620, 1390,
     "Water-resistant digital watch with stopwatch, alarm and backlight.", "tech", "one", ["fitness", "everyday"]),
    ("Couple Watch Pair", "কাপল ওয়াচ পেয়ার", "Couple", 2450, 5290,
     "Matched his-and-hers pair in a gift box with a card.", "metal", "one", ["gift", "couple"]),
    ("Rose Gold Slim Watch", "রোজ গোল্ড স্লিম ওয়াচ", "Women", 1450, 3190,
     "Rose-gold case on a fine link bracelet with a clean dial.", "metal", "one", ["party", "gift"]),
    ("Skeleton Automatic Watch", "স্কেলেটন অটোমেটিক ওয়াচ", "Automatic", 3600, 7490,
     "Open-heart automatic with exhibition caseback and leather strap.", "neutral", "one", ["premium", "collector"]),
    ("Bamboo Wooden Watch", "বাঁশ কাঠের ওয়াচ", "Eco", 1350, 2990,
     "Bamboo-wood case and link band; lightweight and vegan.", "neutral", "one", ["eco", "gift"]),
    ("Kids Cartoon Watch", "কিডস কার্টুন ওয়াচ", "Kids", 280, 690,
     "Soft silicone strap kids watch with easy-read dial.", "tech", "one", ["kids", "gift"]),
    ("Square Dial Vintage Watch", "স্কয়ার ডায়াল ভিন্টেজ ওয়াচ", "Vintage", 980, 2190,
     "Square cushion case with a domed crystal and vintage leather strap.", "neutral", "one", ["vintage", "gift"]),
    ("Fitness Tracker Band", "ফিটনেস ট্র্যাকার ব্যান্ড", "Smart", 1150, 2490,
     "Step, heart-rate and sleep tracking with a 7-day battery.", "tech", "one", ["fitness", "tech"]),
    ("Diver-Style Rubber Strap Watch", "ডাইভার স্টাইল রাবার স্ট্র্যাপ ওয়াচ", "Sport", 1550, 3290,
     "Rotating bezel, screw-down crown look and a soft rubber strap.", "tech", "one", ["sport", "everyday"]),
    ("Calendar Moonphase Watch", "ক্যালেন্ডার মুনফেজ ওয়াচ", "Classic", 2650, 5590,
     "Day-date and moonphase display on a textured leather strap.", "neutral", "one", ["premium", "office"]),
    ("Interchangeable Strap Watch Set", "ইন্টারচেঞ্জেবল স্ট্র্যাপ ওয়াচ সেট", "Gift Set", 1750, 3790,
     "One watch head with three quick-release straps in a travel case.", "metal", "one", ["gift", "versatile"]),
]

ROWS["bags-wallets"] = [
    ("Bifold Leather Wallet", "বাইফোল্ড লেদার ওয়ালেট", "Wallets", 480, 1090,
     "Full-grain leather bifold with eight card slots and RFID lining.", "neutral", "one", ["gift", "leather"]),
    ("Slim RFID Card Holder", "স্লিম আরএফআইডি কার্ড হোল্ডার", "Wallets", 290, 690,
     "Pop-up aluminium card case with RFID blocking.", "tech", "one", ["minimal", "office"]),
    ("Ladies Mini Sling Bag", "লেডিস মিনি স্লিং ব্যাগ", "Sling & Crossbody", 890, 1990,
     "Structured mini sling with detachable chain strap.", "neutral", "one", ["party", "gift"]),
    ("Canvas Tote Shoulder Bag", "ক্যানভাস টোট ব্যাগ", "Tote", 650, 1490,
     "Heavy cotton-canvas tote with inner zip pocket; fits a 14-inch laptop.", "neutral", "one", ["everyday", "office"]),
    ("15.6-inch Laptop Backpack", "১৫.৬ ইঞ্চি ল্যাপটপ ব্যাকপ্যাক", "Backpacks", 1250, 2690,
     "Padded 15.6-inch laptop sleeve, USB pass-through and water-resistant shell.", "tech", "one", ["office", "travel"]),
    ("Anti-Theft Backpack", "অ্যান্টি-থেফট ব্যাকপ্যাক", "Backpacks", 1450, 3090,
     "Hidden zip compartments and a built-in combination lock.", "tech", "one", ["travel", "security"]),
    ("Canvas Messenger Bag", "ক্যানভাস মেসেঞ্জার ব্যাগ", "Messenger", 950, 2090,
     "Crossbody messenger with adjustable webbing strap and magnetic flap.", "neutral", "one", ["casual", "campus"]),
    ("Kids School Backpack", "কিডস স্কুল ব্যাকপ্যাক", "Backpacks", 780, 1690,
     "Lightweight school bag with reflective strips and bottle pocket.", "tech", "one", ["kids", "school"]),
    ("Evening Clutch", "ইভিনিং ক্লাচ", "Clutch", 720, 1690,
     "Satin clutch with detachable wrist strap and magnetic closure.", "neutral", "one", ["party", "wedding"]),
    ("Weekend Travel Duffle", "উইকেন্ড ট্রাভেল ডাফল", "Duffle", 1650, 3490,
     "45 L duffle with shoe compartment and trolley sleeve.", "neutral", "one", ["travel", "gym"]),
    ("Crossbody Mini Camera Bag", "ক্রসবডি মিনি ক্যামেরা ব্যাগ", "Sling & Crossbody", 980, 2190,
     "Compact camera-style crossbody with adjustable wide strap.", "neutral", "one", ["casual", "trending"]),
    ("14-inch Laptop Sleeve", "১৪ ইঞ্চি ল্যাপটপ স্লিভ", "Laptop Bags", 560, 1290,
     "Felt-lined sleeve with a padded lip and accessory pocket.", "tech", "one", ["office"]),
    ("Wristlet Purse", "রিস্টলেট পার্স", "Wallets", 420, 990,
     "Zip wristlet that holds a phone, cards and keys.", "neutral", "one", ["party", "minimal"]),
    ("Hanging Toiletry Pouch", "হ্যান্ডিং টয়লেট্রি পাউচ", "Travel", 390, 890,
     "Water-resistant pouch with a hook for bathroom hanging.", "tech", "one", ["travel"]),
    ("Belt Bag / Bum Bag", "বেল্ট ব্যাগ", "Sling & Crossbody", 620, 1390,
     "Hands-free belt bag with a wide strap and rear slip pocket.", "tech", "one", ["travel", "streetwear"]),
]

ROWS["phone-tech"] = [
    ("Silicone Protective Phone Case", "সিলিকন ফোন কেস", "Phone Cases", 180, 490,
     "Liquid-silicone case with microfibre lining and raised camera lip.", "tech", "one", ["everyday"]),
    ("9H Tempered Glass Protector", "৯এইচ টেম্পারড গ্লাস", "Screen Protection", 90, 290,
     "9H hardness tempered glass with oleophobic coating and install frame.", "tech", "one", ["everyday"]),
    ("10000mAh Power Bank", "১০০০০ এমএএইচ পাওয়ার ব্যাংক", "Power", 950, 2190,
     "Dual-output power bank with USB-C input and digital charge display.", "tech", "one", ["travel", "everyday"]),
    ("3-in-1 Braided Charging Cable", "৩-ইন-১ চার্জিং কেবল", "Cables", 220, 590,
     "Nylon-braided cable with Lightning, USB-C and micro-USB heads.", "tech", "one", ["travel"]),
    ("20W Fast Charger Adapter", "২০ডব্লিউ ফাস্ট চার্জার", "Power", 380, 890,
     "Compact 20W PD adapter with over-current protection.", "tech", "one", ["everyday"]),
    ("TWS Wireless Earbuds", "টিডব্লিউএস ইয়ারবাডস", "Audio", 1150, 2590,
     "Bluetooth 5.3 earbuds with touch controls and a 24-hour charging case.", "tech", "one", ["audio", "commute"]),
    ("Portable Bluetooth Speaker", "পোর্টেবল ব্লুটুথ স্পিকার", "Audio", 1350, 2990,
     "10 W speaker with IPX5 splash resistance and 12-hour playtime.", "tech", "one", ["audio", "travel"]),
    ("Finger Ring Phone Holder", "ফিঙ্গার রিং হোল্ডার", "Mounts & Holders", 80, 250,
     "Metal ring grip that doubles as a kickstand.", "tech", "one", ["everyday"]),
    ("Adjustable Laptop Stand", "অ্যাডজাস্টেবল ল্যাপটপ স্ট্যান্ড", "Desk Tech", 750, 1650,
     "Aluminium stand with six height levels and silicone pads.", "metal", "one", ["office"]),
    ("6-in-1 USB-C Hub", "৬-ইন-১ ইউএসবি-সি হাব", "Desk Tech", 1350, 2990,
     "HDMI 4K, two USB 3.0, SD, microSD and 100 W PD pass-through.", "metal", "one", ["office"]),
    ("Smartwatch Replacement Strap", "স্মার্টওয়াচ স্ট্র্যাপ", "Wearables", 250, 650,
     "Quick-release silicone strap in 20 mm and 22 mm sizes.", "tech", "one", ["everyday"]),
    ("Magnetic Car Phone Mount", "ম্যাগনেটিক কার ফোন মাউন্ট", "Mounts & Holders", 320, 790,
     "Vent-clip magnetic mount with N52 magnets and a metal plate.", "tech", "one", ["car"]),
    ("Cable Organiser Kit", "কেবল অর্গানাইজার কিট", "Desk Tech", 240, 590,
     "Silicone clips, ties and a pouch to stop desk cable clutter.", "tech", "one", ["office", "travel"]),
    ("Phone Tripod with Remote", "ফোন ট্রাইপড রিমোট সহ", "Content Creation", 480, 1150,
     "Extendable tripod with a Bluetooth shutter for content creators.", "tech", "one", ["creator"]),
    ("Phone Grip Card Wallet", "ফোন গ্রিপ কার্ড ওয়ালেট", "Phone Cases", 190, 490,
     "Stick-on grip holding two cards, doubling as a stand.", "tech", "one", ["everyday"]),
]

ROWS["hair-beauty"] = [
    ("Silk Scrunchies (3-Pack)", "সিল্ক স্ক্রাঞ্চি (৩ প্যাক)", "Hair Ties", 180, 490,
     "Mulberry-satin scrunchies that hold hair without creasing.", "apparel", "one", ["gift", "everyday"]),
    ("Large Claw Clip", "বড় ক্লো ক্লিপ", "Clips", 140, 390,
     "Matte acetate claw clip with strong spring for thick hair.", "neutral", "one", ["everyday", "trending"]),
    ("Pearl Hair Pins Set", "পার্ল হেয়ার পিন সেট", "Pins", 160, 450,
     "Set of six pearl-tipped pins for bridal and party styling.", "metal", "one", ["wedding", "party"]),
    ("Ceramic Hair Straightener", "সিরামিক হেয়ার স্ট্রেইটনার", "Styling Tools", 1250, 2790,
     "Ceramic plates with adjustable 150–230 °C heat and auto shut-off.", "tech", "one", ["styling"]),
    ("Compact Travel Hair Dryer", "কম্প্যাক্ট হেয়ার ড্রায়ার", "Styling Tools", 950, 2190,
     "1200 W folding dryer with two heat and two speed settings.", "tech", "one", ["travel", "styling"]),
    ("Ceramic Curling Wand", "সিরামিক কার্লিং ওয়ান্ড", "Styling Tools", 1150, 2490,
     "25 mm barrel that creates defined curls with even heat.", "tech", "one", ["styling"]),
    ("Beard Trimmer", "বিয়ার্ড ট্রিমার", "Grooming", 1350, 2990,
     "Cordless trimmer with four guide combs and USB-C charging.", "tech", "one", ["grooming", "gift"]),
    ("Makeup Brush Set (12-Piece)", "মেকআপ ব্রাশ সেট (১২ পিস)", "Brushes", 780, 1790,
     "Twelve synthetic brushes with a vegan leather roll.", "neutral", "one", ["gift", "beauty"]),
    ("Bamboo Detangling Comb", "বাঁশের চিরুনি", "Combs", 120, 350,
     "Anti-static bamboo comb with wide teeth for wet hair.", "neutral", "one", ["eco"]),
    ("Satin Sleep Bonnet", "সাটিন স্লিপ বনেট", "Hair Care", 220, 550,
     "Adjustable satin bonnet that reduces friction while sleeping.", "apparel", "one", ["haircare"]),
    ("Bamboo Scalp Massager", "বাঁশের স্ক্যাল্প ম্যাসাজার", "Hair Care", 160, 450,
     "Soft silicone-tip massager to lift product and stimulate the scalp.", "neutral", "one", ["haircare", "eco"]),
    ("Jade Face Roller", "জেড ফেস রোলার", "Skincare Tools", 240, 650,
     "Natural jade roller for a cool morning facial massage.", "home", "one", ["skincare", "gift"]),
    ("Nail Care Kit (7-Piece)", "নেইল কেয়ার কিট (৭ পিস)", "Grooming", 190, 490,
     "Stainless steel clipper, scissors, file and cuticle tools in a case.", "metal", "one", ["grooming"]),
    ("Waterproof Shower Cap", "ওয়াটারপ্রুফ শাওয়ার ক্যাপ", "Hair Care", 110, 320,
     "Reusable waterproof cap with a soft elastic band.", "apparel", "one", ["haircare"]),
    ("Heatless Curling Ribbon", "হিটলেস কার্লিং রিবন", "Styling Tools", 170, 450,
     "Satin ribbon set that curls hair overnight without heat.", "apparel", "one", ["haircare", "trending"]),
]

ROWS["couple-collections"] = [
    ("Matching Couple T-Shirt Set", "ম্যাচিং কাপল টি-শার্ট", "Couple Apparel", 780, 1790,
     "Two heavyweight tees with a paired chest print.", "apparel", "apparel-men", ["couple", "valentine"]),
    ("Couple Bracelet Pair", "কাপল ব্রেসলেট পেয়ার", "Couple Jewellery", 420, 1090,
     "Magnetic half-heart bracelet pair in gift packaging.", "metal", "one", ["couple", "gift"]),
    ("Couple Ceramic Mug Set", "কাপল মগ সেট", "Couple Gifts", 380, 950,
     "Two 330 ml ceramic mugs with a shared design.", "home", "one", ["couple", "gift"]),
    ("Couple Keychain Pair", "কাপল কীচেইন পেয়ার", "Couple Gifts", 180, 490,
     "Brass keychain pair that fits together as one piece.", "metal", "one", ["couple", "gift"]),
    ("Matching Couple Hoodie", "ম্যাচিং কাপল হুডি", "Couple Apparel", 1650, 3590,
     "Brushed-fleece hoodies in matching cut and colour.", "apparel", "apparel-men", ["couple", "winter"]),
    ("Couple Promise Ring Pair", "কাপল প্রমিজ রিং পেয়ার", "Couple Jewellery", 590, 1390,
     "Titanium-steel band pair with an inner engraved line.", "metal", "one", ["couple", "gift"]),
    ("Couple Photo Frame", "কাপল ফটো ফ্রেম", "Couple Gifts", 340, 850,
     "Two-slot wooden frame for a shared photo.", "home", "one", ["couple", "home"]),
    ("Couple Pendant Necklace Set", "কাপল পেন্ডেন্ট নেকলেস", "Couple Jewellery", 520, 1290,
     "Half-heart pendant pair on adjustable chains.", "metal", "one", ["couple", "gift"]),
    ("Couple Socks Set", "কাপল সকস সেট", "Couple Gifts", 220, 590,
     "Two pairs of combed-cotton socks with a matching print.", "apparel", "one", ["couple", "gift"]),
    ("Couple Passport Holder", "কাপল পাসপোর্ট হোল্ডার", "Couple Gifts", 580, 1390,
     "Two leather passport covers for a shared trip.", "neutral", "one", ["couple", "travel"]),
    ("Couple Anniversary Gift Hamper", "কাপল অ্যানিভার্সারি হ্যাম্পার", "Couple Gifts", 1290, 2890,
     "Mug pair, photo frame, card and chocolate in one keepsake box.", "home", "one", ["couple", "gift"]),
    ("Couple Winter Scarf Pair", "কাপল শীতের স্কার্ফ", "Couple Apparel", 480, 1190,
     "Two matching scarves in a soft wool blend.", "apparel", "one", ["couple", "winter"]),
    ("Couple Beach Towel Set", "কাপল বিচ টাওয়েল সেট", "Couple Gifts", 620, 1490,
     "Two quick-dry cotton towels with a coordinating border.", "home", "one", ["couple", "summer"]),
    ("Couple Nightwear Set", "কাপল নাইটওয়্যার সেট", "Couple Apparel", 1180, 2590,
     "Matching cotton night set for two in breathable lawn.", "apparel", "apparel-women", ["couple", "comfort"]),
    ("Couple Anniversary Card Set", "কাপল কার্ড সেট", "Couple Gifts", 120, 380,
     "Two hand-lettered cards and envelopes for anniversaries.", "home", "one", ["couple", "stationery"]),
]

ROWS["gifts"] = [
    ("Premium Gift Hamper", "প্রিমিয়াম গিফট হ্যাম্পার", "Hampers", 1150, 2590,
     "Curated hamper with mug, candle, notebook and card in a rigid box.", "home", "one", ["gift", "premium"]),
    ("Gift Box for Him", "তার জন্য গিফট বক্স", "Curated Boxes", 890, 1990,
     "Wallet, socks and grooming trio in a black magnetic box.", "neutral", "one", ["gift", "men"]),
    ("Gift Box for Her", "তার জন্য গিফট বক্স", "Curated Boxes", 950, 2190,
     "Scrunchie set, hair clip, candle and card in a blush box.", "home", "one", ["gift", "women"]),
    ("Birthday Gift Bundle", "জন্মদিনের গিফট বান্ডেল", "Occasion", 790, 1790,
     "Mug, photo frame and confetti card for a birthday drop.", "home", "one", ["gift", "birthday"]),
    ("Anniversary Gift Bundle", "অ্যানিভার্সারি গিফট বান্ডেল", "Occasion", 980, 2290,
     "Candle, frame and card set for anniversaries.", "home", "one", ["gift", "anniversary"]),
    ("Corporate Pen Gift Set", "কর্পোরেট পেন গিফট সেট", "Corporate", 620, 1490,
     "Metal ballpoint and notebook in a presentation box.", "metal", "one", ["corporate", "gift"]),
    ("Gift Mug with Coaster", "মগ উইথ কোস্টার", "Everyday Gifts", 290, 750,
     "Ceramic mug with a matching cork coaster.", "home", "one", ["gift", "office"]),
    ("Scented Candle Gift Set", "সুগন্ধি ক্যান্ডেল সেট", "Everyday Gifts", 540, 1290,
     "Three soy-wax votives in sandalwood, lemongrass and rose.", "home", "one", ["gift", "home"]),
    ("Gift Card (Demo)", "গিফট কার্ড (ডেমো)", "Gift Cards", 0, 1000,
     "Demo gift card redeemed by code at checkout. Not a real payment instrument.", "tech", "one", ["gift", "demo"]),
    ("Eid Gift Box", "ঈদ গিফট বক্স", "Seasonal Gifts", 1050, 2390,
     "Panjabi-inspired keepsake box with prayer beads and a card.", "ethnic", "one", ["eid", "gift"]),
    ("Thank-You Gift Box", "থ্যাংক-ইউ গিফট বক্স", "Curated Boxes", 490, 1190,
     "Notebook, pen and tea sachets for a thoughtful thank-you.", "home", "one", ["gift", "corporate"]),
    ("Newborn Gift Set", "নবজাতকের গিফট সেট", "Occasion", 720, 1690,
     "Cotton romper, mittens and a soft muslin wrap.", "home", "one", ["baby", "gift"]),
    ("Graduation Gift Bundle", "গ্র্যাজুয়েশন গিফট বান্ডেল", "Occasion", 690, 1590,
     "Journal, pen and a printed congratulations card.", "home", "one", ["gift", "graduation"]),
    ("Chocolate Gift Hamper (Demo)", "চকোলেট হ্যাম্পার (ডেমো)", "Hampers", 850, 1990,
     "Display-only hamper used for layout demonstration; food items are not stocked.", "home", "one", ["demo", "gift"]),
    ("Festive Gift Basket", "উৎসব গিফট বাস্কেট", "Hampers", 1350, 2990,
     "Woven basket with candle, mug, dry-flower sachet and card.", "home", "one", ["festive", "gift"]),
]

ROWS["travel-accessories"] = [
    ("Cabin Trolley 20-inch", "কেবিন ট্রলি ২০ ইঞ্চি", "Luggage", 3450, 7290,
     "Polycarbonate cabin case with 360° wheels and TSA-style lock.", "tech", "one", ["travel", "premium"]),
    ("Packing Cubes (3-Set)", "প্যাকিং কিউব (৩ সেট)", "Organisers", 480, 1150,
     "Three compression cubes that keep a suitcase ordered.", "tech", "one", ["travel", "organiser"]),
    ("Memory Foam Neck Pillow", "মেমোরি ফোম নেক পিলো", "Comfort", 620, 1490,
     "Contoured memory-foam pillow with a washable velour cover.", "tech", "one", ["travel", "comfort"]),
    ("Eye Mask & Earplug Set", "আই মাস্ক ও ইয়ারপ্লাগ সেট", "Comfort", 190, 550,
     "Contoured sleep mask with mouldable nose bridge and foam earplugs.", "apparel", "one", ["travel", "sleep"]),
    ("Leather Passport Holder", "লেদার পাসপোর্ট হোল্ডার", "Documents", 420, 990,
     "Leather cover with slots for passport, tickets and two cards.", "neutral", "one", ["travel", "gift"]),
    ("Travel Bottle Set (4-Piece)", "ট্রাভেল বোতল সেট", "Liquids", 240, 650,
     "Leak-proof 60 ml silicone bottles in a clear TSA pouch.", "tech", "one", ["travel"]),
    ("Digital Luggage Scale", "ডিজিটাল লাগেজ স্কেল", "Gadgets", 380, 890,
     "Handheld scale up to 50 kg with tare function and backlight.", "tech", "one", ["travel"]),
    ("Hanging Toiletry Organiser", "হ্যান্ডিং টয়লেট্রি অর্গানাইজার", "Organisers", 520, 1250,
     "Fold-out organiser with four zip compartments and a steel hook.", "tech", "one", ["travel", "organiser"]),
    ("Compression Travel Socks", "কম্প্রেশন ট্রাভেল সকস", "Comfort", 260, 650,
     "Graduated-compression socks for long bus and flight legs.", "apparel", "one", ["travel", "health"]),
    ("Universal Travel Adapter", "ইউনিভার্সাল ট্রাভেল অ্যাডাপ্টার", "Gadgets", 620, 1490,
     "Works in 150+ countries with two USB ports and a safety shutter.", "tech", "one", ["travel", "tech"]),
    ("Laptop Trolley Bag", "ল্যাপটপ ট্রলি ব্যাগ", "Luggage", 2950, 6290,
     "Rolling briefcase that fits a 15.6-inch laptop and two days of clothes.", "neutral", "one", ["travel", "office"]),
    ("Shoe Bag Pair", "শু ব্যাগ পেয়ার", "Organisers", 180, 490,
     "Water-resistant shoe bags that keep clothes clean.", "tech", "one", ["travel", "organiser"]),
    ("Compact Travel Umbrella", "কম্প্যাক্ট ট্রাভেল আম্ব্রেলা", "Comfort", 420, 990,
     "230 g umbrella that fits a day bag and opens with one hand.", "tech", "one", ["monsoon", "travel"]),
    ("Waterproof Dry Pouch", "ওয়াটারপ্রুফ ড্রাই পাউচ", "Organisers", 320, 790,
     "Roll-top dry bag for phones and documents near water.", "tech", "one", ["travel", "monsoon"]),
    ("Traveller Duffel 40L", "ট্রাভেলার ডাফল ৪০ লিটার", "Luggage", 1950, 4190,
     "40 L duffle with a separate shoe base and detachable shoulder strap.", "neutral", "one", ["travel", "gym"]),
]

ROWS["lifestyle"] = [
    ("Yoga Mat 6 mm", "যোগা ম্যাট ৬ মিমি", "Fitness", 780, 1790,
     "Non-slip TPE mat with alignment lines and a carry strap.", "home", "one", ["fitness", "home"]),
    ("Resistance Band Set", "রেজিস্ট্যান্স ব্যান্ড সেট", "Fitness", 420, 990,
     "Five latex bands from light to extra-heavy with a mesh bag.", "tech", "one", ["fitness"]),
    ("Insulated Steel Bottle 750 ml", "ইনসুলেটেড স্টিল বোতল ৭৫০ মিলি", "Hydration", 620, 1490,
     "Double-wall steel bottle: 18 hours cold, 8 hours hot.", "metal", "one", ["fitness", "eco"]),
    ("Menstrual Cup (Size Guide)", "মেনস্ট্রুয়াল কাপ", "Wellness", 380, 950,
     "Medical-grade silicone cup in two sizes with a storage pouch.", "home", "one", ["wellness"]),
    ("Bamboo Toothbrush (4-Pack)", "বাঁশের টুথব্রাশ (৪ প্যাক)", "Wellness", 180, 490,
     "Biodegradable bamboo handles with soft charcoal bristles.", "home", "one", ["eco", "wellness"]),
    ("Weekly Pill Organiser", "সাপ্তাহিক পিল অর্গানাইজার", "Wellness", 230, 590,
     "Seven-day AM/PM case with a push-button release.", "tech", "one", ["health"]),
    ("Digital Kitchen Scale", "ডিজিটাল কিচেন স্কেল", "Home Fitness", 520, 1190,
     "1 g precision up to 5 kg with tare and unit switching.", "tech", "one", ["kitchen", "health"]),
    ("Dumbbell Pair 5 kg", "ডাম্বেল পেয়ার ৫ কেজি", "Fitness", 1450, 3190,
     "Neoprene-coated dumbbells that protect floors and grip well.", "tech", "one", ["fitness"]),
    ("Gym Gloves", "জিম গ্লাভস", "Fitness", 320, 790,
     "Padded palm gloves with wrist wrap and pull tabs.", "tech", "one", ["fitness"]),
    ("Speed Jump Rope", "স্পিড জাম্প রোপ", "Fitness", 220, 590,
     "Ball-bearing speed rope with adjustable steel cable.", "tech", "one", ["fitness"]),
    ("Cooling Sports Towel", "কুলিং স্পোর্টস টাওয়েল", "Fitness", 260, 650,
     "Evaporative cooling towel that stays damp for hours.", "tech", "one", ["fitness", "summer"]),
    ("Waist Support Belt", "ওয়েস্ট সাপোর্ট বেল্ট", "Wellness", 480, 1150,
     "Breathable lumbar support with adjustable double strap.", "tech", "one", ["health"]),
    ("Posture Corrector", "পশ্চার কারেক্টর", "Wellness", 390, 950,
     "Soft posture brace for desk posture awareness.", "tech", "one", ["health", "office"]),
    ("Kettlebell 4 kg", "কেটলবেল ৪ কেজি", "Fitness", 980, 2190,
     "Vinyl-coated kettlebell with a wide, comfortable handle.", "tech", "one", ["fitness"]),
    ("Rechargeable Eye Massager", "রিচার্জেবল আই ম্যাসাজার", "Wellness", 1150, 2590,
     "Heated air-pressure eye massager with Bluetooth audio.", "tech", "one", ["wellness", "gift"]),
]

ROWS["desk-stationery"] = [
    ("A5 Hardcover Journal", "এ৫ হার্ডকভার জার্নাল", "Notebooks", 320, 790,
     "160 pages of 100 GSM paper with a lay-flat binding.", "neutral", "one", ["office", "gift"]),
    ("Gel Pen Set (6-Piece)", "জেল পেন সেট (৬ পিস)", "Pens", 180, 490,
     "Quick-dry 0.5 mm gel pens in six ink colours.", "tech", "one", ["school", "office"]),
    ("Desk Organiser Tray", "ডেস্ক অর্গানাইজার ট্রে", "Desk", 420, 990,
     "Stackable metal tray for stationery, cables and notes.", "metal", "one", ["office"]),
    ("Sticky Note Set", "স্টিকি নোট সেট", "Paper", 150, 420,
     "Five pads in muted tones with a reusable holder.", "home", "one", ["office"]),
    ("Premium Fountain Pen", "প্রিমিয়াম ফাউন্টেন পেন", "Pens", 620, 1490,
     "Brass-barrel fountain pen with a converter and two cartridges.", "metal", "one", ["gift", "office"]),
    ("Mechanical Pencil Set", "মেকানিক্যাল পেন্সিল সেট", "Pens", 220, 590,
     "0.5 mm and 0.7 mm pencils with 40 spare leads.", "metal", "one", ["school", "office"]),
    ("Document File Folder", "ডকুমেন্ট ফাইল ফোল্ডার", "Paper", 190, 490,
     "Expanding folder with 12 indexed pockets.", "tech", "one", ["office"]),
    ("Acrylic Desk Calendar", "অ্যাক্রিলিক ডেস্ক ক্যালেন্ডার", "Desk", 280, 690,
     "Reusable acrylic block calendar with wooden base.", "home", "one", ["office", "gift"]),
    ("Leather Pen Holder", "লেদার পেন হোল্ডার", "Desk", 240, 650,
     "Stitched leather cup that holds pens and a ruler.", "neutral", "one", ["office"]),
    ("A4 Whiteboard", "এ৪ হোয়াইটবোর্ড", "Desk", 480, 1150,
     "Double-sided A4 whiteboard with a marker and eraser.", "tech", "one", ["office", "study"]),
    ("Highlighter Set (6-Piece)", "হাইলাইটার সেট", "Pens", 160, 450,
     "Pastel chisel-tip highlighters that will not bleed through.", "home", "one", ["school", "office"]),
    ("Pocket Notebook (3-Pack)", "পকেট নোটবুক (৩ প্যাক)", "Notebooks", 170, 490,
     "Three stitched pocket notebooks with dot-grid pages.", "neutral", "one", ["office", "travel"]),
    ("Stapler & Staple Set", "স্ট্যাপলার সেট", "Desk", 210, 550,
     "Metal stapler with 1000 staples and a staple remover.", "metal", "one", ["office", "school"]),
    ("LED Desk Lamp", "এলইডি ডেস্ক ল্যাম্প", "Desk", 950, 2190,
     "Three-temperature LED lamp with a USB charging port.", "tech", "one", ["office", "study"]),
    ("Scissors & Cutter Kit", "সিজার ও কাটার কিট", "Desk", 230, 590,
     "Stainless scissors, precision cutter and spare blades.", "metal", "one", ["office"]),
]

ROWS["home-decor"] = [
    ("Cotton Bedsheet Set (Queen)", "কটন বেডশিট সেট (কুইন)", "Bedding", 1150, 2590,
     "Queen sheet, two pillow covers and a bolster cover in combed cotton.", "home", "one", ["home", "cotton"]),
    ("Cushion Cover Set (2-Piece)", "কুশন কভার সেট", "Cushions", 380, 950,
     "Two 16-inch covers with concealed zips and piped edges.", "home", "one", ["home", "decor"]),
    ("Macrame Wall Hanging", "ম্যাক্রামে ওয়াল হ্যাঙ্গিং", "Wall Decor", 540, 1290,
     "Hand-knotted cotton macrame on a wooden dowel.", "home", "one", ["handmade", "decor"]),
    ("Ceramic Bud Vase", "সিরামিক বাড ভাস", "Decor", 290, 750,
     "Wheel-thrown matte ceramic vase for a single stem.", "home", "one", ["decor", "gift"]),
    ("Table Runner", "টেবিল রানার", "Dining", 320, 790,
     "Woven cotton runner with a hand-knotted fringe.", "home", "one", ["home", "decor"]),
    ("Scented Candle Jar", "সুগন্ধি ক্যান্ডেল জার", "Fragrance", 460, 1150,
     "Soy-wax candle in a reusable glass jar, 35-hour burn.", "home", "one", ["home", "gift"]),
    ("Photo Frame Set (3-Piece)", "ফটো ফ্রেম সেট", "Wall Decor", 420, 1090,
     "Three wood frames with mounts for 4×6 and 5×7 prints.", "home", "one", ["home", "gift"]),
    ("Cotton Doormat", "কটন ডোরম্যাট", "Floor", 350, 890,
     "Machine-washable doormat with a non-slip backing.", "home", "one", ["home"]),
    ("Kitchen Apron", "কিচেন এপ্রন", "Kitchen", 290, 750,
     "Heavy cotton apron with adjustable neck strap and two pockets.", "home", "one", ["kitchen", "gift"]),
    ("Prayer Mat (Janamaz)", "জায়নামাজ", "Prayer", 450, 1150,
     "Padded prayer mat with a soft pile and a carry strap.", "ethnic", "one", ["prayer", "gift"]),
    ("Batik Wall Art Panel", "বাটিক ওয়াল আর্ট", "Wall Decor", 620, 1490,
     "Hand-batiked cotton panel made by local artisans.", "ethnic", "one", ["handmade", "decor"]),
    ("Bedside Table Lamp", "বেডসাইড টেবিল ল্যাম্প", "Lighting", 780, 1790,
     "Linen-shade lamp with a warm dimmable LED bulb.", "home", "one", ["home", "decor"]),
    ("Curtain Panel Pair", "কার্টেন পেয়ার", "Window", 890, 1990,
     "Two blackout-lined panels with rod-pocket stitching.", "home", "one", ["home"]),
    ("Ceramic Coaster Set (4)", "সিরামিক কোস্টার সেট", "Dining", 240, 650,
     "Four glazed coasters with a cork backing and holder.", "home", "one", ["home", "gift"]),
    ("Jute Storage Basket", "পাটের স্টোরেজ বাস্কেট", "Storage", 420, 990,
     "Handwoven jute basket that holds throws or toys.", "home", "one", ["eco", "home"]),
]

ROWS["seasonal-collections"] = [
    ("Winter Fleece Hoodie", "শীতের ফ্লিস হুডি", "Winter", 880, 1990,
     "High-pile fleece hoodie with a sherpa-lined hood.", "apparel", "apparel-men", ["winter", "seasonal"]),
    ("Thermal Inner Set", "থার্মাল ইনার সেট", "Winter", 620, 1490,
     "Brushed thermal top and legging set for Dhaka winter nights.", "neutral", "apparel-women", ["winter"]),
    ("Winter Muffler Scarf", "শীতের মাফলার স্কার্ফ", "Winter", 380, 890,
     "Chunky knit scarf long enough to loop twice.", "neutral", "one", ["winter", "gift"]),
    ("Summer Straw Hat", "গ্রীষ্মের স্ট্র হ্যাট", "Summer", 320, 790,
     "Wide-brim straw hat with an inner size adjuster.", "home", "one", ["summer"]),
    ("Eid Gift Box Deluxe", "ঈদ গিফট বক্স ডিলাক্স", "Eid", 1450, 3290,
     "Panjabi-ready gift box with prayer beads, attar and card.", "ethnic", "one", ["eid", "gift"]),
    ("Eid Home Decor Set", "ঈদ হোম ডেকোর সেট", "Eid", 890, 1990,
     "Lantern, bunting and a table runner for Eid hosting.", "ethnic", "one", ["eid", "home"]),
    ("Ramadan Prayer Kit", "রমজান প্রেয়ার কিট", "Eid", 980, 2290,
     "Prayer mat, tasbih and a pocket Quran-cover in one set.", "ethnic", "one", ["ramadan", "gift"]),
    ("Valentine Couple Gift Set", "ভ্যালেন্টাইন কাপল গিফট", "Festive", 890, 2190,
     "Mug pair, candles and a card in a heart-stamped box.", "home", "one", ["valentine", "couple"]),
    ("Pohela Boishakh Festive Tee", "পহেলা বৈশাখ টি-শার্ট", "Festive", 420, 1050,
     "Cotton tee with a hand-drawn Boishakh motif.", "apparel", "apparel-men", ["boishakh", "festive"]),
    ("Autumn Cotton Jacket", "শরতের কটন জ্যাকেট", "Autumn", 1250, 2790,
     "Lightly padded cotton jacket for the post-monsoon chill.", "neutral", "apparel-men", ["autumn"]),
    ("Monsoon Raincoat", "বর্ষার রেইনকোট", "Monsoon", 1150, 2590,
     "Hooded raincoat with taped seams and reflective piping.", "tech", "apparel-men", ["monsoon"]),
    ("Eid Salami Card Set", "ঈদ সালামি কার্ড সেট", "Eid", 160, 490,
     "Ten printed envelopes for Eid salami gifting.", "ethnic", "one", ["eid", "stationery"]),
    ("Wedding Season Jewellery Set", "বিয়ের সিজন জুয়েলারি সেট", "Wedding", 1150, 2690,
     "Necklace, earrings and tikka in a coordinated wedding finish.", "metal", "one", ["wedding", "bridal"]),
    ("New Year Party Props", "নতুন বছরের পার্টি প্রপস", "Festive", 280, 750,
     "Photo-booth props, hats and a banner for New Year gatherings.", "home", "one", ["party"]),
    ("Silk Rose Gift Box", "সিল্ক রোজ গিফট বক্স", "Festive", 340, 890,
     "Nine hand-rolled silk roses in a presentation box.", "home", "one", ["gift", "valentine"]),
]

METRO_AREAS = {
    "Dhaka": ["Dhanmondi", "Gulshan", "Banani", "Mirpur", "Uttara", "Mohammadpur", "Bashundhara R/A", "Old Dhaka", "Motijheel", "Badda"],
    "Chattogram": ["Agrabad", "Nasirabad", "Khulshi", "Panchlaish", "Halishahar", "Pahartali"],
    "Sylhet": ["Zindabazar", "Ambarkhana", "Subid Bazar", "Tilagor"],
    "Rajshahi": ["Boalia", "Motihar", "Shaheb Bazar", "Kazla"],
    "Khulna": ["Sonadanga", "Khalishpur", "Daulatpur", "Boyra"],
    "Barishal": ["Band Road", "Natun Bazar", "Rupatoli"],
    "Rangpur": ["Jahaj Company More", "Dhap", "Modern More"],
    "Mymensingh": ["Ganginarpar", "Charpara", "Kewatkhali"],
    "Cumilla": ["Kandirpar", "Jhautala", "Racecourse"],
    "Narayanganj": ["Chashara", "Masdair", "Fatullah"],
    "Gazipur": ["Chowrasta", "Board Bazar", "Tongi"],
    "Bogura": ["Satmatha", "Jaleshwaritala", "Sherpur Road"],
}

# ---------------------------------------------------------------------------
# Deterministic merchandising flags (no random reviews or fake scarcity)
# ---------------------------------------------------------------------------
def flags_for(cat_idx: int, i: int) -> list[str]:
    flags = []
    if i in (0, 3, 8):
        flags.append("featured")
    if i in (1, 4, 11):
        flags.append("trending")
    if i in (5, 9, 13):
        flags.append("bestseller")
    if i >= 13:
        flags.append("newArrival")
    return flags


def build():
    cats = []
    products = []
    for cat_idx, (slug, name, bn, blurb, icon) in enumerate(CATEGORIES):
        rows = ROWS[slug]
        assert len(rows) == 15, f"{slug} has {len(rows)} rows"
        subs = []
        for i, r in enumerate(rows):
            sub = r[2]
            if sub not in subs:
                subs.append(sub)
        cats.append({
            "slug": slug, "name": name, "nameBn": bn, "blurb": blurb,
            "icon": icon, "sortOrder": cat_idx,
            "subcategories": [{"slug": s.lower().replace(" / ", "-").replace(" ", "-").replace("&", "and").replace("(", "").replace(")", ""), "name": s} for s in subs],
        })
        for i, (pname, pbn, sub, wh, rp, short, ckey, skey, tags) in enumerate(rows):
            num = cat_idx * 15 + i + 1
            colours = PALETTE[ckey]
            # Products rotate a 2–4 colour subset so variants feel curated.
            take = 2 + (i % 3)
            chosen = colours[:take] if i % 2 == 0 else colours[-take:]
            sizes = SIZES[skey]
            sale = None
            if i % 7 == 3:
                sale = int(round(rp * 0.85 / 10.0)) * 10
            products.append({
                "id": num,
                "sku": f"SZS-{slug[:2].upper()}{cat_idx:02d}-{i+1:03d}",
                "slug": pname.lower().replace("'", "").replace("&", "and").replace("(", "").replace(")", "").replace("/", " ").replace(",", "").replace(".", "").replace(" ", "-").replace("--", "-"),
                "name": pname,
                "nameBn": pbn,
                "categorySlug": slug,
                "subcategory": sub,
                "shortDescription": short,
                "wholesaleCost": wh,
                "retailPrice": rp,
                "salePrice": sale,
                "priceStatus": "unverified",
                "moq": 12 if rp < 1000 else (6 if rp < 3000 else 3),
                "colors": chosen,
                "sizes": sizes,
                "tags": tags,
                "flags": flags_for(cat_idx, i),
                "warranty": "7-day replacement" if rp >= 1500 else "3-day replacement",
            })
    # uniqueness guards
    skus = {p["sku"] for p in products}
    slugs = {p["slug"] for p in products}
    names = {p["name"] for p in products}
    assert len(skus) == len(products), "duplicate SKU"
    assert len(slugs) == len(products), f"duplicate slug: {len(slugs)} vs {len(products)}"
    assert len(names) == len(products), "duplicate product name"
    assert len(products) == 225, len(products)

    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, "products.json"), "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=1)
    with open(os.path.join(OUT, "categories.json"), "w", encoding="utf-8") as f:
        json.dump(cats, f, ensure_ascii=False, indent=1)
    with open(os.path.join(OUT, "locations.json"), "w", encoding="utf-8") as f:
        json.dump(METRO_AREAS, f, ensure_ascii=False, indent=1)
    print(f"OK: {len(products)} products / {len(cats)} categories / {sum(len(c['subcategories']) for c in cats)} subcategories")
    for c in cats:
        n = len([p for p in products if p['categorySlug'] == c['slug']])
        print(f"  {c['name']:32} {n} products, {len(c['subcategories'])} subcategories")


if __name__ == "__main__":
    build()
