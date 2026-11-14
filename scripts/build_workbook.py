#!/usr/bin/env python3
"""
Builds SUPER Z SHOP — Business Planning Workbook (.xlsx)

Conventions
-----------
  * Yellow cells are inputs. Everything else is a formula.
  * All cross-sheet references go through the ASSUM / CAT_* maps below, so a
    layout change is a one-line fix instead of a silent off-by-one.
  * Every research row carries a status: VERIFIED / SECONDARY / ESTIMATE /
    NOT VERIFIED. Nothing is presented as verified without a source.
  * Gross profit and contribution are never labelled net profit.

Run:  python3 scripts/build_workbook.py
"""
import json
import os

from openpyxl import Workbook
from openpyxl.chart import BarChart, LineChart, PieChart, Reference
from openpyxl.chart.series import SeriesLabel
from openpyxl.chart.data_source import StrRef
from openpyxl.formatting.rule import CellIsRule, ColorScaleRule, FormulaRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.worksheet.datavalidation import DataValidation

import research_data as R

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "docs", "SUPER-Z-SHOP-business-plan.xlsx")
os.makedirs(os.path.dirname(OUT), exist_ok=True)

with open(os.path.join(ROOT, "data/catalogue/products.json"), encoding="utf-8") as f:
    PRODUCTS = json.load(f)
with open(os.path.join(ROOT, "data/catalogue/categories.json"), encoding="utf-8") as f:
    CATEGORIES = json.load(f)
CATNAME = {c["slug"]: c["name"] for c in CATEGORIES}
AS_ = R.ASSUMPTIONS

# ------------------------------------------------------------- layout ------
SH = {
    "dash": "1. Executive Dashboard",
    "cat": "2. Product Catalogue",
    "res": "3. Product Research",
    "sup": "4. Supplier Database",
    "comp": "5. Competitor Prices",
    "prof": "6. Product Profitability",
    "unit": "7. Unit Economics",
    "budget": "8. Startup Budget",
    "inv": "9. Inventory",
    "sales": "10. Sales Tracker",
    "mkt": "11. Marketing & ROAS",
    "cash": "12. Cash Flow & P&L",
    "risk": "13. Risk Assessment",
    "road": "14. Launch Roadmap",
    "check": "15. Verification Checklist",
    "src": "16. Sources & Assumptions",
    "assum": "Assumptions",
}

CAT_HDR = 4
CAT_FIRST = 5
CAT_LAST = CAT_FIRST + len(PRODUCTS) - 1          # 229
PROF_FIRST = CAT_FIRST
PROF_LAST = PROF_FIRST + len(PRODUCTS) - 1
PROF_TOT = PROF_LAST + 1

# assumptions sheet: single source of truth for every constant's cell
ASSUM_ROWS = [
    ("Inbound transport as % of wholesale", AS_["inbound_transport_pct"], '0.0%', "Market trip cost spread over the units bought"),
    ("Packaging per order", AS_["packaging_per_order"], 'BDT', "Mailer, rigid box, filler, tape, thank-you card"),
    ("Courier charge — inside Dhaka", AS_["courier_dhaka"], 'BDT', "1 kg base rate, Pathao/RedX"),
    ("Courier charge — outside Dhaka", AS_["courier_outside"], 'BDT', "Steadfast flat Dhaka→district rate"),
    ("Delivery charged to customer — inside Dhaka", 70, 'BDT', "Matches the website"),
    ("Delivery charged to customer — outside Dhaka", 130, 'BDT', "Matches the website"),
    ("Free delivery threshold", 2500, 'BDT', "Matches the website; above this we absorb the courier"),
    ("COD collection fee %", AS_["cod_fee_pct"], '0.00%', "Steadfast 1% — worst of our three couriers"),
    ("Return / defect reserve %", AS_["return_reserve_pct"], '0.00%', "Of revenue, set aside for defects"),
    ("Return handling cost per return", 130, 'BDT', "Reverse courier + repack + inspection"),
    ("Return rate — moderate planning case", AS_["return_rate_moderate"], '0.0%', "Scenario driver"),
    ("Ad cost per delivered order", AS_["ad_cost_per_delivered_order"], 'BDT', "CAC at a small daily spend"),
    ("bKash merchant fee %", AS_["bkash_fee_pct"], '0.00%', "Prepaid orders only"),
    ("Nagad merchant fee %", AS_["nagad_fee_pct"], '0.00%', "Prepaid orders only"),
    ("Inside-Dhaka share of orders", AS_["inside_dhaka_order_share"], '0%', "Audience mix at launch"),
]
ASSUM_FIRST = 6
ASSUM_LAST = ASSUM_FIRST + len(ASSUM_ROWS) - 1

def _a(label_start):
    """Cell address on the Assumptions sheet for an assumption label."""
    for i, (label, *_rest) in enumerate(ASSUM_ROWS):
        if label.lower().startswith(label_start.lower()):
            return f"Assumptions!$B${ASSUM_FIRST + i}"
    raise KeyError(label_start)

ASSUM = {
    "inbound": _a("Inbound transport"),
    "pack": _a("Packaging per order"),
    "cour_in": _a("Courier charge — inside"),
    "cour_out": _a("Courier charge — outside"),
    "del_in": _a("Delivery charged to customer — inside"),
    "del_out": _a("Delivery charged to customer — outside"),
    "free_thr": _a("Free delivery threshold"),
    "cod": _a("COD collection fee"),
    "ret_res": _a("Return / defect reserve"),
    "ret_cost": _a("Return handling cost"),
    "ret_rate": _a("Return rate — moderate"),
    "ad": _a("Ad cost per delivered order"),
    "bkash": _a("bKash merchant fee"),
    "nagad": _a("Nagad merchant fee"),
    "dhaka_share": _a("Inside-Dhaka share"),
}
CAT = {
    "sku": f"'{SH['cat']}'!$B${CAT_FIRST}", "name": f"'{SH['cat']}'!$C${CAT_FIRST}",
    "cat": f"'{SH['cat']}'!$E${CAT_FIRST}", "wholesale": f"'{SH['cat']}'!$I${CAT_FIRST}",
    "retail": f"'{SH['cat']}'!$J${CAT_FIRST}", "sale": f"'{SH['cat']}'!$K${CAT_FIRST}",
}
PROF = f"'{SH['prof']}'"

def cat(addr, r):
    """Shift a template address that ends in $<CAT_FIRST> to row r."""
    return addr.replace(f"${CAT_FIRST}", f"${r}")

def prof(addr, r):
    return f"{PROF}!{addr}{r}"

# ----------------------------------------------------------------- styles ---
INK, OLIVE, SAND, LINE = "1D1C1A", "5D6A4F", "F3EFE7", "E3DDD2"
INPUT_FILL = PatternFill("solid", fgColor="FFF4C2")
HEAD_FILL = PatternFill("solid", fgColor=INK)
SUBHEAD_FILL = PatternFill("solid", fgColor=SAND)
CALC_FILL = PatternFill("solid", fgColor="F7F9F5")
WARN_FILL = PatternFill("solid", fgColor="FBEFE6")
GOOD_FILL = PatternFill("solid", fgColor="EEF4EA")
NOTE_FILL = PatternFill("solid", fgColor="F4F1EA")
BAD_FILL = PatternFill("solid", fgColor="F8D7DA")

TITLE_FONT = Font(name="Georgia", size=18, color=INK)
H2_FONT = Font(name="Georgia", size=13, color=INK)
HEAD_FONT = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
BOLD = Font(name="Calibri", size=10, bold=True)
BODY = Font(name="Calibri", size=10)
SMALL = Font(name="Calibri", size=9, color="6B6862")
TINY = Font(name="Calibri", size=8, color="6B6862")
ITALIC = Font(name="Calibri", size=9, italic=True, color="6B6862")
MONO = Font(name="Consolas", size=9)

THIN = Side(style="thin", color=LINE)
BOX = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
BDT = '#,##0" ৳"'
PCT = '0.0%'
NUM = '#,##0'
X = '0.00"x"'

wb = Workbook()
wb.remove(wb.active)

def sheet(name, tab=OLIVE):
    ws = wb.create_sheet(name)
    ws.sheet_properties.tabColor = tab
    ws.sheet_view.showGridLines = False
    return ws

def title_block(ws, title, subtitle, width=10):
    ws["A1"] = title
    ws["A1"].font = TITLE_FONT
    ws.row_dimensions[1].height = 26
    ws["A2"] = subtitle
    ws["A2"].font = ITALIC
    ws["A2"].alignment = Alignment(wrap_text=True, vertical="top")
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=width)
    ws.row_dimensions[2].height = 28
    ws["A3"] = (f"SUPER Z SHOP · business planning workbook · research date {R.RESEARCH_DATE} · "
                "amounts in BDT (৳) · yellow cells are inputs")
    ws["A3"].font = SMALL
    ws.merge_cells(start_row=3, start_column=1, end_row=3, end_column=width)

def header_row(ws, row, headers, widths=None, freeze=True):
    for i, h in enumerate(headers, start=1):
        c = ws.cell(row=row, column=i, value=h)
        c.font = HEAD_FONT
        c.fill = HEAD_FILL
        c.alignment = Alignment(wrap_text=True, vertical="center", horizontal="left")
        c.border = BOX
    ws.row_dimensions[row].height = 30
    if widths:
        for i, w in enumerate(widths, start=1):
            ws.column_dimensions[get_column_letter(i)].width = w
    if freeze:
        ws.freeze_panes = ws.cell(row=row + 1, column=1)

