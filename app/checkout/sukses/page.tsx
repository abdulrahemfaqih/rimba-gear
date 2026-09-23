"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, ArrowRight, MessageSquare, Home } from "lucide-react";

function SuksesContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "RMB-ORDER";
  const waUrl = searchParams.get("waUrl") || "";
  const total = Number(searchParams.get("total") || 0);
  const count = Number(searchParams.get("count") || 1);

  // Auto redirect to WA after 2 seconds if waUrl is present
  useEffect(() => {
    if (waUrl) {
      const timer = setTimeout(() => {
        window.open(waUrl, "_blank");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [waUrl]);

  return (
    <div className="max-w-md w-full mx-auto my-12 sm:my-20 px-4">
      <div className="card-base p-8 bg-white border border-[#E4E1D6] rounded-[6px] text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="w-16 h-16 rounded-full bg-[#3F7D45]/10 text-[#3F7D45] flex items-center justify-center mx-auto mb-5 border border-[#3F7D45]/20">
          <CheckCircle2 className="w-8 h-8 stroke-[2]" />
        </div>

        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1E1E1A] mb-2">
          Pesanan Terkirim!
        </h1>
        <p className="text-sm text-[#6B6B5F] mb-6 leading-relaxed">
          Data sewa dan foto identitas kamu sudah tersimpan di sistem. Kamu akan dialihkan ke WhatsApp untuk konfirmasi dengan admin.
        </p>

        {/* Order Brief Summary */}
        <div className="p-4 bg-[#F7F5EF] border border-[#E4E1D6] rounded-[6px] text-left text-xs space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-[#6B6B5F]">Nomor Pesanan</span>
            <span className="font-mono font-bold text-[#1E1E1A]">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B6B5F]">Jumlah Alat Disewa</span>
            <span className="font-semibold text-[#1E1E1A]">{count} item</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-[#E4E1D6] font-bold">
            <span className="text-[#1E1E1A]">Total Biaya</span>
            <span className="text-[#C1502E] text-sm">
              Rp{total.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Manual WA Button */}
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 mb-3 bg-[#3F7D45] hover:bg-[#346839]"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Buka WhatsApp Sekarang</span>
          </a>
        )}

        <Link
          href="/"
          className="btn-secondary w-full py-2.5 text-xs flex items-center justify-center gap-2"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuksesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <Suspense
          fallback={
            <div className="py-20 text-center text-sm text-[#6B6B5F]">
              Memuat data konfirmasi pesanan...
            </div>
          }
        >
          <SuksesContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
