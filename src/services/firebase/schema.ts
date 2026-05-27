export type Role = "client" | "professional" | "admin";

export type AppUser = {
  id: number;
  uid: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: number;
  name: string;
  description?: string | null;
  price_cents: number;
  duration_minutes: number;
  is_active: boolean;
};

export type Professional = {
  id: number;
  user_id: number;
  display_name: string;
  bio?: string | null;
  photo_url?: string | null;
  is_active: boolean;
};

export type Product = {
  id: number;
  name: string;
  description?: string | null;
  price_cents: number;
  stock_qty: number;
  sku?: string | null;
  image_url?: string | null;
  image_full_url?: string | null;
  is_active: boolean;
};

export type Appointment = {
  id: number;
  client_user_id: number;
  service_id: number;
  professional_id: number;
  date: string;
  time: string;
  starts_at: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price_cents: number;
  subtotal_cents: number;
};

export type Order = {
  id: number;
  client_user_id: number;
  status: string;
  total_cents: number;
  fulfillment_type: "pickup" | "delivery";
  payment_method: "pix" | "credit_card" | "debit_card" | "cash";
  notes?: string | null;
  created_at: string;
  updated_at: string;
};