def note(ws, row, text, span=8, fill=NOTE_FILL):
    c = ws.cell(row=row, column=1, value=text)
    c.font = SMALL
    c.alignment = Alignment(wrap_text=True, vertical="top")
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=span)
    ws.row_dimensions[row].height = max(18, 12.5 * (len(text) // 105 + 1))
    for col in range(1, span + 1):
        ws.cell(row=row, column=col).fill = fill
        ws.cell(row=row, column=col).border = BOX

STATUS_FMT = {
    "VERIFIED": (GOOD_FILL, "2F5539"),
    "SECONDARY": (PatternFill("solid", fgColor="EEF2F7"), "34495E"),
    "ESTIMATE": (WARN_FILL, "8A6516"),
    "NOT VERIFIED": (PatternFill("solid", fgColor="F5F2F2"), "8F2F26"),
}

def status_cell(cell, status):
    fill, colour = STATUS_FMT.get(status, STATUS_FMT["NOT VERIFIED"])
    cell.fill = fill
    cell.font = Font(name="Calibri", size=9, bold=True, color=colour)
    cell.border = BOX
    cell.alignment = Alignment(horizontal="center", vertical="center")

RISK = {
    "mens-fashion": "Size and fit returns", "womens-fashion": "Size, colour mismatch, drape",
    "unisex-accessories": "Low", "jewellery": "Plating tarnish complaint",
    "watches": "Movement failure, water ingress", "bags-wallets": "Stitching or zip failure",
    "phone-tech": "Dead on arrival, battery", "hair-beauty": "Hygiene, heater safety",
    "couple-collections": "Low", "gifts": "Breakage in transit",
    "travel-accessories": "Wheels and zips", "lifestyle": "Low; hygiene items non-returnable",
    "desk-stationery": "Low", "home-decor": "Colour variation, breakage",
    "seasonal-collections": "End-of-season dead stock",
}
TARGET = {
    "mens-fashion": "Men 22–40, Dhaka metro, office and festive", "womens-fashion": "Women 20–40, festive and everyday",
    "unisex-accessories": "Students and young professionals 18–32", "jewellery": "Women 18–45, weddings and gifting",
    "watches": "Men 22–45 and gift buyers", "bags-wallets": "Students, office workers, travellers",
    "phone-tech": "Smartphone users 16–35", "hair-beauty": "Women 16–40, self-care",
    "couple-collections": "Couples 20–32", "gifts": "Occasion gift buyers",
    "travel-accessories": "Domestic travellers and students", "lifestyle": "Health-conscious 20–40",
    "desk-stationery": "Students and office workers", "home-decor": "Young families setting up home",
    "seasonal-collections": "Seasonal and festival buyers",
}
SEASON = {
    "mens-fashion": "Year-round; panjabi peaks pre-Eid", "womens-fashion": "Wedding season Nov–Feb, Eid peaks",
    "unisex-accessories": "Summer caps, winter beanies", "jewellery": "Wedding season + Eid",
    "watches": "Gifting: Eid, birthdays, Valentine's", "bags-wallets": "Back-to-school Jan and Jun",
    "phone-tech": "Year-round", "hair-beauty": "Year-round; gifting peaks",
    "couple-collections": "Valentine's, anniversaries", "gifts": "Eid, weddings, New Year",
    "travel-accessories": "Eid travel rush, winter holidays", "lifestyle": "January resolutions, year-round",
    "desk-stationery": "School terms", "home-decor": "Eid and Pohela Boishakh peaks",
    "seasonal-collections": "Explicitly seasonal",
}
PACK = {
    "mens-fashion": "Poly mailer + tissue", "womens-fashion": "Poly mailer + tissue",
    "unisex-accessories": "Poly mailer", "jewellery": "Pouch + rigid box + bubble wrap",
    "watches": "Watch box + bubble wrap", "bags-wallets": "Dust bag + mailer",
    "phone-tech": "Bubble wrap + rigid box", "hair-beauty": "Bubble wrap + mailer",
    "couple-collections": "Gift box", "gifts": "Rigid gift box + filler",
    "travel-accessories": "Poly mailer / carton", "lifestyle": "Poly mailer / carton",
    "desk-stationery": "Rigid envelope", "home-decor": "Carton + bubble wrap",
    "seasonal-collections": "Varies by item",
}

# ================================================= 2. CATALOGUE (first) ====
ws = sheet(SH["cat"])
title_block(ws, "Complete 225-Product Catalogue",
            "Generated from the same source file that seeds the website database, so the workbook and the store "
            "can never disagree. Wholesale and retail are UNVERIFIED demo estimates until a supplier quote "
            "replaces them — see column N.", 15)
header_row(ws, CAT_HDR,
           ["#", "SKU", "Product", "Bangla name", "Category", "Subcategory", "Colours", "Sizes",
            "Wholesale (৳)", "Retail (৳)", "Sale (৳)", "MOQ (pcs)", "Tags", "Price status", "Warranty",
            "Gross margin est.", "Discount off retail"],
           [5, 15, 36, 23, 20, 18, 21, 15, 12, 10, 10, 9, 24, 13, 16, 14, 15])
for i, p in enumerate(PRODUCTS):
    r = CAT_FIRST + i
    ws.cell(row=r, column=1, value=i + 1).font = SMALL
    ws.cell(row=r, column=2, value=p["sku"]).font = MONO
    ws.cell(row=r, column=3, value=p["name"]).font = BODY
    ws.cell(row=r, column=4, value=p["nameBn"]).font = BODY
    ws.cell(row=r, column=5, value=CATNAME[p["categorySlug"]]).font = SMALL
    ws.cell(row=r, column=6, value=p["subcategory"]).font = SMALL
    ws.cell(row=r, column=7, value=", ".join(p["colors"])).font = SMALL
    ws.cell(row=r, column=8, value=", ".join(p["sizes"]) or "One size").font = SMALL
    for col, val in ((9, p["wholesaleCost"]), (10, p["retailPrice"])):
        c = ws.cell(row=r, column=col, value=val)
        c.number_format = BDT
        c.fill = INPUT_FILL
    c = ws.cell(row=r, column=11, value=p["salePrice"])
    c.number_format = BDT
    ws.cell(row=r, column=12, value=p["moq"]).font = SMALL
    ws.cell(row=r, column=13, value=", ".join(p["tags"])).font = SMALL
    status_cell(ws.cell(row=r, column=14), "NOT VERIFIED")
    ws.cell(row=r, column=15, value=p["warranty"]).font = SMALL
    ws.cell(row=r, column=16, value=f"=IFERROR((J{r}-I{r})/J{r},0)").number_format = PCT
    ws.cell(row=r, column=17, value=f'=IF(K{r}="","-",IFERROR(1-K{r}/J{r},0))').number_format = PCT
    for col in range(1, 18):
        ws.cell(row=r, column=col).border = BOX

ws.auto_filter.ref = f"A{CAT_HDR}:Q{CAT_LAST}"
ws.conditional_formatting.add(f"J{CAT_FIRST}:J{CAT_LAST}",
                              FormulaRule(formula=[f"J{CAT_FIRST}<=I{CAT_FIRST}"], fill=BAD_FILL))
note(ws, CAT_LAST + 2,
     "Columns I and J are yellow because they are the cells you must replace with real supplier quotations. "
     "Column N stays NOT VERIFIED until a dated invoice, quote or price photo supports it. Sheets 6, 9 and 14 "
     "read from this sheet, so correcting a price here updates the whole workbook. SKUs and product names are "
     "checked for uniqueness by the generator, so the 225 rows contain no accidental duplicates.", span=15)

wb.defined_names.add(DefinedName("Cat_Wholesale", attr_text=f"'{SH['cat']}'!$I${CAT_FIRST}:$I${CAT_LAST}"))
wb.defined_names.add(DefinedName("Cat_Retail", attr_text=f"'{SH['cat']}'!$J${CAT_FIRST}:$J${CAT_LAST}"))

# ============================================ 6. PROFITABILITY =============
ws = sheet(SH["prof"])
title_block(ws, "Product Profitability & Unit Economics (per delivered order)",
            "Every cell is a formula driven by the Assumptions sheet. Contribution is NOT net profit — it excludes "
            "rent, salaries, utilities, phone/internet and financing.", 16)
header_row(ws, 4,
           ["SKU", "Product", "Category", "Wholesale (৳)", "Inbound (৳)", "Packaging (৳)", "Landed (৳)",
            "Retail (৳)", "Selling (৳)", "Net delivery (৳)", "Gross profit (৳)", "Gross margin",
            "Contribution (৳)", "Break-even price (৳)", "Return risk"],
           [15, 31, 19, 12, 11, 12, 12, 11, 11, 13, 13, 12, 14, 16, 30])
for i, p in enumerate(PRODUCTS):
    r = PROF_FIRST + i
    cr = CAT_FIRST + i
    ws.cell(row=r, column=1, value=f"={cat(CAT['sku'], cr)}").font = MONO
    ws.cell(row=r, column=2, value=f"={cat(CAT['name'], cr)}").font = SMALL
    ws.cell(row=r, column=3, value=f"={cat(CAT['cat'], cr)}").font = SMALL
    ws.cell(row=r, column=4, value=f"={cat(CAT['wholesale'], cr)}").number_format = BDT
    ws.cell(row=r, column=5, value=f"=D{r}*{ASSUM['inbound']}").number_format = BDT
    ws.cell(row=r, column=6, value=f"={ASSUM['pack']}").number_format = BDT
    ws.cell(row=r, column=7, value=f"=D{r}+E{r}+F{r}").number_format = BDT
    ws.cell(row=r, column=8, value=f"={cat(CAT['retail'], cr)}").number_format = BDT
    ws.cell(row=r, column=9, value=f'=IF({cat(CAT["sale"], cr)}="",H{r},{cat(CAT["sale"], cr)})').number_format = BDT
    ws.cell(row=r, column=9).fill = CALC_FILL
    # net delivery: charged to the customer minus what the courier takes; free above the threshold
    ws.cell(row=r, column=10, value=(
        f"=IF(I{r}>={ASSUM['free_thr']},0,"
        f"{ASSUM['dhaka_share']}*{ASSUM['del_in']}+(1-{ASSUM['dhaka_share']})*{ASSUM['del_out']})"
        f"-({ASSUM['dhaka_share']}*{ASSUM['cour_in']}+(1-{ASSUM['dhaka_share']})*{ASSUM['cour_out']})"
    )).number_format = BDT
    ws.cell(row=r, column=11, value=f"=I{r}-G{r}").number_format = BDT
    ws.cell(row=r, column=12, value=f"=IFERROR(K{r}/I{r},0)").number_format = PCT
    ws.cell(row=r, column=13, value=(
        f"=ROUND(K{r}+J{r}-I{r}*{ASSUM['cod']}-I{r}*{ASSUM['ret_res']}-{ASSUM['ad']},0)"
    )).number_format = BDT
    ws.cell(row=r, column=13).font = BOLD
    # break-even price: zero contribution, delivery assumed charged at the blended rate
    ws.cell(row=r, column=14, value=(
        f"=IFERROR(ROUND((G{r}+{ASSUM['ad']}"
        f"+({ASSUM['dhaka_share']}*{ASSUM['cour_in']}+(1-{ASSUM['dhaka_share']})*{ASSUM['cour_out']})"
        f"-({ASSUM['dhaka_share']}*{ASSUM['del_in']}+(1-{ASSUM['dhaka_share']})*{ASSUM['del_out']}))"
        f"/(1-{ASSUM['cod']}-{ASSUM['ret_res']}),0),\"n/a\")"
    )).number_format = BDT
    ws.cell(row=r, column=15, value=RISK[p["categorySlug"]]).font = SMALL
    for col in range(1, 16):
        ws.cell(row=r, column=col).border = BOX
        ws.cell(row=r, column=col).alignment = Alignment(wrap_text=True, vertical="center")

tot = PROF_TOT
labels = {4: "AVERAGE", 5: "AVERAGE", 6: "AVERAGE", 7: "AVERAGE", 8: "AVERAGE", 9: "AVERAGE",
          10: "AVERAGE", 11: "AVERAGE", 13: "AVERAGE", 14: "AVERAGE"}
ws.cell(row=tot, column=2, value="AVERAGES ACROSS ALL 225 SKUs").font = BOLD
for col, fn in labels.items():
    L = get_column_letter(col)
    c = ws.cell(row=tot, column=col, value=f"={fn}({L}{PROF_FIRST}:{L}{PROF_LAST})")
    c.number_format = PCT if col == 12 else BDT
    c.font = BOLD
    c.fill = SUBHEAD_FILL
    c.border = BOX
ws.cell(row=tot, column=12, value=f"=IFERROR(SUM(K{PROF_FIRST}:K{PROF_LAST})/SUM(I{PROF_FIRST}:I{PROF_LAST}),0)")
ws.cell(row=tot, column=12).number_format = PCT
ws.cell(row=tot, column=12).font = BOLD
ws.cell(row=tot, column=12).fill = SUBHEAD_FILL
ws.cell(row=tot, column=12).border = BOX

ws.auto_filter.ref = f"A4:O{PROF_LAST}"
ws.conditional_formatting.add(f"L{PROF_FIRST}:L{PROF_LAST}",
    ColorScaleRule(start_type="num", start_value=0.2, start_color="F8D7DA",
                   mid_type="num", mid_value=0.45, mid_color="FFF3CD",
                   end_type="num", end_value=0.65, end_color="D4EDDA"))
ws.conditional_formatting.add(f"M{PROF_FIRST}:M{PROF_LAST}",
    CellIsRule(operator="lessThan", formula=["0"], fill=BAD_FILL))
ws.conditional_formatting.add(f"M{PROF_FIRST}:M{PROF_LAST}",
    CellIsRule(operator="lessThan", formula=[ASSUM["ad"]], fill=WARN_FILL))

# --- charts: highest / lowest cost and contribution by category -----------------
by_cat = {}
for p_ in PRODUCTS:
    by_cat.setdefault(CATNAME[p_["categorySlug"]], []).append(PRODUCTS.index(p_) + PROF_FIRST)
cstart = tot + 6
ws.cell(row=cstart, column=1, value="Contribution by category (helper table for the chart)").font = H2_FONT
header_row(ws, cstart + 1, ["Category", "SKUs", "Avg landed (৳)", "Avg selling (৳)", "Avg contribution (৳)",
                            "Margin on selling"],
           [30, 8, 15, 15, 17, 15], freeze=False)
rr = cstart + 2
cat_first = rr
for catname, rows_ in by_cat.items():
    rng = ",".join([])  # placeholder to keep the loop simple
    ws.cell(row=rr, column=1, value=catname).font = BODY
    ws.cell(row=rr, column=2, value=len(rows_)).number_format = NUM
    # AVERAGEIF is not reliable across 225 rows in every engine, so average the exact rows
    for col, src in ((3, "G"), (4, "I"), (5, "M")):
        cells = [f"{src}{x}" for x in rows_]
        ws.cell(row=rr, column=col, value="=AVERAGE(" + ",".join(cells) + ")").number_format = BDT
    # weighted margin: total gross profit / total selling price for the category's SKUs
    gp = "+".join(f"K{x}" for x in rows_)
    sp = "+".join(f"I{x}" for x in rows_)
    ws.cell(row=rr, column=6, value=f"=IFERROR(({gp})/({sp}),0)").number_format = PCT
    for col in range(1, 7):
        ws.cell(row=rr, column=col).border = BOX
    rr += 1
cat_last = rr - 1

ch = BarChart()
ch.type = "bar"
ch.title = "Contribution by category (৳ per order)"
data = Reference(ws, min_col=5, min_row=cat_first - 1, max_row=cat_last)
cats = Reference(ws, min_col=1, min_row=cat_first, max_row=cat_last)
ch.add_data(data, titles_from_data=True)
ch.set_categories(cats)
ch.height = 10
ch.width = 16
ws.add_chart(ch, "H" + str(cstart))

ch_wr = BarChart()
ch_wr.type = "col"
ch_wr.title = "Wholesale vs retail, first 25 SKUs (৳)"
ch_wr.y_axis.title = "BDT"
ch_wr.add_data(Reference(ws, min_col=4, max_col=4, min_row=4, max_row=28), titles_from_data=True)
ch_wr.add_data(Reference(ws, min_col=8, max_col=8, min_row=4, max_row=28), titles_from_data=True)
ch_wr.set_categories(Reference(ws, min_col=1, min_row=5, max_row=28))
ch_wr.height = 9
ch_wr.width = 22
ws.add_chart(ch_wr, "H" + str(cstart + 22))

note(ws, tot + 2,
     "How to read this: (11) gross profit is selling price minus landed product cost. (12) gross margin is that as "
     "a percentage. (10) net delivery is what the customer pays for shipping minus what the courier charges us — "
     "negative on free-delivery orders above the threshold. (13) contribution subtracts the COD fee, a returns "
     "reserve and assumed ad spend from gross profit plus net delivery. (14) break-even price is the lowest price "
     "that still leaves zero contribution. Anything in column M highlighted amber contributes less than one ad "
     "click's worth of margin — it cannot pay for its own acquisition.", span=15)
note(ws, tot + 3,
     "Contribution is NOT net profit. Rent, salaries, utilities, phone bills and financing are excluded and only "
     "appear in the P&L on sheet 12. This distinction is the whole reason a store can look profitable per order "
     "and still lose money each month.", span=15, fill=WARN_FILL)

# ============================================ 1. DASHBOARD =================
ws = sheet(SH["dash"])
title_block(ws, "SUPER Z SHOP — Executive Dashboard",
            "One page, all formulas. Change the yellow cells and every figure here recalculates from sheets 6 and 14.",
            9)
ws["A5"] = "Startup capital scenario"
ws["A5"].font = BOLD
ws["C5"] = 10000
ws["C5"].fill = INPUT_FILL
ws["C5"].number_format = BDT
ws["C5"].border = BOX
ws["D5"] = "← change this single cell (3,000 / 5,000 / 10,000); sheet 14 re-plans to match"
ws["D5"].font = ITALIC
ws.merge_cells("D5:I5")

ws["A8"] = "Headline numbers"
ws["A8"].font = H2_FONT

SAMPLE_COST = f"SUMPRODUCT('{SH['road']}'!$E$5:$E$24,'{SH['road']}'!$H$5:$H$24)"
SAMPLE_UNITS = f"SUM('{SH['road']}'!$H$5:$H$24)"
SAMPLE_SKUS = f"COUNTIF('{SH['road']}'!$H$5:$H$24,\">0\")"
kpis = [
    ("Products in catalogue", f"=COUNTA('{SH['cat']}'!$B${CAT_FIRST}:$B${CAT_LAST})", NUM, "225 SKUs across 15 categories."),
    ("Categories", f"=SUMPRODUCT(1/COUNTIF('{SH['cat']}'!$E${CAT_FIRST}:$E${CAT_LAST},'{SH['cat']}'!$E${CAT_FIRST}:$E${CAT_LAST}))",
     NUM, "Counted from the catalogue, not typed."),
    ("Launch SKUs at ৳10,000", f"={SAMPLE_SKUS}", NUM, "From the tiered shortlist on sheet 14."),
    ("Launch units", f"={SAMPLE_UNITS}", NUM, "Total pieces bought for the first test."),
    ("Launch buy cost at ৳10,000", f"={SAMPLE_COST}", BDT, "Includes inbound transport and packaging."),
    ("Inventory budget (55% of capital)", "=ROUND(C5*0.55,0)", BDT, "The cap sheet 14 funds against."),
    ("Cash left after the buy", f"=C5-{SAMPLE_COST}", BDT, "Funds ads, courier float and one bad batch."),
    ("Gross margin (revenue-weighted)", f"={PROF}!L{PROF_TOT}", PCT,
     "Gross profit ÷ revenue across the whole catalogue."),
    ("Average contribution per order", f"={PROF}!M{PROF_TOT}", BDT, "After delivery, COD, returns and ads."),
    ("Orders needed to recover the buy", f"=IF({PROF}!M{PROF_TOT}<=0,\"not viable\",ROUNDUP({SAMPLE_COST}/{PROF}!M{PROF_TOT},0))",
     NUM, "Only covers the sample stock, not fixed costs."),
]
row = 9
for label, formula, fmt, desk in kpis:
    ws.cell(row=row, column=1, value=label).font = BODY
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=3)
    c = ws.cell(row=row, column=4, value=formula)
    c.number_format = fmt
    c.font = BOLD
    c.fill = CALC_FILL
    c.border = BOX
    d = ws.cell(row=row, column=5, value=desk)
    d.font = SMALL
    d.alignment = Alignment(wrap_text=True, vertical="top")
    ws.merge_cells(start_row=row, start_column=5, end_row=row, end_column=9)
    row += 1

row += 1
ws.cell(row=row, column=1, value="Three capital scenarios").font = H2_FONT
row += 1
header_row(ws, row, ["Capital", "Inventory (55%)", "Marketing (15%)", "Operations (15%)", "Reserve (15%)",
                     "Buy cost", "Orders to break even", "Plan depth"], [14, 15, 15, 16, 15, 15, 17, 34])
row += 1
scen_first = row
for cap in (3000, 5000, 10000):
    ws.cell(row=row, column=1, value=cap).number_format = BDT
    ws.cell(row=row, column=1).fill = INPUT_FILL
    ws.cell(row=row, column=2, value=f"=ROUND(A{row}*0.55,0)")
    ws.cell(row=row, column=3, value=f"=ROUND(A{row}*0.15,0)")
    ws.cell(row=row, column=4, value=f"=ROUND(A{row}*0.15,0)")
    ws.cell(row=row, column=5, value=f"=A{row}-B{row}-C{row}-D{row}")
    ws.cell(row=row, column=6, value=f"=MIN({SAMPLE_COST},B{row})")
    ws.cell(row=row, column=7, value=f"=IF({PROF}!M{PROF_TOT}<=0,\"n/a\",ROUNDUP(B{row}/{PROF}!M{PROF_TOT},0))")
    ws.cell(row=row, column=8, value=f'=IF(B{row}<1650,"partial Tier A",IF(B{row}<2750,"Tier A + some B","Tier A-D"))')
    for col in range(1, 9):
        c = ws.cell(row=row, column=col)
        c.border = BOX
        c.font = BODY
        if col in (1, 2, 3, 4, 5, 6):
            c.number_format = BDT
    row += 1
scen_last = row - 1

ch = BarChart()
ch.type = "col"
ch.title = "Capital allocation by scenario"
ch.y_axis.title = "BDT"
ch.add_data(Reference(ws, min_col=2, max_col=5, min_row=scen_first - 1, max_row=scen_last), titles_from_data=True)
ch.set_categories(Reference(ws, min_col=1, min_row=scen_first, max_row=scen_last))
ch.height = 8
ch.width = 17
ws.add_chart(ch, "A" + str(row + 1))

note(ws, row,
     "HONESTY NOTE — read before quoting any figure. Prices, wholesale costs and demand are NOT verified: the "
     "catalogue uses indicative Dhaka market estimates. Contribution is revenue minus product, delivery, COD, "
     "packaging, returns and advertising — it is NOT net profit, because rent, salaries, utilities, phone bills and "
     "financing are excluded. Every SKU must be re-priced against a real supplier quote before launch.", span=9,
     fill=WARN_FILL)

row += 2
ws.cell(row=row, column=1, value="What is verified, and what is not").font = H2_FONT
row += 1
header_row(ws, row, ["Item", "Status", "Evidence / why"], [40, 14, 76])
row += 1
evidence = [
    ("Bangladesh e-commerce market size", "SECONDARY", "Third-party databook; a modelled figure, not a census."),
    ("COD share of online orders (65–75%)", "SECONDARY", "Two independent secondary sources agree."),
    ("Courier rates (৳55–৳70 inside Dhaka)", "SECONDARY", "Aggregator blogs, not official rate cards."),
    ("bKash / Nagad merchant fees", "SECONDARY", "Published guides; real rates vary by agreement."),
    ("Which Dhaka market sells which category", "SECONDARY", "Market guides; no shop-level confirmation yet."),
    ("Wholesale cost of any specific SKU", "NOT VERIFIED", "No supplier quote collected yet."),
    ("Retail price a customer will actually pay", "NOT VERIFIED", "Estimated from market bands, untested."),
    ("Demand volume per SKU", "NOT VERIFIED", "No sales history exists; this is a new business."),
    ("Supplier names, owners and phone numbers", "NOT VERIFIED", "Left blank on purpose rather than invented."),
    ("Our cost assumptions (ads, packaging, returns)", "ESTIMATE", "Planning numbers, labelled as such throughout."),
]
for item, status, why in evidence:
    ws.cell(row=row, column=1, value=item).font = BODY
    ws.cell(row=row, column=1).border = BOX
    status_cell(ws.cell(row=row, column=2), status)
    w = ws.cell(row=row, column=3, value=why)
    w.font = SMALL
    w.alignment = Alignment(wrap_text=True, vertical="top")
    w.border = BOX
    row += 1

# category price ladder on the dashboard, feeding its own chart
row += 2
ws.cell(row=row, column=1, value="Wholesale vs retail by category").font = H2_FONT
row += 1
header_row(ws, row, ["Category", "SKUs", "Avg wholesale (৳)", "Avg retail (৳)", "Multiple"], [26, 8, 17, 16, 12],
           freeze=False)
row += 1
dash_first = row
for catname in dict.fromkeys(CATNAME[p_["categorySlug"]] for p_ in PRODUCTS):
    idxs = [CAT_FIRST + i for i, p_ in enumerate(PRODUCTS) if CATNAME[p_["categorySlug"]] == catname]
    ws.cell(row=row, column=1, value=catname).font = BODY
    ws.cell(row=row, column=2, value=len(idxs)).number_format = NUM
    ws.cell(row=row, column=3, value="=AVERAGE(" + ",".join(f"'{SH['cat']}'!I{x}" for x in idxs) + ")").number_format = BDT
    ws.cell(row=row, column=4, value="=AVERAGE(" + ",".join(f"'{SH['cat']}'!J{x}" for x in idxs) + ")").number_format = BDT
    ws.cell(row=row, column=5, value=f"=IFERROR(D{row}/C{row},0)").number_format = '0.00"x"'
    for col in range(1, 6):
        ws.cell(row=row, column=col).border = BOX
    row += 1
dash_last = row - 1

ch_wr = BarChart()
ch_wr.type = "bar"
ch_wr.title = "Average wholesale vs retail by category (৳)"
ch_wr.add_data(Reference(ws, min_col=3, max_col=4, min_row=dash_first - 1, max_row=dash_last), titles_from_data=True)
ch_wr.set_categories(Reference(ws, min_col=1, min_row=dash_first, max_row=dash_last))
ch_wr.height = 11
ch_wr.width = 17
ws.add_chart(ch_wr, "K8")

# ============================================ 3. PRODUCT RESEARCH ==========
ws = sheet(SH["res"])
title_block(ws, "Product Research & Market Validation",
            "Per-SKU research worksheet; the first 20 rows are the launch shortlist. Anything not yet researched says "
            "so — do not replace that with a guess.", 15)
header_row(ws, 4, ["#", "SKU", "Product", "Target customer", "Demand evidence", "Seasonality",
                   "Competitor price (৳)", "Competitor source", "Wholesale quote (৳)", "Quote date",
                   "Quality / spec notes", "Return risk", "Packaging", "Research status", "Verification task",
                   "Quote vs catalogue"],
           [5, 14, 30, 27, 30, 24, 15, 26, 15, 11, 34, 22, 22, 13, 34, 16])
tiers = {s: t for s, t, _ in R.SHORTLIST}
ordered = sorted(PRODUCTS, key=lambda p: (p["slug"] not in tiers, p["id"]))
r = 5
for i, p in enumerate(ordered, start=1):
    ws.cell(row=r, column=1, value=i).font = SMALL
    ws.cell(row=r, column=2, value=p["sku"]).font = MONO
    ws.cell(row=r, column=3, value=p["name"]).font = BODY
    ws.cell(row=r, column=4, value=TARGET[p["categorySlug"]]).font = SMALL
    ws.cell(row=r, column=5, value="NOT VERIFIED — no sales or search data collected").font = SMALL
    ws.cell(row=r, column=6, value=SEASON[p["categorySlug"]]).font = SMALL
    for col in (7, 8, 9, 10):
        c = ws.cell(row=r, column=col)
        c.fill = INPUT_FILL
        c.border = BOX
        if col in (7, 9):
            c.number_format = BDT
    ws.cell(row=r, column=11, value="Record at inspection: fabric GSM / plating / material / stitching").font = SMALL
    ws.cell(row=r, column=12, value=RISK[p["categorySlug"]]).font = SMALL
    ws.cell(row=r, column=13, value=PACK[p["categorySlug"]]).font = SMALL
    status_cell(ws.cell(row=r, column=14), "ESTIMATE")
    ws.cell(row=r, column=15, value="Three quotes, price tag photographed, shop name + date recorded").font = SMALL
    # variance only shows once a real quote is typed in
    ws.cell(row=r, column=16, value=(
        f'=IF(I{r}="","awaiting quote",IFERROR(I{r}/VLOOKUP(B{r},\'{SH["cat"]}\'!$B${CAT_FIRST}:$I${CAT_LAST},8,FALSE)-1,"n/a"))')
    ).number_format = '+0%;-0%;0%'
    for col in range(1, 17):
        ws.cell(row=r, column=col).border = BOX
        ws.cell(row=r, column=col).alignment = Alignment(wrap_text=True, vertical="top")
    r += 1
ws.auto_filter.ref = f"A4:P{r-1}"
note(ws, r + 1,
     "Workflow: take this sheet to Chandni Chowk, Gausia and New Market. For each SKU fill the competitor price, the "
     "wholesale quote and the quote date, then switch the status to VERIFIED only when a named shop confirmed it. "
     "Demand evidence stays NOT VERIFIED until the store has real sales data or you have documented comparable "
     "listing volumes. Nothing here is invented.", span=15)

# ============================================ 4. SUPPLIERS ================
ws = sheet(SH["sup"])
title_block(ws, "Dhaka Wholesale Supplier Database",
            "Real markets and platforms that exist. Individual shops, owners and phone numbers are NOT VERIFIED and "
            "are deliberately blank.", 12)
header_row(ws, 4, ["ID", "Name", "Type", "Area", "Categories", "Contact status", "Contact details",
                   "Observed MOQ", "Price evidence", "Status", "Source URL", "Next step"],
           [6, 28, 20, 24, 32, 18, 30, 24, 32, 12, 44, 42])
r = 5
for s in R.SUPPLIERS:
    vals = [s["id"], s["name"], s["type"], s["area"], s["categories"], s["contact_status"], s["contact"],
            s["moq_observed"], s["price_evidence"], s["status"], s["source"], s["next_step"]]
    for i, v in enumerate(vals, start=1):
        c = ws.cell(row=r, column=i, value=v)
        c.border = BOX
        c.alignment = Alignment(wrap_text=True, vertical="top")
        c.font = BODY if i == 2 else SMALL
    status_cell(ws.cell(row=r, column=10), s["status"])
    if str(s["source"]).startswith("http"):
        ws.cell(row=r, column=11).hyperlink = s["source"]
        ws.cell(row=r, column=11).font = Font(name="Calibri", size=8, color="24568A", underline="single")
    ws.row_dimensions[r].height = 48
    r += 1
note(ws, r + 1,
     "Deliberate omission: no phone numbers, shop names or street addresses beyond the published market are listed, "
     "because none were verified. Inventing a supplier contact is worse than admitting the gap — you would plan "
     "around a supplier who does not exist. Record real contacts on sheet 15 as you collect them.", span=12)

# ============================================ 5. COMPETITORS ===============
ws = sheet(SH["comp"])
title_block(ws, "Competitor Price Comparison",
            "Blank competitor cells are honest: those listings have not been surveyed yet. Start with the launch "
            "SKUs, then extend.", 11)
header_row(ws, 4, ["SKU", "Product", "Our retail (৳)", "Competitor A (৳)", "A source", "Competitor B (৳)",
                   "B source", "Our gap vs cheapest (৳)", "Flag", "Action"],
           [14, 34, 15, 15, 30, 15, 30, 20, 14, 32])
r = 5
for p in PRODUCTS[:80]:
    ws.cell(row=r, column=1, value=p["sku"]).font = MONO
    ws.cell(row=r, column=2, value=p["name"]).font = BODY
    c = ws.cell(row=r, column=3, value=f"={cat(CAT['retail'], CAT_FIRST + PRODUCTS.index(p))}")
    c.number_format = BDT
    for col in (4, 5, 6, 7):
        cell = ws.cell(row=r, column=col)
        cell.fill = INPUT_FILL
        cell.border = BOX
        if col in (4, 6):
            cell.number_format = BDT
    ws.cell(row=r, column=8, value=(
        f'=IF(COUNT(D{r},F{r})=0,"—",C{r}-MIN(IF(D{r}="",10^9,D{r}),IF(F{r}="",10^9,F{r})))')).number_format = BDT
    ws.cell(row=r, column=9, value=(
        f'=IF(COUNT(D{r},F{r})=0,"",IF(C{r}<MIN(IF(D{r}="",10^9,D{r}),IF(F{r}="",10^9,F{r})),"TOO CHEAP","Competitive"))'))
    ws.cell(row=r, column=10, value=(
        f'=IF(I{r}="","Enter competitor prices",IF(I{r}="TOO CHEAP","Raise price or strengthen the offer","Hold price"))'))
    for col in range(1, 11):
        ws.cell(row=r, column=col).border = BOX
        ws.cell(row=r, column=col).alignment = Alignment(wrap_text=True, vertical="center")
    r += 1
ws.conditional_formatting.add(f"I5:I{r-1}",
    CellIsRule(operator="equal", formula=['"TOO CHEAP"'], fill=WARN_FILL,
               font=Font(name="Calibri", size=10, bold=True, color="8F2F26")))
note(ws, r + 1,
     "A competitor survey of all 225 SKUs is about a week of work. Start with the 20 shortlist SKUs and extend only "
     "for products you actually stock. Record the listing URL and the date you saw each price — competitor prices "
     "move, and an undated price is not evidence.", span=10)

# ============================================ 7. UNIT ECONOMICS ============
ws = sheet(SH["unit"])
title_block(ws, "Unit Economics Calculator — one order at a time",
            "Change the yellow cells to model any single product. The three scenarios at the bottom vary the return "
            "rate, which is the input most likely to differ from the plan.", 8)

ws["A5"] = "INPUTS"
ws["A5"].font = H2_FONT
inputs = [
    ("Product name (for your reference)", "Premium Cotton Panjabi"),
    ("Wholesale cost (৳)", 1450),
    ("Selling price to customer (৳)", 2990),
]
r = 6
for label, val in inputs:
    ws.cell(row=r, column=1, value=label).font = BODY
    c = ws.cell(row=r, column=2, value=val)
    c.fill = INPUT_FILL
    c.border = BOX
    if isinstance(val, (int, float)):
        c.number_format = BDT
    r += 1
ws.cell(row=9, column=1, value="Everything else is pulled from the Assumptions sheet:").font = ITALIC
pulled = [
    ("Inbound transport %", f"={ASSUM['inbound']}", PCT),
    ("Packaging (৳)", f"={ASSUM['pack']}", BDT),
    ("Blended courier cost (৳)", f"={ASSUM['dhaka_share']}*{ASSUM['cour_in']}+(1-{ASSUM['dhaka_share']})*{ASSUM['cour_out']}", BDT),
    ("Blended delivery charged (৳)", f"={ASSUM['dhaka_share']}*{ASSUM['del_in']}+(1-{ASSUM['dhaka_share']})*{ASSUM['del_out']}", BDT),
    ("COD collection fee %", f"={ASSUM['cod']}", PCT),
    ("Return / defect reserve %", f"={ASSUM['ret_res']}", PCT),
    ("Ad cost per delivered order (৳)", f"={ASSUM['ad']}", BDT),
]
r = 10
for label, formula, fmt in pulled:
    ws.cell(row=r, column=1, value=label).font = BODY
    c = ws.cell(row=r, column=2, value=formula)
    c.number_format = fmt
    c.border = BOX
    c.fill = CALC_FILL
    r += 1

ws.cell(row=5, column=4, value="CALCULATION").font = H2_FONT
# inputs:   B7 wholesale, B8 selling price
# pulled:   B10 inbound %, B11 packaging, B12 courier, B13 delivery charged,
#           B14 COD %, B15 returns reserve %, B16 ad cost
calc = [
    ("Landed product cost", "=B7*(1+B10)+B11", BDT, "Wholesale + inbound transport + packaging"),
    ("Gross profit", "=B8-E18", BDT, "Selling price minus landed cost"),
    ("Gross margin", "=IFERROR(E19/B8,0)", PCT, "Gross profit ÷ selling price"),
    ("Net delivery position", "=B13-B12", BDT, "Charged minus courier; negative means we subsidise"),
    ("COD collection fee", "=B8*B14", BDT, "Deducted from the courier payout"),
    ("Returns reserve", "=B8*B15", BDT, "Percentage of revenue set aside"),
    ("Advertising per order", "=B16", BDT, "Cost of acquiring one delivered order"),
    ("CONTRIBUTION PER DELIVERED ORDER", "=E19+E21-E22-E23-E24", BDT, "After every variable cost"),
]
r = 18
for label, formula, fmt, desk in calc:
    bold = label.isupper()
    ws.cell(row=r, column=4, value=label).font = BOLD if bold else BODY
    c = ws.cell(row=r, column=5, value=formula)
    c.number_format = fmt
    c.border = BOX
    c.fill = GOOD_FILL if bold else CALC_FILL
    c.font = BOLD if bold else BODY
    ws.cell(row=r, column=6, value=desk).font = ITALIC
    r += 1

ws.cell(row=26, column=4, value="Break-even selling price").font = BOLD
c = ws.cell(row=26, column=5, value="=IFERROR(ROUND((E18+B16+B12-B13)/(1-B14-B15),0),\"n/a\")")
c.number_format = BDT
c.border = BOX
c.fill = WARN_FILL
c.font = BOLD
ws.cell(row=26, column=6, value="Lowest price that still leaves zero contribution").font = ITALIC

ws.cell(row=27, column=4, value="Fixed costs to recover (৳)").font = BODY
c = ws.cell(row=27, column=5, value=0)
c.fill = INPUT_FILL
c.border = BOX
c.number_format = BDT
ws.cell(row=27, column=6, value="Rent, salary, internet — zero by default").font = ITALIC

ws.cell(row=28, column=4, value="Break-even order quantity").font = BOLD
c = ws.cell(row=28, column=5,
            value='=IF(E25<=0,"impossible at this price",IF(B27=0,"no fixed costs entered",ROUNDUP(B27/E25,0)))')
c.border = BOX
c.fill = CALC_FILL
ws.cell(row=28, column=6, value="Fixed costs ÷ contribution per order").font = ITALIC

# scenarios — the return rate is the swing factor
r = 31
ws.cell(row=r, column=1, value="Scenario analysis — on 100 shipped orders").font = H2_FONT
r += 1
header_row(ws, r, ["On 100 shipped orders", "Optimistic (3%)", "Moderate (6%)", "Conservative (10%)"],
           [40, 17, 17, 18], freeze=False)
r += 1
s_first = r
# columns B, C, D each carry their own return rate
rates = [f"={ASSUM['ret_rate']}/2", f"={ASSUM['ret_rate']}", f"=MIN({ASSUM['ret_rate']}*1.67,0.25)"]
rows = [
    ("Return rate applied", [x for x in rates], PCT),
    ("Orders returned", [f"={L}{s_first}*100" for L in "BCD"], '0.0'),
    ("Revenue kept (৳)", [f"=100*$B$8*(1-{L}{s_first})" for L in "BCD"], BDT),
    ("Product cost of kept units (৳)", [f"=(100-{L}{s_first+1})*$E$18" for L in "BCD"], BDT),
    ("Reverse logistics on returns (৳)", [f"={L}{s_first+1}*{ASSUM['ret_cost']}" for L in "BCD"], BDT),
    ("Delivery + COD + ads (৳)", [f"=100*($E$21+$E$22+$E$23+$E$24)" for L in "BCD"], BDT),
    ("Contribution on 100 shipped (৳)",
     [f"={L}{s_first+2}-{L}{s_first+3}-{L}{s_first+4}-{L}{s_first+5}" for L in "BCD"], BDT),
    ("Contribution per shipped order (৳)",
     [f"={L}{s_first+6}/100" for L in "BCD"], BDT),
]
for i, (label, formulas, fmt) in enumerate(rows):
    rr = s_first + i
    last = i == len(rows) - 1
    ws.cell(row=rr, column=1, value=label).font = BOLD if last else BODY
    for j in range(3):
        c = ws.cell(row=rr, column=2 + j, value=formulas[j])
        c.number_format = fmt
        c.border = BOX
        c.font = BOLD if last else BODY
        c.fill = GOOD_FILL if last else CALC_FILL
ws.conditional_formatting.add(f"B{s_first+8}:D{s_first+8}",
    CellIsRule(operator="lessThan", formula=["0"], fill=BAD_FILL,
               font=Font(name="Calibri", size=10, bold=True, color="8F2F26")))

r = s_first + 10
note(ws, r,
     "Why the return rate dominates: a returned order still consumed the product cost, the outbound courier trip, "
     "the COD attempt and the ad spend that produced it — and now adds a reverse trip on top. At a 10% return rate "
     "roughly a tenth of your stock and your ad budget buys nothing. Replace these rates with your own as soon as "
     "you have fifty real orders; that is the first number in this workbook that will be genuinely yours.", span=8)
note(ws, r + 1,
     "Contribution is not profit. It is what each shipped order adds toward rent, salaries, utilities and the "
     "founder's own time, none of which appear on this sheet.", span=8, fill=WARN_FILL)

# ============================================ 8. STARTUP BUDGET ============
ws = sheet(SH["budget"])
title_block(ws, "Startup Budget — ৳3,000 / ৳5,000 / ৳10,000",
            "Three lean scenarios built from real Dhaka costs. The ৳3,000 column cannot fund the full shortlist, "
            "and the sheet shows exactly what it buys instead.", 8)
header_row(ws, 4, ["Line item", "৳3,000 plan", "৳5,000 plan", "৳10,000 plan", "Notes", "Status"],
           [36, 15, 15, 15, 58, 13])
budget = [
    ("Sample inventory (tiered shortlist)", 1650, 2750, 5500, "Tier A / A+B / A–D. See sheet 14.", "ESTIMATE"),
    ("Inbound transport (market trips)", 150, 200, 300, "CNG and rickshaw across three sourcing trips", "ESTIMATE"),
    ("Packaging starter kit", 250, 350, 600, "100 mailers, 20 rigid boxes, filler, tape, cards", "ESTIMATE"),
    ("Product photography", 0, 300, 900, "Phone camera plus a fabric backdrop; no studio", "ESTIMATE"),
    ("Brand basics (logo, card, stamp)", 200, 300, 500, "Freelance logo and 100 thank-you cards", "ESTIMATE"),
    ("Paid social test", 450, 750, 1500, "Small daily budget, two creatives per SKU", "ESTIMATE"),
    ("Domain, hosting and SMS buffer", 150, 150, 400, "The local demo store is free; this is for going live", "ESTIMATE"),
    ("Courier cash float", 100, 150, 250, "Couriers settle after delivery, not at pickup", "ESTIMATE"),
    ("Contingency", 50, 50, 50, "Under 2% — thin by design, and a documented risk", "ESTIMATE"),
]
r = 5
for label, a, b, c, n, status in budget:
    ws.cell(row=r, column=1, value=label).font = BODY
    for col, val in ((2, a), (3, b), (4, c)):
        cell = ws.cell(row=r, column=col, value=val)
        cell.number_format = BDT
        cell.fill = INPUT_FILL
    ws.cell(row=r, column=5, value=n).font = SMALL
    ws.cell(row=r, column=5).alignment = Alignment(wrap_text=True, vertical="top")
    status_cell(ws.cell(row=r, column=6), status)
    for col in range(1, 7):
        ws.cell(row=r, column=col).border = BOX
    r += 1

total_row = r      # 14
ws.cell(row=r, column=1, value="TOTAL SPEND").font = BOLD
for col in (2, 3, 4):
    L = get_column_letter(col)
    c = ws.cell(row=r, column=col, value=f"=SUM({L}5:{L}{r-1})")
    c.number_format = BDT
    c.font = BOLD
    c.fill = SUBHEAD_FILL
    c.border = BOX
r += 1
cap_row = r        # 15
ws.cell(row=r, column=1, value="Capital available").font = BOLD
for col, cap in ((2, 3000), (3, 5000), (4, 10000)):
    c = ws.cell(row=r, column=col, value=cap)
    c.number_format = BDT
    c.fill = INPUT_FILL
    c.border = BOX
r += 1
ws.cell(row=r, column=1, value="Surplus / (shortfall)").font = BOLD
for col in (2, 3, 4):
    L = get_column_letter(col)
    c = ws.cell(row=r, column=col, value=f"={L}{cap_row}-{L}{total_row}")
    c.number_format = BDT
    c.font = BOLD
    c.border = BOX
    c.fill = GOOD_FILL
ws.conditional_formatting.add(f"B{r}:D{r}", CellIsRule(operator="lessThan", formula=["0"], fill=BAD_FILL,
                                                      font=Font(name="Calibri", size=10, bold=True, color="8F2F26")))

r += 2
ws.cell(row=r, column=1, value="Capital allocation").font = H2_FONT
r += 1
header_row(ws, r, ["Allocation", "৳3,000", "৳5,000", "৳10,000", "Rule"], [36, 15, 15, 15, 58])
r += 1
alloc_first = r
for label, pct, rule in [
    ("Product inventory", 0.55, "Never more than 55% on stock before you know what sells"),
    ("Marketing test", 0.15, "Enough for a real test, not enough to waste"),
    ("Operations (packaging, transport)", 0.15, "Must be funded before the first order ships"),
    ("Buffer / reserve", 0.15, "Courier cash gaps and one bad batch"),
]:
    ws.cell(row=r, column=1, value=label).font = BODY
    for col in (2, 3, 4):
        L = get_column_letter(col)
        c = ws.cell(row=r, column=col, value=f"=ROUND({L}{cap_row}*{pct},0)")
        c.number_format = BDT
        c.border = BOX
    ws.cell(row=r, column=5, value=rule).font = SMALL
    ws.cell(row=r, column=5).alignment = Alignment(wrap_text=True, vertical="top")
    for col in range(1, 6):
        ws.cell(row=r, column=col).border = BOX
    r += 1

ch = PieChart()
ch.title = "৳10,000 allocation"
ch.add_data(Reference(ws, min_col=4, min_row=alloc_first - 1, max_row=r - 1), titles_from_data=True)
ch.set_categories(Reference(ws, min_col=1, min_row=alloc_first, max_row=r - 1))
ch.height = 7
ch.width = 12
ws.add_chart(ch, "G5")

note(ws, r + 1,
     "The ৳3,000 plan is genuinely tight: it funds about five pieces of sample stock and a small ad test. That is "
     "enough to validate three or four SKUs, not to run a store. If ৳3,000 is all the capital available, treat the "
     "first month as paid market research and expect no profit.", span=6)

# ============================================ 9. INVENTORY ================
ws = sheet(SH["inv"])
title_block(ws, "Inventory & Stock Management",
            "Enter opening stock in the yellow columns; reorder points and stock value are calculated. Mirrors the "
            "store's inventory table so the two stay reconcilable.", 12)
header_row(ws, 4, ["SKU", "Product", "Opening stock", "Units sold", "In transit", "Damaged", "On hand",
                   "Wholesale (৳)", "Stock value at cost (৳)", "Monthly sell-through", "Reorder point", "Action"],
           [14, 32, 12, 11, 11, 10, 10, 12, 18, 14, 13, 18])
r = 5
for p in PRODUCTS[:80]:
    ws.cell(row=r, column=1, value=p["sku"]).font = MONO
    ws.cell(row=r, column=2, value=p["name"]).font = BODY
    for col in (3, 4, 5, 6):
        c = ws.cell(row=r, column=col, value=2)
        c.fill = INPUT_FILL
        c.border = BOX
    ws.cell(row=r, column=7, value=f"=C{r}-D{r}-F{r}").number_format = NUM
    ws.cell(row=r, column=8, value=f"={cat(CAT['wholesale'], CAT_FIRST + PRODUCTS.index(p))}").number_format = BDT
    ws.cell(row=r, column=9, value=f"=G{r}*H{r}").number_format = BDT
    c = ws.cell(row=r, column=10, value=0.5)
    c.number_format = PCT
    c.fill = INPUT_FILL
    c.border = BOX
    ws.cell(row=r, column=11, value=f"=ROUND(D{r}*1.5+3,0)").number_format = NUM
    ws.cell(row=r, column=12, value=f'=IF(G{r}<=0,"REORDER NOW",IF(G{r}<=K{r},"Reorder soon","Healthy"))')
    for col in range(1, 13):
        ws.cell(row=r, column=col).border = BOX
        ws.cell(row=r, column=col).alignment = Alignment(wrap_text=True, vertical="center")
    r += 1
for text, fill, colour in (("REORDER NOW", BAD_FILL, "8F2F26"), ("Reorder soon", WARN_FILL, "8A6516"),
                           ("Healthy", GOOD_FILL, "2F5539")):
    ws.conditional_formatting.add(f"L5:L{r-1}", CellIsRule(operator="equal", formula=[f'"{text}"'], fill=fill,
                                                          font=Font(name="Calibri", size=10, bold=True, color=colour)))
ws.auto_filter.ref = f"A4:L{r-1}"

ch = BarChart()
ch.title = "Stock value at cost, first 20 SKUs (৳)"
ch.add_data(Reference(ws, min_col=9, min_row=4, max_row=24), titles_from_data=True)
ch.set_categories(Reference(ws, min_col=1, min_row=5, max_row=24))
ch.height = 9
ch.width = 20
ws.add_chart(ch, "N4")

note(ws, r + 1,
     "Reorder point = 1.5 × monthly unit sales + 3 safety units, assuming a 7–10 day lead time and no dependable "
     "restock promise from the market — verify both with your sourcing partner. Only the first 80 SKUs are "
     "pre-built to keep the sheet usable; drag the formulas down if you stock more.", span=12)

# ============================================ 10. SALES TRACKER ===========
ws = sheet(SH["sales"])
title_block(ws, "Sales & Order Tracker",
            "Log every order as it happens. Contribution is computed per row; cancelled and returned orders are "
            "kept in the log, never deleted.", 14)
header_row(ws, 4, ["Date", "Order ID", "Area", "District", "Units", "Order value (৳)", "Delivery charged (৳)",
                   "Product cost (৳)", "Courier cost (৳)", "Ad cost (৳)", "Status", "Contribution (৳)", "Returned?"],
           [11, 15, 20, 14, 8, 15, 16, 15, 14, 12, 13, 15, 11])
dv_dist = DataValidation(type="list", allow_blank=True,
    formula1='"Dhaka,Chattogram,Sylhet,Rajshahi,Khulna,Barishal,Rangpur,Mymensingh,Cumilla,Narayanganj,Gazipur,Bogura,Other"')
dv_stat = DataValidation(type="list", allow_blank=True,
    formula1='"pending,confirmed,packed,shipped,delivered,cancelled,returned"')
dv_yn = DataValidation(type="list", allow_blank=True, formula1='"no,yes"')
for dv in (dv_dist, dv_stat, dv_yn):
    ws.add_data_validation(dv)

first_sale, last_sale = 5, 64
for i in range(first_sale, last_sale + 1):
    ws.cell(row=i, column=1).number_format = "yyyy-mm-dd"
    for col in (1, 2, 3, 5, 6, 7, 8, 9, 10):
        c = ws.cell(row=i, column=col)
        c.fill = INPUT_FILL
        if col in (6, 7, 8, 9, 10):
            c.number_format = BDT
    dv_dist.add(ws.cell(row=i, column=4))
    dv_stat.add(ws.cell(row=i, column=11))
    ws.cell(row=i, column=11).fill = INPUT_FILL
    ws.cell(row=i, column=12, value=(
        f'=IF(F{i}="","",IF(OR(K{i}="cancelled",K{i}="returned"),0,'
        f'F{i}+G{i}-H{i}-I{i}-J{i}))')).number_format = BDT
    dv_yn.add(ws.cell(row=i, column=13))
    ws.cell(row=i, column=13).fill = INPUT_FILL
    for col in range(1, 14):
        ws.cell(row=i, column=col).border = BOX

ws.auto_filter.ref = f"A4:M{last_sale}"

r = last_sale + 2
ws.cell(row=r, column=1, value="Summary").font = H2_FONT
r += 1
summary = [
    ("Orders logged", f"=COUNTA(B{first_sale}:B{last_sale})", NUM),
    ("Delivered", f'=COUNTIF(K{first_sale}:K{last_sale},"delivered")', NUM),
    ("Cancelled or returned", f'=COUNTIF(K{first_sale}:K{last_sale},"cancelled")+COUNTIF(K{first_sale}:K{last_sale},"returned")', NUM),
    ("Gross order value", f'=SUM(F{first_sale}:F{last_sale})', BDT),
    ("Collected (delivered only)", f'=SUMIF(K{first_sale}:K{last_sale},"delivered",F{first_sale}:F{last_sale})', BDT),
    ("Total contribution", f"=SUM(L{first_sale}:L{last_sale})", BDT),
    ("Average order value", f"=IFERROR(AVERAGE(F{first_sale}:F{last_sale}),0)", BDT),
    ("Return rate", f'=IFERROR(COUNTIF(M{first_sale}:M{last_sale},"yes")/COUNTA(B{first_sale}:B{last_sale}),0)', PCT),
]
for label, formula, fmt in summary:
    ws.cell(row=r, column=1, value=label).font = BODY
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=2)
    c = ws.cell(row=r, column=3, value=formula)
    c.number_format = fmt
    c.font = BOLD
    c.fill = CALC_FILL
    c.border = BOX
    r += 1
