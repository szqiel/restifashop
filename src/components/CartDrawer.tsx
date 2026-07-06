"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeItem,
    getTotalPrice,
    setIsCheckoutOpen,
  } = useCartStore();

  // Prevent scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckoutClick = () => {
    setIsOpen(false);
    setIsCheckoutOpen(true);
  };

  const totalPrice = getTotalPrice();

  return (
    <div className="fixed inset-0 z-modal flex justify-end">
      {/* Backdrop with darker overlay and stronger blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Cart Container */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-surface shadow-xl animate-slide-in-right border-l border-outline-variant/20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/30 px-6 py-6">
          <h2 className="font-serif text-headline-md text-on-surface">Keranjang Belanja</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-dim btn-tactile text-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">
          {items.length === 0 ? (
            // Empty State
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="h-16 w-16 text-secondary mb-4 stroke-[1.5]" />
              <h3 className="font-serif text-headline-md text-on-surface mb-2">Keranjang Anda Kosong</h3>
              <p className="font-sans text-sm text-on-surface-variant mb-8 max-w-[280px]">
                Jelajahi koleksi sprei dan bedcover premium kami untuk tidur yang lebih berkualitas.
              </p>
              <Link
                href="/shop"
                onClick={() => setIsOpen(false)}
                className="gold-button inline-block rounded-xl bg-primary-container px-7 py-3.5 font-label-caps text-label-caps uppercase tracking-wider text-on-primary-container"
              >
                Jelajahi Koleksi
              </Link>
            </div>
          ) : (
            // Items List
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-start gap-4 border-b border-outline-variant/10 pb-4 last:border-0"
                >
                  {/* Thumbnail */}
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-outline-variant/20 bg-surface-dim">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                     quality={95} />
                  </div>

                  {/* Item Info */}
                  <div className="flex-grow text-left">
                    <h4 className="font-serif text-body-md text-on-surface mb-1 line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="font-sans text-xs text-on-surface-variant mb-3">
                      Varian: {item.colorSelected} / {item.sizeSelected}
                    </p>

                    <div className="flex items-center justify-between">
                      {/* Quantity Selector */}
                      <div className="flex items-center rounded-md border border-outline-variant/30 bg-surface-dim p-1">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-on-surface-variant hover:text-primary btn-tactile"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-sans text-sm font-semibold text-on-surface">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-on-surface-variant hover:text-primary btn-tactile"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Price & Remove */}
                      <div className="flex items-center gap-3">
                        <span className="font-sans text-sm font-bold text-primary">
                          Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                        </span>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-on-surface-variant hover:text-error transition-colors btn-tactile p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary (Sticky bottom) */}
        {items.length > 0 && (
          <div className="border-t border-outline-variant/30 bg-surface p-6 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-4">
              <span className="font-sans text-sm font-bold uppercase tracking-widest text-on-surface-variant">
                Subtotal
              </span>
              <span className="font-serif text-headline-md text-primary font-bold">
                Rp {totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
            <p className="font-sans text-[11px] text-on-surface-variant italic mb-6 text-left">
              *Ongkos kirim akan dikonfirmasi oleh seller via WhatsApp.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleCheckoutClick}
                className="gold-button w-full rounded-full bg-primary-container px-6 py-4 font-label-caps text-label-caps uppercase tracking-widest text-on-primary-container flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Lanjutkan ke Checkout</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full rounded-full border border-outline-variant px-6 py-3.5 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:bg-surface-dim transition-colors btn-tactile cursor-pointer"
              >
                Kembali Belanja
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
