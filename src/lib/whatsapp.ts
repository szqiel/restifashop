import { CartItem } from "@/types";

interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
}

export function generateWhatsAppLink(
  customer: CustomerDetails,
  items: CartItem[],
  orderNumber: string,
  totalPrice: number,
  baseUrl?: string
): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "628777750028";
  
  let message = `*Pesanan Sprei & Bedcover*\n\n`;
  message += `Nama: ${customer.name}\n`;
  message += `No HP: ${customer.phone}\n`;
  message += `Alamat: ${customer.address}\n\n`;
  
  message += `*Detail Pesanan:*\n`;
  
  if (items.length > 3 && baseUrl) {
    const itemWord = items.length === 1 ? "item" : "items";
    message += `- Terdiri dari ${items.length} ${itemWord} sprei/bedcover premium pilihan.\n`;
    message += `Lihat detail pesanan lengkap di: ${baseUrl}/order-confirmation?orderNumber=${orderNumber}\n`;
  } else {
    items.forEach((item) => {
      const lineTotal = item.price * item.quantity;
      message += `- ${item.quantity}x ${item.name} (${item.colorSelected}, ${item.sizeSelected}) = Rp ${lineTotal.toLocaleString("id-ID")}\n`;
    });
  }
  
  message += `\n*Subtotal: Rp ${totalPrice.toLocaleString("id-ID")}*\n`;
  message += `(Ongkos kirim akan dikonfirmasi)\n\n`;
  message += `Order ID: ${orderNumber}`;
  
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodedText}`;
}
