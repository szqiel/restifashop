import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { CartItem } from "@/types";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = (rawUrl && rawUrl.startsWith("http")) ? rawUrl : "https://placeholder-url.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

const supabase = createClient(supabaseUrl, serviceRoleKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer_name,
      customer_phone,
      customer_address,
      customer_email,
      cart_items,
    } = body;

    // 1. Validation
    if (!customer_name || !customer_phone || !customer_address || !cart_items || cart_items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required shipping fields or cart items" },
        { status: 400 }
      );
    }

    // Dev mode fallback check
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-url");
    if (isPlaceholder) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}${mm}${dd}`;
      const orderNumber = `ORD-${dateStr}-DEV`;

      const subtotal = cart_items.reduce(
        (sum: number, item: any) => sum + item.price_at_purchase * item.quantity,
        0
      );

      const formattedCartItems: CartItem[] = cart_items.map((item: any) => ({
        productId: item.product_id,
        variantId: "",
        name: item.product_name || "Sprei / Bedcover Item",
        price: item.price_at_purchase,
        quantity: item.quantity,
        colorSelected: item.color_selected,
        sizeSelected: item.size_selected,
        image: "",
      }));

      const host = req.headers.get("host") || "localhost:3000";
      const protocol = req.headers.get("x-forwarded-proto") || "http";
      const baseUrl = `${protocol}://${host}`;

      const whatsappLink = generateWhatsAppLink(
        { name: customer_name, phone: customer_phone, address: customer_address },
        formattedCartItems,
        orderNumber,
        subtotal,
        baseUrl
      );

      return NextResponse.json({
        success: true,
        data: {
          order_number: orderNumber,
          whatsapp_link: whatsappLink,
        },
      });
    }

    // 2. Generate sequential order number (ORD-YYYYMMDD-SEQ)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}${mm}${dd}`;

    // Get order count for today to generate next sequence number
    const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const { count, error: countError } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayStart);

    if (countError) {
      throw new Error("Failed to count today's orders: " + countError.message);
    }

    const seq = String((count || 0) + 1).padStart(3, "0");
    const orderNumber = `ORD-${dateStr}-${seq}`;

    // 3. Calculate subtotal
    const subtotal = cart_items.reduce(
      (sum: number, item: any) => sum + item.price_at_purchase * item.quantity,
      0
    );

    // 4. Insert order row
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          order_number: orderNumber,
          customer_name,
          customer_phone,
          customer_address,
          customer_email,
          subtotal,
          status: "pending",
          whatsapp_sent: true,
        },
      ])
      .select()
      .single();

    if (orderError) {
      throw new Error("Failed to insert order: " + orderError.message);
    }

    // 5. Insert order items
    const dbOrderItems = cart_items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.price_at_purchase,
      color_selected: item.color_selected,
      size_selected: item.size_selected,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(dbOrderItems);

    if (itemsError) {
      throw new Error("Failed to insert order items: " + itemsError.message);
    }

    // 5b. Update product stock levels
    for (const item of cart_items) {
      const { data: currentProduct, error: fetchStockError } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.product_id)
        .single();
      
      if (!fetchStockError && currentProduct) {
        const currentStock = currentProduct.stock || 0;
        await supabase
          .from("products")
          .update({ stock: Math.max(0, currentStock - item.quantity) })
          .eq("id", item.product_id);
      }
    }

    // 6. Generate WhatsApp Link
    const formattedCartItems: CartItem[] = cart_items.map((item: any) => ({
      productId: item.product_id,
      variantId: "",
      name: item.product_name || "Sprei / Bedcover Item",
      price: item.price_at_purchase,
      quantity: item.quantity,
      colorSelected: item.color_selected,
      sizeSelected: item.size_selected,
      image: "",
    }));

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    const whatsappLink = generateWhatsAppLink(
      { name: customer_name, phone: customer_phone, address: customer_address },
      formattedCartItems,
      orderNumber,
      subtotal,
      baseUrl
    );

    // 7. Update order with generated whatsapp message payload (optional reference)
    const decodedMessage = decodeURIComponent(whatsappLink.split("?text=")[1]);
    await supabase
      .from("orders")
      .update({ whatsapp_message: decodedMessage })
      .eq("id", order.id);

    return NextResponse.json({
      success: true,
      data: {
        order_number: orderNumber,
        whatsapp_link: whatsappLink,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
