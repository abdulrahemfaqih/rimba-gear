import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getDb, initDb } from "@/lib/db";
import { ArrowLeft, Search } from "lucide-react";

export const dynamic = "force-dynamic";

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ q?: string }>;
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: CategoryDetailPageProps) {
  await initDb();
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const query = sp.q || "";

  const db = getDb();

  // Find category
  const catRes = await db.execute({
    sql: `SELECT * FROM categories WHERE slug = ? AND is_active = 1 LIMIT 1`,
    args: [slug],
  });

  if (catRes.rows.length === 0) {
    notFound();
  }

  const category = catRes.rows[0];
  const categoryId = String(category.id);
  const categoryName = String(category.name);

  // Find products in this category
  let prodSql = `
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.category_id = ? AND p.is_active = 1
  `;
  const prodArgs: any[] = [categoryId];

  if (query) {
    prodSql += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
    prodArgs.push(`%${query}%`, `%${query}%`);
  }

  prodSql += ` ORDER BY p.name ASC`;

  const prodRes = await db.execute({ sql: prodSql, args: prodArgs });

  // Get tiers for min price calculation
  const tiersRes = await db.execute(`SELECT * FROM pricing_tiers`);
  const tiersMap: Record<string, number> = {};
  for (const t of tiersRes.rows) {
    const pId = String(t.product_id);
    const price = Number(t.price);
    if (!tiersMap[pId] || price < tiersMap[pId]) {
      tiersMap[pId] = price;
    }
  }

  const products = prodRes.rows.map((row) => {
    let images: string[] = [];
    try {
      images = JSON.parse(String(row.images));
    } catch {
      images = [String(row.images)];
    }
    return {
      id: String(row.id),
      name: String(row.name),
      slug: String(row.slug),
      categoryName: String(row.category_name),
      categorySlug: String(row.category_slug),
      description: String(row.description),
      images,
      minPrice: tiersMap[String(row.id)] || 20000,
    };
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
          <span className="text-[#1E1E1A] font-medium">{categoryName}</span>
        </nav>

        {/* Heading & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-[#E4E1D6]">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E1E1A] font-heading">
              {categoryName}
            </h1>
            <p className="mt-1 text-sm text-[#6B6B5F]">
              Menampilkan {products.length} pilihan alat sewa dalam kategori ini
            </p>
          </div>

          {/* Search bar */}
          <form method="GET" className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#6B6B5F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Cari alat di kategori ini..."
              className="input-hairline pl-9 pr-3 py-2 text-sm w-full bg-white"
            />
          </form>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="card-base p-12 text-center bg-white border border-[#E4E1D6] rounded-[6px] max-w-md mx-auto my-12">
            <p className="font-heading font-semibold text-lg text-[#1E1E1A] mb-2">
              Tidak ada produk ditemukan
            </p>
            <p className="text-sm text-[#6B6B5F] mb-6">
              {query
                ? `Pencarian "${query}" tidak menemukan alat pada kategori ini.`
                : "Belum ada peralatan aktif pada kategori ini."}
            </p>
            <Link href="/kategori" className="btn-secondary text-sm inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Semua Kategori</span>
            </Link>
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
