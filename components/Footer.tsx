import Link from "next/link";
import Image from "next/image";
import { Phone, MapPin, Clock, ShieldCheck } from "lucide-react";

export default function Footer() {
  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "6281234567890";

  return (
    <footer className="bg-[#FFFFFF] border-t border-[#E4E1D6] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <Image
                  src="/rimbagear_logo.png"
                  alt="Rimba Gear"
                  fill
                  className="object-contain"
                  sizes="32px"
                />
              </div>
              <span className="font-heading font-bold text-lg tracking-tight text-[#2F3D2A]">
                RIMBA GEAR
              </span>
            </div>
            <p className="text-sm text-[#6B6B5F] leading-relaxed max-w-md">
              Penyedia sewa alat outdoor dan camping terpercaya. Siapkan perlengkapan petualanganmu dengan peralatan terawat, bersih, dan siap pakai tanpa repot.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#2F3D2A] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#3F7D45]" />
              <span>Jaminan Alat Bersih, Layak Pakai & Teruji</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-sm text-[#1E1E1A] uppercase tracking-wider">
              Kategori Populer
            </h4>
            <ul className="space-y-2 text-sm text-[#6B6B5F]">
              <li>
                <Link href="/kategori/tenda" className="hover:text-[#2F3D2A] transition-colors">
                  Tenda Camping & Bivak
                </Link>
              </li>
              <li>
                <Link href="/kategori/carrier" className="hover:text-[#2F3D2A] transition-colors">
                  Carrier & Ransel Gunung
                </Link>
              </li>
              <li>
                <Link href="/kategori/alat-masak" className="hover:text-[#2F3D2A] transition-colors">
                  Alat Masak & Kompor
                </Link>
              </li>
              <li>
                <Link href="/kategori/penerangan" className="hover:text-[#2F3D2A] transition-colors">
                  Lampu Tenda & Headlamp
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak & Lokasi */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-sm text-[#1E1E1A] uppercase tracking-wider">
              Lokasi & Kontak
            </h4>
            <div className="space-y-2 text-sm text-[#6B6B5F]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 text-[#2F3D2A] shrink-0" />
                <span>Jl. Raya Rinjani No. 45, Pos Rental Rimba Gear (Dekat Basecamp)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2F3D2A] shrink-0" />
                <span>Buka Setiap Hari: 08.00 - 21.00 WIB</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#2F3D2A] shrink-0" />
                <a
                  href={`https://wa.me/${adminPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#2F3D2A] underline underline-offset-2"
                >
                  +{adminPhone} (WhatsApp Admin)
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#E4E1D6] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B6B5F] gap-4">
          <p>© {new Date().getFullYear()} Rimba Gear. Semua hak cipta dilindungi.</p>
          <div className="flex items-center gap-6">
            <Link href="/admin/login" className="hover:text-[#2F3D2A]">
              Masuk Admin
            </Link>
            <Link href="/kategori" className="hover:text-[#2F3D2A]">
              Katalog Alat
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