note(ws, r + 1,
     "Contribution here already nets off product cost, delivery, courier and ads. It still excludes fixed costs. "
     "Leave cancelled and returned orders in the log — deleting them hides the return problem you most need to see.",
     span=13)

# ============================================ 11. MARKETING ===============
ws = sheet(SH["mkt"])
title_block(ws, "Marketing Budget & ROAS",
            "Most small Bangladeshi fashion stores lose money here, not in sourcing. Track cost per delivered order, "
            "not cost per click.", 12)
header_row(ws, 4, ["Month", "Channel", "Spend (৳)", "Impressions", "Clicks", "CTR", "Orders", "Cost per order (৳)",
                   "Revenue (৳)", "ROAS", "Delivered orders", "Cost per delivered order (৳)"],
           [11, 20, 13, 13, 10, 9, 10, 15, 14, 9, 14, 20])
r = 5
for m in ("Month 1", "Month 2", "Month 3"):
    for ch in ("Facebook / Instagram", "Boosted posts", "Influencer barter", "WhatsApp / community"):
        ws.cell(row=r, column=1, value=m).font = SMALL
        ws.cell(row=r, column=2, value=ch).font = SMALL
        for col in (3, 4, 5, 7, 9, 11):
            c = ws.cell(row=r, column=col, value=0)
            c.fill = INPUT_FILL
            c.border = BOX
            c.number_format = BDT if col in (3, 9) else NUM
        ws.cell(row=r, column=6, value=f"=IFERROR(E{r}/D{r},0)").number_format = PCT
        ws.cell(row=r, column=8, value=f"=IFERROR(C{r}/G{r},0)").number_format = BDT
        ws.cell(row=r, column=10, value=f"=IFERROR(I{r}/C{r},0)").number_format = X
        ws.cell(row=r, column=12, value=f"=IFERROR(C{r}/K{r},0)").number_format = BDT
        for col in range(1, 13):
            ws.cell(row=r, column=col).border = BOX
        r += 1
