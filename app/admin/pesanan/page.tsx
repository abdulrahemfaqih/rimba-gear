"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  Search,
  X,
  ExternalLink,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileImage,
} from "lucide-react";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  days: number;
  price: number;
  quantity?: number;
}

interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string | null;
  idPhotoUrl: string;
  totalPrice: number;
  startDate?: string | null;
  endDate?: string | null;
  dpPercentage?: number;
  dpAmount?: number;
  status: "pending" | "dikonfirmasi" | "bayar_dp" | "ambil_barang" | "selesai" | "dibatalkan" | "baru";
  createdAt: string;
  items: OrderItem[];
}

function AdminPesananContent() {
  const searchParams = useSearchParams();
  const initialViewId = searchParams.get("view");

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = selectedStatus === "semua" ? "/api/orders" : `/api/orders?status=${selectedStatus}`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data.orders || []);

      if (initialViewId && !selectedOrder) {
        const found = (data.orders || []).find((o: Order) => o.id === initialViewId);
        if (found) {
          openDetailModal(found);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const openDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Gagal mengupdate status pesanan");

      setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Gagal mengupdate status pesanan");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`Hapus permanen pesanan ${orderId}?`)) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus pesanan");
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus pesanan");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
      case "baru":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "dikonfirmasi":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "bayar_dp":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "ambil_barang":
        return "bg-teal-100 text-teal-800 border-teal-300";
      case "selesai":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "dibatalkan":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
      case "baru":
        return "Pending";
      case "dikonfirmasi":
        return "Dikonfirmasi";
      case "bayar_dp":
        return "Bayar DP";
      case "ambil_barang":
        return "Sudah Ambil";
      case "selesai":
        return "Selesai";
      case "dibatalkan":
        return "Dibatalkan";
      default:
        return status;
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchCustomer = (o.customerName || "").toLowerCase().includes(q);
    const matchPhone = (o.phone || "").toLowerCase().includes(q);
    const matchId = (o.id || "").toLowerCase().includes(q);
    const matchAddress = o.address ? o.address.toLowerCase().includes(q) : false;
    const matchItem =
      o.items &&
      o.items.some((item) => (item.productName || "").toLowerCase().includes(q));
    return matchCustomer || matchPhone || matchId || matchAddress || matchItem;
  });

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#F7F5EF]">
      <AdminSidebar />

      <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-10">
        {/* Header */}
        <div className="mb-8 pb-4 border-b border-[#E4E1D6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1A] font-heading">
              Kelola Pesanan
            </h1>
            <p className="text-xs text-[#6B6B5F] mt-1">
              Data penyewaan masuk, foto identitas penyewa, dan update status pesanan
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#6B6B5F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              enterKeyHint="search"
              placeholder="Cari nama, HP, ID, atau nama alat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: "2.5rem",
                paddingRight: searchQuery ? "2.25rem" : "0.75rem",
              }}
              className="input-hairline input-search text-xs w-full bg-white transition-all focus:border-[#2F3D2A] [&::-webkit-search-cancel-button]:hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                title="Hapus pencarian"
                aria-label="Hapus pencarian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B6B5F] hover:text-[#1E1E1A] p-0.5 rounded-full hover:bg-[#F7F5EF] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Status Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { id: "semua", label: "Semua Status" },
            { id: "pending", label: "Pending" },
            { id: "dikonfirmasi", label: "Dikonfirmasi" },
            { id: "bayar_dp", label: "Bayar DP" },
            { id: "ambil_barang", label: "Sudah Ambil" },
            { id: "selesai", label: "Selesai" },
            { id: "dibatalkan", label: "Dibatalkan" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3.5 py-1.5 rounded-[4px] text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 ${
                selectedStatus === st.id
                  ? "bg-[#2F3D2A] text-white"
                  : "bg-white text-[#6B6B5F] border border-[#E4E1D6] hover:bg-[#F7F5EF] hover:text-[#1E1E1A]"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Active search query feedback */}
        {searchQuery.trim() && (
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 p-3 bg-white border border-[#E4E1D6] rounded-[6px] text-xs text-[#6B6B5F]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span>
                Menemukan <strong className="text-[#1E1E1A]">{filteredOrders.length}</strong> pesanan untuk pencarian:
              </span>
              <span className="font-semibold text-[#1E1E1A] bg-[#F7F5EF] px-2 py-0.5 rounded border border-[#E4E1D6]">
                &quot;{searchQuery}&quot;
              </span>
            </div>
            <button
              onClick={() => setSearchQuery("")}
              className="inline-flex items-center gap-1 text-[#C1502E] hover:text-[#A74223] font-semibold transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Hapus Filter Pencarian</span>
            </button>
          </div>
        )}

        {/* Orders Table */}
        <div className="card-base bg-white border border-[#E4E1D6] rounded-[6px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F5EF] border-b border-[#E4E1D6] text-[#6B6B5F] uppercase font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-5">ID Pesanan</th>
                  <th className="py-3 px-5">Nama Penyewa</th>
                  <th className="py-3 px-5">Periode Sewa</th>
                  <th className="py-3 px-5">Total Biaya</th>
                  <th className="py-3 px-5 text-center">Item</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5">Tanggal Masuk</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E1D6]/60 text-[#1E1E1A]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#6B6B5F]">
                      Memuat daftar pesanan...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#6B6B5F]">
                      <div className="max-w-sm mx-auto space-y-2">
                        <p className="font-semibold text-sm text-[#1E1E1A]">
                          {searchQuery
                            ? `Tidak ada pesanan yang cocok dengan "${searchQuery}"`
                            : "Tidak ada pesanan dengan status ini."}
                        </p>
                        <p className="text-xs text-[#6B6B5F]">
                          {searchQuery
                            ? "Coba gunakan kata kunci lain seperti nama pemesan, nomor HP, ID pesanan, atau nama alat sewa."
                            : "Pesanan baru akan muncul di sini setelah pelanggan melakukan checkout."}
                        </p>
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="mt-2 btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reset Pencarian</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const statusStr = String(order.status === "baru" ? "pending" : order.status);
                    return (
                      <tr key={order.id} className="hover:bg-[#F7F5EF]/50 transition-colors">
                        <td className="py-3.5 px-5 font-mono font-medium text-[#2F3D2A]">
                          {order.id}
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-sm text-[#1E1E1A]">{order.customerName}</div>
                          <span className="text-[11px] text-[#6B6B5F]">{order.phone}</span>
                        </td>
                        <td className="py-3.5 px-5 text-xs text-[#6B6B5F]">
                          {order.startDate ? (
                            <span>{order.startDate} s/d {order.endDate || "-"}</span>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 font-bold text-[#C1502E]">
                          Rp{order.totalPrice.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <span className="bg-[#F7F5EF] px-2 py-0.5 rounded border border-[#E4E1D6]">
                            {order.items.reduce((s, it) => s + (it.quantity || 1), 0)} unit
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${getStatusBadge(
                              statusStr
                            )}`}
                          >
                            {getStatusLabel(statusStr)}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-[#6B6B5F]">
                          {new Date(order.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => openDetailModal(order)}
                            className="btn-secondary text-[11px] py-1 px-3"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Detail Pesanan */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
            <div className="card-base bg-white border border-[#E4E1D6] rounded-[6px] max-w-2xl w-full p-6 shadow-xl my-8">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E1D6] mb-4">
                <div>
                  <h3 className="font-heading font-bold text-base text-[#1E1E1A]">
                    Detail Pesanan: {selectedOrder.id}
                  </h3>
                  <span className="text-[11px] text-[#6B6B5F]">
                    Dibuat pada {new Date(selectedOrder.createdAt).toLocaleString("id-ID")}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-[#6B6B5F] hover:text-[#1E1E1A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
                {/* Customer Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#F7F5EF] rounded-[6px] border border-[#E4E1D6]">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#6B6B5F] block font-medium">
                      Nama Penyewa
                    </span>
                    <span className="text-sm font-bold text-[#1E1E1A]">
                      {selectedOrder.customerName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#6B6B5F] block font-medium">
                      Nomor WhatsApp
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-semibold text-[#1E1E1A]">
                        {selectedOrder.phone}
                      </span>
                      <a
                        href={`https://wa.me/${selectedOrder.phone.replace(/^0/, "62").replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#2F3D2A] hover:underline flex items-center gap-1 font-medium bg-white px-2 py-0.5 border border-[#E4E1D6] rounded"
                      >
                        <MessageSquare className="w-3 h-3 text-[#3F7D45]" />
                        <span>Chat WA</span>
                      </a>
                    </div>
                  </div>

                  {selectedOrder.address && (
                    <div className="md:col-span-2 pt-2 border-t border-[#E4E1D6]">
                      <span className="text-[11px] uppercase tracking-wider text-[#6B6B5F] block font-medium">
                        Alamat Domisili
                      </span>
                      <span className="text-xs text-[#1E1E1A]">
                        {selectedOrder.address}
                      </span>
                    </div>
                  )}

                  {selectedOrder.startDate && (
                    <div className="md:col-span-2 pt-2 border-t border-[#E4E1D6]">
                      <span className="text-[11px] uppercase tracking-wider text-[#6B6B5F] block font-medium">
                        Periode Sewa
                      </span>
                      <span className="text-xs font-semibold text-[#1E1E1A]">
                        {selectedOrder.startDate} s/d {selectedOrder.endDate || "-"}
                      </span>
                    </div>
                  )}
                </div>

                {/* ID Photo Preview */}
                <div>
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#1E1E1A] mb-2">
                    Foto Kartu Identitas Penyewa
                  </h4>
                  <div className="relative aspect-[16/10] w-full max-w-sm rounded-[6px] overflow-hidden border border-[#E4E1D6] bg-black/5">
                    <Image
                      src={selectedOrder.idPhotoUrl}
                      alt="Kartu Identitas"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="mt-1">
                    <a
                      href={selectedOrder.idPhotoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#2F3D2A] hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Buka foto ukuran penuh</span>
                    </a>
                  </div>
                </div>

                {/* Items snapshot table */}
                <div>
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#1E1E1A] mb-2">
                    Daftar Alat Disewa
                  </h4>
                  <div className="border border-[#E4E1D6] rounded-[6px] overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F7F5EF] text-[#6B6B5F] font-semibold border-b border-[#E4E1D6]">
                        <tr>
                          <th className="py-2.5 px-4">Nama Peralatan</th>
                          <th className="py-2.5 px-4 text-center">Durasi</th>
                          <th className="py-2.5 px-4 text-center">Qty</th>
                          <th className="py-2.5 px-4 text-right">Harga Satuan</th>
                          <th className="py-2.5 px-4 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E4E1D6]/60">
                        {selectedOrder.items.map((item, idx) => {
                          const qty = item.quantity || 1;
                          const subtotal = item.price * qty;
                          return (
                            <tr key={idx}>
                              <td className="py-2.5 px-4 font-semibold text-[#1E1E1A]">
                                {item.productName}
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                {item.days} Hari
                              </td>
                              <td className="py-2.5 px-4 text-center font-bold text-[#1E1E1A]">
                                {qty}x
                              </td>
                              <td className="py-2.5 px-4 text-right text-[#6B6B5F]">
                                Rp{item.price.toLocaleString("id-ID")}
                              </td>
                              <td className="py-2.5 px-4 text-right font-medium text-[#C1502E]">
                                Rp{subtotal.toLocaleString("id-ID")}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-[#F7F5EF] border-t border-[#E4E1D6]">
                        <tr>
                          <td colSpan={4} className="py-2.5 px-4 font-bold text-[#1E1E1A]">
                            Total Keseluruhan
                          </td>
                          <td className="py-2.5 px-4 text-right text-sm font-bold text-[#C1502E]">
                            Rp{selectedOrder.totalPrice.toLocaleString("id-ID")}
                          </td>
                        </tr>
                        {selectedOrder.dpAmount && selectedOrder.dpAmount > 0 ? (
                          <>
                            <tr className="text-[#2F3D2A] bg-amber-50/50">
                              <td colSpan={4} className="py-1.5 px-4 font-semibold">
                                Uang Muka (DP {selectedOrder.dpPercentage || 30}%)
                              </td>
                              <td className="py-1.5 px-4 text-right font-bold">
                                Rp{selectedOrder.dpAmount.toLocaleString("id-ID")}
                              </td>
                            </tr>
                            <tr className="text-[#6B6B5F]">
                              <td colSpan={4} className="py-1.5 px-4">
                                Sisa Pelunasan (saat ambil alat)
                              </td>
                              <td className="py-1.5 px-4 text-right font-semibold">
                                Rp{(selectedOrder.totalPrice - selectedOrder.dpAmount).toLocaleString("id-ID")}
                              </td>
                            </tr>
                          </>
                        ) : null}
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Status Update Dropdown */}
                <div className="pt-4 border-t border-[#E4E1D6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <label className="text-xs uppercase font-bold tracking-wider text-[#1E1E1A]">
                      Ubah Status:
                    </label>
                    <select
                      value={newStatus === "baru" ? "pending" : newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="input-hairline py-1.5 px-3 text-xs bg-white font-medium"
                    >
                      <option value="pending">Pending</option>
                      <option value="dikonfirmasi">Dikonfirmasi (Kunci Stok)</option>
                      <option value="bayar_dp">Bayar DP</option>
                      <option value="ambil_barang">Sudah Ambil Barang</option>
                      <option value="selesai">Selesai</option>
                      <option value="dibatalkan">Dibatalkan</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(selectedOrder.id)}
                      className="px-3 py-2 text-[#B3261E] hover:bg-[#B3261E]/10 rounded border border-[#B3261E]/30 text-xs font-semibold transition-colors"
                    >
                      Hapus Pesanan
                    </button>
                    <button
                      type="button"
                      disabled={updatingStatus || newStatus === selectedOrder.status}
                      onClick={handleUpdateStatus}
                      className="btn-primary text-xs py-2 px-4 disabled:opacity-50"
                    >
                      {updatingStatus ? "Menyimpan..." : "Perbarui Status"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminPesananPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen bg-[#F7F5EF] items-center justify-center text-sm text-[#6B6B5F]">
          Memuat halaman pesanan...
        </div>
      }
    >
      <AdminPesananContent />
    </Suspense>
  );
}
