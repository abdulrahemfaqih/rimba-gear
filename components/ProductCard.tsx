import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  categoryName?: string;
  categorySlug?: string;
  description: string;
  images: string[];
  minPrice: number;
}

export default function ProductCard({
  name,
  slug,
  categoryName,
  description,
  images,
  minPrice,
}: ProductCardProps) {
  const thumbnail = images && images.length > 0 ? images[0] : "/yourbrand.jpg";

  return (
    <div className="card-base group flex flex-col overflow-hidden bg-white border border-[#E4E1D6] rounded-[6px] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all">
      {/* Product Image */}
      <Link href={`/produk/${slug}`} className="relative aspect-[4/3] w-full overflow-hidden bg-[#F7F5EF] block">
        <Image
          src={thumbnail}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {categoryName && (
          <span className="absolute top-3 left-3 bg-[#FFFFFF]/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#2F3D2A] border border-[#E4E1D6] rounded">
            {categoryName}
          </span>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-1">
        <Link href={`/produk/${slug}`}>
          <h3 className="font-heading font-bold text-lg text-[#1E1E1A] group-hover:text-[#2F3D2A] transition-colors line-clamp-1">
            {name}
          </h3>
        </Link>

        <p className="mt-1 text-sm text-[#6B6B5F] line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Pricing & CTA */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#E4E1D6]/60">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#6B6B5F] block font-medium">
              Mulai Dari
            </span>
            <span className="text-base font-bold text-[#C1502E]">
              Rp{minPrice.toLocaleString("id-ID")}
              <span className="text-xs font-normal text-[#6B6B5F]"> / sewa</span>
            </span>
          </div>

          <Link
            href={`/produk/${slug}`}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <span>Detail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