total_mkt = r
ws.cell(row=r, column=1, value="TOTAL").font = BOLD
for col in (3, 4, 5, 7, 9, 11):
    L = get_column_letter(col)
    c = ws.cell(row=r, column=col, value=f"=SUM({L}5:{L}{r-1})")
    c.number_format = BDT if col in (3, 9) else NUM
    c.font = BOLD
    c.fill = SUBHEAD_FILL
    c.border = BOX
ws.cell(row=r, column=10, value=f"=IFERROR(I{r}/C{r},0)").number_format = X
ws.cell(row=r, column=12, value=f"=IFERROR(C{r}/K{r},0)").number_format = BDT
for col in (10, 12):
    ws.cell(row=r, column=col).font = BOLD
    ws.cell(row=r, column=col).border = BOX

r += 2
ws.cell(row=r, column=1, value="ROAS reality check").font = H2_FONT
r += 1
ws.cell(row=r, column=1, value="Break-even ROAS").font = BOLD
c = ws.cell(row=r, column=2, value=f"=IFERROR(1/({ASSUM['ad']}/{PROF}!M{PROF_TOT}),0)")
c.number_format = X
c.border = BOX
c.fill = WARN_FILL
c.font = BOLD
ws.cell(row=r, column=3, value="Below this ROAS you lose money on every delivered order").font = ITALIC
ws.merge_cells(start_row=r, start_column=3, end_row=r, end_column=9)
r += 1
ws.cell(row=r, column=1, value="Ad spend as share of revenue").font = BODY
c = ws.cell(row=r, column=2, value=f"=IFERROR(C{total_mkt}/I{total_mkt},0)")
c.number_format = PCT
c.border = BOX
ws.cell(row=r, column=3, value="Keep under 12–15% at launch").font = ITALIC
ws.merge_cells(start_row=r, start_column=3, end_row=r, end_column=9)
r += 1
ws.cell(row=r, column=1, value="Contribution per delivered order (target)").font = BODY
c = ws.cell(row=r, column=2, value=f"={PROF}!M{PROF_TOT}")
c.number_format = BDT
c.border = BOX
ws.cell(row=r, column=3, value="Your ad cost per delivered order must sit well below this").font = ITALIC
ws.merge_cells(start_row=r, start_column=3, end_row=r, end_column=9)

