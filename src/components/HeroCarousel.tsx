"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types";

interface HeroCarouselProps {
  products: Product[];
}

export default function HeroCarousel({ products }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!products || products.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [products]);

  if (!products || products.length === 0) return null;

  return (
    <section className="relative w-full min-h-[560px] md:min-h-[760px] overflow-hidden bg-surface">
      {products.map((product, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={product.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div className="absolute inset-0 w-full h-full">
              <Image
                src={product.images?.[0] || "/images/placeholder.jpg"}
                alt={product.name}
                fill
                priority={index === 0}
                className="object-cover object-center md:object-right"
                sizes="100vw"
                quality={95}
              />
            </div>
            <div className="absolute inset-0 w-full md:w-3/4 bg-gradient-to-r from-surface via-surface/94 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-surface to-transparent" />

            <div className="section-shell absolute inset-0 flex items-center justify-start text-left z-10">
              <div className="max-w-2xl space-y-6 py-16 md:py-24 md:w-1/2">
                <div className="inline-block rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-widest text-primary">
                  Koleksi Terbaru
                </div>
                <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface leading-tight tracking-tighter">
                  {product.name}
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md line-clamp-3">
                  {product.description || "Rasakan kenyamanan premium dari koleksi terbaru kami."}
                </p>
                <div className="pt-2">
                  <Link
                    href={`/product/${product.id}`}
                    className="gold-button inline-flex items-center justify-center rounded-xl bg-primary-container px-10 py-4 md:px-12 font-label-caps text-label-caps text-on-primary-container uppercase tracking-widest shadow-[0_4px_14px_0_rgba(212,175,55,0.28)] relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      Beli Sekarang
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                    <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
      ` }} />

      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
        {products.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative overflow-hidden transition-all duration-300 rounded-full ${
                isActive
                  ? "w-12 h-2.5 bg-on-surface-variant/30 shadow-sm"
                  : "w-2.5 h-2.5 bg-on-surface-variant/30 hover:bg-on-surface-variant/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {isActive && (
                <div
                  key={currentIndex}
                  className="absolute top-0 left-0 h-full bg-primary"
                  style={{ animation: "progressFill 7s linear forwards" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
