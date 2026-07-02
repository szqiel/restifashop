import { createClient } from "@/utils/supabase/server";
import AdminDashboardContent from "./AdminDashboardContent";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch orders with order items and related product names
  const { data: orders, error } = await supabase
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

  if (error) {
    console.error("Error fetching admin orders:", error);
  }

  return (
    <main className="flex-grow">
      <AdminDashboardContent initialOrders={orders || []} />
    </main>
  );
}
