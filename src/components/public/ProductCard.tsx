import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { MerchantCta } from "@/components/public/AffiliateButtonGroup";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { PriceEstimate } from "@/components/public/PriceEstimate";
import { formatRupiah } from "@/lib/utils";
import type { ProductCardData } from "@/types/domain";

export function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images?.[0];
  const primaryLink = product.affiliateLinks?.find((link) => link.isPrimary) ?? product.affiliateLinks?.[0];
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.priceEstimate
      ? Math.round((1 - product.priceEstimate / product.compareAtPrice) * 100)
      : null;

  return (
    <article className="card overflow-hidden">
      <Link href={`/produk/${product.slug}`} className="relative block aspect-[16/9]">
        {image ? (
          <Image src={image.imageUrl} alt={image.altText} fill className="object-cover" sizes="(min-width: 1024px) 25vw, 50vw" />
        ) : (
          <ImagePlaceholder label="product shot 16:9" />
        )}
        {discount ? <span className="badge discount absolute left-2.5 top-2.5 bg-accent-dark text-white">-{discount}%</span> : null}
      </Link>
      <div className="grid gap-2.5 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge tested bg-accent-tint text-accent-dark">✓ Tested</span>
          {typeof product.score === "number" ? (
            <span className="flex items-center gap-1 text-xs text-neutral-500">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {(product.score / 2).toFixed(1)} {product.reviewCount ? `(${product.reviewCount})` : null}
            </span>
          ) : null}
        </div>
        <Link href={`/produk/${product.slug}`} className="text-[15px] font-semibold leading-tight text-primary hover:text-accent-dark">
          {product.name}
        </Link>
        <p className="text-xs font-medium text-neutral-500">Cocok untuk: {product.bestFor}</p>
        <div className="flex items-baseline gap-2">
          <PriceEstimate value={product.priceEstimate} />
          {product.compareAtPrice && product.compareAtPrice > product.priceEstimate ? (
            <span className="text-xs text-neutral-400 line-through">{formatRupiah(product.compareAtPrice)}</span>
          ) : null}
        </div>
        {primaryLink ? (
          <MerchantCta
            link={primaryLink}
            sourcePageType="product_card"
            sourcePageSlug={product.slug}
            className="mt-1 justify-center text-sm"
          />
        ) : (
          <Link href={`/produk/${product.slug}`} className="btn-secondary mt-1 justify-center py-2 text-sm">
            Lihat detail
          </Link>
        )}
      </div>
    </article>
  );
}
