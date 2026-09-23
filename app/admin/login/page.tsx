"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, User, ArrowRight, AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk");
      }

      router.push(redirectTarget);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Username atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-base p-8 bg-white border border-[#E4E1D6] rounded-[6px] shadow-sm">
      {errorMsg && (
        <div className="mb-5 p-3.5 bg-[#B3261E]/10 border border-[#B3261E]/20 text-[#B3261E] rounded-[6px] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Username Field */}
        <div>
          <label className="block text-xs uppercase font-bold tracking-wider text-[#1E1E1A] mb-1.5">
            Username
          </label>
          <div className="relative flex items-center">
            <User className="w-4 h-4 text-[#6B6B5F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username admin"
              className="input-hairline w-full text-sm placeholder:text-[#6B6B5F]/60"
              style={{ paddingLeft: "2.75rem", paddingRight: "1rem" }}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs uppercase font-bold tracking-wider text-[#1E1E1A] mb-1.5">
            Password
          </label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-[#6B6B5F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password admin"
              className="input-hairline w-full text-sm placeholder:text-[#6B6B5F]/60"
              style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B5F] hover:text-[#1E1E1A] p-1 rounded"
              title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <span>{loading ? "Memverifikasi..." : "Masuk ke Panel Admin"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      <div className="mt-6 pt-5 border-t border-[#E4E1D6] text-center">
        <Link
          href="/"
          className="text-xs text-[#6B6B5F] hover:text-[#2F3D2A] inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Website Rental</span>
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#F7F5EF] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo & Title */}
        <div className="text-center mb-6">
          <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full border-2 border-[#E4E1D6] shadow-sm">
            <Image
              src="/yourbrand.jpg"
              alt="Your Brand"
              fill
              sizes="64px"
              className="object-cover scale-125"
              priority
            />
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-[#2F3D2A] tracking-tight">
            YOUR BRAND
          </h1>
          <span className="text-xs uppercase tracking-wider text-[#6B6B5F] font-semibold">
            Portal Administrasi Rental
          </span>
        </div>

        <Suspense
          fallback={
            <div className="card-base p-8 bg-white border border-[#E4E1D6] rounded-[6px] text-center text-sm text-[#6B6B5F]">
              Memuat formulir login...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
