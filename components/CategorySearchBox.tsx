"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface CategorySearchBoxProps {
  categorySlug: string;
  initialQuery?: string;
}

export default function CategorySearchBox({
  categorySlug,
  initialQuery = "",
}: CategorySearchBoxProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Sync state if initialQuery changes from external navigation
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    startTransition(() => {
      if (trimmed) {
        router.push(`/kategori/${categorySlug}?q=${encodeURIComponent(trimmed)}`);
      } else {
        router.push(`/kategori/${categorySlug}`);
      }
    });
  };

  const handleClear = () => {
    setQuery("");
    startTransition(() => {
      router.push(`/kategori/${categorySlug}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full sm:w-72 md:w-80">
      <Search
        className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
          isPending ? "text-[#2F3D2A] animate-pulse" : "text-[#6B6B5F]"
        }`}
      />
      <input
        type="text"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari alat di kategori ini..."
        style={{
          paddingLeft: "2.5rem",
          paddingRight: query ? "2.5rem" : "1rem",
        }}
        className="input-hairline input-search text-sm w-full bg-white transition-all focus:border-[#2F3D2A]"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          title="Hapus pencarian"
          aria-label="Hapus kata kunci pencarian"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B5F] hover:text-[#1E1E1A] p-1 rounded-full hover:bg-[#F7F5EF] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}