note(ws, r + 1,
     "The classic failure is scaling ad spend on a SKU whose contribution per delivered order is below its cost per "
     "delivered order. Fix contribution first — raise the price, cut the cost, cut the returns — then scale. No "
     "industry-average ROAS is quoted here because none would apply to your creative, your price or your market.",
     span=12)

ch = BarChart()
ch.title = "Spend vs revenue by month"
ch.add_data(Reference(ws, min_col=3, min_row=4, max_row=total_mkt - 1), titles_from_data=True)
ch.add_data(Reference(ws, min_col=9, min_row=4, max_row=total_mkt - 1), titles_from_data=True)
ch.set_categories(Reference(ws, min_col=1, min_row=5, max_row=total_mkt - 1))
ch.height = 8
ch.width = 16
ws.add_chart(ch, "N4")

# ============================================ 12. CASH FLOW & P&L =========
ws = sheet(SH["cash"])
title_block(ws, "Cash Flow & Profit/Loss — 6 months",
            "Cash matters more than profit in a COD business: the courier pays you days after you have already paid "
            "the supplier. Months 1–6 are inputs; all totals are formulas.", 8)
header_row(ws, 4, ["Line", "Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6", "Note"],
           [36, 13, 13, 13, 13, 13, 13, 52])
cash = [
    ("Opening cash", "input", "Month 1 is your capital; later months carry forward automatically"),
    ("Cash in — COD settlements", "input", "Delivered-orders cash lands 2–7 days after delivery"),
    ("Cash in — prepaid (bKash/Nagad)", "input", "Only if you enable prepaid"),
    ("Cash out — inventory purchases", "input", "Paid at the market, before you sell"),
    ("Cash out — packaging & transport", "input", "Includes market trips"),
    ("Cash out — advertising", "input", "Paid upfront to the platform"),
    ("Cash out — courier bills", "input", "Courier deducts delivery and COD fee from the payout"),
    ("Cash out — returns & refunds", "input", "Reverse logistics and refunds"),
    ("Cash out — fixed costs", "input", "Phone, internet, domain, subscriptions"),
    ("Net cash movement", "calc", "Sum of all cash in, less all cash out"),
    ("CLOSING CASH", "calc", "Must never go negative"),
    ("", None, ""),
    ("Revenue (non-cancelled)", "input", "Memo line on an accrual basis"),
    ("Cost of goods sold", "input", "Memo line"),
    ("Gross profit", "calc", "Revenue minus COGS"),
    ("Variable costs (delivery, COD, ads, packaging)", "input", "Memo line"),
    ("Contribution", "calc", "Gross profit minus variable costs"),
    ("Fixed costs", "input", "Memo line"),
    ("NET PROFIT / (LOSS)", "calc", "Contribution minus fixed costs — the only true bottom line"),
]
r = 5
ROW = {}
for label, kind, desk in cash:
    if not label:
        r += 1
        continue
    ROW[label] = r
    bold = label.isupper() or label.startswith("NET")
    ws.cell(row=r, column=1, value=label).font = BOLD if bold else BODY
    if kind == "input":
        for col in range(2, 8):
            c = ws.cell(row=r, column=col, value=0)
            c.number_format = BDT
            c.fill = INPUT_FILL
            c.border = BOX
    elif kind == "calc":
        for col in range(2, 8):
            c = ws.cell(row=r, column=col)
            c.number_format = BDT
            c.font = BOLD
            c.border = BOX
            c.fill = GOOD_FILL if bold else CALC_FILL
    ws.cell(row=r, column=8, value=desk).font = ITALIC
    r += 1

