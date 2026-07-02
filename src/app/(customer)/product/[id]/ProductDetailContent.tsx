"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { ChevronDown, ArrowRight, Check, ShoppingBag } from "lucide-react";

interface ProductDetailContentProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailContent({
  product,
  relatedProducts,
}: ProductDetailContentProps) {
  const { addItem, setIsOpen, setIsCheckoutOpen } = useCartStore();

  const colors = product.colors.length > 0 ? product.colors : ["Standard"];
  const sizes = product.sizes.length > 0 ? product.sizes : ["Standard"];

  // Active configurations
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [addedToCart, setAddedToCart] = useState(false);

  // Price calculations
  const discountedPrice = product.price * (1 - product.discount_percentage / 100);

  // Map color names to Hex colors for variant circles
  const getColorHex = (colorName: string): string => {
    const name = colorName.toLowerCase();
    if (name.includes("champagne")) return "#e5dfd3";
    if (name.includes("white") || name.includes("cream")) return "#f8fafc";
    if (name.includes("grey") || name.includes("silver") || name.includes("ash")) return "#d1d5db";
    if (name.includes("green") || name.includes("sage")) return "#8f9779";
    if (name.includes("pink")) return "#e8c3be";
    if (name.includes("taupe") || name.includes("stone")) return "#a39e93";
    if (name.includes("clay") || name.includes("terracotta")) return "#c97d60";
    if (name.includes("charcoal") || name.includes("midnight") || name.includes("black")) return "#374151";
    return "#d4af37"; // default gold accent
  };

  const handleAddToCart = () => {
    const variantId = `${product.id}-${selectedColor}-${selectedSize}`;
    
    addItem({
      productId: product.id,
      variantId,
      name: product.name,
      price: discountedPrice,
      quantity: 1,
      colorSelected: selectedColor,
      sizeSelected: selectedSize,
      image: product.images[0] || "https://via.placeholder.com/300?text=Bedding",
    });

    setAddedToCart(true);
    setIsOpen(true); // Open the cart drawer automatically

    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };

  const handleWhatsAppCheckout = () => {
    // Add the single item to cart
    const variantId = `${product.id}-${selectedColor}-${selectedSize}`;
    addItem({
      productId: product.id,
      variantId,
      name: product.name,
      price: discountedPrice,
      quantity: 1,
      colorSelected: selectedColor,
      sizeSelected: selectedSize,
      image: product.images[0] || "https://via.placeholder.com/300?text=Bedding",
    });

    // Open the checkout form modal directly
    setIsCheckoutOpen(true);
  };

  return (
    <div className="max-w-container-max mx-auto w-full py-12 px-margin-mobile md:px-gutter grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-16 items-start text-left">
      
      {/* Left Column: Image Gallery (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col gap-[12px] sticky top-28">
        {/* Main Display Image */}
        <div className="parallax-container w-full h-[450px] md:h-[768px] overflow-hidden rounded-xl bg-surface-container-low relative border border-outline-variant/10 shadow-sm">
          <Image
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover w-full h-full parallax-img"
            src={product.images[0] || "https://via.placeholder.com/600?text=Product"}
          />
          {product.discount_percentage > 0 && (
            <div className="absolute top-4 left-4 bg-surface/80 backdrop-blur-md px-3 py-1 border border-outline-variant/30 rounded font-label-caps text-label-caps text-on-background">
              SALE -{product.discount_percentage}%
            </div>
          )}
        </div>

        {/* Secondary Images (Grid of 2 Square Images, Desktop only) */}
        {product.images.length > 0 && (
          <div className="hidden md:grid grid-cols-2 gap-[12px]">
            <div className="parallax-container aspect-square overflow-hidden rounded-xl bg-surface-container-low border border-outline-variant/10">
              <div
                className="bg-cover bg-center w-full h-full parallax-img"
                style={{ backgroundImage: `url('${product.images[1] || product.images[0]}')` }}
              />
            </div>
            <div className="parallax-container aspect-square overflow-hidden rounded-xl bg-surface-container-low border border-outline-variant/10">
              <div
                className="bg-cover bg-center w-full h-full parallax-img"
                style={{ backgroundImage: `url('${product.images[2] || product.images[0]}')` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Product Info & Actions (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-8 py-4">
        {/* Header (Collection, Title, Price) */}
        <div className="flex flex-col gap-2 border-b border-surface-variant pb-8">
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
            {product.category} Collection
          </p>
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight leading-tight">
            {product.name}
          </h1>
          <p className="font-headline-md text-headline-md text-primary mt-2">
            Rp {discountedPrice.toLocaleString("id-ID")}
            {product.discount_percentage > 0 && (
              <span className="font-sans text-sm text-secondary line-through ml-3 font-normal">
                Rp {product.price.toLocaleString("id-ID")}
              </span>
            )}
          </p>
        </div>

        {/* Description */}
        <div className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
          <p>{product.description}</p>
        </div>

        {/* Variant Selectors */}
        <div className="flex flex-col gap-6">
          {/* Color Selector */}
          {product.colors.length > 0 && (
            <div className="flex flex-col gap-3">
              <label className="font-label-caps text-label-caps text-on-surface uppercase flex justify-between tracking-wider">
                <span>Warna / Motif</span>
                <span className="text-on-surface-variant font-normal normal-case">{selectedColor}</span>
              </label>
              <div className="flex gap-4">
                {colors.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      aria-label={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center focus:outline-none transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/20 scale-105"
                          : "border-surface-variant hover:border-primary"
                      }`}
                      style={{ backgroundColor: getColorHex(color) }}
                    >
                      {isSelected && (
                        <Check className="h-4.5 w-4.5 text-primary invert" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <label className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider">Ukuran</label>
                <button className="text-sm underline text-on-surface-variant hover:text-primary transition-colors">
                  Panduan Ukuran
                </button>
              </div>
              {/* Segemented control Indicator */}
              <div className="segmented-control w-full relative" id="size-selector">
                <div
                  className="segmented-indicator"
                  style={{
                    transform: `translateX(${sizes.indexOf(selectedSize) * 100}%)`,
                    width: `calc(${100 / sizes.length}% - 4px)`,
                  }}
                />
                {sizes.map((size) => {
                  const isActive = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`segmented-btn font-body-md text-body-md focus:outline-none cursor-pointer ${
                        isActive ? "active" : ""
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Area */}
        <div className="flex flex-col gap-4 mt-4">
          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-on-surface text-surface py-4 px-6 rounded-full font-label-caps text-label-caps uppercase tracking-widest hover:bg-surface-tint transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span>{addedToCart ? "Dimasukkan ke Keranjang" : "Tambah ke Keranjang"}</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </button>

          {/* Order via WhatsApp */}
          <button
            onClick={handleWhatsAppCheckout}
            disabled={product.stock === 0}
            className="w-full bg-primary-container text-on-primary-container py-4 px-6 rounded-full font-label-caps text-label-caps uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-2 relative overflow-hidden group cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"></path>
              </svg>
              Pesan via WhatsApp
            </span>
            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
          </button>
          <p className="text-center font-body-md text-sm text-on-surface-variant mt-2">
            Gratis ongkir ke seluruh Indonesia. Garansi uji coba 30 hari.
          </p>
        </div>

        {/* Accordion Details */}
        <div className="mt-8 border-t border-surface-variant text-left">
          {/* Material & Care */}
          <details className="group border-b border-surface-variant py-4 cursor-pointer" open>
            <summary className="flex justify-between items-center font-body-lg text-body-lg text-on-surface list-none focus:outline-none select-none">
              <span>Bahan & Perawatan</span>
              <ChevronDown className="h-5 w-5 transform group-open:rotate-180 transition-transform duration-300 text-secondary" />
            </summary>
            <div className="pt-4 font-body-md text-sm text-on-surface-variant space-y-2 leading-relaxed">
              <p>{product.material || "100% Serat organik pilihan, ditenun halus untuk memberikan kelembutan maksimal dan kenyamanan tidur terbaik."}</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>{product.care_instructions || "Cuci dengan air dingin menggunakan putaran mesin cuci lambat."}</li>
                <li>Keringkan dengan mesin pengering putaran rendah, segera keluarkan setelah kering.</li>
                <li>Jangan gunakan pemutih atau pelembut pakaian secara berlebihan.</li>
              </ul>
            </div>
          </details>

          {/* Shipping & Returns */}
          <details className="group border-b border-surface-variant py-4 cursor-pointer">
            <summary className="flex justify-between items-center font-body-lg text-body-lg text-on-surface list-none focus:outline-none select-none">
              <span>Pengiriman & Pengembalian</span>
              <ChevronDown className="h-5 w-5 transform group-open:rotate-180 transition-transform duration-300 text-secondary" />
            </summary>
            <div className="pt-4 font-body-md text-sm text-on-surface-variant space-y-2 leading-relaxed">
              <p>Pengiriman ekspres gratis di Pulau Jawa & Bali (2-3 hari kerja). Kepulauan luar membutuhkan waktu 4-7 hari kerja.</p>
              <p>Jika Anda tidak sepenuhnya puas dengan kualitas produk, kembalikan dalam waktu 30 hari untuk pengembalian dana penuh.</p>
            </div>
          </details>
        </div>

      </div>
    </div>
  );
}
