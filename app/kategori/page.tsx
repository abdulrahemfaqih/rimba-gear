import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getDb, initDb } from "@/lib/db";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await initDb();
  const db = getDb();

  const categoriesRes = await db.execute(`
    SELECT c.*, COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
    WHERE c.is_active = 1
    GROUP BY c.id
    ORDER BY c.sort_order ASC, c.name ASC
  `);

  const categories = categoriesRes.rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    imageUrl: String(row.image_url),
    productCount: Number(row.product_count || 0),
  }));

  return (
    <>
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-[#E4E1D6]">
          <nav className="text-xs text-[#6B6B5F] mb-3 flex items-center gap-1.5">
            <Link href="/" className="hover:text-[#2F3D2A]">
              Beranda
            </Link>
            <span>/</span>
            <span className="text-[#1E1E1A] font-medium">Kategori</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E1E1A] font-heading">
            Kategori Alat
          </h1>
          <p className="mt-2 text-sm text-[#6B6B5F]">
            Menampilkan {categories.length} kategori perlengkapan outdoor siap sewa
          </p>
        </div>

        {/* Categories Grid (3 cols desktop, 2 cols tablet, 1 col mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/kategori/${cat.slug}`}
              className="card-base group overflow-hidden bg-white border border-[#E4E1D6] rounded-[6px] hover:border-[#2F3D2A] transition-all flex flex-col"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F7F5EF]">
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-lg text-[#1E1E1A] group-hover:text-[#2F3D2A] transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-[#6B6B5F] block mt-0.5">
                    {cat.productCount} alat tersedia
                  </span>
                </div>

                <div className="w-8 h-8 rounded-full bg-[#F7F5EF] flex items-center justify-center text-[#2F3D2A] group-hover:bg-[#2F3D2A] group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
