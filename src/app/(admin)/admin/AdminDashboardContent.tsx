"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { LogOut, Search, Download, Clipboard, Check, Phone, Mail, MapPin, Eye, Save, AlertCircle, X } from "lucide-react";
import Link from "next/link";

interface AdminDashboardContentProps {
  initialOrders: any[];
}

export default function AdminDashboardContent({ initialOrders }: AdminDashboardContentProps) {
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
    router.push("/admin/login");
  };

  // Status handler
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      alert("Gagal memperbarui status order");
      console.error(err);
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

      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, notes: notesText } : o));
      setSelectedOrder({ ...selectedOrder, notes: notesText });
      alert("Catatan berhasil disimpan!");
    } catch (err) {
      alert("Gagal menyimpan catatan");
      console.error(err);
    } finally {
      setSavingNotes(false);
    }
  };

  // Copy order text handler
  const handleCopyOrderText = () => {
    if (!selectedOrder) return;
    const itemsText = selectedOrder.order_items
      .map((item: any) => `- ${item.quantity}x ${item.products?.name || "Item"} (${item.color_selected}, ${item.size_selected})`)
      .join("\n");

    const textToCopy = `ORD ID: ${selectedOrder.order_number}\nPelanggan: ${selectedOrder.customer_name}\nTelepon: ${selectedOrder.customer_phone}\nAlamat: ${selectedOrder.customer_address}\n\nDetail:\n${itemsText}\n\nSubtotal: Rp ${selectedOrder.subtotal.toLocaleString("id-ID")}`;
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // CSV Exporter
  const handleExportCSV = () => {
    const headers = ["Nomor Order", "Tanggal", "Pelanggan", "Telepon", "Alamat", "Total Belanja", "Status", "Catatan"];
    const rows = filteredOrders.map(o => [
      o.order_number,
      new Date(o.created_at).toLocaleDateString("id-ID"),
      o.customer_name,
      o.customer_phone,
      `"${o.customer_address.replace(/"/g, '""')}"`,
      o.subtotal,
      o.status,
      `"${(o.notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Restifashop_Pesanan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filters logic
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const totalOrdersCount = orders.length;
  const totalRevenueSum = orders
    .filter(o => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.subtotal, 0);
  const pendingOrdersCount = orders.filter(o => o.status === "pending").length;

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Admin Navbar */}
      <header className="bg-text-primary text-white sticky top-0 z-50">
        <div className="mx-auto flex h-20 max-w-container-max items-center justify-between px-margin-mobile md:px-margin-desktop">
          <Link href="/admin" className="font-serif text-lg md:text-display-sm text-accent tracking-tighter hover:opacity-85 transition-opacity">
            Restifashop <span className="font-sans text-xs uppercase font-bold tracking-widest text-text-muted ml-2">Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="font-sans text-xs font-bold uppercase tracking-widest text-white hover:text-accent transition-colors">
              Lihat Toko
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 font-sans text-xs font-bold uppercase tracking-widest text-text-muted hover:text-white transition-colors cursor-pointer"
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
          <div className="bg-white border border-border-custom/50 rounded-md p-6 shadow-sm">
            <span className="block font-sans font-bold text-[10px] text-text-muted uppercase tracking-widest mb-1">
              Total Pesanan
            </span>
            <span className="font-sans text-3xl font-bold text-text-primary">
              {totalOrdersCount}
            </span>
          </div>

          {/* Card 2: Total Revenue */}
          <div className="bg-white border border-border-custom/50 rounded-md p-6 shadow-sm">
            <span className="block font-sans font-bold text-[10px] text-text-muted uppercase tracking-widest mb-1">
              Total Pendapatan (Diluar Batal)
            </span>
            <span className="font-sans text-3xl font-bold text-accent">
              Rp {totalRevenueSum.toLocaleString("id-ID")}
            </span>
          </div>

          {/* Card 3: Pending Orders */}
          <div className="bg-white border border-border-custom/50 rounded-md p-6 shadow-sm relative overflow-hidden">
            <span className="block font-sans font-bold text-[10px] text-text-muted uppercase tracking-widest mb-1">
              Pesanan Pending
            </span>
            <span className="font-sans text-3xl font-bold text-error">
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
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-border-custom/50 rounded-md font-sans text-xs text-text-primary focus:border-accent focus:outline-none transition-colors shadow-xs"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
          </div>

          {/* Export CSV & Categories */}
          <div className="flex w-full md:w-auto gap-3 justify-end items-center">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-border-custom/50 rounded-md font-sans text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-accent hover:border-accent/50 transition-all btn-tactile shadow-xs cursor-pointer"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Status filters */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-6 border-b border-border-custom/20 hide-scrollbar">
          {[
            { name: "Semua", id: "all" },
            { name: "Pending", id: "pending" },
            { name: "Dikonfirmasi", id: "confirmed" },
            { name: "Dikirim", id: "shipped" },
            { name: "Selesai", id: "completed" },
            { name: "Dibatalkan", id: "cancelled" },
          ].map(status => (
            <button
              key={status.id}
              onClick={() => setStatusFilter(status.id)}
              className={`px-4 py-2 rounded-full font-sans text-[10px] font-bold uppercase tracking-widest transition-all btn-tactile border ${
                statusFilter === status.id
                  ? "bg-text-primary text-white border-text-primary"
                  : "bg-white border-border-custom/50 text-text-secondary hover:border-text-primary/50"
              }`}
            >
              {status.name}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-border-custom/50 rounded-md shadow-sm overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="bg-surface-dim border-b border-border-custom/50 font-bold uppercase tracking-wider text-text-secondary">
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
                  <td colSpan={6} className="py-12 text-center text-text-muted font-sans">
                    Tidak ada transaksi tercatat.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="border-b border-border-custom/20 hover:bg-surface-dim/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-accent">{order.order_number}</td>
                    <td className="py-4 px-6">
                      <span className="block font-bold text-text-primary">{order.customer_name}</span>
                      <span className="block text-[10px] text-text-muted">{order.customer_phone}</span>
                    </td>
                    <td className="py-4 px-6 text-text-muted">
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`mx-auto block text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-full border cursor-pointer focus:outline-none ${
                          order.status === "completed"
                            ? "bg-success/10 border-success/30 text-success"
                            : order.status === "shipped"
                            ? "bg-accent/15 border-accent/40 text-accent"
                            : order.status === "confirmed"
                            ? "bg-blue-500/10 border-blue-500/30 text-blue-600"
                            : order.status === "cancelled"
                            ? "bg-error/10 border-error/30 text-error"
                            : "bg-yellow-500/10 border-yellow-500/30 text-yellow-700"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Dikonfirmasi</option>
                        <option value="shipped">Dikirim</option>
                        <option value="completed">Selesai</option>
                        <option value="cancelled">Batal</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-text-primary">
                      Rp {order.subtotal.toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setNotesText(order.notes || "");
                        }}
                        className="p-2 text-accent hover:bg-surface-dim rounded-md transition-colors btn-tactile cursor-pointer"
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
          
          <div className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 md:p-8 shadow-xl animate-scale-up max-h-[90vh] overflow-y-auto hide-scrollbar">
            {/* Close */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-dim text-text-secondary btn-tactile"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="block font-sans font-bold text-[9px] text-accent uppercase tracking-widest mb-1">
              Rincian Pesanan
            </span>
            <h2 className="font-serif text-h1 text-text-primary mb-6">
              {selectedOrder.order_number}
            </h2>

            {/* Customer Details Box */}
            <div className="flex flex-col gap-3 rounded-md border border-border-custom/50 bg-surface-dim p-4 mb-6 text-xs text-text-secondary">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-accent" />
                <div>
                  <span className="block font-bold text-text-primary">{selectedOrder.customer_name}</span>
                  <a
                    href={`https://wa.me/${selectedOrder.customer_phone}`}
                    target="_blank"
                    className="text-accent font-semibold hover:underline flex items-center gap-1 mt-0.5"
                  >
                    {selectedOrder.customer_phone} (Hubungi WhatsApp)
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-border-custom/20 pt-3">
                <MapPin className="h-4 w-4 text-accent" />
                <span className="leading-relaxed">{selectedOrder.customer_address}</span>
              </div>
              {selectedOrder.customer_email && (
                <div className="flex items-center gap-3 border-t border-border-custom/20 pt-3">
                  <Mail className="h-4 w-4 text-accent" />
                  <span>{selectedOrder.customer_email}</span>
                </div>
              )}
            </div>

            {/* Items Summary Box */}
            <div className="border border-border-custom/50 rounded-md p-4 mb-6">
              <h3 className="font-serif text-body-md text-text-primary mb-3 font-semibold">
                Detail Produk
              </h3>
              <div className="flex flex-col gap-3">
                {selectedOrder.order_items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-xs text-text-secondary">
                    <div>
                      <span className="block font-bold text-text-primary">
                        {item.products?.name || "Produk Bedding"}
                      </span>
                      <span className="block text-[10px] text-text-muted mt-0.5">
                        Warna: {item.color_selected} / Ukuran: {item.size_selected}
                      </span>
                    </div>
                    <span className="text-text-primary font-semibold whitespace-nowrap">
                      {item.quantity}x @ Rp {item.price_at_purchase.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border-custom/30 pt-3 mt-3 flex justify-between font-sans text-sm font-bold text-text-primary">
                <span>Subtotal</span>
                <span className="text-accent text-base">
                  Rp {selectedOrder.subtotal.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Internal Seller Notes */}
            <div className="mb-6">
              <label className="block font-sans font-bold text-[10px] text-text-primary uppercase tracking-widest mb-2">
                Catatan Penjual (Internal)
              </label>
              <textarea
                rows={3}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="cth: Pembayaran lunas via transfer BNI Rp 350.000, dikirim via JNE Resi: 123456..."
                className="w-full border border-border-custom/50 rounded-md px-3 py-2 bg-transparent font-sans text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none resize-none"
              />
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="mt-2 py-2 px-4 bg-text-primary text-white font-sans font-bold text-[10px] uppercase tracking-widest rounded-md hover:bg-accent transition-colors flex items-center gap-1.5 ml-auto btn-tactile cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                {savingNotes ? "Menyimpan..." : "Simpan Catatan"}
              </button>
            </div>

            {/* Copy & Status Select Controls */}
            <div className="flex flex-col sm:flex-row gap-3 border-t border-border-custom/20 pt-6">
              <button
                onClick={handleCopyOrderText}
                className="flex-grow py-3 border border-border-custom text-text-secondary font-sans font-bold text-label rounded-md tracking-widest uppercase hover:bg-surface-dim transition-colors flex items-center justify-center gap-1.5 btn-tactile cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-success" />
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
                className="py-3 px-6 bg-accent text-white font-sans font-bold text-label rounded-md tracking-widest uppercase transition-all hover:opacity-95 btn-tactile cursor-pointer"
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
