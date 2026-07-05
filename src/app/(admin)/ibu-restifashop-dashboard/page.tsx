import { createClient } from "@/utils/supabase/server";
import AdminDashboardContent from "./AdminDashboardContent";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 1. Fetch orders with order items and related product names
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        id,
        quantity,
        price_at_purchase,
        color_selected,
        size_selected,
        product_id,
        products (
          name
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("Error fetching admin orders:", ordersError);
  }

  // 2. Fetch all products to manage in the product manager tab
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (productsError) {
    console.error("Error fetching admin products:", productsError);
  }

  return (
    <main className="flex-grow">
      <AdminDashboardContent 
        initialOrders={orders || []} 
        initialProducts={products || []} 
      />
    </main>
  );
}
