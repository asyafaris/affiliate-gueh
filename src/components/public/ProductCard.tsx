import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PriceEstimate } from "@/components/public/PriceEstimate";
import { MarkdownText } from "@/components/public/MarkdownText";
import type { ProductCardData } from "@/types/domain";

export function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images?.[0];
  return (
    <article className="card overflow-hidden">
      <Link href={`/produk/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] bg-line">
          {image ? <Image src={image.imageUrl} alt={image.altText} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" /> : null}
        </div>
      </Link>
      <div className="grid gap-3 p-4">
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-moss">
          <span>{product.category?.name}</span>
          <span>{product.brand?.name}</span>
        </div>
        <Link href={`/produk/${product.slug}`} className="font-serif text-xl font-bold leading-tight hover:text-moss">
          {product.name}
        </Link>
        <MarkdownText content={product.shortDescription} className="line-clamp-2 text-sm leading-6 text-ink/70 prose-p:m-0" />
        <p className="text-xs font-medium text-ink/60">Cocok untuk: {product.bestFor}</p>
        <div className="flex items-center justify-between gap-3 pt-1">
          <PriceEstimate value={product.priceEstimate} />
          <Link href={`/produk/${product.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-moss">
            Review <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