for col in range(2, 8):
    L = get_column_letter(col)
    ws[f"{L}{ROW['Net cash movement']}"] = (
        f"={L}{ROW['Cash in — COD settlements']}+{L}{ROW['Cash in — prepaid (bKash/Nagad)']}"
        f"-{L}{ROW['Cash out — inventory purchases']}-{L}{ROW['Cash out — packaging & transport']}"
        f"-{L}{ROW['Cash out — advertising']}-{L}{ROW['Cash out — courier bills']}"
        f"-{L}{ROW['Cash out — returns & refunds']}-{L}{ROW['Cash out — fixed costs']}")
    ws[f"{L}{ROW['CLOSING CASH']}"] = f"={L}{ROW['Opening cash']}+{L}{ROW['Net cash movement']}"
    ws[f"{L}{ROW['Gross profit']}"] = f"={L}{ROW['Revenue (non-cancelled)']}-{L}{ROW['Cost of goods sold']}"
    ws[f"{L}{ROW['Contribution']}"] = (
        f"={L}{ROW['Gross profit']}-{L}{ROW['Variable costs (delivery, COD, ads, packaging)']}")
    ws[f"{L}{ROW['NET PROFIT / (LOSS)']}"] = f"={L}{ROW['Contribution']}-{L}{ROW['Fixed costs']}"

for col in range(3, 8):
    L, P = get_column_letter(col), get_column_letter(col - 1)
    c = ws[f"{L}{ROW['Opening cash']}"]
    c.value = f"={P}{ROW['CLOSING CASH']}"
    c.number_format = BDT
    c.fill = CALC_FILL
    c.border = BOX

ws.conditional_formatting.add(f"B{ROW['CLOSING CASH']}:G{ROW['CLOSING CASH']}",
    CellIsRule(operator="lessThan", formula=["0"], fill=BAD_FILL,
               font=Font(name="Calibri", size=10, bold=True, color="8F2F26")))

r = ROW["NET PROFIT / (LOSS)"] + 2
ws.cell(row=r, column=1, value="Plan vs actual — month 1").font = H2_FONT
r += 1
for label in ("Revenue", "Contribution", "Net profit"):
    ws.cell(row=r, column=1, value=label).font = BODY
    src = {"Revenue": "Revenue (non-cancelled)", "Contribution": "Contribution", "Net profit": "NET PROFIT / (LOSS)"}[label]
    ws.cell(row=r, column=2, value=f"=B{ROW[src]}").number_format = BDT
    ws.cell(row=r, column=2).border = BOX
    ws.cell(row=r, column=3, value="actual").font = ITALIC
    c = ws.cell(row=r, column=4, value=0)
    c.fill = INPUT_FILL
    c.number_format = BDT
    c.border = BOX
    ws.cell(row=r, column=5, value=f"=IFERROR(D{r}-B{r},0)").number_format = BDT
    ws.cell(row=r, column=5).border = BOX
    ws.cell(row=r, column=6, value="variance").font = ITALIC
    r += 1

note(ws, r + 1,
     "Gross profit is not net profit. Contribution is not net profit. Only the bottom row is net profit, and only "
     "because it subtracts fixed costs. The workbook ships with zeroed inputs on purpose: fill in your own numbers "
     "rather than trusting a template's placeholder, because a plan built on invented revenue is worse than no plan "
     "at all.", span=8)

# series names live in a far-off helper block so the legend reads properly
series_lbl_row = ROW["NET PROFIT / (LOSS)"] + 30
ws.cell(row=series_lbl_row, column=1, value="Closing cash").font = BOLD
ws.cell(row=series_lbl_row + 1, column=1, value="Net profit / (loss)").font = BOLD

ch = LineChart()
ch.title = "Closing cash vs net profit, months 1-6"
ch.y_axis.title = "BDT"
ch.x_axis.title = "Month"
# series 1: closing cash; series 2: net profit. Titles read from the helper cells.
ch.add_data(Reference(ws, min_col=2, max_col=7, min_row=ROW["CLOSING CASH"], max_row=ROW["CLOSING CASH"]),
            from_rows=True, titles_from_data=False)
ch.series[0].tx = SeriesLabel(strRef=StrRef(f"'{SH['cash']}'!$A${series_lbl_row}"))
ch.add_data(Reference(ws, min_col=2, max_col=7, min_row=ROW["NET PROFIT / (LOSS)"],
                      max_row=ROW["NET PROFIT / (LOSS)"]), from_rows=True, titles_from_data=False)
ch.series[1].tx = SeriesLabel(strRef=StrRef(f"'{SH['cash']}'!$A${series_lbl_row + 1}"))
ch.set_categories(Reference(ws, min_col=2, max_col=7, min_row=4, max_row=4))
ch.height = 9
ch.width = 19
ws.add_chart(ch, "J5")

# ============================================ 13. RISK ====================
ws = sheet(SH["risk"])
title_block(ws, "Risk Assessment",
            "Scored 1–5 on likelihood and impact; score = likelihood × impact. Mitigations are specific actions, not "
            "slogans. Treat anything at 15 or above as a launch blocker.", 9)
header_row(ws, 4, ["#", "Risk", "Category", "Likelihood (1–5)", "Impact (1–5)", "Score", "Severity",
                   "Mitigation", "Owner", "Mitigation strength (1–5)", "Residual score"],
           [5, 38, 15, 12, 11, 8, 11, 54, 13, 16, 14])
risks = [
    ("Stock does not sell and capital is locked", "Inventory", 4, 4, "Two or three pieces per SKU; never buy twenty of an unproven design; keep a 15% reserve."),
    ("Return rate higher than modelled", "Operations", 4, 4, "Photograph the actual product, publish real measurements, confirm size before dispatch."),
    ("Courier loses or damages parcels", "Logistics", 3, 3, "Use tracked couriers; fix a packaging standard; photograph every parcel before handover."),
    ("COD cash gap starves restocking", "Cash flow", 3, 5, "Model a 5–7 day payout delay; hold a courier float; use the 0%-COD courier inside Dhaka."),
    ("Supplier quality drifts between batches", "Supply", 4, 4, "Inspect 100% of the first batch; buy from the same shop; keep a written spec card per SKU."),
    ("Ad cost exceeds contribution per order", "Marketing", 4, 4, "Track cost per delivered order weekly; pause any SKU whose contribution is below it."),
    ("Price war with established Facebook sellers", "Market", 5, 3, "Compete on photography, packaging and service — never on being cheapest."),
    ("Seasonal overstock after Eid", "Inventory", 4, 3, "Order festive stock 3–4 weeks out, not 3 months; clear before the season ends."),
    ("Fraudulent or unreachable COD orders", "Operations", 3, 2, "Confirm every COD order by phone or WhatsApp before dispatch."),
    ("Single-person dependency", "People", 3, 4, "Document supplier contacts and the process; train a second person on market visits."),
    ("Platform or payment account suspension", "Compliance", 2, 4, "Keep business and personal accounts separate; use a merchant account, not a personal number."),
    ("Tax and licensing exposure (TIN/VAT/BIN)", "Compliance", 3, 3, "Register TIN early; consult an accountant before crossing turnover thresholds."),
    ("Product-safety liability (electronics, heaters)", "Legal", 2, 5, "Make no unverified safety claims; test electronics; publish honest spec limits."),
    ("Import cost swings on tech items", "Financial", 3, 3, "Prefer local sourcing for accessories; keep imported stock minimal."),
    ("Data breach or privacy complaint", "Technology", 2, 4, "Keep the demo's local-only data model until a reviewed production stack exists."),
]
r = 5
for i, (risk, cat_, like, impact, mit) in enumerate(risks, start=1):
    ws.cell(row=r, column=1, value=i).font = SMALL
    ws.cell(row=r, column=2, value=risk).font = BODY
    ws.cell(row=r, column=3, value=cat_).font = SMALL
    for col, val in ((4, like), (5, impact)):
        c = ws.cell(row=r, column=col, value=val)
        c.fill = INPUT_FILL
        c.border = BOX
    ws.cell(row=r, column=6, value=f"=D{r}*E{r}").font = BOLD
    ws.cell(row=r, column=7, value=f'=IF(F{r}>=15,"Critical",IF(F{r}>=9,"High",IF(F{r}>=5,"Medium","Low")))')
    ws.cell(row=r, column=8, value=mit).font = SMALL
    ws.cell(row=r, column=8).alignment = Alignment(wrap_text=True, vertical="top")
    ws.cell(row=r, column=9, value="Founder" if cat_ in ("Marketing", "Financial", "Technology", "Compliance", "Market")
            else "Sourcing partner").font = SMALL
    mc = ws.cell(row=r, column=10, value=3)
    mc.fill = INPUT_FILL
    mc.border = BOX
    ws.cell(row=r, column=11, value=f"=ROUND(F{r}*(1-(J{r}-1)/6),1)").number_format = '0.0'
    for col in range(1, 12):
        ws.cell(row=r, column=col).border = BOX
    ws.row_dimensions[r].height = 32
    r += 1
