import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import CategorySearchBox from "@/components/CategorySearchBox";
import { getCategoryBySlug, getProducts } from "@/lib/db";
import { ArrowLeft, X } from "lucide-react";

export const dynamic = "force-dynamic";

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ q?: string }>;
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: CategoryDetailPageProps) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const query = (sp.q || "").trim();

  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const products = await getProducts({
    categoryId: category.id,
    search: query,
    includeInactive: false,
  });

  return (
    <>
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Breadcrumb */}
        <nav className="text-xs text-[#6B6B5F] mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#2F3D2A]">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/kategori" className="hover:text-[#2F3D2A]">
            Kategori
          </Link>
          <span>/</span>
          <span className="text-[#1E1E1A] font-medium">{category.name}</span>
        </nav>

        {/* Heading & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-[#E4E1D6]">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E1E1A] font-heading">
              {category.name}
            </h1>
            <p className="mt-1 text-sm text-[#6B6B5F]">
              {query
                ? `Menemukan ${products.length} alat sewa untuk "${query}"`
                : `Menampilkan ${products.length} pilihan alat sewa dalam kategori ini`}
            </p>
          </div>

          {/* Search bar */}
          <CategorySearchBox categorySlug={category.slug} initialQuery={query} />
        </div>

        {/* Active Filter Banner */}
        {query && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8 p-3.5 bg-white border border-[#E4E1D6] rounded-[6px]">
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#6B6B5F]">
              <span>Hasil pencarian untuk:</span>
              <span className="font-bold text-[#1E1E1A] bg-[#F7F5EF] px-2.5 py-0.5 rounded border border-[#E4E1D6]">
                &quot;{query}&quot;
              </span>
              <span className="text-[#2F3D2A] font-semibold">
                ({products.length} alat ditemukan)
              </span>
            </div>

            <Link
              href={`/kategori/${category.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C1502E] hover:text-[#A74223] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Hapus Filter Pencarian</span>
            </Link>
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="card-base p-8 sm:p-12 text-center bg-white border border-[#E4E1D6] rounded-[6px] max-w-md mx-auto my-12">
            <p className="font-heading font-semibold text-lg text-[#1E1E1A] mb-2">
              Tidak ada produk ditemukan
            </p>
            <p className="text-sm text-[#6B6B5F] mb-6">
              {query
                ? `Pencarian "${query}" tidak menemukan alat pada kategori ${category.name}.`
                : `Belum ada peralatan aktif pada kategori ${category.name}.`}
            </p>
            {query ? (
              <Link
                href={`/kategori/${category.slug}`}
                className="btn-primary text-sm inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Lihat Semua Alat {category.name}</span>
              </Link>
            ) : (
              <Link
                href="/kategori"
                className="btn-secondary text-sm inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Semua Kategori</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                categoryName={product.categoryName}
                categorySlug={product.categorySlug}
                description={product.description}
                images={product.images}
                minPrice={product.minPrice}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

