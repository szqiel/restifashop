"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Search,
  Download,
  Eye,
  LogOut,
  X,
  Phone,
  MapPin,
  Mail,
  Save,
  Clipboard,
  Check,
} from "lucide-react";
import Link from "next/link";

interface AdminDashboardContentProps {
  initialOrders: any[];
}

export default function AdminDashboardContent({
  initialOrders,
}: AdminDashboardContentProps) {
  const router = useRouter();
  const supabase = createClient();

  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Edit notes state
  const [notesText, setNotesText] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/ibu-restifashop");
  };

  // Status handler
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      // Update state locally
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      
      // Update selected order modal if open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err: any) {
      alert("Gagal memperbarui status order: " + err.message);
    }
  };

  // Save notes handler
  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    setSavingNotes(true);

    try {
      const { error } = await supabase
        .from("orders")
        .update({ notes: notesText })
        .eq("id", selectedOrder.id);

      if (error) throw error;

      // Update state locally
      setOrders(
        orders.map((o) =>
          o.id === selectedOrder.id ? { ...o, notes: notesText } : o
        )
      );
      setSelectedOrder({ ...selectedOrder, notes: notesText });
      alert("Catatan berhasil disimpan!");
    } catch (err: any) {
      alert("Gagal menyimpan catatan: " + err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  // Copy order summary to clipboard for logistics/record-keeping
  const handleCopyOrderText = () => {
    if (!selectedOrder) return;

    let itemsText = "";
    selectedOrder.order_items.forEach((item: any) => {
      itemsText += `- ${item.products?.name || "Sprei"} (${item.color_selected}, ${item.size_selected}) x ${item.quantity}\n`;
    });

    const summary = `*RINGKASAN PESANAN RESTIFASHOP*\n` +
      `----------------------------------------\n` +
      `No Order: ${selectedOrder.order_number}\n` +
      `Nama Pelanggan: ${selectedOrder.customer_name}\n` +
      `No HP: ${selectedOrder.customer_phone}\n` +
      `Alamat: ${selectedOrder.customer_address}\n` +
      `Email: ${selectedOrder.customer_email || "-"}\n` +
      `----------------------------------------\n` +
      `*Produk:*\n${itemsText}` +
      `----------------------------------------\n` +
      `*Total Belanja: Rp ${selectedOrder.subtotal.toLocaleString("id-ID")}*\n` +
      `Status: ${selectedOrder.status.toUpperCase()}\n` +
      `Catatan: ${selectedOrder.notes || "-"}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export orders to CSV
  const handleExportCSV = () => {
    const headers = [
      "ID Order",
      "Nama Pelanggan",
      "No HP",
      "Alamat",
      "Total Belanja (IDR)",
      "Status",
      "Catatan Internal"
    ];

    const rows = filteredOrders.map((o) => [
      o.order_number,
      o.customer_name,
      o.customer_phone,
      `"${o.customer_address.replace(/"/g, '""')}"`,
      o.subtotal,
      o.status,
      `"${(o.notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Restifashop_Pesanan_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filters logic
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const totalOrdersCount = orders.length;
  const totalRevenueSum = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.subtotal, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="flex flex-col min-h-dvh bg-primary-bg">
      {/* Admin Navbar */}
      <header className="sticky top-0 z-navbar bg-surface/85 backdrop-blur-md border-b border-outline-variant/30 text-on-surface">
        <div className="mx-auto flex h-20 max-w-container-max items-center justify-between px-margin-mobile md:px-margin-desktop">
          <Link
            href="/admin"
            className="font-serif text-headline-sm md:text-headline-md tracking-tight text-on-surface hover:opacity-85 transition-opacity flex items-center"
          >
            Restifashop{" "}
            <span className="font-sans text-[9px] uppercase font-bold tracking-widest text-on-surface-variant/70 border border-outline-variant rounded-md px-2 py-0.5 ml-2.5">
              Dashboard
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-sans text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
            >
              Lihat Toko
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 font-sans text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" /> Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Canvas */}
      <div className="flex-grow mx-auto w-full max-w-container-max px-margin-mobile md:px-margin-desktop py-10">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Card 1: Total Orders */}
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-6 shadow-2xs">
            <span className="block font-sans font-bold text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">
              Total Pesanan
            </span>
            <span className="font-serif text-3xl font-normal text-on-surface">
              {totalOrdersCount}
            </span>
          </div>

          {/* Card 2: Total Revenue */}
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-6 shadow-2xs">
            <span className="block font-sans font-bold text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">
              Total Pendapatan (Diluar Batal)
            </span>
            <span className="font-serif text-3xl font-normal text-on-surface">
              Rp {totalRevenueSum.toLocaleString("id-ID")}
            </span>
          </div>

          {/* Card 3: Pending Orders */}
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-6 shadow-2xs relative overflow-hidden">
            <span className="block font-sans font-bold text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">
              Pesanan Pending
            </span>
            <span className="font-serif text-3xl font-normal text-error">
              {pendingOrdersCount}
            </span>
            {pendingOrdersCount > 0 && (
              <span className="absolute top-4 right-4 flex h-2 w-2 rounded-full bg-error animate-ping" />
            )}
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <input
              type="text"
              placeholder="Cari order ID, nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline-variant/50 rounded-lg font-sans text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-all shadow-3xs"
            />
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-on-surface-variant/60" />
          </div>

          {/* Export CSV & Categories */}
          <div className="flex w-full md:w-auto gap-3 justify-end items-center">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-surface border border-outline-variant rounded-full font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30 transition-all btn-tactile shadow-3xs cursor-pointer"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Status filters */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-6 border-b border-outline-variant/20 hide-scrollbar">
          {[
            { name: "Semua", id: "all" },
            { name: "Pending", id: "pending" },
            { name: "Dikonfirmasi", id: "confirmed" },
            { name: "Dikirim", id: "shipped" },
            { name: "Selesai", id: "completed" },
            { name: "Dibatalkan", id: "cancelled" },
          ].map((status) => (
            <button
              key={status.id}
              onClick={() => setStatusFilter(status.id)}
              className={`px-4 py-2 rounded-full font-sans text-[9px] font-bold uppercase tracking-widest transition-all btn-tactile border cursor-pointer ${
                statusFilter === status.id
                  ? "bg-on-surface text-surface border-on-surface"
                  : "bg-surface border-outline-variant text-on-surface-variant hover:border-on-surface"
              }`}
            >
              {status.name}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-surface border border-outline-variant/40 rounded-xl shadow-xs overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="bg-surface border-b border-outline-variant/40 font-bold uppercase tracking-wider text-on-surface-variant/85">
                <th className="py-4 px-6">ID Order</th>
                <th className="py-4 px-6">Pelanggan</th>
                <th className="py-4 px-6">Tanggal</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Total Belanja</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-on-surface-variant/60 font-sans"
                  >
                    Tidak ada transaksi tercatat.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-outline-variant/20 hover:bg-surface-variant/10 transition-all"
                  >
                    <td className="py-4 px-6 font-bold text-primary">
                      {order.order_number}
                    </td>
                    <td className="py-4 px-6">
                      <span className="block font-bold text-on-surface">
                        {order.customer_name}
                      </span>
                      <span className="block text-[10px] text-on-surface-variant">
                        {order.customer_phone}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        className={`mx-auto block text-[9px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-full border cursor-pointer focus:outline-none ${
                          order.status === "completed"
                            ? "bg-green-100/50 border-green-300/50 text-green-800"
                            : order.status === "shipped"
                            ? "bg-purple-100/50 border-purple-300/50 text-purple-850"
                            : order.status === "confirmed"
                            ? "bg-blue-100/50 border-blue-300/50 text-blue-800"
                            : order.status === "cancelled"
                            ? "bg-red-100/50 border-red-300/50 text-red-800"
                            : "bg-amber-100/50 border-amber-300/50 text-amber-800"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Dikonfirmasi</option>
                        <option value="shipped">Dikirim</option>
                        <option value="completed">Selesai</option>
                        <option value="cancelled">Batal</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-on-surface">
                      Rp {order.subtotal.toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setNotesText(order.notes || "");
                        }}
                        className="p-2 text-on-surface hover:bg-surface-variant/30 rounded-md transition-colors btn-tactile cursor-pointer"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-surface p-6 md:p-8 border border-outline-variant/30 shadow-xl animate-scale-up max-h-[90vh] overflow-y-auto hide-scrollbar">
            {/* Close */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-variant/40 text-on-surface-variant btn-tactile"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="block font-sans font-bold text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">
              Rincian Pesanan
            </span>
            <h2 className="font-serif text-display-xs text-on-surface mb-6">
              {selectedOrder.order_number}
            </h2>

            {/* Customer Details Box */}
            <div className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-primary-bg p-4 mb-6 text-xs text-on-surface-variant">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-on-surface-variant" />
                <div>
                  <span className="block font-bold text-on-surface">
                    {selectedOrder.customer_name}
                  </span>
                  <a
                    href={`https://wa.me/${selectedOrder.customer_phone}`}
                    target="_blank"
                    className="text-primary font-semibold hover:underline flex items-center gap-1 mt-0.5"
                  >
                    {selectedOrder.customer_phone} (Hubungi WhatsApp)
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-outline-variant/40 pt-3">
                <MapPin className="h-4 w-4 text-on-surface-variant" />
                <span className="leading-relaxed">
                  {selectedOrder.customer_address}
                </span>
              </div>
              {selectedOrder.customer_email && (
                <div className="flex items-center gap-3 border-t border-outline-variant/40 pt-3">
                  <Mail className="h-4 w-4 text-on-surface-variant" />
                  <span>{selectedOrder.customer_email}</span>
                </div>
              )}
            </div>

            {/* Items Summary Box */}
            <div className="border border-outline-variant/60 rounded-xl p-4 mb-6 bg-primary-bg">
              <h3 className="font-serif text-body-md text-on-surface mb-3 font-semibold">
                Detail Produk
              </h3>
              <div className="flex flex-col gap-3">
                {selectedOrder.order_items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-xs text-on-surface-variant"
                  >
                    <div>
                      <span className="block font-bold text-on-surface">
                        {item.products?.name || "Produk Bedding"}
                      </span>
                      <span className="block text-[10px] text-on-surface-variant/80 mt-0.5">
                        Warna: {item.color_selected} / Ukuran: {item.size_selected}
                      </span>
                    </div>
                    <span className="text-on-surface font-semibold whitespace-nowrap">
                      {item.quantity}x @ Rp{" "}
                      {item.price_at_purchase.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-outline-variant/40 pt-3 mt-3 flex justify-between font-sans text-sm font-bold text-on-surface">
                <span>Subtotal</span>
                <span className="text-primary text-base">
                  Rp {selectedOrder.subtotal.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Internal Seller Notes */}
            <div className="mb-6 text-left">
              <label className="block font-sans font-bold text-[9px] text-on-surface-variant uppercase tracking-widest mb-2">
                Catatan Penjual (Internal)
              </label>
              <textarea
                rows={3}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="cth: Pembayaran lunas via transfer BNI Rp 350.000, dikirim via JNE Resi: 123456..."
                className="w-full border border-outline-variant/50 rounded-lg px-3 py-2 bg-surface font-sans text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none resize-none shadow-2xs"
              />
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="mt-2 py-2.5 px-4 bg-on-surface text-surface font-sans font-bold text-[9px] uppercase tracking-widest rounded-full hover:bg-surface-tint transition-all flex items-center gap-1.5 ml-auto btn-tactile cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                {savingNotes ? "Menyimpan..." : "Simpan Catatan"}
              </button>
            </div>

            {/* Copy & Status Select Controls */}
            <div className="flex flex-col sm:flex-row gap-3 border-t border-outline-variant/20 pt-6">
              <button
                onClick={handleCopyOrderText}
                className="flex-grow py-3 bg-surface border border-outline-variant text-on-surface font-sans font-bold text-label rounded-full tracking-widest uppercase hover:bg-surface-variant/30 transition-all flex items-center justify-center gap-1.5 btn-tactile cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Berhasil Disalin!
                  </>
                ) : (
                  <>
                    <Clipboard className="h-4 w-4" />
                    Salin Info Order
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="py-3 px-6 bg-on-surface text-surface font-sans font-bold text-label rounded-full tracking-widest uppercase transition-all hover:bg-surface-tint btn-tactile cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
