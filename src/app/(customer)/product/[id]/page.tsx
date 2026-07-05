import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import ProductDetailContent from "./ProductDetailContent";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProductData(id: string): Promise<{ product: Product | null; related: Product[] }> {
  try {
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-url");
    if (isPlaceholder) {
      return { product: null, related: [] };
    }
    // Fetch target product
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !product) {
      return { product: null, related: [] };
    }

    // Fetch related products (same category, excluding current product, limit 4)
    const { data: related } = await supabase
      .from("products")
      .select("*")
      .eq("category", product.category)
      .neq("id", id)
      .range(0, 3);

    return { product, related: related || [] };
  } catch (err) {
    console.error("Error fetching product data:", err);
    return { product: null, related: [] };
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const id = (await params).id;
  const { product } = await getProductData(id);

  if (!product) {
    return {
      title: "Product Not Found — Restifashop",
    };
  }

  const discountedPrice = product.price * (1 - product.discount_percentage / 100);
  return {
    title: `${product.name} — Restifashop`,
    description: `${product.description?.slice(0, 150)}... Beli sekarang hanya Rp ${discountedPrice.toLocaleString("id-ID")}`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.images[0] }],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const id = (await params).id;
  const { product, related } = await getProductData(id);

  const { data: settings } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (!product) {
    notFound();
  }

  return (
    <main className="flex-grow bg-primary-bg">
      <ProductDetailContent product={product} relatedProducts={related} storeSettings={settings} />
    </main>
  );
}