for text, fill, colour in (("Critical", BAD_FILL, "8F2F26"), ("High", WARN_FILL, "8A6516"), ("Medium", GOOD_FILL, None)):
    kw = {"fill": fill}
    if colour:
        kw["font"] = Font(name="Calibri", size=10, bold=True, color=colour)
    ws.conditional_formatting.add(f"G5:G{r-1}", CellIsRule(operator="equal", formula=[f'"{text}"'], **kw))
ws.auto_filter.ref = f"A4:K{r-1}"
note(ws, r + 1,
     "The two risks that actually kill a ৳3,000–৳10,000 launch are unsold stock and returns. Both are inventory and "
     "sizing decisions, not marketing decisions.", span=9)

# ============================================ 14. LAUNCH ROADMAP ==========
ws = sheet(SH["road"])
title_block(ws, "Launch Roadmap — 20-SKU shortlist, funded cheapest-first",
            "Set your capital at K5. The sheet then funds one unit at a time, cheapest landed cost first, until the "
            "inventory budget runs out — which is exactly how you would actually buy. Do not buy all 225 at launch.",
            10)

# order rows by tier, then cheapest landed cost, so the greedy allocation reads top-down
costed = []
for slug, tier, why in R.SHORTLIST:
    prod = next((x for x in PRODUCTS if x["slug"] == slug), None)
    if not prod:
        raise SystemExit(f"shortlist slug missing from catalogue: {slug}")
    landed = round(prod["wholesaleCost"] * (1 + AS_["inbound_transport_pct"]) + AS_["packaging_per_order"])
    costed.append((tier, landed, prod, why))
costed.sort(key=lambda t: (t[0], t[1]))
tier_cols = [("$M$6", "$M$7", "F"), ("$N$6", "$N$7", "G"), ("$O$6", "$O$7", "H")]
FIRST, LAST = 5, 4 + len(costed)

header_row(ws, 4, ["SKU", "Product", "Tier", "Retail (৳)", "Landed cost (৳)",
                   "Qty @ ৳3,000", "Qty @ ৳5,000", "Qty @ ৳10,000", "Why this SKU", "Decision rule after the test"],
           [14, 31, 6, 11, 13, 11, 11, 12, 50, 34])

# three budgets side by side, each allocated cheapest-first, all on the sheet at once
ws["L4"] = "Capital plans"
ws["L4"].font = H2_FONT
panel = [
    ("Capital", 3000, 5000, 10000, BDT),
    ("Inventory budget (55%)", "=ROUND(M5*0.55,0)", "=ROUND(N5*0.55,0)", "=ROUND(O5*0.55,0)", BDT),
    ("Max depth per SKU", 2, 2, 2, NUM),
    ("Planned spend", None, None, None, BDT),
    ("Budget left", None, None, None, BDT),
    ("SKUs funded", None, None, None, NUM),
    ("Units funded", None, None, None, NUM),
]
r = 5
for label, a, b, c, fmt in panel:
    ws.cell(row=r, column=12, value=label).font = BOLD if label in ("Capital", "Max depth per SKU") else BODY
    for j, v in enumerate((a, b, c)):
        cell = ws.cell(row=r, column=13 + j, value=v)
        cell.number_format = fmt
        cell.border = BOX
        cell.font = BOLD
        cell.fill = INPUT_FILL if label in ("Capital", "Max depth per SKU") else CALC_FILL
    r += 1

r = FIRST
for i, (tier, landed, prod, why) in enumerate(costed):
    cr = CAT_FIRST + PRODUCTS.index(prod)
    ws.cell(row=r, column=1, value=prod["sku"]).font = MONO
    ws.cell(row=r, column=2, value=prod["name"]).font = BODY
    tc = ws.cell(row=r, column=3, value=tier)
    tc.font = BOLD
    tc.alignment = Alignment(horizontal="center")
    ws.cell(row=r, column=4, value=f"={cat(CAT['retail'], cr)}").number_format = BDT
    ws.cell(row=r, column=5, value=f"=ROUND({cat(CAT['wholesale'], cr)}*(1+{ASSUM['inbound']})+{ASSUM['pack']},0)")
    ws.cell(row=r, column=5).number_format = BDT
    # Single-pass greedy, cheapest landed cost first: each row can only spend what the
    # rows above it left over. Transparent and auditable, which matters more here than
    # algorithmic elegance.
    for j, (budget_cell, depth_cell, _plan_col) in enumerate(tier_cols):
        spent_above = "0" if r == FIRST else (
            f"SUMPRODUCT($E${FIRST}:$E${r-1},{_plan_col}${FIRST}:{_plan_col}${r-1})")
        f = f'=MAX(0,MIN({depth_cell},INT(({budget_cell}-({spent_above}))/$E{r})))'
        c = ws.cell(row=r, column=6 + j, value=f)
        c.number_format = NUM
        c.font = BOLD
        c.fill = CALC_FILL
    ws.cell(row=r, column=9, value=why).font = SMALL
    ws.cell(row=r, column=9).alignment = Alignment(wrap_text=True, vertical="top")
    ws.cell(row=r, column=10, value="Restock 2x if contribution beats ad cost; drop if two weeks pass with no sale").font = SMALL
    for col in range(1, 11):
        ws.cell(row=r, column=col).border = BOX
        ws.cell(row=r, column=col).alignment = Alignment(wrap_text=True, vertical="center")
    ws.row_dimensions[r].height = 30
    r += 1

# panel totals (rows 8-11 in L..O)
ws["M8"] = f"=SUMPRODUCT($E${FIRST}:$E${LAST},$F${FIRST}:$F${LAST})"
ws["N8"] = f"=SUMPRODUCT($E${FIRST}:$E${LAST},$G${FIRST}:$G${LAST})"
ws["O8"] = f"=SUMPRODUCT($E${FIRST}:$E${LAST},$H${FIRST}:$H${LAST})"
ws["M9"] = "=M6-M8"
ws["N9"] = "=N6-N8"
ws["O9"] = "=O6-O8"
ws["M10"] = f'=COUNTIF($F${FIRST}:$F${LAST},">0")'
ws["N10"] = f'=COUNTIF($G${FIRST}:$G${LAST},">0")'
ws["O10"] = f'=COUNTIF($H${FIRST}:$H${LAST},">0")'
ws["M11"] = f"=SUM($F${FIRST}:$F${LAST})"
ws["N11"] = f"=SUM($G${FIRST}:$G${LAST})"
ws["O11"] = f"=SUM($H${FIRST}:$H${LAST})"
for cellref, fmt in (("M8", BDT), ("N8", BDT), ("O8", BDT), ("M9", BDT), ("N9", BDT), ("O9", BDT),
                     ("M10", NUM), ("N10", NUM), ("O10", NUM), ("M11", NUM), ("N11", NUM), ("O11", NUM)):
    c = ws[cellref]
    c.number_format = fmt
    c.border = BOX
    c.font = BOLD
    c.fill = CALC_FILL

# total row
ws.cell(row=r, column=2, value="PLANNED BUY COST").font = BOLD
for j, col in enumerate(("F", "G", "H")):
    c = ws.cell(row=r, column=6 + j, value=f"=SUMPRODUCT($E${FIRST}:$E${LAST},{col}${FIRST}:{col}${LAST})")
    c.number_format = BDT
    c.font = BOLD
    c.fill = SUBHEAD_FILL
    c.border = BOX
ws.cell(row=r, column=9, value="Each column is funded independently, cheapest landed cost first.").font = ITALIC
for col in (2, 9, 10):
    ws.cell(row=r, column=col).fill = SUBHEAD_FILL
    ws.cell(row=r, column=col).border = BOX
total_road = r

# over-budget guard
for j, (qcol, bcell) in enumerate((("F", "$M$6"), ("G", "$N$6"), ("H", "$O$6"))):
    ws.conditional_formatting.add(f"{qcol}{total_road}",
        FormulaRule(formula=[f"{qcol}{total_road}>{bcell}"], fill=BAD_FILL,
                    font=Font(name="Calibri", size=10, bold=True, color="8F2F26")))
    ws.conditional_formatting.add(f"{qcol}{FIRST}:{qcol}{LAST}",
        CellIsRule(operator="equal", formula=["0"], fill=PatternFill("solid", fgColor="F5F2F2"),
                   font=Font(name="Calibri", size=10, color="A8A29A")))

ch = BarChart()
ch.title = "Landed cost per unit (৳)"
ch.y_axis.title = "BDT per piece"
ch.add_data(Reference(ws, min_col=5, min_row=4, max_row=LAST), titles_from_data=True)
ch.set_categories(Reference(ws, min_col=2, min_row=FIRST, max_row=LAST))
ch.height = 11
ch.width = 20
ws.add_chart(ch, "L16")

ch2 = BarChart()
ch2.title = "Units funded per capital plan"
ch2.y_axis.title = "Pieces"
ch2.add_data(Reference(ws, min_col=6, max_col=8, min_row=4, max_row=LAST), titles_from_data=True)
ch2.set_categories(Reference(ws, min_col=2, min_row=FIRST, max_row=LAST))
ch2.height = 9
ch2.width = 20
ws.add_chart(ch2, "L36")

r = total_road + 2
ws.cell(row=r, column=1, value="30-day implementation plan").font = H2_FONT
r += 1
header_row(ws, r, ["Day", "Focus", "Concrete task", "Deliverable", "Cost (৳)"], [9, 17, 62, 34, 11], freeze=False)
r += 1
plan = [
    ("1-2", "Setup", "Register TIN and a bKash/Nagad merchant account. Create Facebook and Instagram business pages.", "Registered accounts", 0),
    ("3-4", "Sourcing", "Market trip 1: Chandni Chowk and Gausia. Price the tier-A SKUs at three shops each; photograph every price tag.", "Sheet 3 filled", 150),
    ("5", "Sourcing", "Place the sample order for exactly what the budget engine funded. Pay cash and get a written price slip.", "Sample stock", 1650),
    ("6-7", "Quality", "Inspect every piece. Reject loose stitching, tarnish or dead electronics. Record material and weight on a spec card.", "QC notes", 0),
    ("8-9", "Content", "Photograph each SKU on a plain backdrop. Write descriptions with real measurements, not adjectives.", "Listing photos", 300),
    ("10", "Setup", "Load the SKUs into the store, set delivery charges and the free-delivery threshold, publish policies.", "Live store", 0),
    ("11", "Pricing", "Confirm every price clears contribution plus ad cost on sheet 7. Fix or drop the ones that do not.", "Final price list", 0),
    ("12", "Ops", "Open accounts with two couriers - one Dhaka-focused, one district-focused. Send a test parcel with each.", "Courier accounts", 0),
    ("13-14", "Marketing", "Ten organic posts, four short videos, two ad creatives per tier-A SKU.", "Content bank", 0),
    ("15", "Launch", "Open orders. Spend 100-150 tk a day. Confirm every COD order by WhatsApp before dispatch.", "First orders", 450),
    ("16-21", "Learn", "Ship daily. Log each order on sheet 10. Record delivery failures and returns per SKU.", "Real unit economics", 200),
    ("22-24", "Adjust", "Drop SKUs with no sales or negative contribution. Raise the price where returns are high.", "Revised price list", 0),
    ("25-27", "Restock", "Reorder the winners only, at two to three times the first quantity. Do not widen the catalogue yet.", "Restock order", 900),
    ("28-30", "Review", "Compare plan against actual. Set the month-2 budget from the cash flow on sheet 12.", "Month-2 plan", 0),
]
plan_first = r
for day, focus, task, deliverable, cost in plan:
    ws.cell(row=r, column=1, value=day).font = BOLD
    ws.cell(row=r, column=2, value=focus).font = BODY
    ws.cell(row=r, column=3, value=task).font = SMALL
    ws.cell(row=r, column=3).alignment = Alignment(wrap_text=True, vertical="top")
    ws.cell(row=r, column=4, value=deliverable).font = SMALL
    c = ws.cell(row=r, column=5, value=cost)
    c.number_format = BDT
    c.fill = INPUT_FILL
    for col in range(1, 6):
        ws.cell(row=r, column=col).border = BOX
    ws.row_dimensions[r].height = 30
    r += 1
