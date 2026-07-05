import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getDb } from "@/lib/db";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { ProductGrid } from "@/components/public/ProductGrid";
import { EmailSignupForm } from "@/components/public/EmailSignupForm";
import { HeroSection } from "@/components/public/HeroSection";
import { PriceEstimate } from "@/components/public/PriceEstimate";
import { MarkdownText } from "@/components/public/MarkdownText";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import type { ProductCardData } from "@/types/domain";

export const dynamic = "force-dynamic";

// ISR: Revalidate every 3600 seconds (1 hour)
// Homepage content (categories, products, articles) can be static
// On-demand revalidation when admin publishes content
export const revalidate = 3600;

type CategoryCard = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  _count: { products: number };
  products: { images: { imageUrl: string; altText: string }[] }[];
};

type BestPickCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | null;
  products: { product: { bestFor: string; category: { name: string } } }[];
  _count: { products: number };
};

export default async function HomePage() {
  const db = getDb();
  const [categories, products, bestPicks]: [
    CategoryCard[],
    ProductCardData[],
    BestPickCard[]
  ] = await Promise.all([
    db.category.findMany({
      where: { featured: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { products: true } },
        products: {
          where: { isPublished: true },
          include: { images: { where: { isPrimary: true }, take: 1 } },
          take: 1
        }
      },
      take: 6
    }),
    db.product.findMany({
      where: { isPublished: true, isFeatured: true },
      include: {
        brand: true,
        category: true,
        images: { where: { isPrimary: true }, take: 1 },
        affiliateLinks: { where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 1 }
      },
      take: 8
    }),
    db.article.findMany({
      where: { isPublished: true, articleType: "BEST_PICKS" },
      include: {
        _count: { select: { products: true } },
        products: {
          orderBy: { sortOrder: "asc" },
          take: 3,
          include: { product: { include: { category: true } } }
        }
      },
      orderBy: { publishedAt: "desc" },
      take: 4
    })
  ]);

  const featuredProduct = products[0];

  const quickPick = featuredProduct ? (
    <div className="mt-4">
      <p className="text-sm font-semibold text-accent-dark">{featuredProduct.category?.name}</p>
      <h2 className="mt-2 text-2xl">{featuredProduct.name}</h2>
      <MarkdownText content={featuredProduct.shortDescription} className="mt-3 text-sm leading-6 text-neutral-600 prose-p:m-0" />
      <p className="mt-3 text-sm text-neutral-500">Cocok untuk: {featuredProduct.bestFor}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <PriceEstimate value={featuredProduct.priceEstimate} />
        <Link href={`/produk/${featuredProduct.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-accent-dark">
          Lihat alasan <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  ) : (
    <p className="mt-4 text-sm text-neutral-500">Produk pilihan akan tampil setelah data tersedia.</p>
  );

  return (
    <>
      <Header />
      <main>
        <HeroSection quickPick={quickPick} />

        <section id="produk" className="container-page py-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Produk pilihan</p>
              <h2 className="text-3xl">Baru diuji minggu ini</h2>
            </div>
            <Link href="/kategori" className="text-sm font-semibold text-accent-dark hover:underline">Lihat semua →</Link>
          </div>
          <ProductGrid products={products} />
        </section>

        <section className="bg-white py-12">
          <div className="container-page">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Best Pick</p>
                <h2 className="text-3xl">Pilihan terbaik per kebutuhan</h2>
              </div>
              <Link href="/best" className="btn-secondary">Lihat semua Best Pick</Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {bestPicks.map((article) => (
                <Link key={article.slug} href={`/best/${article.slug}`} className="card overflow-hidden">
                  <div className="relative aspect-[16/9]">
                    {article.coverImageUrl ? (
                      <Image src={article.coverImageUrl} alt={article.title} fill className="object-cover" sizes="(min-width: 1024px) 25vw, 50vw" />
                    ) : (
                      <ImagePlaceholder label="cover 16:9" />
                    )}
                  </div>
                  <div className="p-5">
                    <p className="eyebrow">{article.products[0]?.product.category.name ?? "Best Pick"}</p>
                    <h3 className="mt-3 line-clamp-2 text-xl leading-tight">{article.title}</h3>
                    <MarkdownText content={article.excerpt} className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600 prose-p:m-0" />
                    <div className="mt-4 flex flex-wrap gap-2">
                      {article.products.slice(0, 2).map((item) => (
                        <span key={item.product.bestFor} className="badge bg-accent-tint text-accent-dark">
                          {item.product.bestFor}
                        </span>
                      ))}
                    </div>
                    <p className="mt-4 text-xs font-semibold text-neutral-400">{article._count.products} produk dalam koleksi</p>
                  </div>
                </Link>
              ))}
              {!bestPicks.length ? (
                <div className="rounded-card border border-neutral-200 bg-white p-6 text-sm leading-6 text-neutral-500">
                  Belum ada Best Pick yang dipublish dari admin.
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="container-page py-12">
          <div className="mb-6">
            <p className="eyebrow">Kategori</p>
            <h2 className="text-3xl">Jelajah kategori</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const image = category.imageUrl;
              return (
                <article key={category.slug} className="card overflow-hidden">
                  <Link href={`/kategori/${category.slug}`} className="block">
                    <div className="relative aspect-[16/7]">
                      {image ? (
                        <Image src={image} alt={category.name} fill className="object-cover" sizes="(min-width: 1024px) 33vw, 50vw" />
                      ) : (
                        <ImagePlaceholder label="kategori" />
                      )}
                    </div>
                  </Link>
                  <div className="p-5">
                    <h3 className="text-xl">{category.name}</h3>
                    <MarkdownText content={category.description} className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600 prose-p:m-0" />
                    <p className="mt-3 text-xs font-semibold text-accent-dark">{category._count.products} produk tersedia</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link href={`/kategori/${category.slug}`} className="btn-secondary py-2">Lihat rekomendasi</Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="py-10">
          <div className="container-page">
            <EmailSignupForm location="homepage" variant="dark" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
