export type Category = {
  id: number;
  slug: string;
  name: string;
  name_bn: string;
  blurb: string;
  icon: string;
  sort_order: number;
  is_active: number;
};

export type Product = {
  id: number;
  sku: string;
  slug: string;
  name: string;
  name_bn: string;
  category_id: number;
  subcategory: string;
  short_description: string;
  description: string;
  specs_json: string;
  wholesale_cost: number;
  retail_price: number;
  sale_price: number | null;
  price_status: string;
  moq: number;
  tags_json: string;
  flags_json: string;
  warranty: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  category_slug?: string;
  category_name?: string;
  image_url?: string;
  image_kind?: string;
  total_stock?: number;
  colors?: string;
  sizes?: string;
};

export type Variant = {
  id: number;
  product_id: number;
  variant_sku: string;
  size: string;
  color: string;
  price_delta: number;
  stock: number;
  is_active: number;
};

export type CartLine = {
  variant_id: number;
  qty: number;
  size: string;
  color: string;
  variant_sku: string;
  stock: number;
  price_delta: number;
  product_id: number;
  slug: string;
  name: string;
  sku: string;
  retail_price: number;
  sale_price: number | null;
  image_url: string | null;
  image_kind: string | null;
  category_name: string;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type Order = {
  id: number;
  order_number: string;
  customer_id: number;
  status: OrderStatus;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  coupon_code: string | null;
  ship_name: string;
  ship_phone: string;
  ship_email: string;
  ship_address: string;
  ship_area: string;
  ship_district: string;
  notes: string;
  courier: string;
  tracking_code: string;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  variant_id: number | null;
  name: string;
  sku: string;
  variant_label: string;
  unit_price: number;
  qty: number;
  line_total: number;
  unit_cost: number;
};
