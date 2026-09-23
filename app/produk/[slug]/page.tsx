import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetailClient from "@/components/ProductDetailClient";
import { getDb, initDb } from "@/lib/db";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  await initDb();
  const { slug } = await params;
  const db = getDb();

  const productResult = await db.execute({
    sql: `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE (p.slug = ? OR p.id = ?) AND p.is_active = 1
      LIMIT 1
    `,
    args: [slug, slug],
  });

  if (productResult.rows.length === 0) {
    notFound();
  }

  const row = productResult.rows[0];
  const productId = String(row.id);

  let images: string[] = [];
  try {
    images = JSON.parse(String(row.images));
  } catch {
    images = [String(row.images)];
  }

  const tiersResult = await db.execute({
    sql: `SELECT * FROM pricing_tiers WHERE product_id = ? ORDER BY days ASC`,
    args: [productId],
  });

  const pricingTiers = tiersResult.rows.map((t) => ({
    days: Number(t.days),
    price: Number(t.price),
  }));

  const product = {
    id: productId,
    categoryId: String(row.category_id),
    categoryName: String(row.category_name),
    categorySlug: String(row.category_slug),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description),
    images,
    pricingTiers,
  };

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ProductDetailClient product={product} />
      </main>
      <Footer />
    </>
  );
}
