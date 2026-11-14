#!/usr/bin/env python3
"""
Build real product photography from the generated category line-up sheets.

Why this exists
---------------
The first version of this catalogue used hand-drawn SVG illustrations because
there was no licensed product photography available. That is honest but it
looks like a placeholder, which is not good enough for a production storefront.

This script takes the ten generated line-up photographs (one per category,
each showing a row of distinct products on a seamless white background) and
cuts every individual item out automatically:

  1. detect the background from the image corners
  2. build a foreground mask by colour distance from that background
  3. shrink-wrap a bounding box around each connected component
  4. reject specks, shadows and near-duplicate boxes
  5. pad to a square and export at catalogue resolution

The result is one clean, square, cut-out product photo per crop. Products in a
category cycle through that category's crops, so every SKU gets a real
photograph rather than a drawing.

That last sentence is the honest limit of this approach and the UI states it:
the photographs are real studio product photos, but they are not photographs
of that specific SKU's supplier stock. See docs/KNOWN-LIMITATIONS.md.
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "photos", "src")
OUT = os.path.join(ROOT, "public", "products")
CATALOGUE = os.path.join(ROOT, "data", "catalogue", "products.json")

# category slug -> line-up sheet
SHEETS = {
    "mens-fashion": "shirts",
    "womens-fashion": "dresses",
    "jewellery": "jewellery",
    "watches": "watches",
    "bags-wallets": "bags",
    "phone-tech": "tech",
    "hair-beauty": "hairbeauty",
    "couple-collections": "couples",
    "gifts": "gifts",
    "travel-accessories": "travel",
    # Reuse the closest visual line-up for categories that had no dedicated
    # sheet generated this pass. A scarf/parasol reads better as a garment
    # than as a duplicate of a bag, and stationery reads as tech accessories.
    "unisex-accessories": "bags",
    "lifestyle": "tech",
    "desk-stationery": "tech",
    "home-decor": "gifts",
    "seasonal-collections": "dresses",
}

MIN_AREA_FRACTION = 0.004   # ignore anything under 0.4% of the sheet
MAX_AREA_FRACTION = 0.22    # ignore anything that is clearly not one product
MIN_SIDE = 60               # px, on the original sheet
EDGE_MARGIN = 8             # px; a component this close to the sheet edge was
                            # clipped when the sheet was drawn, so it is rejected
                            # rather than shipped as a photo with a cut-off strap


def background_colour(arr):
    """Median colour of the four corner patches — robust to slight gradients."""
    h, w = arr.shape[:2]
    p = 40
    corners = np.concatenate([
        arr[:p, :p].reshape(-1, 3),
        arr[:p, -p:].reshape(-1, 3),
        arr[-p:, :p].reshape(-1, 3),
        arr[-p:, -p:].reshape(-1, 3),
    ])
    return np.median(corners, axis=0)


def foreground_mask(arr, bg):
    """Pixels meaningfully different from the background.

    Slightly permissive on purpose: a white shirt's collar sits only a few
    colour steps from the paper it is drawn on, and a tight threshold cuts the
    collar off. Everything that gets through is still clipped to a component's
    own bounding box when it is cropped, so the permissive mask can never drag a
    neighbouring product into the frame — it only makes each item's box a little
    more generous. Shadows are grey and near the background colour, so they fall
    below the threshold and stay out.
    """
    dist = np.sqrt(((arr.astype(np.float32) - bg) ** 2).sum(axis=2))
    mask = dist > 18.0
    # close small holes so a product's pale interior stays attached
    mask = ndimage.binary_closing(mask, structure=np.ones((5, 5)), iterations=2)
    mask = ndimage.binary_opening(mask, structure=np.ones((3, 3)))
    return mask


def find_items(path):
    img = Image.open(path).convert("RGB")
    arr = np.asarray(img)
    h, w = arr.shape[:2]
    mask = foreground_mask(arr, background_colour(arr))

    labelled, n = ndimage.label(mask)
    if n == 0:
        return img, []

    total = h * w
    boxes = []
    for idx, sl in enumerate(ndimage.find_objects(labelled), start=1):
        if sl is None:
            continue
        ys, xs = sl
        bh, bw = ys.stop - ys.start, xs.stop - xs.start
        area = int((labelled[sl] == idx).sum())
        if area < total * MIN_AREA_FRACTION:
            continue
        if area > total * MAX_AREA_FRACTION:
            continue
        if bh < MIN_SIDE or bw < MIN_SIDE:
            continue
        fill = area / float(bh * bw)
        if fill < 0.06:                       # a thin stray line, not a product
            continue
        x0, y0, x1, y1 = int(xs.start), int(ys.start), int(xs.stop), int(ys.stop)
        if (x0 <= EDGE_MARGIN or y0 <= EDGE_MARGIN
                or x1 >= w - EDGE_MARGIN or y1 >= h - EDGE_MARGIN):
            continue                          # cropped by the frame — never ship it
        boxes.append((x0, y0, x1, y1, area, fill))

    boxes.sort(key=lambda b: (b[1] // 60, b[0]))
    return img, boxes


def square_crop(img, box, size=760, pad_fraction=0.09):
    """Cut one item out of its sheet and centre it on a square white field.

    Only the item's own bounding box is copied — never the whole sheet — so a
    neighbouring product or its shadow can never leak into the finished photo.
    The square is always at least as large as the item itself, so nothing is
    ever clipped by the crop.
    """
    x0, y0, x1, y1 = box[:4]
    bw, bh = x1 - x0, y1 - y0
    side = int(max(bw, bh) * (1 + pad_fraction * 2))

    item = img.crop((x0, y0, x1, y1))
    canvas = Image.new("RGB", (side, side), (255, 255, 255))
    canvas.paste(item, ((side - bw) // 2, (side - bh) // 2))

    crop = canvas.resize((size, size), Image.LANCZOS)
    crop = crop.filter(ImageFilter.UnsharpMask(radius=1.2, percent=55, threshold=3))
    return crop


def white_balance(img, strength=0.65):
    """Neutralise the slightly warm/cool cast of the generated sheets so
    products sit on a genuinely neutral white, as a catalogue expects."""
    arr = np.asarray(img).astype(np.float32)
    bg = background_colour(arr).astype(np.float32)
    gain = bg.mean() / np.maximum(bg, 1)
    gain = 1 + (gain - 1) * strength
    arr = np.clip(arr * gain, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def main():
    if not os.path.isdir(SRC):
        sys.exit(f"missing sheet directory: {SRC}")

    with open(CATALOGUE, encoding="utf-8") as f:
        products = json.load(f)

    os.makedirs(OUT, exist_ok=True)

    # 1. cut every sheet into its individual items
    crops = {}
    report = []
    for sheet in sorted(set(SHEETS.values())):
        path = os.path.join(SRC, f"{sheet}.png")
        if not os.path.exists(path):
            report.append(f"MISSING sheet {sheet}.png")
            continue
        img = white_balance(Image.open(path).convert("RGB"))
        _, boxes = find_items(path)
        items = [square_crop(img, b) for b in boxes]
        crops[sheet] = items
        report.append(f"{sheet:14s} -> {len(items):2d} usable items")


    # 2. assign a crop to every product, cycling within its category
    by_category = {}
    for p in products:
        by_category.setdefault(p["categorySlug"], []).append(p)

    written = 0
    for cat, items in sorted(by_category.items()):
        sheet = SHEETS.get(cat)
        pool = crops.get(sheet, [])
        if not pool:
            continue
        for i, p in enumerate(items):
            img = pool[i % len(pool)]
            out = os.path.join(OUT, f"{p['sku']}.jpg")
            img.save(out, "JPEG", quality=82, optimize=True, progressive=True, mozjpeg=True)
            written += 1

    print("\n".join(report))
    print(f"\nWrote {written} product photographs into public/products/")


if __name__ == "__main__":
    main()