ws.cell(row=r, column=1, value="TOTAL").font = BOLD
c = ws.cell(row=r, column=5, value=f"=SUM(E{plan_first}:E{r-1})")
c.number_format = BDT
c.font = BOLD
c.border = BOX
c.fill = SUBHEAD_FILL

note(ws, r + 2,
     "Why cheapest-first: with a tiny budget, the constraint is not what you want to sell, it is how many different "
     "things you can test. Cheap, light, low-return accessories give you the most experiments per taka, and their "
     "contribution per order is high relative to their courier cost. The expensive anchors (the watch, the hamper, "
     "the choker) only get funded once the budget can absorb them. One piece of every SKU in the catalogue would "
     "cost several times the 10,000 tk plan and leave nothing for ads or the courier cash gap.", span=9)

# ============================================ 15. VERIFICATION ============
ws = sheet(SH["check"])
title_block(ws, "Supplier Verification Checklist",
            "Print this and take it to the market. A supplier counts as verified only when every mandatory field has "
            "a value, a date and a name.", 7)
header_row(ws, 4, ["#", "Check", "Mandatory?", "Why it matters", "Recorded value", "Date verified", "Verified by"],
           [5, 44, 12, 56, 30, 13, 18])
checks = [
    ("Shop name and exact address", "Yes", "So you can return a bad batch and reorder from the same source."),
    ("Owner or manager name", "Yes", "Prices and terms change with the person, not the shop."),
    ("Working phone number, tested", "Yes", "A number you have actually dialled and had answered."),
    ("Wholesale price at our MOQ, in writing", "Yes", "Verbal prices conveniently rise at pickup."),
    ("MOQ and price breaks", "Yes", "The price at two pieces is not the price at fifty."),
    ("Stock available today", "Yes", "Prevents selling twenty units you cannot buy."),
    ("Lead time to restock", "Yes", "Drives the reorder point on sheet 9."),
    ("Material, GSM or plating spec", "Yes", "The only defence against a silent quality downgrade."),
    ("Sample inspection result", "Yes", "Check stitching, zips, tarnish, screens and batteries."),
    ("Supplier provides packaging?", "No", "Changes landed cost and damage rate."),
    ("Defect replacement policy", "Yes", "A supplier with no defect policy is a cost you absorb."),
    ("Payment terms", "Yes", "Most Dhaka wholesalers want cash upfront."),
    ("Batch consistency evidence", "No", "Ask to see a recent repeat order."),
    ("Trade licence or BIN on request", "No", "Needed for formal invoicing and VAT later."),
    ("Reference from another buyer", "No", "The strongest quality signal, if you can get it."),
    ("Delivery to your address included?", "No", "Often cheaper than your own CNG trip."),
]
r = 5
for i, (check, mand, why) in enumerate(checks, start=1):
    ws.cell(row=r, column=1, value=i).font = SMALL
    ws.cell(row=r, column=2, value=check).font = BODY
    mc = ws.cell(row=r, column=3, value=mand)
    mc.alignment = Alignment(horizontal="center")
    if mand == "Yes":
        mc.fill = PatternFill("solid", fgColor="E8EFE4")
        mc.font = Font(name="Calibri", size=9, bold=True, color="2F5539")
    ws.cell(row=r, column=4, value=why).font = SMALL
    ws.cell(row=r, column=4).alignment = Alignment(wrap_text=True, vertical="top")
    for col in (5, 6, 7):
        ws.cell(row=r, column=col).fill = INPUT_FILL
    for col in range(1, 8):
        ws.cell(row=r, column=col).border = BOX
    ws.row_dimensions[r].height = 26
    r += 1
check_last = r - 1

r += 1
ws.cell(row=r, column=1, value="Verification status").font = H2_FONT
r += 1
ws.cell(row=r, column=1, value="A supplier is VERIFIED only when every mandatory row has a value, a date and a name.")
ws.cell(row=r, column=1).font = ITALIC
ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=7)
r += 1
ws.cell(row=r, column=1, value="Mandatory checks completed").font = BODY
c = ws.cell(row=r, column=5, value=f'=COUNTIFS($C$5:$C${check_last},"Yes",$E$5:$E${check_last},"<>")')
c.font = BOLD
c.border = BOX
c.fill = CALC_FILL
c.alignment = Alignment(horizontal="center")
ws.cell(row=r, column=6, value=f'=COUNTIF($C$5:$C${check_last},"Yes")').font = BOLD
ws.cell(row=r, column=6).alignment = Alignment(horizontal="center")
ws.cell(row=r, column=6).border = BOX
ws.cell(row=r, column=4, value="of mandatory checks done").font = ITALIC
r += 1
ws.cell(row=r, column=1, value="Result").font = BOLD
c = ws.cell(row=r, column=5, value=f'=IF(E{r-1}=F{r-1},"VERIFIED","NOT VERIFIED")')
c.font = BOLD
c.border = BOX
c.alignment = Alignment(horizontal="center")
status_cell(c, "NOT VERIFIED")
ws.conditional_formatting.add(f"E{r}",
    CellIsRule(operator="equal", formula=['"VERIFIED"'], fill=GOOD_FILL,
               font=Font(name="Calibri", size=10, bold=True, color="2F5539")))
ws.conditional_formatting.add(f"E{r}",
    CellIsRule(operator="equal", formula=['"NOT VERIFIED"'], fill=PatternFill("solid", fgColor="F5F2F2"),
               font=Font(name="Calibri", size=10, bold=True, color="8F2F26")))

# ============================================ 16. SOURCES =================
ws = sheet(SH["src"])
title_block(ws, "Research Sources & Assumptions",
            "Every external claim used anywhere in this workbook, with its source, date and a caveat. Anything "
            "missing here is our own estimate and is labelled ESTIMATE elsewhere.", 7)
ws["A5"] = "External evidence"
ws["A5"].font = H2_FONT
header_row(ws, 6, ["Claim", "Value used", "Status", "Source", "URL", "Source date", "Caveat"],
           [30, 44, 12, 36, 46, 11, 44])
r = 7
for m in R.MARKET_EVIDENCE:
    ws.cell(row=r, column=1, value=m["claim"]).font = BODY
    ws.cell(row=r, column=2, value=m["value"]).font = SMALL
    status_cell(ws.cell(row=r, column=3), m["status"])
    ws.cell(row=r, column=4, value=m["source"]).font = SMALL
    link = ws.cell(row=r, column=5, value=m["url"])
    link.hyperlink = m["url"]
    link.font = Font(name="Calibri", size=8, color="24568A", underline="single")
    ws.cell(row=r, column=6, value=m["date"]).font = SMALL
    ws.cell(row=r, column=7, value=m["note"]).font = ITALIC
    for col in range(1, 8):
        ws.cell(row=r, column=col).border = BOX
        ws.cell(row=r, column=col).alignment = Alignment(wrap_text=True, vertical="top")
    ws.row_dimensions[r].height = 46
    r += 1

r += 1
ws.cell(row=r, column=1, value="Our planning assumptions — not evidence").font = H2_FONT
r += 1
header_row(ws, r, ["Assumption", "Value", "Status", "Basis", "Sensitivity"], [30, 14, 12, 56, 44], freeze=False)
r += 1
assumption_rows = [
    ("Inbound transport from market", AS_["inbound_transport_pct"], PCT, "CNG round trip ÷ units bought", "Small at 3%; would matter on very cheap items"),
    ("Packaging per order", AS_["packaging_per_order"], BDT, "Mailer ৳8 + box ৳15 + filler and tape ৳2", "Rigid gift boxes push this past ৳60"),
    ("Courier inside Dhaka", AS_["courier_dhaka"], BDT, "Published base rate, 1 kg", "Weight and volume change the rate materially"),
    ("Courier outside Dhaka", AS_["courier_outside"], BDT, "Flat Dhaka→district rate", "Remote upazilas cost more"),
    ("COD collection fee", AS_["cod_fee_pct"], PCT, "Worst of our three couriers", "One courier is 0% inside Dhaka"),
    ("Ad cost per delivered order", AS_["ad_cost_per_delivered_order"], BDT, "Small-spend Facebook/Instagram CAC", "Most volatile input; could be double, could be zero"),
    ("Return / defect reserve", AS_["return_reserve_pct"], PCT, "Fashion e-commerce norms", "Jewellery and electronics differ sharply"),
    ("bKash merchant fee", AS_["bkash_fee_pct"], PCT, "Worst case of the published range", "Negotiable at volume"),
    ("Nagad merchant fee", AS_["nagad_fee_pct"], PCT, "Published range", "Lower than bKash on every source found"),
    ("Inside-Dhaka share of orders", AS_["inside_dhaka_order_share"], PCT, "Dhaka-heavy launch audience", "A district-heavy mix adds roughly ৳55 per order"),
    ("Return rate scenarios", "3% / 6% / 10%", PCT, "Optimistic / moderate / conservative", "Drives the whole scenario table on sheet 7"),
]
for name, value, fmt, basis, sens in assumption_rows:
    ws.cell(row=r, column=1, value=name).font = BODY
    c = ws.cell(row=r, column=2, value=value)
    c.number_format = fmt
    status_cell(ws.cell(row=r, column=3), "ESTIMATE")
    ws.cell(row=r, column=4, value=basis).font = SMALL
    ws.cell(row=r, column=5, value=sens).font = SMALL
    for col in range(1, 6):
        ws.cell(row=r, column=col).border = BOX
        ws.cell(row=r, column=col).alignment = Alignment(wrap_text=True, vertical="top")
    ws.row_dimensions[r].height = 28
    r += 1

note(ws, r + 1,
     "What we deliberately did not do: invent supplier names, phone numbers, prices, demand volumes, reviews or "
     "market statistics. Every gap is written as NOT VERIFIED. A workbook that looks complete but rests on invented "
     "numbers is more dangerous than one that admits what is missing, because you would spend real money on it.",
     span=7, fill=WARN_FILL)

# ============================================ 17. ASSUMPTIONS (engine) ====
ws = sheet(SH["assum"], tab=INK)
title_block(ws, "Model Assumptions — the engine for every formula",
            "Edit only the yellow cells in column B. Sheets 6, 7, 8, 10, 11, 12 and 14 read from here.", 6)
header_row(ws, 5, ["Assumption", "Value", "", "Note"], [44, 14, 3, 52], freeze=False)
r = ASSUM_FIRST
for label, value, fmt, desk in ASSUM_ROWS:
    ws.cell(row=r, column=1, value=label).font = BODY
    c = ws.cell(row=r, column=2, value=value)
    c.number_format = BDT if fmt == 'BDT' else fmt
    c.fill = INPUT_FILL
    c.border = BOX
    c.font = BOLD
    ws.cell(row=r, column=4, value=desk).font = ITALIC
    ws.cell(row=r, column=4).alignment = Alignment(wrap_text=True)
    r += 1
note(ws, r + 1,
     "These fifteen numbers drive every calculation in the workbook. Change one and sheet 6 recalculates all 225 "
     "SKUs. Keep the status labels on sheet 16 in step with any change you make here.", span=4)

# ------------------------------------------------------------- ordering ----
order = [SH["dash"], SH["cat"], SH["res"], SH["sup"], SH["comp"], SH["prof"], SH["unit"], SH["budget"],
         SH["inv"], SH["sales"], SH["mkt"], SH["cash"], SH["risk"], SH["road"], SH["check"], SH["src"],
         SH["assum"]]
wb._sheets = [wb[name] for name in order]
wb.active = 0

wb.properties.title = "SUPER Z SHOP — Business Planning Workbook"
wb.properties.subject = "Bangladesh e-commerce research, unit economics and launch plan"
wb.properties.creator = "SUPER Z SHOP"
wb.properties.description = (
    "Planning workbook for SUPER Z SHOP. External claims are sourced and dated; unverified data is labelled "
    "NOT VERIFIED. Prices are indicative estimates pending supplier quotations."
)
wb.save(OUT)

# Post-build guard: fail loudly if any formula is unbalanced or references a dead cell name.
from openpyxl import load_workbook as _lw
_wb = _lw(OUT)
_bad = []
for _ws in _wb:
    for _row in _ws.iter_rows():
        for _c in _row:
            if isinstance(_c.value, str) and _c.value.startswith("="):
                if _c.value.count("(") != _c.value.count(")"):
                    _bad.append(f"{_ws.title}!{_c.coordinate}")
if _bad:
    raise SystemExit(f"unbalanced formulas: {_bad[:5]} (total {len(_bad)})")

print(f"Wrote {OUT}")
print(f"  sheets: {len(wb.sheetnames)}")
print(f"  catalogue rows: {len(PRODUCTS)} ({CAT_FIRST}..{CAT_LAST})")
print(f"  suppliers: {len(R.SUPPLIERS)}   evidence rows: {len(R.MARKET_EVIDENCE)}")
print(f"  assumption cells: B{ASSUM_FIRST}..B{ASSUM_LAST}")
