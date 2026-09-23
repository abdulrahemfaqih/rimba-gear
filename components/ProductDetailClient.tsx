"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ShoppingBag, ArrowLeft, ShieldCheck, Clock, RefreshCw } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";

interface PricingTier {
  days: number;
  price: number;
}

interface ProductDetailProps {
  product: {
    id: string;
    categoryId: string;
    categoryName: string;
    categorySlug: string;
    name: string;
    slug: string;
    description: string;
    images: string[];
    pricingTiers: PricingTier[];
  };
}

export default function ProductDetailClient({ product }: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedTier, setSelectedTier] = useState<PricingTier>(
    product.pricingTiers[0] || { days: 2, price: 0 }
  );
  const [isAdded, setIsAdded] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] || "/rimbagear_logo.png",
      selectedDays: selectedTier.days,
      selectedPrice: selectedTier.price,
      availableTiers: product.pricingTiers,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2500);
  };

  const currentImage = product.images[selectedImageIndex] || product.images[0] || "/rimbagear_logo.png";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Breadcrumb */}
      <nav className="text-xs text-[#6B6B5F] mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-[#2F3D2A]">
          Beranda
        </Link>
        <span>/</span>
        <Link href={`/kategori/${product.categorySlug}`} className="hover:text-[#2F3D2A]">
          {product.categoryName}
        </Link>
        <span>/</span>
        <span className="text-[#1E1E1A] font-medium">{product.name}</span>
      </nav>

      {/* Main product area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* Left: Gallery (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Photo */}
          <div className="relative aspect-[4/3] w-full bg-white border border-[#E4E1D6] rounded-[6px] overflow-hidden">
            <Image
              src={currentImage}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-[4px] overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? "border-[#2F3D2A] opacity-100"
                      : "border-[#E4E1D6] opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} foto ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Assurance info */}
          <div className="p-4 bg-white border border-[#E4E1D6] rounded-[6px] text-xs text-[#6B6B5F] space-y-2 mt-6">
            <div className="flex items-center gap-2 font-medium text-[#2F3D2A]">
              <ShieldCheck className="w-4 h-4 text-[#3F7D45]" />
              <span>Standar Kebersihan & Kelayakan Rimba Gear</span>
            </div>
            <p>
              Setiap alat dicek kelengkapannya sebelum diserahkan. Gratis konsultasi cara pemasangan atau penggunaan di basecamp kami.
            </p>
          </div>
        </div>

        {/* Right: Info & Pricing (6 cols) */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="pb-6 border-b border-[#E4E1D6]">
            <Link
              href={`/kategori/${product.categorySlug}`}
              className="text-xs uppercase font-semibold tracking-wider text-[#2F3D2A] hover:underline"
            >
              {product.categoryName}
            </Link>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-[#1E1E1A] font-heading leading-tight">
              {product.name}
            </h1>
            <p className="mt-3 text-sm text-[#6B6B5F] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Pricing Tiers Selection */}
          <div className="py-6 border-b border-[#E4E1D6]">
            <label className="block text-xs uppercase font-bold tracking-wider text-[#1E1E1A] mb-3">
              Pilih Durasi Sewa
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {product.pricingTiers.map((tier) => {
                const isSelected = selectedTier.days === tier.days;
                return (
                  <button
                    key={tier.days}
                    type="button"
                    onClick={() => setSelectedTier(tier)}
                    className={`p-3 text-left border rounded-[6px] transition-all ${
                      isSelected
                        ? "border-[#2F3D2A] bg-[#2F3D2A] text-white shadow-sm"
                        : "border-[#E4E1D6] bg-white text-[#1E1E1A] hover:border-[#2F3D2A]"
                    }`}
                  >
                    <span className="block text-xs font-semibold">
                      {tier.days} Hari
                    </span>
                    <span
                      className={`block text-sm font-bold mt-1 ${
                        isSelected ? "text-white" : "text-[#C1502E]"
                      }`}
                    >
                      Rp{tier.price.toLocaleString("id-ID")}
                    </span>
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-[#6B6B5F] mt-2 block">
              *Durasi sewa dihitung per hari kalender sewa sesuai paket.
            </span>
          </div>

          {/* Total Price Display & Add To Cart */}
          <div className="py-6 space-y-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#6B6B5F] font-semibold block">
                Total Biaya Sewa ({selectedTier.days} Hari)
              </span>
              <div className="text-3xl font-extrabold font-heading text-[#C1502E]">
                Rp{selectedTier.price.toLocaleString("id-ID")}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn-primary flex-1 py-3.5 text-base flex items-center justify-center gap-2"
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5 text-white" />
                    <span>Berhasil Masuk Keranjang!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Tambah ke Keranjang</span>
                  </>
                )}
              </button>

              <Link
                href="/keranjang"
                className="btn-secondary py-3.5 px-6 text-sm text-center flex items-center justify-center gap-2"
              >
                <span>Lihat Keranjang</span>
              </Link>
            </div>
          </div>

          {/* Specifications and Package Inclusion Tabs/Cards */}
          <div className="mt-auto pt-6 border-t border-[#E4E1D6] space-y-4">
            <h3 className="font-heading font-bold text-base text-[#1E1E1A]">
              Ketentuan & Isi Paket
            </h3>
            <ul className="text-xs text-[#6B6B5F] space-y-2 list-disc pl-4 leading-relaxed">
              <li>Penyewaan wajib menyertakan foto identitas asli (KTP/SIM/KTM) saat checkout.</li>
              <li>Barang diambil dan dikembalikan ke alamat basecamp Rimba Gear.</li>
              <li>Harap menjaga keutuhan peralatan selama masa petualangan di alam terbuka.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
