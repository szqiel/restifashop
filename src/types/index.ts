export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_percentage: number;
  category: string;
  colors: string[];
  sizes: string[];
  images: string[];
  material: string;
  care_instructions: string;
  size_guide?: string;
  stock: number;
  sold_count: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionSlide {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  type: "large" | "tall" | "standard";
}

export interface ShopBanner {
  title: string;
  description: string;
  image: string;
  link: string;
}

export interface StoreSettings {
  id?: number;
  home_collections?: CollectionSlide[];
  shop_banner?: ShopBanner;
  shipping_info?: string;
  return_info?: string;
  updated_at?: string;
}

export interface OrderItemRecord {
  id: string;
  quantity: number;
  price_at_purchase: number;
  color_selected: string | null;
  size_selected: string | null;
  product_id: string;
  products?: {
    name: string | null;
  } | null;
}

export interface OrderRecord {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_email: string | null;
  subtotal: number;
  status: string;
  whatsapp_sent: boolean;
  whatsapp_message: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItemRecord[];
}

export interface CartItem {
  productId: string;
  variantId: string; // Combined: `${productId}-${color}-${size}`
  name: string;
  price: number;
  quantity: number;
  colorSelected: string;
  sizeSelected: string;
  image: string;
}

export interface OrderInput {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_email?: string;
  cart_items: {
    product_id: string;
    quantity: number;
    color_selected: string;
    size_selected: string;
    price_at_purchase: number;
  }[];
}
