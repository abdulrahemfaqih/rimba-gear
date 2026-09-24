"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  ExternalLink,
  MessageCircle,
  Package,
  Clock,
} from "lucide-react";

export interface CalendarOrderItem {
  productName: string;
  quantity: number;
}

export interface CalendarOrder {
  id: string;
  customerName: string;
  phone: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  dpAmount?: number;
  status: string;
  items: CalendarOrderItem[];
}

interface BookingCalendarProps {
  orders: CalendarOrder[];
}

export default function BookingCalendar({ orders }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayString, setSelectedDayString] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar matrix calculation
  const firstDayOfMonth = new Date(year, month, 1);
  // Convert Sunday (0) to 7, so Monday is 1, Sunday is 7
  let startingDayOfWeek = firstDayOfMonth.getDay();
  startingDayOfWeek = startingDayOfWeek === 0 ? 7 : startingDayOfWeek;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: {
    dayNumber: number;
    dateString: string;
    isCurrentMonth: boolean;
    isToday: boolean;
  }[] = [];

  const todayStr = new Date().toISOString().slice(0, 10);

  // Previous month trailing days
  for (let i = startingDayOfWeek - 1; i > 0; i--) {
    const d = daysInPrevMonth - i + 1;
    const prevDate = new Date(year, month - 1, d);
    const dateString = prevDate.toISOString().slice(0, 10);
    calendarDays.push({
      dayNumber: d,
      dateString,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(year, month, d);
    const dateString = curDate.toISOString().slice(0, 10);
    calendarDays.push({
      dayNumber: d,
      dateString,
      isCurrentMonth: true,
      isToday: dateString === todayStr,
    });
  }

  // Next month leading days (to complete 35 or 42 cells)
  const remainingCells = 42 - calendarDays.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextDate = new Date(year, month + 1, d);
    const dateString = nextDate.toISOString().slice(0, 10);
    calendarDays.push({
      dayNumber: d,
      dateString,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
    });
  }

  // Helper to find orders active on a given date
  const getOrdersForDate = (dateStr: string) => {
    return orders.filter((o) => {
      if (!o.startDate || !o.endDate) return false;
      if (o.status === "dibatalkan") return false;
      return dateStr >= o.startDate && dateStr <= o.endDate;
    });
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "dikonfirmasi":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "bayar_dp":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "ambil_barang":
        return "bg-teal-100 text-teal-800 border-teal-300";
      case "selesai":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
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

  // Selected day orders for modal
  const selectedDayOrders = selectedDayString ? getOrdersForDate(selectedDayString) : [];
  const selectedDayTotalUnits = selectedDayOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, it) => s + (it.quantity || 1), 0),
    0
  );

  return (
    <div className="card-base bg-white border border-[#E4E1D6] rounded-[6px] overflow-hidden shadow-xs">
      {/* Calendar Header */}
      <div className="p-4 sm:p-5 border-b border-[#E4E1D6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#2F3D2A]/10 text-[#2F3D2A] flex items-center justify-center">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-base text-[#1E1E1A]">
              Kalender Booking Sewa
            </h2>
            <span className="text-xs text-[#6B6B5F]">
              Jadwal peminjaman dan ketersediaan alat outdoor
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToday}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            Hari Ini
          </button>
          <div className="flex items-center gap-1 bg-[#F7F5EF] p-1 rounded border border-[#E4E1D6]">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-white rounded transition-colors text-[#1E1E1A]"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-heading font-bold text-xs text-[#1E1E1A] px-2 min-w-[110px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-white rounded transition-colors text-[#1E1E1A]"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Day of week headers and Grid (Scrollable on small mobile screens) */}
      <div className="overflow-x-auto">
        <div className="min-w-[560px] sm:min-w-0">
          <div className="grid grid-cols-7 border-b border-[#E4E1D6] bg-[#F7F5EF] text-center text-xs font-semibold text-[#6B6B5F] py-2">
            {dayNames.map((name) => (
              <div key={name}>{name}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 divide-x divide-y divide-[#E4E1D6]/70">
            {calendarDays.map((cd, idx) => {
              const dayOrders = getOrdersForDate(cd.dateString);
              const hasOrders = dayOrders.length > 0;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDayString(cd.dateString)}
                  className={`min-h-[90px] sm:min-h-[105px] p-1.5 sm:p-2 flex flex-col cursor-pointer transition-colors relative ${
                    cd.isCurrentMonth
                      ? "bg-white hover:bg-[#F7F5EF]/60"
                      : "bg-[#F7F5EF]/30 text-gray-400 hover:bg-[#F7F5EF]/70"
                  }`}
                >
                  {/* Day header: number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center ${
                        cd.isToday
                          ? "bg-[#2F3D2A] text-white font-bold"
                          : cd.isCurrentMonth
                          ? "text-[#1E1E1A]"
                          : "text-gray-400"
                      }`}
                    >
                      {cd.dayNumber}
                    </span>

                    {hasOrders && (
                      <span className="text-[10px] font-bold text-[#2F3D2A] bg-[#2F3D2A]/10 px-1.5 py-0.2 rounded">
                        {dayOrders.reduce(
                          (s, o) => s + o.items.reduce((sum, it) => sum + (it.quantity || 1), 0),
                          0
                        )}{" "}
                        unit
                      </span>
                    )}
                  </div>

                  {/* Booking pills list */}
                  <div className="space-y-1 overflow-hidden flex-1">
                    {dayOrders.slice(0, 2).map((order) => (
                      <div
                        key={order.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded border truncate font-medium ${getStatusBadgeStyle(
                          order.status
                        )}`}
                        title={`${order.customerName} - ${order.items.map((i) => `${i.productName} (${i.quantity}x)`).join(", ")}`}
                      >
                        <span className="font-bold mr-1">[{getStatusLabel(order.status)}]</span>
                        {order.customerName}
                      </div>
                    ))}

                    {dayOrders.length > 2 && (
                      <span className="text-[9px] text-[#6B6B5F] font-semibold block px-1">
                        +{dayOrders.length - 2} booking lagi
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend below calendar */}
      <div className="p-3 bg-[#F7F5EF] border-t border-[#E4E1D6] flex flex-wrap items-center gap-4 text-xs text-[#6B6B5F]">
        <span className="font-semibold text-[#1E1E1A]">Status Booking:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>Dikonfirmasi (Kunci Stok)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
          <span>Bayar DP</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
          <span>Sudah Ambil Barang</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Pending (Belum Dikonfirmasi)</span>
        </span>
      </div>

      {/* Day Detail Modal */}
      {selectedDayString && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="card-base bg-white border border-[#E4E1D6] rounded-[6px] max-w-xl w-full p-6 shadow-xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E1D6] mb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-[#1E1E1A]">
                  Jadwal Booking:{" "}
                  {new Date(selectedDayString).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <span className="text-xs text-[#6B6B5F]">
                  Total: {selectedDayOrders.length} transaksi sewa ({selectedDayTotalUnits} unit alat)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayString(null)}
                className="p-1.5 text-[#6B6B5F] hover:text-[#1E1E1A] hover:bg-[#F7F5EF] rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedDayOrders.length === 0 ? (
              <div className="text-center py-10 text-xs text-[#6B6B5F]">
                Tidak ada pesanan rental aktif pada tanggal ini.
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {selectedDayOrders.map((order) => {
                  const adminWaUrl = `https://wa.me/${order.phone.replace(/[^0-9]/g, "")}`;
                  return (
                    <div
                      key={order.id}
                      className="p-4 border border-[#E4E1D6] rounded-[6px] bg-[#F7F5EF]/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-xs font-bold text-[#2F3D2A] block">
                            {order.id}
                          </span>
                          <span className="font-heading font-bold text-sm text-[#1E1E1A]">
                            {order.customerName}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${getStatusBadgeStyle(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </div>

                      {/* Rental range */}
                      <div className="text-xs text-[#6B6B5F] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#2F3D2A]" />
                        <span>
                          Periode: {order.startDate} s/d {order.endDate}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="border-t border-[#E4E1D6] pt-2">
                        <span className="text-[11px] font-bold text-[#1E1E1A] uppercase block mb-1">
                          Alat yang disewa:
                        </span>
                        <ul className="text-xs space-y-1">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="flex justify-between text-[#1E1E1A]">
                              <span>&bull; {item.productName}</span>
                              <span className="font-bold">{item.quantity || 1} unit</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Total & Action */}
                      <div className="border-t border-[#E4E1D6] pt-2.5 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-[#6B6B5F] block">Total Sewa:</span>
                          <span className="font-bold text-sm text-[#C1502E]">
                            Rp{order.totalPrice.toLocaleString("id-ID")}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={adminWaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-[#3F7D45]" />
                            <span>Chat WA</span>
                          </a>

                          <Link
                            href={`/admin/pesanan?view=${order.id}`}
                            className="btn-primary text-[11px] py-1 px-2.5 flex items-center gap-1"
                          >
                            <span>Detail Pesanan</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
