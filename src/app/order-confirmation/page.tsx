import Link from "next/link";
import { CheckCircle2, ArrowLeft } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrderConfirmationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const orderNumber = (params.orderNumber as string) || "ORD-XXXXXXXX-XXX";

  return (
    <main className="flex-grow flex items-center justify-center py-20 px-margin-mobile md:px-margin-desktop min-h-dvh">
      <div className="surface-panel w-full max-w-md rounded-2xl p-8 text-center animate-scale-up">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-10 w-10 stroke-[1.5]" />
          </div>
        </div>

        {/* Heading */}
        <p className="mb-2 font-label-caps text-label-caps uppercase tracking-widest text-primary">Checkout</p>
        <h1 className="font-serif text-h1 text-text-primary mb-3">
          Pesanan Dikirim!
        </h1>
        <p className="font-sans text-sm text-text-secondary mb-6">
          Detail pesanan Anda telah berhasil dibuat di sistem dan diteruskan ke WhatsApp customer service kami.
        </p>

        {/* Order Details box */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-dim p-4 mb-8">
          <span className="block font-sans font-bold text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Nomor Pesanan Anda
          </span>
          <span className="font-sans text-lg font-bold text-primary tracking-wide">
            {orderNumber}
          </span>
        </div>

        {/* Next Steps Info */}
        <div className="mb-8 flex flex-col gap-4 border-t border-outline-variant/10 pt-6 text-left text-xs text-on-surface-variant">
          <h3 className="font-serif text-sm text-on-surface font-semibold mb-1">
            Langkah Selanjutnya:
          </h3>
          <div className="flex gap-3">
            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-sans text-[10px] font-bold">
              1
            </div>
            <p>Jika chat WhatsApp belum terbuka otomatis, silakan periksa aplikasi WhatsApp Anda.</p>
          </div>
          <div className="flex gap-3">
            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-sans text-[10px] font-bold">
              2
            </div>
            <p>Admin kami akan segera meninjau pesanan, menghitung ongkos kirim ke alamat Anda, dan membalas chat Anda (biasanya dalam 1 jam).</p>
          </div>
          <div className="flex gap-3">
            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-sans text-[10px] font-bold">
              3
            </div>
            <p>Pembayaran dapat dilakukan setelah ongkos kirim disepakati via WhatsApp (Transfer Bank / COD).</p>
          </div>
        </div>

        {/* Back Button */}
        <Link
          href="/"
          className="gold-button flex w-full items-center justify-center gap-2 rounded-full bg-primary-container py-4 font-label-caps text-label-caps uppercase tracking-widest text-on-primary-container btn-tactile cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali Berbelanja
        </Link>
      </div>
    </main>
  );
}
