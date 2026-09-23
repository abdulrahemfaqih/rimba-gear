"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? items.length : 0;

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E4E1D6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-9 h-9 overflow-hidden rounded">
              <Image
                src="/rimbagear_logo.png"
                alt="Rimba Gear Logo"
                fill
                className="object-contain"
                sizes="36px"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg leading-tight tracking-tight text-[#2F3D2A]">
                RIMBA GEAR
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#6B6B5F] font-medium">
                Rental Alat Outdoor
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/kategori"
              className="text-sm font-medium text-[#1E1E1A] hover:text-[#2F3D2A] transition-colors"
            >
              Kategori
            </Link>
            <Link
              href="/#cara-sewa"
              className="text-sm font-medium text-[#1E1E1A] hover:text-[#2F3D2A] transition-colors"
            >
              Cara Sewa
            </Link>
            <Link
              href="/#tentang-kami"
              className="text-sm font-medium text-[#1E1E1A] hover:text-[#2F3D2A] transition-colors"
            >
              Tentang Kami
            </Link>
          </nav>

          {/* Right Action: Cart */}
          <div className="flex items-center gap-4">
            <Link
              href="/keranjang"
              className="relative p-2 text-[#2F3D2A] hover:bg-[#F7F5EF] rounded-md transition-colors"
              aria-label="Keranjang Sewa"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C1502E] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>



            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#1E1E1A] hover:bg-[#F7F5EF] rounded-md"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E4E1D6] bg-white px-4 pt-3 pb-4 space-y-2">
          <Link
            href="/kategori"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-base font-medium text-[#1E1E1A] hover:bg-[#F7F5EF]"
          >
            Kategori Alat
          </Link>
          <Link
            href="/#cara-sewa"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-base font-medium text-[#1E1E1A] hover:bg-[#F7F5EF]"
          >
            Cara Sewa
          </Link>
          <Link
            href="/#tentang-kami"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-base font-medium text-[#1E1E1A] hover:bg-[#F7F5EF]"
          >
            Tentang Kami
          </Link>
        </div>
      )}
    </header>
  );
}
