import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import HeroCarousel from "@/components/HeroCarousel";

export const dynamic = "force-dynamic";

// Server-side fetching for home page carousel
async function getLatestProducts(): Promise<Product[]> {
  try {
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-url");
    if (isPlaceholder) {
      return [];
    }
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .range(0, 4); // top 5 products

    if (error) throw error;
    return data && data.length > 0 ? data : [];
  } catch (err) {
    console.error("Error fetching latest products:", err);
    return [];
  }
}

// Server-side fetching for home page products
async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-url");
    if (isPlaceholder) {
      return [];
    }
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sold_count", { ascending: false })
      .range(0, 3); // top 4 products

    if (error) throw error;
    return data && data.length > 0 ? data : [];
  } catch (err) {
    console.error("Error fetching featured products:", err);
    return [];
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();
  const latestProducts = await getLatestProducts();

  const { data: settings } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .single();

  const collections = settings?.home_collections || [
    { title: "Bedcover", subtitle: "Koleksi", image: "/images/category-bedcover.jpg", link: "/shop?category=bedcover", type: "large" },
    { title: "Sprei", subtitle: "Koleksi Utama", image: "/images/category-sprei.jpg", link: "/shop?category=sprei", type: "tall" },
    { title: "Selimut", subtitle: "Kenyamanan", image: "/images/category-selimut.jpg", link: "/shop?category=selimut", type: "standard" }
  ];

  return (
    <main className="flex-grow">
      {/* Hero Carousel Section */}
      <HeroCarousel products={latestProducts} />

      {/* Bento Grid Categories */}
      <section className="bg-surface-bright py-16 md:py-24 border-t border-outline-variant/10">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-headline-md text-headline-md text-on-surface">Curated Essentials</h2>
            <Link
              href="/shop"
              className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1 hidden md:block uppercase tracking-wider"
            >
              Lihat Semua Koleksi
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-element-gap md:gap-gutter auto-rows-[300px] md:auto-rows-[400px]">
            {collections.map((col: any, idx: number) => {
              const gridClass = 
                col.type === "large" ? "md:col-span-2 relative rounded-xl overflow-hidden group block parallax-zoom bg-surface-dim" :
                col.type === "tall" ? "md:col-span-1 md:row-span-2 relative rounded-xl overflow-hidden group block parallax-zoom bg-surface-dim" :
                "md:col-span-2 relative rounded-xl overflow-hidden group block parallax-zoom bg-surface-dim"; // standard

              return (
                <Link
                  key={idx}
                  href={col.link}
                  className={gridClass}
                >
                  <Image
                    alt={col.title}
                    fill
                    sizes={col.type === "tall" ? "(max-width: 768px) 100vw, 30vw" : "(max-width: 768px) 100vw, 60vw"}
                    className="object-cover"
                    src={col.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-left">
                    <div>
                      <span className="font-label-caps text-label-caps text-white/80 block mb-2 uppercase tracking-wider">
                        {col.subtitle}
                      </span>
                      <h3 className="font-headline-sm text-headline-sm text-white">{col.title}</h3>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <ArrowUpRight className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured New Arrivals */}
      <section className="py-16 md:py-24 bg-surface border-t border-outline-variant/10">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
          <div className="text-center mb-12">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">New Arrivals</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">
              Temukan koleksi sprei dan bedcover terbaru kami, dirancang dengan ketelitian tinggi untuk menghadirkan kenyamanan tidur terbaik di kamar tidur Anda.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-element-gap gap-y-12">
            {featuredProducts.map((product) => {
              const displayPrice = product.price * (1 - product.discount_percentage / 100);
              return (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group cursor-pointer block text-left"
                >
                  <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-surface-dim mb-4 parallax-zoom shadow-md hover:shadow-xl transition-shadow duration-300">
                    <Image
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover"
                      src={product.images[0] || "/images/category-sprei.jpg"}
                    />
                  </div>
                  <div className="flex flex-col mt-4 text-left">
                    <h4 className="font-body-lg text-body-lg text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant capitalize mb-2">
                      {product.colors[0] || product.category}
                    </p>
                    <span className="font-body-md text-body-md font-bold text-on-surface">
                      Rp {displayPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
