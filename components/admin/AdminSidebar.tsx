"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Package,
  ClipboardList,
  LogOut,
  ExternalLink,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

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
    <aside className="w-64 bg-white border-r border-[#E4E1D6] flex flex-col shrink-0 min-h-screen">
      {/* Brand header */}
      <div className="p-6 border-b border-[#E4E1D6]">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="relative w-8 h-8">
            <Image
              src="/rimbagear_logo.png"
              alt="Rimba Gear"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="font-heading font-bold text-base text-[#2F3D2A] leading-tight">
              RIMBA GEAR
            </h1>
            <span className="text-[11px] uppercase tracking-wider text-[#6B6B5F] font-medium">
              Admin Panel
            </span>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="p-4 space-y-1 flex-1">
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
      <div className="p-4 border-t border-[#E4E1D6] space-y-2">
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
  );
}
