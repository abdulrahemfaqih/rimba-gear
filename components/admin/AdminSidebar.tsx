"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Package,
  ClipboardList,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Kelola Kategori", href: "/admin/kategori", icon: Layers },
    { label: "Kelola Produk", href: "/admin/produk", icon: Package },
    { label: "Kelola Pesanan", href: "/admin/pesanan", icon: ClipboardList },
  ];

  return (
    <>
      {/* 1. Mobile Topbar (Hanya tampil di layar < md) */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#E4E1D6] sticky top-0 z-30 shrink-0 w-full shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-1 text-[#1E1E1A] hover:bg-[#F7F5EF] rounded-md transition-colors"
            aria-label="Buka Menu Admin"
          >
            <Menu className="w-5 h-5 text-[#2F3D2A]" />
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <div className="relative w-7 h-7 overflow-hidden rounded-full border border-[#E4E1D6]">
              <Image src="/yourbrand.jpg" alt="Logo" fill className="object-cover scale-125" />
            </div>
            <span className="font-heading font-bold text-sm text-[#2F3D2A]">
              YOUR BRAND
            </span>
            <span className="text-[10px] bg-[#2F3D2A]/10 text-[#2F3D2A] px-1.5 py-0.5 rounded font-semibold uppercase">
              Admin
            </span>
          </Link>
        </div>

        <Link
          href="/"
          target="_blank"
          className="text-xs text-[#6B6B5F] hover:text-[#2F3D2A] flex items-center gap-1 font-medium p-1"
        >
          <span>Web Publik</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2. Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* 3. Mobile Slide-in Drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#E4E1D6] flex items-center justify-between">
          <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 overflow-hidden rounded-full border border-[#E4E1D6]">
              <Image src="/yourbrand.jpg" alt="Logo" fill className="object-cover scale-125" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-sm text-[#2F3D2A] leading-tight">
                YOUR BRAND
              </h2>
              <span className="text-[10px] uppercase tracking-wider text-[#6B6B5F] font-medium">
                Admin Panel
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-1.5 text-[#6B6B5F] hover:text-[#1E1E1A] hover:bg-[#F7F5EF] rounded-md"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#2F3D2A] text-white"
                    : "text-[#1E1E1A] hover:bg-[#F7F5EF] hover:text-[#2F3D2A]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#E4E1D6] space-y-2 shrink-0 bg-[#F7F5EF]/50">
          <Link
            href="/"
            target="_blank"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-between px-3 py-2.5 rounded text-xs font-medium text-[#6B6B5F] hover:bg-white hover:text-[#1E1E1A] transition-colors bg-white/70 border border-[#E4E1D6]/50"
          >
            <span>Lihat Website Publik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => {
              setMobileOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded text-xs font-semibold text-[#B3261E] hover:bg-red-50 transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </div>

      {/* 4. Desktop Sidebar (Hanya tampil di md: ke atas) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-[#E4E1D6] flex-col shrink-0 h-screen sticky top-0 z-30 select-none">
        {/* Brand header */}
        <div className="p-6 border-b border-[#E4E1D6] shrink-0">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="relative w-9 h-9 overflow-hidden rounded-full border border-[#E4E1D6]">
              <Image
                src="/yourbrand.jpg"
                alt="Your Brand"
                fill
                className="object-cover scale-125"
              />
            </div>
            <div>
              <h1 className="font-heading font-bold text-base text-[#2F3D2A] leading-tight">
                YOUR BRAND
              </h1>
              <span className="text-[11px] uppercase tracking-wider text-[#6B6B5F] font-medium">
                Admin Panel
              </span>
            </div>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#2F3D2A] text-white"
                    : "text-[#1E1E1A] hover:bg-[#F7F5EF] hover:text-[#2F3D2A]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Utilities */}
        <div className="p-4 border-t border-[#E4E1D6] space-y-2 shrink-0 bg-white">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded text-xs font-medium text-[#6B6B5F] hover:bg-[#F7F5EF] hover:text-[#1E1E1A] transition-colors"
          >
            <span>Lihat Website Publik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-medium text-[#B3261E] hover:bg-[#F7F5EF] transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
}
