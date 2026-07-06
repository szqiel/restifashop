import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { CollectionSlide, Product, StoreSettings } from "@/types";
import { ArrowUpRight } from "lucide-react";
import HeroCarousel from "@/components/HeroCarousel";

export const dynamic = "force-dynamic";

async function getLatestProducts(): Promise<Product[]> {
  try {
    const isPlaceholder =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-url");
    if (isPlaceholder) return [];

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .range(0, 7);

    if (error) throw error;
    return data && data.length > 0 ? data : [];
  } catch (err) {
    console.error("Error fetching latest products:", err);
    return [];
  }
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const isPlaceholder =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-url");
    if (isPlaceholder) return [];

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sold_count", { ascending: false })
      .range(0, 3);

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

  const storeSettings = settings as StoreSettings | null;
  const collections: CollectionSlide[] = storeSettings?.home_collections || [
    {
      title: "Bedcover",
      subtitle: "Koleksi",
      image: "/images/category-bedcover.jpg",
      link: "/shop?category=bedcover",
      type: "large",
    },
    {
      title: "Sprei",
      subtitle: "Koleksi Utama",
      image: "/images/category-sprei.jpg",
      link: "/shop?category=sprei",
      type: "tall",
    },
    {
      title: "Selimut",
      subtitle: "Kenyamanan",
      image: "/images/category-selimut.jpg",
      link: "/shop?category=selimut",
      type: "standard",
    },
  ];

  return (
    <main className="flex-grow">
      <HeroCarousel products={latestProducts} />

      <section className="border-t border-outline-variant/10 bg-surface-bright py-18 md:py-24">
        <div className="section-shell">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="mb-2 font-label-caps text-label-caps uppercase tracking-widest text-primary">
                Curated Essentials
              </p>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Selected for daily comfort
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden border-b border-transparent pb-1 font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant transition-colors hover:border-primary hover:text-primary md:block"
            >
              Lihat Semua Koleksi
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-element-gap auto-rows-[280px] md:grid-cols-3 md:auto-rows-[400px] md:gap-gutter">
            {collections.map((col) => {
              const gridClass =
                col.type === "large"
                  ? "md:col-span-2 relative rounded-2xl overflow-hidden group block parallax-zoom bg-surface-dim"
                  : col.type === "tall"
                    ? "md:col-span-1 md:row-span-2 relative rounded-2xl overflow-hidden group block parallax-zoom bg-surface-dim"
                    : "md:col-span-2 relative rounded-2xl overflow-hidden group block parallax-zoom bg-surface-dim";

              return (
                <Link key={col.title} href={col.link} className={gridClass}>
                  <Image
                    alt={col.title}
                    fill
                    sizes={col.type === "tall" ? "(max-width: 768px) 100vw, 30vw" : "(max-width: 768px) 100vw, 60vw"}
                    className="object-cover"
                    src={col.image}
                    quality={95}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-left">
                    <div>
                      <span className="mb-2 block font-label-caps text-label-caps uppercase tracking-wider text-white/80">
                        {col.subtitle}
                      </span>
                      <h3 className="font-headline-sm text-headline-sm text-white">{col.title}</h3>
                    </div>
                    <div className="flex items-center justify-center rounded-full bg-white/20 p-2 opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
                      <ArrowUpRight className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-outline-variant/10 bg-surface py-18 md:py-24">
        <div className="section-shell">
          <div className="mb-12 text-center">
            <p className="mb-2 font-label-caps text-label-caps uppercase tracking-widest text-primary">
              New Arrivals
            </p>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">
              Fresh drops, softer nights
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto">
              Temukan koleksi sprei dan bedcover terbaru kami, dirancang dengan ketelitian tinggi untuk menghadirkan
              kenyamanan tidur terbaik di kamar tidur Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-y-12 gap-x-element-gap sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => {
              const displayPrice = product.price * (1 - product.discount_percentage / 100);
              return (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group block cursor-pointer text-left"
                >
                  <div className="parallax-zoom relative mb-4 aspect-[4/5] overflow-hidden rounded-2xl bg-surface-dim shadow-md transition-shadow duration-300 hover:shadow-xl">
                    <Image
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover"
                      src={product.images[0] || "/images/category-sprei.jpg"}
                      quality={95}
                    />
                  </div>
                  <div className="mt-4 flex flex-col text-left">
                    <h4 className="mb-1 line-clamp-1 font-body-lg text-body-lg text-on-surface transition-colors group-hover:text-primary">
                      {product.name}
                    </h4>
                    <p className="mb-2 font-body-sm text-body-sm text-on-surface-variant capitalize">
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
