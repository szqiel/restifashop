import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { MOCK_PRODUCTS } from "@/lib/mockData";

// Server-side fetching for home page products
async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-url");
    if (isPlaceholder) {
      return MOCK_PRODUCTS;
    }
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sold_count", { ascending: false })
      .range(0, 3); // top 4 products

    if (error) throw error;
    return data && data.length > 0 ? data : MOCK_PRODUCTS;
  } catch (err) {
    console.error("Error fetching featured products, using mock fallback:", err);
    return MOCK_PRODUCTS;
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <main className="flex-grow">
      {/* Hero Section (Asymmetric) */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-gutter pt-12 pb-section-gap">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
          {/* Text Content (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-start space-y-6 z-10 md:pr-8 text-left">
            <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface leading-tight tracking-tighter">
              Artistry in Every Thread.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
              Experience the pinnacle of Indonesian craftsmanship. Premium bedding designed for those who appreciate the quiet luxury of a curated home.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-primary-container text-on-primary-container font-label-caps text-label-caps px-8 py-4 rounded-xl hover:scale-95 transition-transform duration-300 shadow-[0_4px_14px_0_rgba(212,175,55,0.39)] uppercase tracking-wider"
            >
              Shop Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          {/* Image Content (7 cols) */}
          <div className="md:col-span-7 relative h-[400px] md:h-[650px] w-full rounded-2xl overflow-hidden mt-8 md:mt-0 parallax-zoom group border border-white/10 shadow-lg">
            <Image
              alt="Premium Bedding"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwGKhUmsxoYtUWLCedcnz5tALl0XzFQySY6D1deIzJ5EojtjN4djAH0SHOlMMxQPA713UGU4uu9Y9eo2lqr4hmVAGYAEtQf2YdOIL1W3iZot10Z0wqwHGIGqAzBeYI4PxWBebq-8xxkMmmTmu5sBgwzMvCkMqYUSqH3enYi78KFiPeZpBR3NWy9xoqjo6_a2L_rSmAiomPkt9cr_u_g6utLUQqJ2qED5ea_V8DWQkZG4wOPL1RNtrO"
            />
          </div>
        </div>
      </section>

      {/* Bento Grid Categories */}
      <section className="bg-surface-bright py-section-gap border-t border-outline-variant/10">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
          <div className="flex justify-between items-end mb-12">
            <h2 className="font-headline-md text-headline-md text-on-surface">Curated Essentials</h2>
            <Link
              href="/shop"
              className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1 hidden md:block uppercase tracking-wider"
            >
              View All Collections
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-element-gap md:gap-gutter auto-rows-[300px] md:auto-rows-[400px]">
            {/* Bedcover (Large) */}
            <Link
              href="/shop?category=bedcover"
              className="md:col-span-2 relative rounded-xl overflow-hidden group block parallax-zoom bg-surface-dim"
            >
              <Image
                alt="Premium Bedcover"
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrek7Dy8_zyxu3nxRwJe45p0oG3TFSzpglayS6e-CVhyfTsPjiXR6iX0XdCgEyr1aY1Wrwd3nmcCBylN1fcYhtsUWeQuY7IUNPaeqSoLq1yUHpg7L4JyLsGCT2wqXZP66B9ieH-kOQwSw8OnnDF27OXqGl64LXASLqT--s-aUu3i2uT2R6DaT8hFrlhzFAOOzns3lIQyEl_4Q613Uy4s5YxPdDa7uNpq30EJLOnHEly-62fwYh22va"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute inset-0 border border-white/10 rounded-xl pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-left">
                <div>
                  <span className="font-label-caps text-label-caps text-white/80 block mb-2 uppercase tracking-wider">
                    Collection
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-white">Bedcover</h3>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <ArrowUpRight className="h-5 w-5 text-white" />
                </div>
              </div>
            </Link>

            {/* Sprei (Tall) */}
            <Link
              href="/shop?category=sprei"
              className="md:col-span-1 md:row-span-2 relative rounded-xl overflow-hidden group block parallax-zoom bg-surface-dim"
            >
              <Image
                alt="Premium Sprei"
                fill
                sizes="(max-width: 768px) 100vw, 30vw"
                className="object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0lizvIe2RxGvzVSlHZg5GpfdxBcQFfH8P97TUlTZSmKrgOezV5GU13V4y3I7JjMQj5Zu2mAx_SxK3k8m0lIHEGPcSNJnFYMc1B7UXVdgh5paiu93IM1I1Or64iKaMEQYqVxvkw89x-uc7t2BwFkG7j3pi3Z1TfzWKqiUW-xJNYxF5Tw6FJqaXU69xxgBZ7dxbXbRdsLMWrwcKE_gaJU1bMcEeIBpGyegWUwG2S8pVxozsghDIaLlK"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute inset-0 border border-white/10 rounded-xl pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-left">
                <div>
                  <span className="font-label-caps text-label-caps text-white/80 block mb-2 uppercase tracking-wider">
                    Essentials
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-white">Sprei</h3>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <ArrowUpRight className="h-5 w-5 text-white" />
                </div>
              </div>
            </Link>

            {/* Selimut (Standard) */}
            <Link
              href="/shop?category=selimut"
              className="md:col-span-2 relative rounded-xl overflow-hidden group block parallax-zoom bg-surface-dim"
            >
              <Image
                alt="Premium Selimut"
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDabY6pXY4s7d_2CPda7FFq1wb3IJmApt5hU-7Nr_NMjmLVyHar69sOHR0X0QarjSbQVDSu9m1ANU3DmpYTvRNg1xmjZ-86C-HcWg6IelhV3kU6Xpr6MK8AevcjazjldMFNAnrAdl9rdiRwQRjZrtzSSrBQAsy-2--k58KK7TYfg-4nCFWZftns6w6IS3e5T2WCB9kXGCR8h8j9Qf1k5ACFFPXhs31DAclD42erpJLZWX2M9rMB5td3"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute inset-0 border border-white/10 rounded-xl pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-left">
                <div>
                  <span className="font-label-caps text-label-caps text-white/80 block mb-2 uppercase tracking-wider">
                    Comfort
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-white">Selimut</h3>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <ArrowUpRight className="h-5 w-5 text-white" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured New Arrivals */}
      <section className="py-section-gap bg-surface border-t border-outline-variant/10">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
          <div className="text-center mb-16">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">New Arrivals</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">
              Discover the latest additions to our gallery, meticulously crafted to elevate your sanctuary.
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
                  <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-surface-dim mb-4 parallax-zoom border border-outline-variant/20 shadow-xs">
                    <Image
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover"
                      src={product.images[0] || "https://via.placeholder.com/400?text=Product"}
                    />
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-body-lg text-body-lg text-on-surface mb-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant capitalize">
                        {product.colors[0] || product.category}
                      </p>
                    </div>
                    <span className="font-body-md text-body-md font-bold whitespace-nowrap">
                      Rp {(displayPrice / 1000).toLocaleString("id-ID")}k
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
