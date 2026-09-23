import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getDb, initDb } from "@/lib/db";
import { ArrowRight, ShieldCheck, Sparkles, Clock, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await initDb();
  const db = getDb();

  // Fetch active categories
  const catRes = await db.execute(`
    SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC LIMIT 8
  `);

  // Fetch featured products
  const prodRes = await db.execute(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1
    ORDER BY p.name ASC
    LIMIT 6
  `);

  // Fetch tiers for min price calculation
  const tiersRes = await db.execute(`SELECT * FROM pricing_tiers`);
  const tiersMap: Record<string, number> = {};
  for (const t of tiersRes.rows) {
    const pId = String(t.product_id);
    const price = Number(t.price);
    if (!tiersMap[pId] || price < tiersMap[pId]) {
      tiersMap[pId] = price;
    }
  }

  const categories = catRes.rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    imageUrl: String(row.image_url),
  }));

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

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative bg-[#2F3D2A] text-white overflow-hidden">
          {/* Atmospheric background camping photo */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1920&q=80"
              alt="Outdoor Camping Your Brand"
              fill
              priority
              className="object-cover object-center opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/40" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
            <div className="max-w-2xl">

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight !text-white leading-[1.1] mb-6 font-heading">
                Sewa Alat Camping, Siap Berangkat Akhir Pekan Ini
              </h1>
              <p className="text-base sm:text-lg text-white/90 leading-relaxed mb-8">
                Tenda, carrier, alat masak, penerangan, dan perlengkapan petualangan lengkap.
                Pilih durasi sewa fleksibel, tanpa ribet daftar akun, dan langsung konfirmasi via WhatsApp.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/kategori"
                  className="bg-[#C1502E] hover:bg-[#A74223] text-white px-6 py-3.5 text-base font-semibold rounded-[6px] shadow-md flex items-center gap-2 transition-colors"
                >
                  <span>Lihat Semua Alat</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </Link>
                <Link
                  href="#cara-sewa"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/40 px-6 py-3.5 text-base font-semibold rounded-[6px] transition-colors"
                >
                  Cara Sewa
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION KATEGORI UNGGULAN */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-[#E4E1D6]">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1E1E1A] font-heading">
                Kategori Alat Outdoor
              </h2>
              <p className="mt-1 text-sm text-[#6B6B5F]">
                Pilihan perlengkapan terbaik dikelompokkan sesuai kebutuhan petualanganmu
              </p>
            </div>
            <Link
              href="/kategori"
              className="mt-3 sm:mt-0 text-sm font-semibold text-[#2F3D2A] hover:text-[#C1502E] flex items-center gap-1.5 transition-colors"
            >
              <span>Semua Kategori</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                className="group card-base overflow-hidden border border-[#E4E1D6] rounded-[6px] bg-white hover:border-[#2F3D2A] transition-all"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F7F5EF]">
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="font-heading font-bold text-base sm:text-lg text-white block">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-[#E4E1D6] flex items-center gap-1 group-hover:text-white transition-colors">
                      Lihat Peralatan <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* SECTION CARA SEWA */}
        <section id="cara-sewa" className="py-16 bg-[#FFFFFF] border-y border-[#E4E1D6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1E1E1A] font-heading">
                Cara Sewa di Your Brand
              </h2>
              <p className="mt-2 text-sm text-[#6B6B5F]">
                Proses penyewaan sederhana dan transparan dalam 3 langkah mudah
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="p-6 bg-[#F7F5EF] border border-[#E4E1D6] rounded-[6px] relative">
                <div className="w-10 h-10 rounded-full bg-[#2F3D2A] text-white font-heading font-bold text-lg flex items-center justify-center mb-4">
                  1
                </div>
                <h3 className="font-heading font-bold text-lg text-[#1E1E1A] mb-2">
                  Pilih alat & durasi sewa
                </h3>
                <p className="text-sm text-[#6B6B5F] leading-relaxed">
                  Pilih tenda, carrier, atau alat masak yang kamu butuhkan. Tentukan durasi sewa (2, 3, 4, atau 5 hari) dengan harga pasti tanpa hitungan manual.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 bg-[#F7F5EF] border border-[#E4E1D6] rounded-[6px] relative">
                <div className="w-10 h-10 rounded-full bg-[#2F3D2A] text-white font-heading font-bold text-lg flex items-center justify-center mb-4">
                  2
                </div>
                <h3 className="font-heading font-bold text-lg text-[#1E1E1A] mb-2">
                  Isi data diri di checkout
                </h3>
                <p className="text-sm text-[#6B6B5F] leading-relaxed">
                  Lengkapi nama lengkap, nomor WhatsApp aktif, dan unggah foto kartu identitas asli (KTP/SIM/KTM) untuk verifikasi cepat tanpa perlu repot registrasi.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 bg-[#F7F5EF] border border-[#E4E1D6] rounded-[6px] relative">
                <div className="w-10 h-10 rounded-full bg-[#C1502E] text-white font-heading font-bold text-lg flex items-center justify-center mb-4">
                  3
                </div>
                <h3 className="font-heading font-bold text-lg text-[#1E1E1A] mb-2">
                  Konfirmasi via WhatsApp & ambil
                </h3>
                <p className="text-sm text-[#6B6B5F] leading-relaxed">
                  Sistem langsung menyiapkan format pesanan rapi untuk dikirimkan ke WhatsApp admin. Barang disiapkan dan siap kamu ambil di lokasi rental kami.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION PRODUK UNGGULAN */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-[#E4E1D6]">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1E1E1A] font-heading">
                Peralatan Populer
              </h2>
              <p className="mt-1 text-sm text-[#6B6B5F]">
                Peralatan favorit pendaki dengan spesifikasi teruji dan kondisi terawat prima
              </p>
            </div>
            <Link
              href="/kategori"
              className="mt-3 sm:mt-0 text-sm font-semibold text-[#2F3D2A] hover:text-[#C1502E] flex items-center gap-1.5 transition-colors"
            >
              <span>Lihat Semua Produk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

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
        </section>

        {/* SECTION TENTANG KAMI & JAMINAN */}
        <section id="tentang-kami" className="py-16 bg-[#2F3D2A] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4 !text-white">
                  Kenapa Memilih Your Brand?
                </h2>
                <p className="text-white/85 leading-relaxed mb-6">
                  Kami mengerti bahwa keselamatan dan kenyamanan pendakian berawal dari peralatan yang prima. Setiap perlengkapan di Your Brand melalui proses pengecekan teliti, pencucian higienis, dan pengeringan sempurna setelah setiap pemakaian.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#4ade80] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-heading font-semibold !text-white">Peralatan Siap Pakai & Bebas Bau</h4>
                      <p className="text-xs text-white/75">Tenda kering, pasak lengkap, sleeping bag wangi dicuci bersih.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#4ade80] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-heading font-semibold !text-white">Sistem Tier Durasi Fleksibel</h4>
                      <p className="text-xs text-white/75">Harga hemat dan transparan mulai dari 2 hari hingga 5 hari sewa.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#4ade80] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-heading font-semibold !text-white">Lokasi Strategis & Ramah Pendaki</h4>
                      <p className="text-xs text-white/75">Mudah diakses saat keberangkatan maupun saat pengembalian barang.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative aspect-video rounded-[6px] overflow-hidden border border-white/20">
                <Image
                  src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1000&q=80"
                  alt="Basecamp Your Brand"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
