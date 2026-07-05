"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { ChevronDown, ArrowRight, Check, ShoppingBag, X } from "lucide-react";

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

  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Price calculations
  const discountedPrice = product.price * (1 - product.discount_percentage / 100);

  // Map color names to Hex colors for variant circles
  const getColorHex = (colorName: string): string => {
    const name = colorName.toLowerCase().trim();
    
    // Refined theme lookbook colors
    if (name.includes("champagne")) return "#e5dfd3";
    if (name.includes("sage") || name.includes("hijau") || name.includes("green")) return "#8f9779";
    if (name.includes("taupe") || name.includes("stone")) return "#a39e93";
    if (name.includes("clay") || name.includes("terracotta") || name.includes("bata")) return "#c97d60";
    if (name.includes("charcoal") || name.includes("midnight") || name.includes("black") || name.includes("hitam")) return "#374151";
    if (name.includes("grey") || name.includes("silver") || name.includes("ash") || name.includes("abu")) return "#d1d5db";
    
    // Standard colors (English & Indonesian)
    if (name.includes("white") || name.includes("putih") || name.includes("cream") || name.includes("whi") || name.includes("wit")) return "#ffffff";
    if (name.includes("pink") || name.includes("merah muda") || name.includes("rose")) return "#e8c3be";
    if (name.includes("red") || name.includes("merah")) return "#dc2626";
    if (name.includes("yellow") || name.includes("kuning")) return "#eab308";
    if (name.includes("purple") || name.includes("ungu")) return "#a855f7";
    if (name.includes("blue") || name.includes("biru")) return "#3b82f6";
    if (name.includes("orange") || name.includes("jingga")) return "#f97316";
    if (name.includes("brown") || name.includes("cokelat") || name.includes("coklat")) return "#78350f";
    if (name.includes("gold") || name.includes("emas")) return "#d4af37";
    
    // Fallback: If it's a single word, try to use it directly in CSS, otherwise default to gold accent
    return colorName; 
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
      image: product.images[0] || "",
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    
    // Auto-open cart drawer
    setIsOpen(true);
  };

  const handleWhatsAppCheckout = () => {
    const variantId = `${product.id}-${selectedColor}-${selectedSize}`;
    
    // 1. Add to cart
    addItem({
      productId: product.id,
      variantId,
      name: product.name,
      price: discountedPrice,
      quantity: 1,
      colorSelected: selectedColor,
      sizeSelected: selectedSize,
      image: product.images[0] || "",
    });
    
    // 2. Open Checkout Form modal directly
    setIsCheckoutOpen(true);
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-20 text-left">
      {/* Back to collections link */}
      <Link
        href="/shop"
        className="inline-flex items-center gap-1.5 text-secondary hover:text-primary font-sans text-xs font-bold uppercase tracking-widest mb-10 transition-colors"
      >
        ← Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-gutter items-start">
        {/* Left Column: Image Gallery */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-surface-container-low border border-outline-variant/20 shadow-xs">
            <Image
              src={product.images[activeImageIndex] || "https://via.placeholder.com/600x800"}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 55vw"
              priority
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-20 w-20 rounded-lg overflow-hidden border cursor-pointer ${
                    activeImageIndex === idx
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-outline-variant/40"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumb ${idx}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info & Options */}
        <div className="md:col-span-5 flex flex-col gap-6 md:pl-4">
          {/* Title & Price */}
          <div className="space-y-3">
            <span className="block font-sans font-bold text-[10px] text-primary uppercase tracking-widest">
              {product.category}
            </span>
            <h1 className="font-serif text-display-xs text-on-background tracking-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-3">
              <span className="font-serif text-headline-lg text-primary">
                Rp {discountedPrice.toLocaleString("id-ID")}
              </span>
              {product.discount_percentage > 0 && (
                <>
                  <span className="font-sans text-xs text-secondary line-through">
                    Rp {product.price.toLocaleString("id-ID")}
                  </span>
                  <span className="font-sans text-xs font-bold text-error bg-error/10 px-2 py-0.5 rounded">
                    Save {product.discount_percentage}%
                  </span>
                </>
              )}
            </div>
          </div>

          <hr className="border-outline-variant/30" />

          {/* Color Selector */}
          {product.colors.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <label className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider">Warna / Motif</label>
                <span className="font-sans text-xs text-secondary font-medium">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      aria-label={color}
                      onClick={() => setSelectedColor(color)}
                      className={`h-9 w-9 rounded-full border flex items-center justify-center cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/20 scale-105"
                          : "border-outline-variant/40 hover:scale-102"
                      }`}
                      style={{ backgroundColor: getColorHex(color) }}
                    >
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary" style={{ filter: "invert(1) grayscale(1) contrast(9)" }} />
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
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-sm underline text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  Panduan Ukuran
                </button>
              </div>
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

        {/* Action Area */}
        <div className="flex flex-col gap-4 mt-4">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-on-surface text-surface py-4 px-6 rounded-full font-label-caps text-label-caps uppercase tracking-widest hover:bg-surface-tint transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span>{addedToCart ? "Dimasukkan ke Keranjang" : "Tambah ke Keranjang"}</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </button>

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
              <p>Pengiriman ekspres di Pulau Jawa & Bali (2-3 hari kerja). Kepulauan luar membutuhkan waktu 4-7 hari kerja.</p>
              <p>Jika Anda tidak sepenuhnya puas dengan kualitas produk, kembalikan dalam waktu 30 hari untuk pengembalian dana penuh.</p>
            </div>
          </details>
        </div>
      </div>
    </div>

    {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsSizeGuideOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 md:p-8 border border-outline-variant/30 shadow-xl animate-scale-up text-left">
            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-variant/40 text-on-surface-variant cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <span className="block font-sans font-bold text-[9px] text-primary uppercase tracking-widest mb-1">
              Panduan Ukuran
            </span>
            <h3 className="font-serif text-headline-md text-on-surface mb-6">
              Detail Ukuran Sprei & Bedcover
            </h3>
            
            {product.size_guide ? (
              <div className="font-sans text-xs text-on-surface-variant leading-relaxed whitespace-pre-line">
                {product.size_guide}
              </div>
            ) : (
              <div className="overflow-hidden border border-outline-variant rounded-lg">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="bg-primary-bg border-b border-outline-variant font-bold text-on-surface">
                      <th className="py-2.5 px-4">Tipe Ukuran</th>
                      <th className="py-2.5 px-4">Dimensi (Lebar x Panjang)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40 text-on-surface-variant">
                    <tr>
                      <td className="py-2.5 px-4 font-semibold">Single</td>
                      <td className="py-2.5 px-4">120 x 200 cm</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold">Double</td>
                      <td className="py-2.5 px-4">140 x 200 cm</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold">Queen</td>
                      <td className="py-2.5 px-4">160 x 200 cm</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold">King</td>
                      <td className="py-2.5 px-4">180 x 200 cm</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold">Extra King</td>
                      <td className="py-2.5 px-4">200 x 200 cm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            
            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="mt-6 w-full py-3 bg-on-surface text-surface font-sans font-bold text-label rounded-full tracking-widest uppercase hover:bg-surface-tint transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
