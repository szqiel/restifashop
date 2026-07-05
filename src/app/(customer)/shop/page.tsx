import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import { HelpCircle } from "lucide-react";
import ShopFilters from "./ShopFilters";
import { unstable_cache } from "next/cache";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// 1. Memory-cached product fetching (validated for 60 seconds)
const getProductsCached = unstable_cache(
  async (category: string, search: string, sort: string): Promise<Product[]> => {
    try {
      const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-url");
      if (isPlaceholder) {
        return [];
      }
      let query = supabase.from("products").select("*");

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      // Apply sorting
      if (sort === "price-asc") {
        query = query.order("price", { ascending: true });
      } else if (sort === "price-desc") {
        query = query.order("price", { ascending: false });
      } else if (sort === "popular") {
        query = query.order("sold_count", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false }); // newest
      }

      const { data, error } = await query;
      if (error) throw error;
      return data && data.length > 0 ? data : [];
    } catch (err) {
      console.error("Error fetching cached products:", err);
      return [];
    }
  },
  ["products-list"],
  { revalidate: 60, tags: ["products"] }
);

// 2. Memory-cached categories list (validated for 5 minutes)
const getCategoriesCached = unstable_cache(
  async () => {
    try {
      const { data } = await supabase.from("products").select("category");
      return data || [];
    } catch (err) {
      console.error("Error fetching cached categories:", err);
      return [];
    }
  },
  ["products-categories"],
  { revalidate: 300, tags: ["products"] }
);

export default async function ShopPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentCategory = (params.category as string) || "all";
  const currentSearch = (params.search as string) || "";
  const currentSort = (params.sort as string) || "newest";
  const focusSearch = params.focus === "search";

  // Fetch products and categories in parallel using memory-cached Next.js data-cache
  const [products, allProducts, { data: settings }] = await Promise.all([
    getProductsCached(currentCategory, currentSearch, currentSort),
    getCategoriesCached(),
    supabase.from("store_settings").select("*").eq("id", 1).single()
  ]);

  const shopBanner = settings?.shop_banner || {
    title: "The Resort Collection",
    description: "Rasakan kemewahan hotel bintang lima setiap malam di kamar tidur utama Anda.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDspoyrZ-C65kSNPrRIMje4Kriv53iQG5KC4G2y5qxKVqCbtSx_qrDz4KlWAPlgwReSBS-Q1f0fixbrbVTM1w9FgAFZY7FkdFW1HSSh1FtIJDfrrDtXQ9eHn-5HH3VwRFzL7mXWbIxdw6gLtX6fprfqTvAQ2RrdWLvCPnyQiTgcMyZEB_pzmHlPpEPXa960oyYYEF-NrJxP5uyUglZYLxR-fM1qGEAgSAfbXiZE-KP9SMz3oE1wuWlt",
    link: "/shop?category=bedcover"
  };

  const categoriesList = ["sprei", "bedcover", "selimut", "aksesoris"];
  if (allProducts) {
    allProducts.forEach((p) => {
      const cat = p.category?.toLowerCase();
      if (cat && !categoriesList.includes(cat)) {
        categoriesList.push(cat);
      }
    });
  }

  return (
    <main className="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop pt-12 pb-24 text-left">
      {/* Page Header & Description */}
      <div className="mb-12">
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-background mb-2">
          Curated Collections
        </h1>
        <p className="font-body-lg text-body-lg text-secondary max-w-2xl">
          Discover our handcrafted selections, designed to elevate your sleep experience with unparalleled materiality.
        </p>
      </div>

      {/* Filter and Dropdowns (Client component) */}
      <ShopFilters
        currentCategory={currentCategory}
        currentSearch={currentSearch}
        currentSort={currentSort}
        focusSearch={focusSearch}
        categoriesList={categoriesList}
      />

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-outline-variant/30 rounded-xl bg-white">
          <HelpCircle className="h-16 w-16 text-secondary mb-4 stroke-[1.5]" />
          <h3 className="font-serif text-h2 text-text-primary mb-2">Koleksi Tidak Ditemukan</h3>
          <p className="font-sans text-sm text-text-secondary max-w-[280px]">
            Coba sesuaikan kata kunci pencarian Anda atau pilih kategori lainnya.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-gutter gap-y-16">
          {products.map((product, idx) => {
            const displayPrice = product.price * (1 - product.discount_percentage / 100);
            
            // Re-create the product card mapping from design HTML
            const productCardElement = (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group product-card block text-left"
              >
                <div className="relative aspect-[4/5] bg-surface-container-low mb-6 overflow-hidden rounded-xl border border-outline-variant/20 shadow-xs parallax-zoom">
                  <Image
                    className="object-cover w-full h-full"
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    src={product.images[0] || "https://via.placeholder.com/400?text=Product"}
                  />
                  {product.discount_percentage > 0 && (
                    <div className="absolute top-4 left-4 bg-surface/80 backdrop-blur-md px-3 py-1 border border-outline-variant/30 rounded font-label-caps text-label-caps text-on-background">
                      SALE -{product.discount_percentage}%
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center">
                      <span className="bg-error text-white font-label-caps text-label-caps py-2 px-4 rounded-md">
                        STOK HABIS
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-headline-md text-headline-sm md:text-headline-md text-on-background text-lg group-hover:text-primary transition-colors duration-200">
                      {product.name}
                    </h3>
                    <span className="font-body-md text-body-md text-on-background font-medium whitespace-nowrap">
                      Rp {displayPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <p className="font-body-md text-sm text-secondary">
                    {product.material || "Luxe Bedding"} • {product.sizes[0] || "Standard"} • {product.colors[0] || "Standard"}
                  </p>
                  <p className="font-label-caps text-label-caps text-secondary pt-2">
                    Motif: {product.category === "bedcover" ? "Solid Rumbai" : "Solid Calm"}
                  </p>
                </div>
              </Link>
            );

            // Inject the premium Resort Collection promo banner block asymmetrically after the 3rd card
            if (idx === 2) {
              return [
                productCardElement,
                <div
                  key="resort-collection-banner"
                  className="group product-card block lg:col-span-2 text-left"
                >
                  <div className="relative aspect-[16/9] md:aspect-[8/5] bg-surface-container-low mb-6 overflow-hidden rounded-xl border border-outline-variant/20 shadow-xs">
                    <Image
                      className="object-cover w-full h-full"
                      alt={shopBanner.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      src={shopBanner.image}
                    />
                    <div className="absolute bottom-6 left-6 bg-surface/90 backdrop-blur-xl p-4 md:p-6 rounded-lg shadow-sm border border-outline-variant/30 max-w-xs text-left animate-scale-up">
                      <h4 className="font-headline-md text-headline-md text-on-background mb-1">
                        {shopBanner.title}
                      </h4>
                      <p className="font-body-md text-xs md:text-sm text-secondary mb-3">
                        {shopBanner.description}
                      </p>
                      <Link
                        href={shopBanner.link}
                        className="bg-primary-container text-on-primary-container px-4 py-2 font-label-caps text-label-caps hover:bg-primary hover:text-on-primary transition-all duration-300 rounded inline-block text-xs uppercase relative overflow-hidden group"
                      >
                        <span className="relative z-10">Lihat Koleksi</span>
                        <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                      </Link>
                    </div>
                  </div>
                </div>
              ];
            }

            return productCardElement;
          })}
        </div>
      )}
    </main>
  );
}
