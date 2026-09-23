"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCartStore } from "@/lib/cartStore";
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const updateItemDuration = useCartStore((state) => state.updateItemDuration);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <>
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-16 text-center text-sm text-[#6B6B5F]">
          Memuat keranjang sewa...
        </main>
        <Footer />
      </>
    );
  }

  const totalPrice = getTotalPrice();

  return (
    <>
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Breadcrumb */}
        <nav className="text-xs text-[#6B6B5F] mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#2F3D2A]">
            Beranda
          </Link>
          <span>/</span>
          <span className="text-[#1E1E1A] font-medium">Keranjang Sewa</span>
        </nav>

        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E4E1D6]">
          <h1 className="text-3xl font-extrabold text-[#1E1E1A] font-heading">
            Keranjang Sewa
          </h1>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-[#6B6B5F] hover:text-[#B3261E] transition-colors"
            >
              Kosongkan Keranjang
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="card-base p-12 text-center bg-white border border-[#E4E1D6] rounded-[6px] max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-[#F7F5EF] text-[#2F3D2A] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h2 className="font-heading font-bold text-xl text-[#1E1E1A] mb-2">
              Keranjang masih kosong
            </h2>
            <p className="text-sm text-[#6B6B5F] mb-6">
              Belum ada peralatan outdoor yang kamu pilih untuk disewa.
            </p>
            <Link href="/kategori" className="btn-primary text-sm inline-flex items-center gap-2">
              <span>Mulai Pilih Alat</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Cart List & Summary Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Items list (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="card-base p-4 sm:p-5 bg-white border border-[#E4E1D6] rounded-[6px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 bg-[#F7F5EF] rounded-[4px] overflow-hidden shrink-0 border border-[#E4E1D6]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <Link
                        href={`/produk/${item.slug}`}
                        className="font-heading font-bold text-base text-[#1E1E1A] hover:text-[#2F3D2A] transition-colors"
                      >
                        {item.name}
                      </Link>
                      <div className="mt-2 flex items-center gap-2">
                        <label className="text-xs text-[#6B6B5F]">Durasi:</label>
                        <select
                          value={item.selectedDays}
                          onChange={(e) =>
                            updateItemDuration(item.productId, Number(e.target.value))
                          }
                          className="input-hairline py-1 px-2.5 text-xs bg-[#F7F5EF] font-medium"
                        >
                          {item.availableTiers.map((t) => (
                            <option key={t.days} value={t.days}>
                              {t.days} Hari — Rp{t.price.toLocaleString("id-ID")}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E4E1D6]">
                    <div className="text-right">
                      <span className="text-[11px] uppercase tracking-wider text-[#6B6B5F] block font-medium">
                        Biaya Sewa
                      </span>
                      <span className="font-heading font-bold text-base text-[#C1502E]">
                        Rp{item.selectedPrice.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-2 text-[#6B6B5F] hover:text-[#B3261E] hover:bg-[#F7F5EF] rounded transition-colors"
                      title="Hapus dari keranjang"
                      aria-label="Hapus item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky summary (4 cols) */}
            <div className="lg:col-span-4">
              <div className="card-base p-6 bg-white border border-[#E4E1D6] rounded-[6px] sticky top-24 space-y-6">
                <h3 className="font-heading font-bold text-lg text-[#1E1E1A] pb-4 border-b border-[#E4E1D6]">
                  Ringkasan Sewa
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-[#6B6B5F]">
                    <span>Jumlah Item</span>
                    <span className="font-medium text-[#1E1E1A]">{items.length} alat</span>
                  </div>

                  <div className="flex justify-between text-[#6B6B5F]">
                    <span>Total Durasi</span>
                    <span className="font-medium text-[#1E1E1A]">Sesuai pilihan tier</span>
                  </div>

                  <div className="pt-3 border-t border-[#E4E1D6] flex justify-between items-baseline">
                    <span className="font-bold text-base text-[#1E1E1A]">Total Biaya</span>
                    <span className="font-heading font-extrabold text-2xl text-[#C1502E]">
                      Rp{totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Lanjut ke Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="pt-4 border-t border-[#E4E1D6] text-xs text-[#6B6B5F] space-y-2">
                  <div className="flex items-center gap-2 text-[#2F3D2A] font-semibold">
                    <ShieldCheck className="w-4 h-4 text-[#3F7D45]" />
                    <span>Jaminan Bebas Ribet</span>
                  </div>
                  <p>
                    Data pesanan akan difinalisasi dan diverifikasi via WhatsApp langsung dengan tim kami.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
