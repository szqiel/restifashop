import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Product, StoreSettings } from "@/types";
import { HelpCircle } from "lucide-react";
import ShopFilters from "./ShopFilters";
import { unstable_cache } from "next/cache";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const getProductsCached = unstable_cache(
  async (category: string, search: string, sort: string): Promise<Product[]> => {
    try {
      const isPlaceholder =
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-url");
      if (isPlaceholder) return [];

      let query = supabase.from("products").select("*");

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      if (sort === "price-asc") {
        query = query.order("price", { ascending: true });
      } else if (sort === "price-desc") {
        query = query.order("price", { ascending: false });
      } else if (sort === "popular") {
        query = query.order("sold_count", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
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

  const [products, allProducts, { data: settings }] = await Promise.all([
    getProductsCached(currentCategory, currentSearch, currentSort),
    getCategoriesCached(),
    supabase.from("store_settings").select("*").eq("id", 1).single(),
  ]);

  const storeSettings = settings as StoreSettings | null;
  const shopBanner = storeSettings?.shop_banner || {
    title: "The Resort Collection",
    description: "Rasakan kemewahan hotel bintang lima setiap malam di kamar tidur utama Anda.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDspoyrZ-C65kSNPrRIMje4Kriv53iQG5KC4G2y5qxKVqCbtSx_qrDz4KlWAPlgwReSBS-Q1f0fixbrbVTM1w9FgAFZY7FkdFW1HSSh1FtIJDfrrDtXQ9eHn-5HH3VwRFzL7mXWbIxdw6gLtX6fprfqTvAQ2RrdWLvCPnyQiTgcMyZEB_pzmHlPpEPXa960oyYYEF-NrJxP5uyUglZYLxR-fM1qGEAgSAfbXiZE-KP9SMz3oE1wuWlt",
    link: "/shop?category=bedcover",
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
    <main className="section-shell flex-grow w-full pt-12 pb-24 text-left">
      <div className="mb-12 max-w-3xl">
        <p className="mb-2 font-label-caps text-label-caps uppercase tracking-widest text-primary">Shop</p>
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-background mb-3">
          Curated Collections
        </h1>
        <p className="font-body-lg text-body-lg text-secondary max-w-2xl">
          Discover our handcrafted selections, designed to elevate your sleep experience with unparalleled materiality.
        </p>
      </div>

      <ShopFilters
        currentCategory={currentCategory}
        currentSearch={currentSearch}
        currentSort={currentSort}
        focusSearch={focusSearch}
        categoriesList={categoriesList}
      />

      {products.length === 0 ? (
        <div className="surface-panel flex flex-col items-center justify-center rounded-2xl border-dashed border-outline-variant/30 py-20 text-center">
          <HelpCircle className="mb-4 h-16 w-16 stroke-[1.5] text-secondary" />
          <h3 className="mb-2 font-serif text-h2 text-text-primary">Koleksi Tidak Ditemukan</h3>
          <p className="max-w-[280px] font-sans text-sm text-text-secondary">
            Coba sesuaikan kata kunci pencarian Anda atau pilih kategori lainnya.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-gutter gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product, idx) => {
            const displayPrice = product.price * (1 - product.discount_percentage / 100);

            const productCardElement = (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group product-card block text-left"
              >
                <div className="parallax-zoom relative mb-6 aspect-[4/5] overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-low shadow-xs">
                  <Image
                    className="h-full w-full object-cover"
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    src={product.images[0] || "https://via.placeholder.com/400?text=Product"}
                    quality={95}
                  />
                  {product.discount_percentage > 0 && (
                    <div className="absolute left-4 top-4 rounded font-label-caps text-label-caps border border-outline-variant/30 bg-surface/80 px-3 py-1 backdrop-blur-md text-on-background">
                      SALE -{product.discount_percentage}%
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs">
                      <span className="rounded-md bg-error px-4 py-2 font-label-caps text-label-caps text-white">
                        STOK HABIS
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-headline-md text-headline-sm md:text-headline-md text-on-background text-lg transition-colors duration-200 group-hover:text-primary">
                      {product.name}
                    </h3>
                    <span className="whitespace-nowrap font-body-md text-body-md font-medium text-on-background">
                      Rp {displayPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <p className="font-body-md text-sm text-secondary">
                    {product.material || "Luxe Bedding"} • {product.sizes[0] || "Standard"} • {product.colors[0] || "Standard"}
                  </p>
                  <p className="pt-2 font-label-caps text-label-caps text-secondary">
                    Motif: {product.category === "bedcover" ? "Solid Rumbai" : "Solid Calm"}
                  </p>
                </div>
              </Link>
            );

            if (idx === 2 || (products.length <= 2 && idx === products.length - 1)) {
              return [
                productCardElement,
                <div
                  key="resort-collection-banner"
                  className="group product-card block text-left lg:col-span-2"
                >
                  <div className="relative mb-6 aspect-square overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-low shadow-xs md:aspect-[8/5]">
                    <Image
                      className="h-full w-full object-cover"
                      alt={shopBanner.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      src={shopBanner.image}
                      quality={95}
                    />
                    <div className="absolute inset-0 flex items-end justify-start p-4 md:p-6 pointer-events-none">
                      <div className="w-full md:w-[320px] rounded-lg border border-outline-variant/30 bg-surface/90 p-4 md:p-6 text-left shadow-sm backdrop-blur-xl animate-scale-up pointer-events-auto">
                        <h4 className="mb-1 font-headline-md text-headline-md text-on-background">
                          {shopBanner.title}
                        </h4>
                        <p className="mb-3 font-body-md text-xs text-secondary md:text-sm">
                          {shopBanner.description}
                        </p>
                        <Link
                          href={shopBanner.link}
                          className="gold-button relative inline-block overflow-hidden rounded-full bg-primary-container px-4 py-2 text-xs font-label-caps uppercase tracking-widest text-on-primary-container"
                        >
                          <span className="relative z-10">Lihat Koleksi</span>
                          <div className="absolute inset-0 transform -translate-x-full bg-white/20 transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>,
              ];
            }

            return productCardElement;
          })}
        </div>
      )}
    </main>
  );
}
