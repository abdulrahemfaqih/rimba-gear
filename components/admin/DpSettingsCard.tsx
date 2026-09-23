"use client";

import { useState } from "react";
import { Percent, Check, Loader2, ShieldAlert } from "lucide-react";

interface DpSettingsCardProps {
  initialDp: number;
}

export default function DpSettingsCard({ initialDp }: DpSettingsCardProps) {
  const [dpPercentage, setDpPercentage] = useState(initialDp);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = async () => {
    if (dpPercentage < 0 || dpPercentage > 100) {
      setErrorMsg("Persentase DP harus di antara 0% dan 100%");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dpPercentage }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan pengaturan DP");

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-base p-5 bg-white border border-[#E4E1D6] rounded-[6px] shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#2F3D2A]/10 text-[#2F3D2A] flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-[#1E1E1A]">
              Pengaturan Uang Muka (DP)
            </h3>
            <span className="text-[11px] text-[#6B6B5F]">
              Besaran DP sewa alat di halaman Checkout & WhatsApp
            </span>
          </div>
        </div>

        {savedSuccess && (
          <span className="text-xs font-semibold text-[#3F7D45] bg-[#3F7D45]/10 px-2.5 py-1 rounded flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            Tersimpan!
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        <div className="flex items-center gap-2">
          <div className="relative w-28">
            <input
              type="number"
              min={0}
              max={100}
              value={dpPercentage}
              onChange={(e) => setDpPercentage(Number(e.target.value))}
              className="input-hairline w-full py-1.5 px-3 pr-8 text-sm font-bold bg-[#F7F5EF] text-[#1E1E1A]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6B6B5F]">
              %
            </span>
          </div>

          <div className="flex items-center gap-1">
            {[20, 30, 50, 100].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setDpPercentage(preset)}
                className={`px-2 py-1 text-xs font-semibold rounded border transition-colors ${
                  dpPercentage === preset
                    ? "bg-[#2F3D2A] text-white border-[#2F3D2A]"
                    : "bg-white text-[#6B6B5F] border-[#E4E1D6] hover:border-[#2F3D2A]"
                }`}
              >
                {preset}%
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary text-xs py-2 px-4 flex items-center justify-center gap-1.5 sm:ml-auto disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <span>Simpan Persentase DP</span>
          )}
        </button>
      </div>

      {errorMsg && (
        <span className="text-xs text-[#B3261E] mt-2 block">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
