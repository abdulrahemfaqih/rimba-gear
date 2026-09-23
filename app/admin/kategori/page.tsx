"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Plus, Edit2, Trash2, X, AlertCircle, Upload, Loader2, Image as ImageIcon } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
}

export default function AdminKategoriPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showManualUrl, setShowManualUrl] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories?includeInactive=true");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("File harus berupa gambar (JPG, PNG, WEBP, dll)");
      return;
    }

    try {
      setUploadingImage(true);
      setUploadError("");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Gagal mengunggah foto kategori");
      }

      setFormImageUrl(data.url);
    } catch (err: any) {
      setUploadError(err.message || "Gagal upload foto");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormImageUrl("");
    setFormSortOrder(categories.length + 1);
    setFormIsActive(true);
    setErrorMsg("");
    setUploadError("");
    setShowManualUrl(false);
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormImageUrl(cat.imageUrl);
    setFormSortOrder(cat.sortOrder);
    setFormIsActive(cat.isActive);
    setErrorMsg("");
    setUploadError("");
    setShowManualUrl(false);
    setModalOpen(true);
  };

  const handleToggleStatus = async (cat: Category) => {
    try {
      await fetch(`/api/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Nonaktifkan kategori ini?")) return;
    try {
      await fetch(`/api/categories/${id}`, { method: "DELETE" });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formImageUrl.trim()) {
      setErrorMsg("Nama dan URL foto kategori wajib diisi");
      return;
    }

    try {
      setFormSubmitting(true);
      setErrorMsg("");

      if (editingCategory) {
        // Update
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            imageUrl: formImageUrl.trim(),
            sortOrder: formSortOrder,
            isActive: formIsActive,
          }),
        });
        if (!res.ok) throw new Error("Gagal memperbarui kategori");
      } else {
        // Create
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            imageUrl: formImageUrl.trim(),
            sortOrder: formSortOrder,
            isActive: formIsActive,
          }),
        });
        if (!res.ok) throw new Error("Gagal menambah kategori");
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan");
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F5EF]">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="mb-8 pb-4 border-b border-[#E4E1D6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1A] font-heading">
              Kelola Kategori
            </h1>
            <p className="text-xs text-[#6B6B5F] mt-1">
              Atur kategori perlengkapan outdoor yang tampil di website
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kategori</span>
          </button>
        </div>

        {/* Categories Table */}
        <div className="card-base bg-white border border-[#E4E1D6] rounded-[6px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F5EF] border-b border-[#E4E1D6] text-[#6B6B5F] uppercase font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-5">Foto</th>
                  <th className="py-3 px-5">Nama Kategori</th>
                  <th className="py-3 px-5">Slug</th>
                  <th className="py-3 px-5 text-center">Urutan</th>
                  <th className="py-3 px-5 text-center">Jumlah Produk</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E1D6]/60 text-[#1E1E1A]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#6B6B5F]">
                      Memuat data kategori...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#6B6B5F]">
                      Belum ada kategori. Silakan tambah kategori baru.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-[#F7F5EF]/50 transition-colors">
                      <td className="py-3 px-5">
                        <div className="relative w-12 h-10 rounded-[4px] overflow-hidden bg-[#F7F5EF] border border-[#E4E1D6]">
                          <Image
                            src={cat.imageUrl}
                            alt={cat.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-5 font-bold text-sm text-[#1E1E1A]">
                        {cat.name}
                      </td>
                      <td className="py-3 px-5 font-mono text-[#6B6B5F]">
                        {cat.slug}
                      </td>
                      <td className="py-3 px-5 text-center font-mono">
                        {cat.sortOrder}
                      </td>
                      <td className="py-3 px-5 text-center">
                        <span className="bg-[#F7F5EF] px-2 py-0.5 rounded border border-[#E4E1D6] font-medium">
                          {cat.productCount} alat
                        </span>
                      </td>
                      <td className="py-3 px-5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cat)}
                          className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                            cat.isActive
                              ? "bg-[#3F7D45]/10 text-[#3F7D45] border border-[#3F7D45]/30 hover:bg-[#3F7D45]/20"
                              : "bg-[#B3261E]/10 text-[#B3261E] border border-[#B3261E]/30 hover:bg-[#B3261E]/20"
                          }`}
                        >
                          {cat.isActive ? "Aktif" : "Nonaktif"}
                        </button>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-1.5 text-[#6B6B5F] hover:text-[#2F3D2A] hover:bg-[#F7F5EF] rounded"
                            title="Edit Kategori"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-1.5 text-[#6B6B5F] hover:text-[#B3261E] hover:bg-[#F7F5EF] rounded"
                            title="Nonaktifkan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Tambah/Edit */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="card-base bg-white border border-[#E4E1D6] rounded-[6px] max-w-md w-full p-6 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E1D6] mb-4">
                <h3 className="font-heading font-bold text-base text-[#1E1E1A]">
                  {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase font-bold tracking-wider text-[#1E1E1A] mb-1">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Tenda Camping"
                    className="input-hairline w-full text-xs"
                  />
                </div>

                <div>
                  <div className="mb-1.5">
                    <label className="block text-xs uppercase font-bold tracking-wider text-[#1E1E1A]">
                      Foto Kategori
                    </label>
                  </div>

                  {/* Preview if image exists */}
                  {formImageUrl ? (
                    <div className="border border-[#E4E1D6] rounded-[6px] p-2.5 bg-[#F7F5EF] flex items-center gap-3">
                      <div className="relative w-20 h-16 rounded-[4px] overflow-hidden bg-white border border-[#E4E1D6] shrink-0">
                        <Image
                          src={formImageUrl}
                          alt="Preview Kategori"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] text-[#6B6B5F] truncate block mb-1">
                          {formImageUrl.split("/").pop()}
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-semibold text-[#2F3D2A] hover:underline cursor-pointer flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>Ganti Foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                              disabled={uploadingImage}
                            />
                          </label>
                          <span className="text-[#E4E1D6]">•</span>
                          <button
                            type="button"
                            onClick={() => setFormImageUrl("")}
                            className="text-[11px] text-[#B3261E] hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Dropzone / Upload button */
                    <label
                      className={`border-2 border-dashed rounded-[6px] p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                        uploadingImage
                          ? "border-[#3F7D45] bg-[#3F7D45]/5"
                          : "border-[#E4E1D6] hover:border-[#2F3D2A] bg-white hover:bg-[#F7F5EF]/60"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      {uploadingImage ? (
                        <div className="flex flex-col items-center gap-1 text-[#3F7D45]">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-xs font-semibold">Mengunggah foto...</span>
                          <span className="text-[10px] text-[#6B6B5F]">Mohon tunggu sebentar</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-center">
                          <div className="w-8 h-8 rounded-full bg-[#F7F5EF] flex items-center justify-center text-[#2F3D2A] mb-0.5">
                            <Upload className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-[#1E1E1A]">
                            Pilih / Upload Foto Kategori
                          </span>
                          <span className="text-[10px] text-[#6B6B5F]">
                            Format PNG, JPG, atau JPEG
                          </span>
                        </div>
                      )}
                    </label>
                  )}

                  {uploadError && (
                    <p className="text-[11px] text-[#B3261E] mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{uploadError}</span>
                    </p>
                  )}

                  {/* Manual URL toggle */}
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setShowManualUrl(!showManualUrl)}
                      className="text-[10px] text-[#6B6B5F] hover:text-[#2F3D2A] underline"
                    >
                      {showManualUrl ? "Sembunyikan URL manual" : "Atau masukkan URL gambar secara manual"}
                    </button>
                    {showManualUrl && (
                      <input
                        type="url"
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="input-hairline w-full text-xs font-mono mt-1"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider text-[#1E1E1A] mb-1">
                      Urutan Tampil
                    </label>
                    <input
                      type="number"
                      value={formSortOrder}
                      onChange={(e) => setFormSortOrder(Number(e.target.value))}
                      className="input-hairline w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider text-[#1E1E1A] mb-1">
                      Status
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
                    disabled={formSubmitting}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    {formSubmitting ? "Menyimpan..." : "Simpan Kategori"}
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
