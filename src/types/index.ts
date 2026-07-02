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
  stock: number;
  sold_count: number;
  created_at: string;
  updated_at: string;
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
