import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";

export function buildMetadata(input: {
  title: string;
  description: string;
  path?: string;
  image?: string | null;
  robots?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
}): Metadata {
  const url = absoluteUrl(input.path ?? "/");
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    robots: input.robots ?? "index, follow",
    openGraph: {
      title: input.ogTitle || input.title,
      description: input.ogDescription || input.description,
      url,
      siteName: "Produk Worth It",
      locale: "id_ID",
      type: "website",
      images: input.image ? [{ url: input.image }] : undefined
    }
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url)
    }))
  };
}

export function articleJsonLd(article: { title: string; excerpt: string; slug: string; publishedAt?: Date | null; updatedAt: Date; coverImageUrl?: string | null }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.coverImageUrl ?? undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    mainEntityOfPage: absoluteUrl(`/artikel/${article.slug}`)
  };
}

export function productJsonLd(product: { name: string; shortDescription: string; slug: string; priceEstimate: number; currency: string; images: { imageUrl: string }[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: product.images.map((image) => image.imageUrl),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: product.currency,
      lowPrice: product.priceEstimate,
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/produk/${product.slug}`)
    }
  };
}
