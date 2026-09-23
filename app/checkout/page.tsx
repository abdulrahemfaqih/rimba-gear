"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCartStore } from "@/lib/cartStore";
import {
  Upload,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileImage,
  Send,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdFile(file);
      const previewUrl = URL.createObjectURL(file);
      setIdPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!customerName.trim()) {
      setErrorMsg("Nama lengkap wajib diisi");
      return;
    }

    if (!phone.trim()) {
      setErrorMsg("Nomor WhatsApp wajib diisi");
      return;
    }

    if (!idFile) {
      setErrorMsg("Foto kartu identitas (KTP/SIM/KTM) wajib diunggah untuk verifikasi sewa");
      return;
    }

    if (items.length === 0) {
      setErrorMsg("Keranjang sewa kamu masih kosong");
      return;
    }

    try {
      setLoading(true);

      // 1. Upload ID card photo
      const uploadFormData = new FormData();
      uploadFormData.append("file", idFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadRes.ok) {
        throw new Error("Gagal mengunggah foto kartu identitas");
      }

      const uploadData = await uploadRes.json();
      const idPhotoUrl = uploadData.url;

      // 2. Save order to database
      const totalPrice = getTotalPrice();
      const orderPayload = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
        idPhotoUrl,
        totalPrice,
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.name,
          days: item.selectedDays,
          price: item.selectedPrice,
        })),
      };

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) {
        throw new Error("Gagal menyimpan pesanan");
      }

      const orderData = await orderRes.json();
      const orderId = orderData.orderId;

      // 3. Format WhatsApp text
      const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "6281234567890";
      const itemListText = items
        .map(
          (item, idx) =>
            `${idx + 1}. ${item.name} (${item.selectedDays} Hari) - Rp${item.selectedPrice.toLocaleString("id-ID")}`
        )
        .join("\n");

      const waMessage = `Halo Admin Your Brand, saya ingin konfirmasi sewa alat outdoor:%0A%0A` +
        `*ID Pesanan:* ${orderId}%0A` +
        `*Nama Penyewa:* ${customerName}%0A` +
        `*No. WhatsApp:* ${phone}%0A` +
        (address ? `*Alamat:* ${address}%0A` : "") +
        `%0A*Daftar Alat Disewa:*%0A${encodeURIComponent(itemListText)}%0A%0A` +
        `*Total Biaya:* Rp${totalPrice.toLocaleString("id-ID")}%0A` +
        `*Foto Identitas:* Sudah diunggah ke sistem.%0A%0A` +
        `Mohon konfirmasi ketersediaan alat dan proses pengambilannya. Terima kasih!`;

      const waUrl = `https://wa.me/${adminPhone}?text=${waMessage}`;

      // 4. Clear cart & redirect
      clearCart();
      router.push(`/checkout/sukses?orderId=${orderId}&waUrl=${encodeURIComponent(waUrl)}&total=${totalPrice}&count=${items.length}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <>
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-16 text-center text-sm text-[#6B6B5F]">
          Memuat formulir checkout...
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="flex-1 max-w-md mx-auto px-4 py-20 text-center">
          <div className="card-base p-8 bg-white border border-[#E4E1D6] rounded-[6px]">
            <h2 className="font-heading font-bold text-xl text-[#1E1E1A] mb-3">
              Keranjang Sewa Kosong
            </h2>
            <p className="text-sm text-[#6B6B5F] mb-6">
              Silakan pilih perlengkapan outdoor terlebih dahulu sebelum menuju checkout.
            </p>
            <Link href="/kategori" className="btn-primary text-sm inline-flex items-center gap-2">
              <span>Pilih Peralatan</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
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
          <Link href="/keranjang" className="hover:text-[#2F3D2A]">
            Keranjang
          </Link>
          <span>/</span>
          <span className="text-[#1E1E1A] font-medium">Checkout</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-[#1E1E1A] font-heading mb-8 pb-4 border-b border-[#E4E1D6]">
          Checkout Sewa
        </h1>

        {errorMsg && (
          <div className="mb-6 p-4 bg-[#B3261E]/10 border border-[#B3261E]/20 text-[#B3261E] rounded-[6px] text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="card-base p-6 bg-white border border-[#E4E1D6] rounded-[6px] space-y-5">
              <h2 className="font-heading font-bold text-lg text-[#1E1E1A] pb-3 border-b border-[#E4E1D6]">
                Data Diri Penyewa
              </h2>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-[#1E1E1A] mb-1.5">
                  Nama Lengkap <span className="text-[#B3261E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dimas Prasetyo"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input-hairline w-full text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-[#1E1E1A] mb-1.5">
                  Nomor WhatsApp Aktif <span className="text-[#B3261E]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-hairline w-full text-sm"
                />
                <span className="text-[11px] text-[#6B6B5F] mt-1 block">
                  Admin akan menghubungi dan mengirimkan konfirmasi pengambilan ke nomor ini.
                </span>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-[#1E1E1A] mb-1.5">
                  Alamat Domisili (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Alamat tempat tinggal atau kota asal"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-hairline w-full text-sm resize-none"
                />
              </div>
            </div>

            {/* ID Photo Upload Section */}
            <div className="card-base p-6 bg-white border border-[#E4E1D6] rounded-[6px] space-y-4">
              <div className="pb-3 border-b border-[#E4E1D6]">
                <h2 className="font-heading font-bold text-lg text-[#1E1E1A]">
                  Foto Kartu Identitas Asli <span className="text-[#B3261E]">*</span>
                </h2>
                <p className="text-xs text-[#6B6B5F] mt-1">
                  KTP, SIM, atau Kartu Tanda Mahasiswa (KTM) yang masih berlaku sebagai jaminan sewa.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {!idPreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E4E1D6] hover:border-[#2F3D2A] rounded-[6px] p-8 text-center cursor-pointer transition-colors bg-[#F7F5EF]/50 flex flex-col items-center justify-center gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-white border border-[#E4E1D6] flex items-center justify-center text-[#2F3D2A]">
                    <Upload className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[#2F3D2A] block">
                      Klik untuk Unggah Foto Identitas
                    </span>
                    <span className="text-xs text-[#6B6B5F] block mt-0.5">
                      Format JPG, PNG, atau WebP (Maks. 5MB)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative aspect-[16/10] w-full max-w-sm rounded-[6px] overflow-hidden border border-[#E4E1D6] bg-black/5">
                    <Image
                      src={idPreview}
                      alt="Preview Identitas"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-[#2F3D2A] hover:underline flex items-center gap-1"
                    >
                      <FileImage className="w-3.5 h-3.5" />
                      <span>Ganti Foto</span>
                    </button>
                    <span className="text-xs text-[#3F7D45] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Foto terpilih ({idFile?.name})</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Summary (5 cols) */}
          <div className="lg:col-span-5">
            <div className="card-base p-6 bg-white border border-[#E4E1D6] rounded-[6px] sticky top-24 space-y-6">
              <h3 className="font-heading font-bold text-lg text-[#1E1E1A] pb-4 border-b border-[#E4E1D6]">
                Ringkasan Pesanan
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between text-sm py-2 border-b border-[#E4E1D6]/60 last:border-none"
                  >
                    <div>
                      <div className="font-semibold text-[#1E1E1A] line-clamp-1">
                        {item.name}
                      </div>
                      <span className="text-xs text-[#6B6B5F]">
                        Durasi: {item.selectedDays} Hari
                      </span>
                    </div>
                    <span className="font-heading font-bold text-sm text-[#C1502E]">
                      Rp{item.selectedPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Price */}
              <div className="pt-4 border-t border-[#E4E1D6] flex justify-between items-baseline">
                <span className="font-bold text-base text-[#1E1E1A]">Total Biaya Sewa</span>
                <span className="font-heading font-extrabold text-2xl text-[#C1502E]">
                  Rp{totalPrice.toLocaleString("id-ID")}
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-base font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Menyiapkan Pesanan...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 stroke-[2.5]" />
                    <span>Konfirmasi via WhatsApp</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-[#6B6B5F] leading-tight">
                Data kamu akan dikirim ke admin lewat WhatsApp untuk konfirmasi ketersediaan dan detail pengambilan alat.
              </p>

              <div className="pt-4 border-t border-[#E4E1D6] text-xs text-[#6B6B5F] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3F7D45] shrink-0" />
                <span>Privasi aman: Foto identitas disimpan secara terenkripsi hanya untuk jaminan rental.</span>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </>
  );
}
