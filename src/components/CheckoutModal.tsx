"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { X, Send, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CheckoutModal() {
  const {
    items,
    isCheckoutOpen,
    setIsCheckoutOpen,
    getTotalPrice,
    clearCart,
  } = useCartStore();

  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isCheckoutOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const totalPrice = getTotalPrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Simple validations
    if (!name.trim()) return setError("Nama lengkap wajib diisi");
    if (!phone.trim()) return setError("Nomor WhatsApp wajib diisi");
    if (!address.trim()) return setError("Alamat pengiriman lengkap wajib diisi");

    // Validate email format if provided
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError("Format email tidak valid (cth: nama@email.com)");
    }

    // Phone format sanitization (support 08 -> 62 conversion, allow international length)
    let sanitizedPhone = phone.replace(/[^0-9]/g, "");
    if (sanitizedPhone.startsWith("0")) {
      sanitizedPhone = "62" + sanitizedPhone.slice(1);
    }
    if (sanitizedPhone.length < 9 || sanitizedPhone.length > 15) {
      return setError("Nomor WhatsApp tidak valid. Gunakan nomor dengan panjang 9-15 digit.");
    }

    setLoading(true);

    try {
      // Call Next.js API Route to create order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: name,
          customer_phone: sanitizedPhone,
          customer_address: address,
          customer_email: email || null,
          cart_items: items.map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
            color_selected: item.colorSelected,
            size_selected: item.sizeSelected,
            price_at_purchase: item.price,
            product_name: item.name, // Pass to make generating WA text easy
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Gagal memproses pesanan.");
      }

      const { order_number, whatsapp_link } = result.data;

      // Clear the shopping cart
      clearCart();
      setIsCheckoutOpen(false);

      // Open WhatsApp deep link in new tab
      window.open(whatsapp_link, "_blank");

      // Redirect customer to Order Confirmation Page
      router.push(`/order-confirmation?orderNumber=${order_number}`);
    } catch (err: any) {
      setError(err.message || "Koneksi bermasalah. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={() => !loading && setIsCheckoutOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 md:p-8 shadow-xl animate-scale-up max-h-[90vh] overflow-y-auto hide-scrollbar">
        {/* Close Button */}
        <button
          onClick={() => setIsCheckoutOpen(false)}
          disabled={loading}
          className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-dim text-text-secondary disabled:opacity-50 btn-tactile"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="font-serif text-h1 text-text-primary mb-6">Informasi Pengiriman</h2>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-error/10 p-4 text-xs font-semibold text-error mb-6">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name */}
          <div>
            <label className="block font-sans font-bold text-label text-text-primary uppercase tracking-widest mb-2">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              disabled={loading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="cth: Syair Adharian"
              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg font-sans text-sm text-on-surface placeholder:text-text-muted focus:border-primary focus:outline-none transition-all shadow-2xs"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block font-sans font-bold text-label text-text-primary uppercase tracking-widest mb-2">
              Nomor WhatsApp *
            </label>
            <input
              type="tel"
              required
              disabled={loading}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="cth: 08123456789"
              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg font-sans text-sm text-on-surface placeholder:text-text-muted focus:border-primary focus:outline-none transition-all shadow-2xs"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block font-sans font-bold text-label text-text-primary uppercase tracking-widest mb-2">
              Alamat Lengkap Pengiriman *
            </label>
            <textarea
              required
              rows={3}
              disabled={loading}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="cth: Jalan Melati No. 12, RT 03/RW 04, Kec. Gajahmungkur, Kota Semarang"
              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg font-sans text-sm text-on-surface placeholder:text-text-muted focus:border-primary focus:outline-none transition-all shadow-2xs resize-none"
            />
          </div>

          {/* Email (Optional) */}
          <div>
            <label className="block font-sans font-bold text-label text-text-primary uppercase tracking-widest mb-2">
              Email (Opsional)
            </label>
            <input
              type="email"
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cth: siti@example.com"
              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg font-sans text-sm text-on-surface placeholder:text-text-muted focus:border-primary focus:outline-none transition-all shadow-2xs"
            />
          </div>

          {/* Order Summary */}
          <div className="rounded-md border border-border-custom/50 bg-surface-dim p-4 mt-2">
            <h3 className="font-serif text-body-md text-text-primary mb-3 font-semibold">
              Ringkasan Pesanan
            </h3>
            <div className="flex flex-col gap-2 max-h-24 overflow-y-auto hide-scrollbar">
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between text-xs text-text-secondary">
                  <span className="line-clamp-1 max-w-[260px]">
                    {item.name} ({item.colorSelected}, {item.sizeSelected}) x{item.quantity}
                  </span>
                  <span>Rp {(item.price * item.quantity).toLocaleString("id-ID")}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border-custom/50 pt-3 mt-3 flex justify-between font-sans text-sm font-bold text-text-primary">
              <span>Subtotal</span>
              <span className="text-primary text-base font-bold">
                Rp {totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
            <p className="text-[10px] text-text-muted italic mt-2 text-right">
              *Belum termasuk ongkir.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-3 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-grow py-4 bg-on-surface text-surface font-label-caps text-label-caps rounded-full uppercase tracking-widest hover:bg-surface-tint transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 btn-tactile cursor-pointer"
            >
              <Send className="h-4 w-4" />
              {loading ? "Memproses..." : "Konfirmasi & Kirim WA"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setIsCheckoutOpen(false)}
              className="py-4 px-6 border border-outline-variant text-on-surface-variant font-label-caps text-label-caps rounded-full tracking-widest uppercase hover:bg-surface-dim transition-colors disabled:opacity-50 btn-tactile cursor-pointer"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
