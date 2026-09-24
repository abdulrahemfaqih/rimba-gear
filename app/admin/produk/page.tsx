"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Upload,
  Loader2,
  Star,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface PricingTier {
  days: number;
  price: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  description: string;
  images: string[];
  stock: number;
  isActive: boolean;
  minPrice: number;
  pricingTiers: PricingTier[];
}

interface Category {
  id: string;
  name: string;
}

export default function AdminProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formStock, setFormStock] = useState(5);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formTiers, setFormTiers] = useState<PricingTier[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Upload State
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [showManualUrls, setShowManualUrls] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch(
          `/api/products?includeInactive=true${
            selectedCategoryFilter ? `&categoryId=${selectedCategoryFilter}` : ""
          }`
        ),
        fetch("/api/categories?includeInactive=true"),
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      setProducts(prodData.products || []);
      setCategories(catData.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategoryFilter]);

  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const invalidFiles = fileList.filter((f) => !f.type.startsWith("image/"));
    if (invalidFiles.length > 0) {
      setUploadError("Semua file harus berupa gambar (JPG, PNG, WEBP, dll)");
      return;
    }

    try {
      setUploadingImages(true);
      setUploadError("");
      setUploadProgress(`Mengunggah ${fileList.length} foto...`);

      const formData = new FormData();
      for (const file of fileList) {
        formData.append("files", file);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengunggah foto");
      }

      const newUrls: string[] = data.urls || (data.url ? [data.url] : []);
      if (newUrls.length > 0) {
        setFormImages((prev) => [...prev, ...newUrls]);
      }
    } catch (err: any) {
      setUploadError(err.message || "Gagal mengunggah foto");
    } finally {
      setUploadingImages(false);
      setUploadProgress("");
      e.target.value = "";
    }
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    setFormImages((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
  };

  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    setFormImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  const handleMoveRight = (index: number) => {
    setFormImages((prev) => {
      if (index >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormCategoryId(categories[0]?.id || "");
    setFormDescription("");
    setFormImages([
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
    ]);
    setFormStock(5);
    setFormIsActive(true);
    setFormTiers([
      { days: 2, price: 38000 },
      { days: 3, price: 52000 },
      { days: 4, price: 62000 },
      { days: 5, price: 72000 },
    ]);
    setErrorMsg("");
    setUploadError("");
    setShowManualUrls(false);
    setModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategoryId(prod.categoryId);
    setFormDescription(prod.description);
    setFormImages(prod.images && prod.images.length > 0 ? [...prod.images] : []);
    setFormStock(prod.stock ?? 5);
    setFormIsActive(prod.isActive);
    setFormTiers(
      prod.pricingTiers && prod.pricingTiers.length > 0
        ? [...prod.pricingTiers]
        : [{ days: 2, price: 30000 }]
    );
    setErrorMsg("");
    setUploadError("");
    setShowManualUrls(false);
    setModalOpen(true);
  };

  const handleAddTierRow = () => {
    const nextDays = formTiers.length > 0 ? Math.max(...formTiers.map((t) => t.days)) + 1 : 2;
    const lastPrice = formTiers.length > 0 ? formTiers[formTiers.length - 1].price + 15000 : 35000;
    setFormTiers([...formTiers, { days: nextDays, price: lastPrice }]);
  };

  const handleRemoveTierRow = (idx: number) => {
    if (formTiers.length <= 1) {
      alert("Produk minimal harus memiliki 1 tier harga durasi sewa");
      return;
    }
    setFormTiers(formTiers.filter((_, i) => i !== idx));
  };

  const handleTierChange = (index: number, field: "days" | "price", value: number) => {
    const updated = [...formTiers];
    updated[index] = { ...updated[index], [field]: value };
    setFormTiers(updated);
  };

  const handleToggleStatus = async (prod: Product) => {
    try {
      await fetch(`/api/products/${prod.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !prod.isActive }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Nonaktifkan produk ini?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCategoryId || !formDescription.trim()) {
      setErrorMsg("Nama, kategori, dan deskripsi wajib diisi");
      return;
    }

    const images = formImages
      .map((url) => url.trim())
      .filter(Boolean);

    if (images.length === 0) {
      setErrorMsg("Minimal harus ada 1 foto produk");
      return;
    }

    if (formTiers.length === 0) {
      setErrorMsg("Minimal harus ada 1 tier harga sewa");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");

      const payload = {
        name: formName.trim(),
        categoryId: formCategoryId,
        description: formDescription.trim(),
        images,
        stock: Number(formStock ?? 5),
        pricingTiers: formTiers.map((t) => ({
          days: Number(t.days),
          price: Number(t.price),
        })),
        isActive: formIsActive,
      };

      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Gagal memperbarui produk");
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Gagal menambah produk");
      }

      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F5EF]">
      <AdminSidebar />

      <main className="flex-1 h-screen p-6 lg:p-10 overflow-y-auto">
        {/* Header */}
        <div className="mb-8 pb-4 border-b border-[#E4E1D6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1A] font-heading">
              Kelola Produk
            </h1>
            <p className="text-xs text-[#6B6B5F] mt-1">
              Daftar peralatan sewa dan konfigurasi tier harga sewa per durasi
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Category Filter */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="input-hairline text-xs py-2 px-3 bg-white"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              onClick={openAddModal}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Produk</span>
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="card-base bg-white border border-[#E4E1D6] rounded-[6px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F5EF] border-b border-[#E4E1D6] text-[#6B6B5F] uppercase font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-5">Foto</th>
                  <th className="py-3 px-5">Nama Produk</th>
                  <th className="py-3 px-5">Kategori</th>
                  <th className="py-3 px-5 text-center">Stok Unit</th>
                  <th className="py-3 px-5">Harga Mulai Dari</th>
                  <th className="py-3 px-5 text-center">Tier Durasi</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E1D6]/60 text-[#1E1E1A]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#6B6B5F]">
                      Memuat data produk...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#6B6B5F]">
                      Tidak ada produk ditemukan.
                    </td>
                  </tr>
                ) : (
                  products.map((prod) => {
                    const thumb = prod.images[0] || "/yourbrand.jpg";
                    return (
                      <tr key={prod.id} className="hover:bg-[#F7F5EF]/50 transition-colors">
                        <td className="py-3 px-5">
                          <div className="relative w-12 h-10 rounded-[4px] overflow-hidden bg-[#F7F5EF] border border-[#E4E1D6]">
                            <Image
                              src={thumb}
                              alt={prod.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <div className="font-bold text-sm text-[#1E1E1A]">{prod.name}</div>
                          <span className="text-[11px] text-[#6B6B5F] line-clamp-1">
                            {prod.description}
                          </span>
                        </td>
                        <td className="py-3 px-5">
                          <span className="bg-[#F7F5EF] px-2 py-0.5 rounded border border-[#E4E1D6] font-medium text-[11px] text-[#2F3D2A]">
                            {prod.categoryName}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-center font-bold text-[#1E1E1A]">
                          <span className="bg-[#F7F5EF] px-2 py-0.5 rounded border border-[#E4E1D6]">
                            {prod.stock ?? 5} unit
                          </span>
                        </td>
                        <td className="py-3 px-5 font-bold text-[#C1502E]">
                          Rp{prod.minPrice.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-5 text-center">
                          <span className="text-[11px] text-[#6B6B5F]">
                            {prod.pricingTiers?.length || 0} pilihan
                          </span>
                        </td>
                        <td className="py-3 px-5 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(prod)}
                            className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                              prod.isActive
                                ? "bg-[#3F7D45]/10 text-[#3F7D45] border border-[#3F7D45]/30 hover:bg-[#3F7D45]/20"
                                : "bg-[#B3261E]/10 text-[#B3261E] border border-[#B3261E]/30 hover:bg-[#B3261E]/20"
                            }`}
                          >
                            {prod.isActive ? "Aktif" : "Nonaktif"}
                          </button>
                        </td>
                        <td className="py-3 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(prod)}
                              className="p-1.5 text-[#6B6B5F] hover:text-[#2F3D2A] hover:bg-[#F7F5EF] rounded"
                              title="Edit Produk & Pricing"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(prod.id)}
                              className="p-1.5 text-[#6B6B5F] hover:text-[#B3261E] hover:bg-[#F7F5EF] rounded"
                              title="Nonaktifkan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Tambah/Edit Produk */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
            <div className="card-base bg-white border border-[#E4E1D6] rounded-[6px] max-w-xl w-full p-6 shadow-xl my-8">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E1D6] mb-4">
                <h3 className="font-heading font-bold text-base text-[#1E1E1A]">
                  {editingProduct ? `Edit Produk: ${editingProduct.name}` : "Tambah Produk Baru"}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-[#6B6B5F] hover:text-[#1E1E1A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-[#B3261E]/10 border border-[#B3261E]/20 text-[#B3261E] rounded text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs uppercase font-bold tracking-wider text-[#1E1E1A] mb-1">
                    Nama Produk
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Bivak Set 3x4 Meter"
                    className="input-hairline w-full text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider text-[#1E1E1A] mb-1">
                      Kategori
                    </label>
                    <select
                      value={formCategoryId}
                      onChange={(e) => setFormCategoryId(e.target.value)}
                      className="input-hairline w-full text-xs bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider text-[#1E1E1A] mb-1">
                      Stok Fisik Unit
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={formStock}
                      onChange={(e) => setFormStock(Math.max(0, parseInt(e.target.value) || 0))}
                      className="input-hairline w-full text-xs bg-white font-medium"
                      placeholder="5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider text-[#1E1E1A] mb-1">
                      Status Tampil
                    </label>
                    <select
                      value={formIsActive ? "1" : "0"}
                      onChange={(e) => setFormIsActive(e.target.value === "1")}
                      className="input-hairline w-full text-xs bg-white"
                    >
                      <option value="1">Aktif (Tampil)</option>
                      <option value="0">Nonaktif</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold tracking-wider text-[#1E1E1A] mb-1">
                    Deskripsi Lengkap
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Jelaskan spesifikasi, material, dan isi paket alat..."
                    className="input-hairline w-full text-xs"
                  />
                </div>

                {/* GALERI FOTO PRODUK DENGAN UPLOAD */}
                <div>
                  <div className="mb-2">
                    <label className="block text-xs uppercase font-bold tracking-wider text-[#1E1E1A]">
                      Foto Produk ({formImages.length})
                    </label>
                    <span className="text-[11px] text-[#6B6B5F]">
                      Foto pertama akan otomatis menjadi foto utama (cover produk)
                    </span>
                  </div>

                  {/* Grid Galeri Foto */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {formImages.map((url, idx) => (
                      <div
                        key={`${url}-${idx}`}
                        className={`relative group border rounded-[6px] overflow-hidden bg-[#F7F5EF] flex flex-col ${
                          idx === 0
                            ? "border-[#2F3D2A] ring-2 ring-[#2F3D2A]/20"
                            : "border-[#E4E1D6] hover:border-[#2F3D2A]/50"
                        }`}
                      >
                        <div className="relative aspect-[4/3] w-full bg-white">
                          <Image
                            src={url}
                            alt={`Foto ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                          {idx === 0 ? (
                            <span className="absolute top-1.5 left-1.5 bg-[#2F3D2A] text-[#F7F5EF] text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-[#F7F5EF]" />
                              Cover Utama
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetCover(idx)}
                              className="absolute top-1.5 left-1.5 bg-black/70 hover:bg-[#2F3D2A] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow"
                              title="Jadikan Foto Utama"
                            >
                              <Star className="w-2.5 h-2.5" />
                              Set Utama
                            </button>
                          )}

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1.5 right-1.5 bg-[#B3261E] hover:bg-[#901e18] text-white p-1 rounded opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow"
                            title="Hapus Foto"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Bar Kontrol Posisi */}
                        <div className="px-2 py-1 bg-[#F7F5EF] border-t border-[#E4E1D6] flex items-center justify-between text-[10px]">
                          <span className="font-mono text-[#6B6B5F]">
                            #{idx + 1}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveLeft(idx)}
                              className="p-0.5 text-[#6B6B5F] hover:text-[#1E1E1A] disabled:opacity-20"
                              title="Pindahkan ke kiri"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === formImages.length - 1}
                              onClick={() => handleMoveRight(idx)}
                              className="p-0.5 text-[#6B6B5F] hover:text-[#1E1E1A] disabled:opacity-20"
                              title="Pindahkan ke kanan"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Tombol Upload Dropzone */}
                    <label
                      className={`border-2 border-dashed rounded-[6px] aspect-[4/3] flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-colors ${
                        uploadingImages
                          ? "border-[#3F7D45] bg-[#3F7D45]/5"
                          : "border-[#E4E1D6] hover:border-[#2F3D2A] bg-white hover:bg-[#F7F5EF]/60"
                      }`}
                    >
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFilesUpload}
                        className="hidden"
                        disabled={uploadingImages}
                      />
                      {uploadingImages ? (
                        <div className="flex flex-col items-center gap-1 text-[#3F7D45] p-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-[10px] font-bold leading-tight">
                            {uploadProgress || "Mengunggah..."}
                          </span>
                          <span className="text-[9px] text-[#6B6B5F]">Mohon tunggu sebentar</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-7 h-7 rounded-full bg-[#F7F5EF] flex items-center justify-center text-[#2F3D2A]">
                            <Upload className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-bold text-[#1E1E1A] leading-tight">
                            + Upload Foto
                          </span>
                          <span className="text-[9px] text-[#6B6B5F]">
                            Pilih 1 atau banyak file
                          </span>
                        </div>
                      )}
                    </label>
                  </div>

                  {uploadError && (
                    <p className="text-[11px] text-[#B3261E] mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{uploadError}</span>
                    </p>
                  )}

                  {/* Manual URLs editor option */}
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setShowManualUrls(!showManualUrls)}
                      className="text-[10px] text-[#6B6B5F] hover:text-[#2F3D2A] underline"
                    >
                      {showManualUrls ? "Sembunyikan editor URL teks" : "Atau edit daftar URL gambar secara langsung (manual)"}
                    </button>
                    {showManualUrls && (
                      <div className="mt-1">
                        <textarea
                          rows={3}
                          value={formImages.join("\n")}
                          onChange={(e) =>
                            setFormImages(
                              e.target.value
                                .split("\n")
                                .map((u) => u.trim())
                                .filter(Boolean)
                            )
                          }
                          placeholder="https://..."
                          className="input-hairline w-full text-xs font-mono"
                        />
                        <span className="text-[10px] text-[#6B6B5F] block mt-0.5">
                          1 baris = 1 URL foto. Baris paling atas adalah foto utama (cover).
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* DYNAMIC PRICING TIERS SECTION */}
                <div className="pt-2 border-t border-[#E4E1D6]">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#1E1E1A]">
                        Tier Harga Sewa Dinamis
                      </h4>
                      <span className="text-[11px] text-[#6B6B5F]">
                        Tentukan harga tetap untuk setiap opsi durasi sewa
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddTierRow}
                      className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah Durasi</span>
                    </button>
                  </div>

                  <div className="border border-[#E4E1D6] rounded-[6px] overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F7F5EF] text-[#6B6B5F] font-semibold border-b border-[#E4E1D6]">
                        <tr>
                          <th className="py-2 px-3">Durasi (Hari)</th>
                          <th className="py-2 px-3">Harga Sewa (Rp)</th>
                          <th className="py-2 px-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E4E1D6]/60">
                        {formTiers.map((tier, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="1"
                                  value={tier.days}
                                  onChange={(e) =>
                                    handleTierChange(idx, "days", Number(e.target.value))
                                  }
                                  className="input-hairline py-1 px-2 w-20 text-xs text-center"
                                />
                                <span className="text-xs text-[#6B6B5F]">Hari</span>
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-[#6B6B5F]">Rp</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="1000"
                                  value={tier.price}
                                  onChange={(e) =>
                                    handleTierChange(idx, "price", Number(e.target.value))
                                  }
                                  className="input-hairline py-1 px-2 w-32 text-xs"
                                />
                              </div>
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveTierRow(idx)}
                                className="p-1 text-[#6B6B5F] hover:text-[#B3261E] rounded"
                                title="Hapus baris durasi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E4E1D6] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn-secondary text-xs py-2 px-3"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    {submitting ? "Menyimpan..." : "Simpan Produk"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
