-- SUPER Z SHOP — initial schema (SQLite)
-- Money is stored as INTEGER taka (BDT) to avoid floating point drift.
-- Timestamps are ISO-8601 UTC strings.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  name_bn     TEXT NOT NULL DEFAULT '',
  blurb       TEXT NOT NULL DEFAULT '',
  icon        TEXT NOT NULL DEFAULT 'grid',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS subcategories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  slug        TEXT NOT NULL,
  name        TEXT NOT NULL,
  UNIQUE (category_id, slug)
);

CREATE TABLE IF NOT EXISTS products (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  sku               TEXT NOT NULL UNIQUE,
  slug              TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  name_bn           TEXT NOT NULL DEFAULT '',
  category_id       INTEGER NOT NULL REFERENCES categories(id),
  subcategory       TEXT NOT NULL DEFAULT '',
  short_description TEXT NOT NULL,
  description       TEXT NOT NULL DEFAULT '',
  specs_json        TEXT NOT NULL DEFAULT '{}',
  wholesale_cost    INTEGER NOT NULL DEFAULT 0,
  retail_price      INTEGER NOT NULL DEFAULT 0,
  sale_price        INTEGER,
  price_status      TEXT NOT NULL DEFAULT 'unverified',
  moq               INTEGER NOT NULL DEFAULT 6,
  tags_json         TEXT NOT NULL DEFAULT '[]',
  flags_json        TEXT NOT NULL DEFAULT '[]',
  warranty          TEXT NOT NULL DEFAULT '',
  is_active         INTEGER NOT NULL DEFAULT 1,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

CREATE TABLE IF NOT EXISTS product_variants (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id    INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_sku   TEXT NOT NULL UNIQUE,
  size          TEXT NOT NULL DEFAULT 'One Size',
  color         TEXT NOT NULL DEFAULT 'Default',
  price_delta   INTEGER NOT NULL DEFAULT 0,
  stock         INTEGER NOT NULL DEFAULT 0,
  is_active     INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);

CREATE TABLE IF NOT EXISTS product_images (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt         TEXT NOT NULL,
  kind        TEXT NOT NULL DEFAULT 'placeholder',
  sort_order  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);

CREATE TABLE IF NOT EXISTS customers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS addresses (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id  INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label        TEXT NOT NULL DEFAULT 'Home',
  address_line TEXT NOT NULL,
  area         TEXT NOT NULL,
  district     TEXT NOT NULL,
  postcode     TEXT NOT NULL DEFAULT '',
  phone        TEXT NOT NULL DEFAULT '',
  is_default   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS coupons (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  code          TEXT NOT NULL UNIQUE,
  description   TEXT NOT NULL DEFAULT '',
  type          TEXT NOT NULL DEFAULT 'percent', -- percent | fixed | freeship
  value         INTEGER NOT NULL DEFAULT 0,
  min_subtotal  INTEGER NOT NULL DEFAULT 0,
  max_discount  INTEGER,
  usage_limit   INTEGER,
  used_count    INTEGER NOT NULL DEFAULT 0,
  starts_at     TEXT,
  ends_at       TEXT,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number    TEXT NOT NULL UNIQUE,
  customer_id     INTEGER NOT NULL REFERENCES customers(id),
  status          TEXT NOT NULL DEFAULT 'pending',
  -- pending | confirmed | packed | shipped | delivered | cancelled | returned
  payment_method  TEXT NOT NULL DEFAULT 'cod',
  payment_status  TEXT NOT NULL DEFAULT 'unpaid',
  subtotal        INTEGER NOT NULL,
  discount        INTEGER NOT NULL DEFAULT 0,
  delivery_fee    INTEGER NOT NULL DEFAULT 0,
  total           INTEGER NOT NULL,
  coupon_code     TEXT,
  ship_name       TEXT NOT NULL,
  ship_phone      TEXT NOT NULL,
  ship_email      TEXT NOT NULL DEFAULT '',
  ship_address    TEXT NOT NULL,
  ship_area       TEXT NOT NULL,
  ship_district   TEXT NOT NULL,
  notes           TEXT NOT NULL DEFAULT '',
  courier         TEXT NOT NULL DEFAULT 'Not assigned',
  tracking_code   TEXT NOT NULL DEFAULT '',
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id      INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    INTEGER NOT NULL REFERENCES products(id),
  variant_id    INTEGER REFERENCES product_variants(id),
  name          TEXT NOT NULL,
  sku           TEXT NOT NULL,
  variant_label TEXT NOT NULL DEFAULT '',
  unit_price    INTEGER NOT NULL,
  qty           INTEGER NOT NULL,
  line_total    INTEGER NOT NULL,
  unit_cost     INTEGER NOT NULL DEFAULT 0   -- snapshot of wholesale cost for profit reporting
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id  INTEGER NOT NULL REFERENCES products(id),
  variant_id  INTEGER REFERENCES product_variants(id),
  change_qty  INTEGER NOT NULL,
  reason      TEXT NOT NULL, -- seed | order | restock | adjustment | return
  reference   TEXT NOT NULL DEFAULT '',
  note        TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_moves_product ON inventory_movements(product_id);

CREATE TABLE IF NOT EXISTS carts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  token       TEXT NOT NULL UNIQUE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cart_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  cart_id     INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  variant_id  INTEGER NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  qty         INTEGER NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (cart_id, variant_id)
);

CREATE TABLE IF NOT EXISTS wishlist (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_key    TEXT NOT NULL,
  product_id   INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (owner_key, product_id)
);

CREATE TABLE IF NOT EXISTS banners (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  placement   TEXT NOT NULL DEFAULT 'hero',
  title       TEXT NOT NULL,
  subtitle    TEXT NOT NULL DEFAULT '',
  cta_label   TEXT NOT NULL DEFAULT 'Shop now',
  cta_href    TEXT NOT NULL DEFAULT '/shop',
  theme       TEXT NOT NULL DEFAULT 'ink',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS admin_users (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  email          TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  password_hash  TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT 'admin',
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS store_settings (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT NOT NULL UNIQUE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT NOT NULL DEFAULT '',
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  is_read     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS _migrations (
  name        TEXT PRIMARY KEY,
  applied_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
