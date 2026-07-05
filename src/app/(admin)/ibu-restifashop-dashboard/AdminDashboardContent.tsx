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
  Plus,
  Trash2,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface AdminDashboardContentProps {
  initialOrders: any[];
  initialProducts: any[];
}

export default function AdminDashboardContent({
  initialOrders,
  initialProducts,
}: AdminDashboardContentProps) {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");
  const [orders, setOrders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);

  // Orders filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Edit notes state
  const [notesText, setNotesText] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [copied, setCopied] = useState(false);

  // Products manager state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Add product form states
  const [pName, setPName] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pCategory, setPCategory] = useState("sprei");
  const [pCustomCategory, setPCustomCategory] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pDiscount, setPDiscount] = useState("0");
  const [pStock, setPStock] = useState("10");
  const [pColors, setPColors] = useState("");
  const [pSizes, setPSizes] = useState("");
  const [pMaterial, setPMaterial] = useState("");
  const [pCare, setPCare] = useState("");
  const [pSizeGuide, setPSizeGuide] = useState("");
  const [pImages, setPImages] = useState(""); // comma-separated URLs

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

  // Copy order summary to clipboard
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

  // Upload image to Supabase Storage
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error("Gagal mengunggah file. Silakan pastikan bucket 'product-images' sudah dibuat di Storage Supabase dengan akses 'public'.");
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        const currentUrls = pImages.trim() ? pImages.split(",") : [];
        setPImages([...currentUrls, data.publicUrl].join(","));
        alert("Gambar berhasil diunggah!");
      }
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah gambar.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Add product submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pName.trim()) return alert("Nama produk wajib diisi");
    if (!pPrice || parseFloat(pPrice) <= 0) return alert("Harga produk harus lebih dari 0");

    const categoryToSave = pCategory === "custom" 
      ? pCustomCategory.trim().toLowerCase() 
      : pCategory.toLowerCase();

    if (!categoryToSave) return alert("Kategori produk wajib ditentukan");

    const colorsArray = pColors.split(",").map(c => c.trim()).filter(Boolean);
    const sizesArray = pSizes.split(",").map(s => s.trim()).filter(Boolean);
    const imagesArray = pImages.split(",").map(img => img.trim()).filter(Boolean);

    if (imagesArray.length === 0) {
      imagesArray.push("https://via.placeholder.com/600x800?text=No+Image");
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            name: pName.trim(),
            description: pDesc.trim(),
            price: parseFloat(pPrice),
            discount_percentage: parseInt(pDiscount) || 0,
            category: categoryToSave,
            colors: colorsArray,
            sizes: sizesArray,
            images: imagesArray,
            material: pMaterial.trim() || null,
            care_instructions: pCare.trim() || null,
            size_guide: pSizeGuide.trim() || null,
            stock: parseInt(pStock) || 0,
            sold_count: 0
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Update state locally
      setProducts([data, ...products]);
      setIsAddProductOpen(false);
      
      // Clear form
      setPName("");
      setPDesc("");
      setPCategory("sprei");
      setPCustomCategory("");
      setPPrice("");
      setPDiscount("0");
      setPStock("10");
      setPColors("");
      setPSizes("");
      setPImages("");
      setPMaterial("");
      setPCare("");
      setPSizeGuide("");

      alert("Produk berhasil ditambahkan!");
    } catch (err: any) {
      alert("Gagal menambahkan produk: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== id));
      alert("Produk berhasil dihapus!");
    } catch (err: any) {
      alert("Gagal menghapus produk: " + err.message);
    }
  };

  // Orders filtering logic
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
            href="/ibu-restifashop-dashboard"
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
        
        {/* Tab Selection Row */}
        <div className="flex gap-4 border-b border-outline-variant/30 pb-4 mb-8">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-2.5 font-sans font-bold text-xs uppercase tracking-widest rounded-full cursor-pointer transition-all border ${
              activeTab === "orders"
                ? "bg-on-surface text-surface border-on-surface"
                : "bg-surface border-outline-variant text-on-surface-variant hover:border-on-surface"
            }`}
          >
            Kelola Pesanan
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-5 py-2.5 font-sans font-bold text-xs uppercase tracking-widest rounded-full cursor-pointer transition-all border ${
              activeTab === "products"
                ? "bg-on-surface text-surface border-on-surface"
                : "bg-surface border-outline-variant text-on-surface-variant hover:border-on-surface"
            }`}
          >
            Kelola Produk
          </button>
        </div>

        {activeTab === "orders" ? (
          <>
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

              {/* Export CSV Button */}
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
                                ? "bg-purple-100/50 border-purple-300/50 text-purple-800"
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
          </>
        ) : (
          <>
            {/* Products Control Row */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-headline-md text-on-surface">
                Daftar Produk ({products.length})
              </h2>
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-on-surface text-surface font-sans font-bold text-[10px] uppercase tracking-widest rounded-full hover:bg-surface-tint transition-all shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Tambah Produk
              </button>
            </div>

            {/* Products Management Table */}
            <div className="bg-surface border border-outline-variant/40 rounded-xl shadow-xs overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs font-sans">
                <thead>
                  <tr className="bg-surface border-b border-outline-variant/40 font-bold uppercase tracking-wider text-on-surface-variant/85">
                    <th className="py-4 px-6 w-16">Foto</th>
                    <th className="py-4 px-6">Nama Produk</th>
                    <th className="py-4 px-6">Kategori</th>
                    <th className="py-4 px-6 text-right">Harga (IDR)</th>
                    <th className="py-4 px-6 text-center">Stok</th>
                    <th className="py-4 px-6 text-center">Terjual</th>
                    <th className="py-4 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-on-surface-variant/60 font-sans"
                      >
                        Tidak ada produk terdaftar. Silakan tambah produk baru.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const displayPrice =
                        product.price * (1 - product.discount_percentage / 100);
                      return (
                        <tr
                          key={product.id}
                          className="border-b border-outline-variant/20 hover:bg-surface-variant/10 transition-all align-middle"
                        >
                          <td className="py-4 px-6">
                            <div className="relative h-12 w-10 overflow-hidden rounded border border-outline-variant/40 bg-surface-dim">
                              <Image
                                src={
                                  product.images?.[0] ||
                                  "https://via.placeholder.com/400"
                                }
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="block font-bold text-on-surface text-sm">
                              {product.name}
                            </span>
                            {product.discount_percentage > 0 && (
                              <span className="inline-block mt-0.5 bg-red-100 text-red-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                SALE -{product.discount_percentage}%
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-block bg-surface-variant/40 border border-outline-variant/30 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
                              {product.category}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-semibold">
                            {product.discount_percentage > 0 ? (
                              <div>
                                <span className="block text-on-surface">
                                  Rp {displayPrice.toLocaleString("id-ID")}
                                </span>
                                <span className="block text-[10px] text-on-surface-variant/60 line-through mt-0.5">
                                  Rp {product.price.toLocaleString("id-ID")}
                                </span>
                              </div>
                            ) : (
                              <span className="text-on-surface">
                                Rp {product.price.toLocaleString("id-ID")}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center font-bold">
                            <span
                              className={
                                product.stock === 0 ? "text-error" : "text-on-surface"
                              }
                            >
                              {product.stock}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center text-on-surface-variant">
                            {product.sold_count}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-error hover:bg-red-500/10 rounded-md transition-colors btn-tactile cursor-pointer"
                              title="Hapus Produk"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
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

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsAddProductOpen(false)}
          />

          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-surface p-6 md:p-8 border border-outline-variant/30 shadow-xl animate-scale-up max-h-[90vh] overflow-y-auto hide-scrollbar text-left">
            {/* Close */}
            <button
              onClick={() => setIsAddProductOpen(false)}
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-variant/40 text-on-surface-variant btn-tactile"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="block font-sans font-bold text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">
              Manajemen Produk
            </span>
            <h2 className="font-serif text-headline-lg text-on-surface mb-6">
              Tambah Produk Baru
            </h2>

            <form onSubmit={handleAddProductSubmit} className="flex flex-col gap-5">
              {/* Product Name */}
              <div>
                <label className="block font-sans font-bold text-[9px] text-on-surface-variant uppercase tracking-widest mb-1.5">
                  Nama Produk
                </label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="cth: Aurelian Signature Bedcover Set"
                  className="w-full border border-outline-variant/50 rounded-lg px-3 py-2 bg-surface font-sans text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-all shadow-2xs"
                />
              </div>

              {/* Category / Type & Custom Category Option */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans font-bold text-[9px] text-on-surface-variant uppercase tracking-widest mb-1.5">
                    Kategori / Tipe
                  </label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="w-full border border-outline-variant/50 rounded-lg px-3 py-2 bg-surface font-sans text-xs text-on-surface focus:border-primary focus:outline-none transition-all shadow-2xs h-[38px] cursor-pointer"
                  >
                    <option value="sprei">Sprei</option>
                    <option value="bedcover">Bedcover</option>
                    <option value="selimut">Selimut</option>
                    <option value="aksesoris">Aksesoris</option>
                    <option value="custom">Kategori Baru...</option>
                  </select>
                </div>

                {pCategory === "custom" && (
                  <div>
                    <label className="block font-sans font-bold text-[9px] text-on-surface-variant uppercase tracking-widest mb-1.5">
                      Nama Kategori Baru
                    </label>
                    <input
                      type="text"
                      required
                      value={pCustomCategory}
                      onChange={(e) => setPCustomCategory(e.target.value)}
                      placeholder="cth: Bantal"
                      className="w-full border border-outline-variant/50 rounded-lg px-3 py-2 bg-surface font-sans text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-all shadow-2xs"
                    />
                  </div>
                )}
              </div>

              {/* Price & Discount & Stock */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-sans font-bold text-[9px] text-on-surface-variant uppercase tracking-widest mb-1.5">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    placeholder="350000"
                    className="w-full border border-outline-variant/50 rounded-lg px-3 py-2 bg-surface font-sans text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-all shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block font-sans font-bold text-[9px] text-on-surface-variant uppercase tracking-widest mb-1.5">
                    Diskon (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={pDiscount}
                    onChange={(e) => setPDiscount(e.target.value)}
                    placeholder="10"
                    className="w-full border border-outline-variant/50 rounded-lg px-3 py-2 bg-surface font-sans text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-all shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block font-sans font-bold text-[9px] text-on-surface-variant uppercase tracking-widest mb-1.5">
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    placeholder="10"
                    className="w-full border border-outline-variant/50 rounded-lg px-3 py-2 bg-surface font-sans text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-sans font-bold text-[9px] text-on-surface-variant uppercase tracking-widest mb-1.5">
                  Deskripsi Produk
                </label>
                <textarea
                  rows={2}
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  placeholder="Deskripsi detail mengenai kelebihan produk..."
                  className="w-full border border-outline-variant/50 rounded-lg px-3 py-2 bg-surface font-sans text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-all resize-none shadow-2xs"
                />
              </div>

              {/* Colors & Sizes Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans font-bold text-[9px] text-on-surface-variant uppercase tracking-widest mb-1.5">
                    Pilihan Warna (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={pColors}
                    onChange={(e) => setPColors(e.target.value)}
                    placeholder="Sage Green, Dusty Pink, Slate Grey"
                    className="w-full border border-outline-variant/50 rounded-lg px-3 py-2 bg-surface font-sans text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-all shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block font-sans font-bold text-[9px] text-on-surface-variant uppercase tracking-widest mb-1.5">
                    Pilihan Ukuran (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={pSizes}
                    onChange={(e) => setPSizes(e.target.value)}
                    placeholder="Single, Queen, King, Extra King"
                    className="w-full border border-outline-variant/50 rounded-lg px-3 py-2 bg-surface font-sans text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Material & Care */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans font-bold text-[9px] text-on-surface-variant uppercase tracking-widest mb-1.5">
                    Bahan / Material
                  </label>
                  <input
                    type="text"
                    value={pMaterial}
                    onChange={(e) => setPMaterial(e.target.value)}
                    placeholder="cth: 100% Egyptian Cotton"
                    className="w-full border border-outline-variant/50 rounded-lg px-3 py-2 bg-surface font-sans text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-all shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block font-sans font-bold text-[9px] text-on-surface-variant uppercase tracking-widest mb-1.5">
                    Cara Perawatan
                  </label>
                  <input
                    type="text"
                    value={pCare}
                    onChange={(e) => setPCare(e.target.value)}
                    placeholder="cth: Jangan disetrika, gunakan air dingin"
                    className="w-full border border-outline-variant/50 rounded-lg px-3 py-2 bg-surface font-sans text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Size Guide Text Editor */}
              <div>
                <label className="block font-sans font-bold text-[9px] text-on-surface-variant uppercase tracking-widest mb-1.5">
                  Panduan Ukuran Khusus (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={pSizeGuide}
                  onChange={(e) => setPSizeGuide(e.target.value)}
                  placeholder="cth:&#10;Single: 120 x 200 cm&#10;Queen: 160 x 200 cm&#10;King: 180 x 200 cm"
                  className="w-full border border-outline-variant/50 rounded-lg px-3 py-2 bg-surface font-sans text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-all resize-none shadow-2xs"
                />
              </div>

              {/* Image upload URLs and picker */}
              <div>
                <label className="block font-sans font-bold text-[9px] text-on-surface-variant uppercase tracking-widest mb-1.5">
                  Link Gambar Produk (Gunakan koma jika lebih dari satu)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pImages}
                    onChange={(e) => setPImages(e.target.value)}
                    placeholder="https://res.cloudinary.com/..., https://..."
                    className="flex-grow border border-outline-variant/50 rounded-lg px-3 py-2 bg-surface font-sans text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-all shadow-2xs"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*"
                      onChange={handleUploadImage}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex h-9 px-4 items-center justify-center gap-1.5 bg-surface border border-outline-variant rounded-lg font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface hover:border-on-surface cursor-pointer shadow-2xs transition-all duration-300"
                    >
                      <Upload className="h-4 w-4" />
                      {uploadingImage ? "Upload..." : "Pilih File"}
                    </label>
                  </div>
                </div>
                <span className="block text-[9px] text-on-surface-variant/60 mt-1 font-sans">
                  *Anda dapat mengunggah file langsung ke Storage Supabase atau memasukkan URL gambar web dari Google Photos/Cloudinary secara langsung.
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-outline-variant/20 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="flex-grow py-3 bg-surface border border-outline-variant text-on-surface font-sans font-bold text-label rounded-full tracking-widest uppercase hover:bg-surface-variant/30 transition-all btn-tactile cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-grow py-3 bg-on-surface text-surface font-sans font-bold text-label rounded-full tracking-widest uppercase hover:bg-surface-tint transition-all btn-tactile cursor-pointer"
                >
                  {loading ? "Menyimpan..." : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
