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
  totalPrice: number
): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "628777750028";
  
  let message = `*Pesanan Sprei & Bedcover*\n\n`;
  message += `Nama: ${customer.name}\n`;
  message += `No HP: ${customer.phone}\n`;
  message += `Alamat: ${customer.address}\n\n`;
  
  message += `*Detail Pesanan:*\n`;
  items.forEach((item) => {
    const lineTotal = item.price * item.quantity;
    message += `- ${item.quantity}x ${item.name} (${item.colorSelected}, ${item.sizeSelected}) = Rp ${lineTotal.toLocaleString("id-ID")}\n`;
  });
  
  message += `\n*Subtotal: Rp ${totalPrice.toLocaleString("id-ID")}*\n`;
  message += `(Ongkos kirim akan dikonfirmasi)\n\n`;
  message += `Order ID: ${orderNumber}`;
  
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodedText}`;
}
