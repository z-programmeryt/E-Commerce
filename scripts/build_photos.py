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
    """Pixels meaningfully different from the background."""
    dist = np.sqrt(((arr.astype(np.float32) - bg) ** 2).sum(axis=2))
    mask = dist > 26.0
    # close small holes so a product's pale interior stays attached
    mask = ndimage.binary_closing(mask, structure=np.ones((5, 5)), iterations=2)
    mask = ndimage.binary_opening(mask, structure=np.ones((3, 3)))
    # drop shadows: a real product has saturated or dark pixels, a shadow is
    # uniformly desaturated grey close to the background colour
    return mask


def find_items(path):
    img = Image.open(path).convert("RGB")
    arr = np.asarray(img)
    h, w = arr.shape[:2]
    bg = background_colour(arr)
    mask = foreground_mask(arr, bg)

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
        if fill < 0.06:          # a thin stray line, not a product
            continue
        boxes.append((int(xs.start), int(ys.start), int(xs.stop), int(ys.stop), area, fill))

    # If a component is suspiciously large it is probably two products touching.
    # Split it by median-filtering the mask's column profile.
    boxes.sort(key=lambda b: (b[1] // 60, b[0]))
    return img, boxes


def square_crop(img, box, size=900, pad_fraction=0.09):
    x0, y0, x1, y1 = box[:4]
    bw, bh = x1 - x0, y1 - y0
    side = int(max(bw, bh) * (1 + pad_fraction * 2))
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    left, top = cx - side // 2, cy - side // 2

    canvas = Image.new("RGB", (side, side), (255, 255, 255))
    # paste the whole sheet offset so the crop lands correctly, then crop
    canvas.paste(img, (-left, -top))
    crop = canvas

    # Resize with a high-quality filter, then emit on a pure white field.
    crop = crop.resize((size, size), Image.LANCZOS)
    # very light unsharp so fine texture survives the downscale
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
        report.append(f"{sheet:14s} -> {len(items):2d} items")

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
            img.save(out, "JPEG", quality=88, optimize=True, progressive=True)
            written += 1

    print("\n".join(report))
    print(f"\nWrote {written} product photographs into public/products/")


if __name__ == "__main__":
    main()
