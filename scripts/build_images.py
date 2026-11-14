#!/usr/bin/env python3
"""
Generates deterministic, clearly-labelled studio illustrations for every SKU.

Why illustrations instead of photos: this catalogue is a demo build with no
supplier photography rights. Using random photos of real products would be
misleading, so each image is an original vector illustration, and the UI labels
it as an illustration on the product page.
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "products")

HEX = {
    "Black": ("#2C2B29", "#454340"),
    "White": ("#F4F1EA", "#DDD8CE"),
    "Navy": ("#26354F", "#3B4F72"),
    "Olive": ("#5A6244", "#77805E"),
    "Maroon": ("#6E2A35", "#8C3B48"),
    "Beige": ("#CDBFA6", "#E0D5C2"),
    "Deep Green": ("#234A3C", "#356B58"),
    "Royal Blue": ("#26407A", "#3A5CA8"),
    "Off-White": ("#EFEAE0", "#DAD3C6"),
    "Mustard": ("#B98527", "#D2A044"),
    "Gold": ("#B08A3E", "#D6B366"),
    "Silver": ("#9BA1A6", "#C3C8CC"),
    "Rose Gold": ("#B4785F", "#D39C85"),
    "Tan": ("#A57A4E", "#C29B70"),
    "Brown": ("#5B4030", "#7A5A45"),
    "Charcoal": ("#3A3B3D", "#55575A"),
    "Ivory": ("#F0EADD", "#DCD4C4"),
    "Sage": ("#8A9A83", "#A9B7A2"),
    "Terracotta": ("#A85C43", "#C4795F"),
    "Grey": ("#8A8B8C", "#A9AAAB"),
}

FAMILY = {
    "mens-fashion": "shirt",
    "womens-fashion": "dress",
    "unisex-accessories": "cap",
    "jewellery": "gem",
    "watches": "watch",
    "bags-wallets": "bag",
    "phone-tech": "phone",
    "hair-beauty": "beauty",
    "couple-collections": "pair",
    "gifts": "gift",
    "travel-accessories": "case",
    "lifestyle": "bottle",
    "desk-stationery": "pen",
    "home-decor": "vase",
    "seasonal-collections": "parasol",
}

TITLES = {
    "shirt": "Apparel study",
    "dress": "Drape study",
    "cap": "Headwear study",
    "gem": "Set study",
    "watch": "Watch study",
    "bag": "Carry study",
    "phone": "Device study",
    "beauty": "Care study",
    "pair": "Pair study",
    "gift": "Gift study",
    "case": "Luggage study",
    "bottle": "Everyday study",
    "pen": "Desk study",
    "vase": "Interior study",
    "parasol": "Season study",
}


def attrs(color):
    return HEX.get(color, ("#6B6B6B", "#8C8C8C"))


def shape(family, variant, a, b):
    """Return SVG body for a family + variant (0,1,2)."""
    v = variant % 3
    if family == "shirt":
        if v == 0:  # tee
            return f'''<path d="M318 316 L382 282 Q400 316 418 282 L482 316 L540 372 L500 424 L470 402 L470 690 Q400 710 330 690 L330 402 L300 424 L260 372 Z" fill="{a}"/>
<path d="M382 282 Q400 322 418 282" stroke="{b}" stroke-width="7" fill="none"/>
<path d="M330 676 Q400 696 470 676" stroke="{b}" stroke-width="6" fill="none" opacity=".65"/>
<path d="M400 344 L400 660" stroke="{b}" stroke-width="3" opacity=".28"/>'''
        if v == 1:  # panjabi / long shirt
            return f'''<path d="M330 304 L396 276 L404 276 L470 304 L534 366 L496 418 L466 396 L470 736 Q400 758 330 736 L334 396 L304 418 L266 366 Z" fill="{a}"/>
<path d="M396 282 L398 700" stroke="{b}" stroke-width="6" opacity=".85"/>
<path d="M404 282 L402 700" stroke="{b}" stroke-width="2" opacity=".4"/>
<circle cx="386" cy="376" r="5" fill="{b}"/><circle cx="386" cy="428" r="5" fill="{b}"/>
<circle cx="386" cy="480" r="5" fill="{b}"/><circle cx="386" cy="532" r="5" fill="{b}"/>
<circle cx="386" cy="584" r="5" fill="{b}"/>
<path d="M330 722 Q400 744 470 722" stroke="{b}" stroke-width="5" fill="none" opacity=".6"/>'''
        return f'''<path d="M320 314 L384 280 L416 280 L480 314 L540 370 L500 422 L470 400 L470 566 L330 566 L330 400 L300 422 L260 370 Z" fill="{a}"/>
<path d="M330 566 L326 736 Q400 756 474 736 L470 566" fill="{b}" opacity=".9"/>
<path d="M384 286 L400 330 L416 286" stroke="{b}" stroke-width="6" fill="none"/>
<path d="M400 566 L400 738" stroke="#F6F3EE" stroke-width="4" opacity=".5"/>
<path d="M356 470 L444 470" stroke="{b}" stroke-width="5" opacity=".5"/>'''

    if family == "dress":
        if v == 0:  # maxi dress
            return f'''<path d="M352 298 L400 268 L448 298 L480 342 L444 376 L458 470 Q532 664 552 764 Q400 796 248 764 Q268 664 342 470 L356 376 L320 342 Z" fill="{a}"/>
<path d="M348 470 Q400 500 452 470" stroke="{b}" stroke-width="6" fill="none" opacity=".8"/>
<path d="M400 300 L400 760" stroke="{b}" stroke-width="3" opacity=".25"/>'''
        if v == 1:  # saree drape
            return f'''<path d="M318 330 Q400 282 482 330 L520 424 L482 476 L504 712 Q400 774 296 712 L318 476 L280 424 Z" fill="{a}"/>
<path d="M318 330 Q400 402 482 330" stroke="{b}" stroke-width="9" fill="none"/>
<path d="M486 344 Q548 470 524 616 Q506 700 470 736" stroke="{b}" stroke-width="12" fill="none" opacity=".55"/>
<path d="M296 712 Q400 758 504 712" stroke="{b}" stroke-width="7" fill="none"/>'''
        return f'''<path d="M352 292 L400 268 L448 292 L488 338 L456 372 L470 500 Q496 646 516 706 Q400 740 284 706 Q304 646 330 500 L344 372 L312 338 Z" fill="{a}"/>
<path d="M344 372 L400 406 L456 372" stroke="{b}" stroke-width="6" fill="none" opacity=".85"/>
<path d="M330 500 Q400 528 470 500" stroke="{b}" stroke-width="6" fill="none" opacity=".6"/>'''

    if family == "cap":
        if v == 0:  # baseball cap
            return f'''<path d="M300 540 Q300 372 400 356 Q500 372 500 540 Z" fill="{a}"/>
<path d="M500 540 Q580 546 600 566 Q540 586 498 570 Z" fill="{b}"/>
<path d="M400 358 L400 540" stroke="{b}" stroke-width="4" opacity=".5"/>
<circle cx="400" cy="352" r="9" fill="{b}"/>'''
        if v == 1:  # beanie
            return f'''<path d="M312 560 Q312 380 400 360 Q488 380 488 560 Z" fill="{a}"/>
<path d="M312 540 L488 540 L488 596 Q400 616 312 596 Z" fill="{b}"/>
<path d="M340 420 L340 540 M400 404 L400 540 M460 420 L460 540" stroke="{b}" stroke-width="4" opacity=".5"/>'''
        return f'''<path d="M316 546 L400 392 L484 546 Z" fill="{a}"/>
<path d="M400 392 L400 546" stroke="{b}" stroke-width="4" opacity=".5"/>
<ellipse cx="400" cy="556" rx="120" ry="34" fill="{b}"/>'''

    if family == "gem":
        if v == 0:  # necklace
            return f'''<path d="M300 320 Q400 520 500 320" stroke="{b}" stroke-width="7" fill="none"/>
<path d="M330 372 Q400 470 470 372" stroke="{a}" stroke-width="9" fill="none" opacity=".85"/>
<circle cx="400" cy="486" r="34" fill="{a}"/><circle cx="400" cy="486" r="18" fill="{b}"/>
<circle cx="378" cy="466" r="5" fill="#fff" opacity=".65"/>
<circle cx="352" cy="430" r="7" fill="{b}"/><circle cx="448" cy="430" r="7" fill="{b}"/>'''
        if v == 1:  # earrings
            return f'''<circle cx="330" cy="360" r="7" fill="{b}"/><circle cx="470" cy="360" r="7" fill="{b}"/>
<path d="M330 372 L330 430" stroke="{b}" stroke-width="5"/>
<path d="M470 372 L470 430" stroke="{b}" stroke-width="5"/>
<path d="M330 430 Q286 520 330 604 Q374 520 330 430 Z" fill="{a}"/>
<path d="M470 430 Q426 520 470 604 Q514 520 470 430 Z" fill="{a}"/>
<circle cx="330" cy="520" r="9" fill="{b}" opacity=".8"/><circle cx="470" cy="520" r="9" fill="{b}" opacity=".8"/>'''
        return f'''<circle cx="400" cy="470" r="104" fill="none" stroke="{a}" stroke-width="22"/>
<circle cx="400" cy="470" r="104" fill="none" stroke="{b}" stroke-width="6" opacity=".6"/>
<circle cx="400" cy="366" r="16" fill="{a}"/><circle cx="400" cy="574" r="16" fill="{a}"/>
<circle cx="296" cy="470" r="16" fill="{a}"/><circle cx="504" cy="470" r="16" fill="{a}"/>
<circle cx="400" cy="470" r="20" fill="{b}" opacity=".7"/>'''

    if family == "watch":
        band = a
        face = "#F6F3EE"
        return f'''<rect x="352" y="250" width="96" height="180" rx="26" fill="{band}"/>
<rect x="352" y="600" width="96" height="180" rx="26" fill="{band}"/>
<circle cx="400" cy="510" r="128" fill="{b}"/>
<circle cx="400" cy="510" r="112" fill="{face}"/>
<circle cx="400" cy="510" r="112" fill="none" stroke="{a}" stroke-width="4" opacity=".5"/>
<path d="M400 510 L400 428" stroke="#2C2B29" stroke-width="7" stroke-linecap="round"/>
<path d="M400 510 L456 546" stroke="#2C2B29" stroke-width="5" stroke-linecap="round"/>
<circle cx="400" cy="510" r="7" fill="{a}"/>
<rect x="520" y="494" width="16" height="32" rx="5" fill="{b}"/>'''

    if family == "bag":
        if v == 0:
            return f'''<path d="M300 430 L500 430 L520 720 Q400 748 280 720 Z" fill="{a}"/>
<path d="M352 430 Q352 300 400 300 Q448 300 448 430" stroke="{b}" stroke-width="12" fill="none"/>
<rect x="300" y="520" width="220" height="34" fill="{b}" opacity=".65"/>
<circle cx="400" cy="537" r="11" fill="#F6F3EE"/>'''
        if v == 1:
            return f'''<rect x="286" y="400" width="228" height="300" rx="34" fill="{a}"/>
<rect x="286" y="400" width="228" height="80" rx="34" fill="{b}"/>
<path d="M336 402 Q336 320 400 320 Q464 320 464 402" stroke="{b}" stroke-width="11" fill="none"/>
<rect x="360" y="520" width="80" height="24" rx="12" fill="{b}" opacity=".8"/>'''
        return f'''<rect x="300" y="452" width="200" height="240" rx="20" fill="{a}"/>
<path d="M300 452 L502 452" stroke="{b}" stroke-width="8"/>
<path d="M352 452 Q352 362 400 362 Q448 362 448 452" stroke="{b}" stroke-width="10" fill="none"/>
<rect x="372" y="560" width="56" height="40" rx="10" fill="{b}" opacity=".75"/>'''

    if family == "phone":
        if v == 2:
            return f'''<rect x="318" y="300" width="164" height="260" rx="30" fill="{a}"/>
<rect x="336" y="320" width="128" height="220" rx="18" fill="#F6F3EE" opacity=".9"/>
<rect x="360" y="430" width="80" height="12" rx="6" fill="{b}"/>
<rect x="360" y="462" width="52" height="12" rx="6" fill="{b}" opacity=".6"/>'''
        return f'''<rect x="330" y="270" width="140" height="290" rx="26" fill="{a}"/>
<rect x="378" y="286" width="44" height="8" rx="4" fill="{b}"/>
<circle cx="400" cy="510" r="110" fill="none" stroke="{b}" stroke-width="3" stroke-dasharray="8 10" opacity=".7"/>
<path d="M352 560 Q400 620 448 560" stroke="{b}" stroke-width="8" fill="none" opacity=".8"/>'''

    if family == "beauty":
        if v == 0:
            return f'''<circle cx="400" cy="470" r="120" fill="none" stroke="{a}" stroke-width="26"/>
<circle cx="400" cy="470" r="60" fill="{b}" opacity=".55"/>
<path d="M400 320 L400 240 M400 600 L400 700" stroke="{a}" stroke-width="20" stroke-linecap="round"/>'''
        if v == 1:
            return f'''<rect x="336" y="330" width="128" height="260" rx="54" fill="{a}"/>
<rect x="336" y="360" width="128" height="42" fill="{b}" opacity=".7"/>
<rect x="376" y="590" width="48" height="70" rx="14" fill="{b}"/>
<path d="M400 420 L400 560" stroke="#F6F3EE" stroke-width="6" opacity=".35"/>'''
        return f'''<path d="M300 560 Q400 300 500 560" stroke="{a}" stroke-width="24" fill="none" stroke-linecap="round"/>
<path d="M336 520 Q400 380 464 520" stroke="{b}" stroke-width="14" fill="none" stroke-linecap="round"/>'''

    if family == "pair":
        return f'''<path d="M400 470 C400 470 320 420 300 372 C282 328 320 292 356 302 C380 310 398 334 400 352 C402 334 420 310 444 302 C480 292 518 328 500 372 C480 420 400 470 400 470 Z" fill="{a}" transform="translate(-76,0)"/>
<path d="M400 470 C400 470 320 420 300 372 C282 328 320 292 356 302 C380 310 398 334 400 352 C402 334 420 310 444 302 C480 292 518 328 500 372 C480 420 400 470 400 470 Z" fill="{b}" opacity=".85" transform="translate(84,26)"/>'''

    if family == "gift":
        return f'''<rect x="296" y="440" width="208" height="220" rx="14" fill="{a}"/>
<rect x="278" y="392" width="244" height="58" rx="12" fill="{b}"/>
<rect x="382" y="392" width="36" height="268" fill="#F6F3EE" opacity=".88"/>
<path d="M400 392 Q336 306 306 342 Q288 372 400 392" fill="{b}"/>
<path d="M400 392 Q464 306 494 342 Q512 372 400 392" fill="{b}"/>'''

    if family == "case":
        if v == 2:
            return f'''<rect x="300" y="330" width="200" height="300" rx="18" fill="{a}"/>
<path d="M300 330 L500 330" stroke="{b}" stroke-width="9"/>
<path d="M350 330 L350 250 L450 250 L450 330" stroke="{b}" stroke-width="12" fill="none"/>
<rect x="356" y="450" width="88" height="10" rx="5" fill="{b}" opacity=".7"/>
<rect x="356" y="480" width="58" height="10" rx="5" fill="{b}" opacity=".5"/>'''
        return f'''<rect x="316" y="330" width="168" height="330" rx="30" fill="{a}"/>
<rect x="340" y="356" width="120" height="278" rx="16" fill="{b}" opacity=".8"/>
<path d="M400 306 L400 380" stroke="{b}" stroke-width="10"/>
<path d="M376 288 L424 288" stroke="{b}" stroke-width="10" stroke-linecap="round"/>
<circle cx="360" cy="640" r="9" fill="#F6F3EE" opacity=".8"/><circle cx="440" cy="640" r="9" fill="#F6F3EE" opacity=".8"/>'''

    if family == "bottle":
        if v == 2:
            return f'''<path d="M340 380 L340 660 Q340 704 400 704 Q460 704 460 660 L460 380 Z" fill="{a}"/>
<rect x="372" y="300" width="56" height="86" rx="16" fill="{b}"/>
<rect x="360" y="286" width="80" height="26" rx="10" fill="{b}"/>
<rect x="340" y="470" width="120" height="26" fill="#F6F3EE" opacity=".55"/>'''
        return f'''<rect x="336" y="392" width="128" height="268" rx="46" fill="{a}"/>
<rect x="368" y="322" width="64" height="70" rx="14" fill="{b}"/>
<rect x="358" y="304" width="84" height="24" rx="9" fill="{b}"/>
<circle cx="400" cy="520" r="34" fill="#F6F3EE" opacity=".35"/>'''

    if family == "pen":
        if v == 1:
            return f'''<rect x="300" y="330" width="200" height="290" rx="12" fill="{a}"/>
<rect x="300" y="330" width="26" height="290" fill="{b}"/>
<rect x="352" y="380" width="112" height="10" rx="5" fill="#F6F3EE" opacity=".8"/>
<rect x="352" y="412" width="90" height="10" rx="5" fill="#F6F3EE" opacity=".6"/>
<rect x="352" y="444" width="104" height="10" rx="5" fill="#F6F3EE" opacity=".6"/>'''
        return f'''<g transform="rotate(-24 400 500)">
<rect x="384" y="300" width="34" height="300" rx="10" fill="{a}"/>
<path d="M384 600 L401 650 L418 600 Z" fill="{b}"/>
<rect x="384" y="318" width="34" height="34" rx="8" fill="{b}"/>
</g>
<rect x="286" y="600" width="230" height="8" rx="4" fill="{b}" opacity=".5"/>'''

    if family == "vase":
        if v == 1:
            return f'''<rect x="300" y="380" width="200" height="264" rx="20" fill="{a}"/>
<rect x="300" y="380" width="200" height="264" rx="20" fill="none" stroke="{b}" stroke-width="8"/>
<path d="M340 380 Q400 300 460 380" stroke="{b}" stroke-width="8" fill="none"/>
<circle cx="400" cy="510" r="42" fill="{b}" opacity=".55"/>'''
        return f'''<path d="M352 386 Q330 470 348 598 Q360 660 400 660 Q440 660 452 598 Q470 470 448 386 Z" fill="{a}"/>
<rect x="348" y="360" width="104" height="34" rx="12" fill="{b}"/>
<path d="M400 360 Q378 300 400 250 Q424 300 412 360" fill="{b}" opacity=".8"/>
<path d="M348 520 Q400 546 452 520" stroke="{b}" stroke-width="4" opacity=".55" fill="none"/>'''

    # parasol
    if v == 1:
        return f'''<path d="M400 286 Q470 380 470 560 L400 700 L330 560 Q330 380 400 286 Z" fill="{a}"/>
<path d="M400 286 L400 700" stroke="{b}" stroke-width="6" opacity=".55"/>
<path d="M400 286 Q352 390 344 556" stroke="{b}" stroke-width="5" fill="none" opacity=".45"/>
<path d="M400 286 Q448 390 456 556" stroke="{b}" stroke-width="5" fill="none" opacity=".45"/>
<path d="M400 700 L400 742" stroke="{b}" stroke-width="10" stroke-linecap="round"/>
<path d="M400 742 Q366 748 366 716" stroke="{b}" stroke-width="9" fill="none" stroke-linecap="round"/>
<circle cx="400" cy="278" r="8" fill="{b}"/>'''
    return f'''<path d="M400 244 Q548 300 552 470 Q505 500 470 470 Q436 500 400 470 Q364 500 330 470 Q295 500 248 470 Q252 300 400 244 Z" fill="{a}"/>
<path d="M400 244 L400 470" stroke="{b}" stroke-width="6" opacity=".7"/>
<path d="M400 244 Q320 340 300 474" stroke="{b}" stroke-width="5" fill="none" opacity=".5"/>
<path d="M400 244 Q480 340 500 474" stroke="{b}" stroke-width="5" fill="none" opacity=".5"/>
<circle cx="400" cy="238" r="9" fill="{b}"/>
<path d="M400 470 L400 700" stroke="{b}" stroke-width="11" stroke-linecap="round"/>
<path d="M400 700 Q356 706 356 668" stroke="{b}" stroke-width="10" fill="none" stroke-linecap="round"/>'''


# Studio backdrops, one per family, so a category's tiles feel like one shoot
# rather than 15 unrelated illustrations. Cool blue-grey throughout: the
# storefront chrome is blue and white, and a warm cream backdrop fought it.
BACKDROPS = {
    "apparel": ("#F4F7FC", "#E3EAF5"),
    "jewellery": ("#F6F7FB", "#E6E9F3"),
    "tech": ("#F5F8FD", "#E1E9F6"),
    "home": ("#F7F8FA", "#E7EAF0"),
    "beauty": ("#F6F8FB", "#E4EBF4"),
    "default": ("#F5F7FB", "#E5EAF3"),
}

# Per-family zoom: small objects (earrings, rings) need to fill the tile the
# way a real catalogue crops them; garments are already large in frame.
FAMILY_SCALE = {
    "shirt": 1.16, "dress": 1.14, "cap": 1.22, "gem": 1.62, "watch": 1.20,
    "bag": 1.18, "phone": 1.28, "beauty": 1.34, "pair": 1.30, "gift": 1.20,
    "case": 1.24, "bottle": 1.30, "pen": 1.26, "vase": 1.20, "parasol": 1.14,
}

FAMILY_BACKDROP = {
    "shirt": "apparel", "dress": "apparel", "cap": "apparel", "pair": "apparel",
    "gem": "jewellery", "watch": "jewellery",
    "phone": "tech", "pen": "tech", "bottle": "tech",
    "vase": "home", "parasol": "home", "gift": "home",
    "beauty": "beauty", "case": "beauty", "bag": "apparel",
}


def svg_for(product):
    family = FAMILY[product["categorySlug"]]
    color = product["colors"][0] if product["colors"] else "Charcoal"
    a, b = attrs(color)
    bg1, bg2 = BACKDROPS[FAMILY_BACKDROP.get(family, "default")]
    body = shape(family, product["id"] % 3, a, b)
    scale = FAMILY_SCALE.get(family, 1.15)
    label = TITLES[family]
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000" role="img" aria-label="{product['name']} — studio illustration">
  <defs>
    <linearGradient id="bg" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0" stop-color="{bg1}"/><stop offset="1" stop-color="{bg2}"/>
    </linearGradient>
    <radialGradient id="spot" cx="46%" cy="30%" r="66%">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="1"/>
      <stop offset="0.55" stop-color="#FFFFFF" stop-opacity=".45"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="50%" cy="50%" r="72%">
      <stop offset="0.55" stop-color="#0B1B33" stop-opacity="0"/>
      <stop offset="1" stop-color="#0B1B33" stop-opacity=".10"/>
    </radialGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity=".22"/>
      <stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>

  <!-- seamless studio sweep -->
  <rect width="800" height="1000" fill="url(#bg)"/>
  <rect width="800" height="1000" fill="url(#spot)"/>
  <rect width="800" height="1000" fill="url(#vig)"/>

  <!-- cyclorama floor line + contact shadow -->
  <path d="M0 800 Q400 758 800 800 L800 1000 L0 1000 Z" fill="#0B1B33" opacity=".03"/>
  <ellipse cx="400" cy="806" rx="204" ry="26" fill="#0B1B33" opacity=".18" filter="url(#soft)"/>

  <!-- plinth the product stands on -->
  <ellipse cx="400" cy="802" rx="228" ry="52" fill="#FFFFFF" opacity=".8"/>
  <ellipse cx="400" cy="802" rx="228" ry="52" fill="none" stroke="#0B1B33" stroke-opacity=".06" stroke-width="2"/>
  <ellipse cx="400" cy="798" rx="160" ry="30" fill="#FFFFFF" opacity=".55"/>

  <!-- product, enlarged to fill the tile as a catalogue would -->
  <g transform="translate(400 486) scale({scale}) translate(-400 -500)">{body}</g>
  <rect width="800" height="1000" fill="url(#sheen)"/>

  <text x="56" y="916" font-family="Georgia, 'Times New Roman', serif" font-size="17" letter-spacing="4.5" fill="#6E7B93">{label}</text>
  <text x="56" y="944" font-family="Helvetica, Arial, sans-serif" font-size="13" letter-spacing="3" fill="#93A0B6">SUPER Z SHOP</text>
</svg>'''


def main():
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(ROOT, "data", "catalogue", "products.json"), encoding="utf-8") as f:
        products = json.load(f)
    for p in products:
        with open(os.path.join(OUT, f"{p['sku']}.svg"), "w", encoding="utf-8") as fh:
            fh.write(svg_for(p))
    print(f"Generated {len(products)} illustrations into public/products/")


if __name__ == "__main__":
    main()
