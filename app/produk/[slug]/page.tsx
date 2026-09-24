import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetailClient from "@/components/ProductDetailClient";
import { getProductBySlugOrId } from "@/lib/db";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlugOrId(slug);

  if (!product) {
    notFound();
  }

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
