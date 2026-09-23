import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";
import BookingCalendar, { CalendarOrder } from "@/components/admin/BookingCalendar";
import DpSettingsCard from "@/components/admin/DpSettingsCard";
import { getDb, initDb } from "@/lib/db";
import {
  Package,
  Layers,
  TrendingUp,
  ArrowRight,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await initDb();
  const db = getDb();

  // Metrics
  const ordersCountRes = await db.execute(`
    SELECT 
      COUNT(*) as total_orders,
      SUM(CASE WHEN status = 'pending' OR status = 'baru' THEN 1 ELSE 0 END) as new_orders,
      SUM(total_price) as total_revenue
    FROM orders
  `);

  const prodCountRes = await db.execute(`
    SELECT COUNT(*) as total_products FROM products WHERE is_active = 1
  `);

  const catCountRes = await db.execute(`
    SELECT COUNT(*) as total_categories FROM categories WHERE is_active = 1
  `);

  // Settings: DP percentage
  const settingsRes = await db.execute("SELECT * FROM settings WHERE key = 'dp_percentage'");
  const dpPercentage = parseInt(String(settingsRes.rows[0]?.value || "30"), 10) || 30;

  // Active bookings for calendar
  const allOrdersRes = await db.execute(`
    SELECT o.id, o.customer_name, o.phone, o.start_date, o.end_date, o.total_price, o.dp_amount, o.status,
           oi.product_name, oi.quantity
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.status != 'dibatalkan'
    ORDER BY o.created_at DESC
  `);

  const calendarOrdersMap: Record<string, CalendarOrder> = {};
  for (const row of allOrdersRes.rows) {
    const oId = String(row.id);
    if (!calendarOrdersMap[oId]) {
      calendarOrdersMap[oId] = {
        id: oId,
        customerName: String(row.customer_name),
        phone: String(row.phone),
        startDate: row.start_date ? String(row.start_date) : "",
        endDate: row.end_date ? String(row.end_date) : "",
        totalPrice: Number(row.total_price),
        dpAmount: Number(row.dp_amount || 0),
        status: String(row.status === "baru" ? "pending" : row.status),
        items: [],
      };
    }
    if (row.product_name) {
      calendarOrdersMap[oId].items.push({
        productName: String(row.product_name),
        quantity: Number(row.quantity || 1),
      });
    }
  }

  const calendarOrders = Object.values(calendarOrdersMap);

  // Recent 5 orders
  const recentOrdersRes = await db.execute(`
    SELECT * FROM orders ORDER BY created_at DESC LIMIT 5
  `);

  const totalOrders = Number(ordersCountRes.rows[0]?.total_orders || 0);
  const newOrders = Number(ordersCountRes.rows[0]?.new_orders || 0);
  const totalRevenue = Number(ordersCountRes.rows[0]?.total_revenue || 0);
  const totalProducts = Number(prodCountRes.rows[0]?.total_products || 0);
  const totalCategories = Number(catCountRes.rows[0]?.total_categories || 0);

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

  return (
    <div className="flex min-h-screen bg-[#F7F5EF]">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8">
        {/* Header */}
        <div className="pb-4 border-b border-[#E4E1D6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1A] font-heading">
              Dashboard Rental
            </h1>
            <p className="text-xs text-[#6B6B5F] mt-1">
              Ringkasan operasional rental alat outdoor Your Brand
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/pesanan"
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
            >
              <span>Semua Pesanan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Metric 1 */}
          <div className="card-base p-5 bg-white border border-[#E4E1D6] rounded-[6px]">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#6B6B5F] font-semibold">
                Pesanan Pending
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 font-heading font-extrabold text-3xl text-[#1E1E1A]">
              {newOrders}
            </div>
            <span className="text-[11px] text-[#6B6B5F] mt-1 block">
              Menunggu konfirmasi admin
            </span>
          </div>

          {/* Metric 2 */}
          <div className="card-base p-5 bg-white border border-[#E4E1D6] rounded-[6px]">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#6B6B5F] font-semibold">
                Total Produk
              </span>
              <div className="w-8 h-8 rounded-full bg-[#2F3D2A]/10 text-[#2F3D2A] flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 font-heading font-extrabold text-3xl text-[#1E1E1A]">
              {totalProducts}
            </div>
            <span className="text-[11px] text-[#6B6B5F] mt-1 block">
              Peralatan aktif siap disewa
            </span>
          </div>

          {/* Metric 3 */}
          <div className="card-base p-5 bg-white border border-[#E4E1D6] rounded-[6px]">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#6B6B5F] font-semibold">
                Total Kategori
              </span>
              <div className="w-8 h-8 rounded-full bg-[#2F3D2A]/10 text-[#2F3D2A] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 font-heading font-extrabold text-3xl text-[#1E1E1A]">
              {totalCategories}
            </div>
            <span className="text-[11px] text-[#6B6B5F] mt-1 block">
              Kategori alat camping
            </span>
          </div>

          {/* Metric 4 */}
          <div className="card-base p-5 bg-white border border-[#E4E1D6] rounded-[6px]">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#6B6B5F] font-semibold">
                Total Nilai Sewa
              </span>
              <div className="w-8 h-8 rounded-full bg-[#3F7D45]/10 text-[#3F7D45] flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 font-heading font-extrabold text-2xl text-[#1E1E1A]">
              Rp{totalRevenue.toLocaleString("id-ID")}
            </div>
            <span className="text-[11px] text-[#6B6B5F] mt-1 block">
              Dari {totalOrders} total pesanan
            </span>
          </div>
        </div>

        {/* DP Percentage Settings Card */}
        <DpSettingsCard initialDp={dpPercentage} />

        {/* Interactive Monthly Booking Calendar */}
        <BookingCalendar orders={calendarOrders} />

        {/* Recent Orders Section */}
        <div className="card-base bg-white border border-[#E4E1D6] rounded-[6px] overflow-hidden">
          <div className="p-5 border-b border-[#E4E1D6] flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-base text-[#1E1E1A]">
                Pesanan Masuk Terbaru
              </h2>
              <span className="text-xs text-[#6B6B5F]">
                5 transaksi penyewaan terakhir
              </span>
            </div>
            <Link
              href="/admin/pesanan"
              className="text-xs font-semibold text-[#2F3D2A] hover:underline"
            >
              Lihat Semua Pesanan
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F5EF] border-b border-[#E4E1D6] text-[#6B6B5F] uppercase font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-5">ID Pesanan</th>
                  <th className="py-3 px-5">Nama Penyewa</th>
                  <th className="py-3 px-5">No. WhatsApp</th>
                  <th className="py-3 px-5">Total Biaya</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Tanggal Masuk</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E1D6]/60 text-[#1E1E1A]">
                {recentOrdersRes.rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#6B6B5F]">
                      Belum ada pesanan masuk.
                    </td>
                  </tr>
                ) : (
                  recentOrdersRes.rows.map((order) => {
                    const statusStr = String(order.status === "baru" ? "pending" : order.status);
                    return (
                      <tr key={String(order.id)} className="hover:bg-[#F7F5EF]/50 transition-colors">
                        <td className="py-3.5 px-5 font-mono font-medium text-[#2F3D2A]">
                          {String(order.id)}
                        </td>
                        <td className="py-3.5 px-5 font-semibold">
                          {String(order.customer_name)}
                        </td>
                        <td className="py-3.5 px-5 text-[#6B6B5F]">
                          {String(order.phone)}
                        </td>
                        <td className="py-3.5 px-5 font-bold text-[#C1502E]">
                          Rp{Number(order.total_price).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${getStatusBadge(
                              statusStr
                            )}`}
                          >
                            {getStatusLabel(statusStr)}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-[#6B6B5F]">
                          {new Date(String(order.created_at)).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <Link
                            href={`/admin/pesanan?view=${order.id}`}
                            className="btn-secondary text-[11px] py-1 px-2.5"
                          >
                            Detail
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

