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
  status: "baru" | "dikonfirmasi" | "selesai" | "dibatalkan";
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
      case "baru":
        return "bg-[#C1502E]/10 text-[#C1502E] border border-[#C1502E]/30";
      case "dikonfirmasi":
        return "bg-[#2F3D2A]/10 text-[#2F3D2A] border border-[#2F3D2A]/30";
      case "selesai":
        return "bg-[#3F7D45]/10 text-[#3F7D45] border border-[#3F7D45]/30";
      case "dibatalkan":
        return "bg-[#B3261E]/10 text-[#B3261E] border border-[#B3261E]/30";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.customerName.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex min-h-screen bg-[#F7F5EF]">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
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
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#6B6B5F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, no HP, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-hairline pl-9 pr-3 py-1.5 text-xs w-full bg-white"
            />
          </div>
        </div>

        {/* Filter Status Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {["semua", "baru", "dikonfirmasi", "selesai", "dibatalkan"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3.5 py-1.5 rounded-[4px] text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 ${
                selectedStatus === st
                  ? "bg-[#2F3D2A] text-white"
                  : "bg-white text-[#6B6B5F] border border-[#E4E1D6] hover:bg-[#F7F5EF] hover:text-[#1E1E1A]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="card-base bg-white border border-[#E4E1D6] rounded-[6px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F5EF] border-b border-[#E4E1D6] text-[#6B6B5F] uppercase font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-5">ID Pesanan</th>
                  <th className="py-3 px-5">Nama Penyewa</th>
                  <th className="py-3 px-5">No. WhatsApp</th>
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
                    <td colSpan={8} className="py-8 text-center text-[#6B6B5F]">
                      Tidak ada pesanan dengan filter status ini.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#F7F5EF]/50 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-medium text-[#2F3D2A]">
                        {order.id}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-sm">
                        {order.customerName}
                      </td>
                      <td className="py-3.5 px-5 text-[#6B6B5F]">
                        {order.phone}
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
                            order.status
                          )}`}
                        >
                          {order.status}
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
                  ))
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
                      <tfoot className="bg-[#F7F5EF] border-t border-[#E4E1D6] font-bold">
                        <tr>
                          <td colSpan={4} className="py-2.5 px-4 text-[#1E1E1A]">
                            Total Keseluruhan
                          </td>
                          <td className="py-2.5 px-4 text-right text-sm text-[#C1502E]">
                            Rp{selectedOrder.totalPrice.toLocaleString("id-ID")}
                          </td>
                        </tr>
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
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="input-hairline py-1.5 px-3 text-xs bg-white font-medium"
                    >
                      <option value="baru">Baru</option>
                      <option value="dikonfirmasi">Dikonfirmasi</option>
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
