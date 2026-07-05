import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, GitCompare } from "lucide-react";
import { getDb } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { LoadMoreProductGrid } from "@/components/public/LoadMoreProductGrid";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { MarkdownText } from "@/components/public/MarkdownText";
import type { ArticleSummary, BrandSummary, CategorySummary, ProductCardData } from "@/types/domain";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getDb().category.findUnique({ where: { slug } });
  if (!category) return {};
  return buildMetadata({ title: `${category.name} terbaik dan worth it`, description: category.description, path: `/kategori/${slug}` });
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { slug } = await params;
  const search = await searchParams;
  const db = getDb();
  const category = (await db.category.findUnique({ where: { slug } })) as CategorySummary | null;
  if (!category) notFound();
  const activeSort = search.sort === "price" ? "price" : search.sort === "newest" ? "newest" : "featured";
  const orderBy = activeSort === "price" ? { priceEstimate: "asc" as const } : activeSort === "newest" ? { createdAt: "desc" as const } : { isFeatured: "desc" as const };
  const products: ProductCardData[] = await db.product.findMany({
    where: { categoryId: category.id, isPublished: true, brand: search.brand ? { slug: search.brand } : undefined },
    include: {
      brand: true,
      category: true,
      images: { where: { isPrimary: true }, take: 1 },
      affiliateLinks: { where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 1 }
    },
    orderBy
  });
  const [brands, articles, bestPicks]: [BrandSummary[], ArticleSummary[], ArticleSummary[]] = await Promise.all([
    db.brand.findMany({ where: { products: { some: { categoryId: category.id } } }, orderBy: { name: "asc" } }),
    db.article.findMany({ where: { isPublished: true, articleType: { not: "BEST_PICKS" }, categories: { some: { categoryId: category.id } } }, take: 4 }),
    db.article.findMany({ where: { isPublished: true, articleType: "BEST_PICKS", categories: { some: { categoryId: category.id } } }, take: 3 })
  ]);

  const sortOptions = [
    { id: "featured", label: "Terpilih", href: `/kategori/${slug}${search.brand ? `?brand=${search.brand}` : ""}` },
    { id: "price", label: "Harga termurah", href: `/kategori/${slug}?sort=price${search.brand ? `&brand=${search.brand}` : ""}` },
    { id: "newest", label: "Terbaru", href: `/kategori/${slug}?sort=newest${search.brand ? `&brand=${search.brand}` : ""}` }
  ];

  return (
    <>
      <Header />
      <main>
        <section className="border-b border-neutral-100 bg-gradient-wash">
          <div className="container-page grid gap-3 py-8 md:min-h-0">
            <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Kategori", href: "/kategori" }, { label: category.name, href: `/kategori/${category.slug}` }]} />
            <span className="badge w-fit bg-accent-tint text-accent-dark">✓ {products.length} produk diuji langsung</span>
            <h1 className="max-w-3xl text-4xl leading-tight">{category.name}</h1>
            <MarkdownText content={category.description} className="max-w-2xl text-base leading-7 text-neutral-600 prose-p:m-0" />
            <div className="mt-2 flex flex-wrap gap-3">
              <Link href="#produk" className="btn-primary">Lihat rekomendasi</Link>
              <Link href={`/bandingkan?category=${category.slug}`} className="btn-secondary">
                <GitCompare className="h-4 w-4" />
                Bandingkan kategori ini
              </Link>
            </div>
          </div>
        </section>

        <section id="produk" className="container-page grid gap-6 py-10">
          <div className="sticky top-[60px] z-30 flex flex-col gap-3 rounded-card border border-neutral-200 bg-white/95 p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/kategori/${slug}${activeSort !== "featured" ? `?sort=${activeSort}` : ""}`}
                className={cn(
                  "rounded-full border-2 px-4 py-2 text-sm font-semibold transition",
                  !search.brand ? "border-accent bg-accent-tint text-accent-dark" : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                )}
              >
                Semua brand
              </Link>
              {brands.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/kategori/${slug}?brand=${brand.slug}${activeSort !== "featured" ? `&sort=${activeSort}` : ""}`}
                  className={cn(
                    "rounded-full border-2 px-4 py-2 text-sm font-semibold transition",
                    search.brand === brand.slug ? "border-accent bg-accent-tint text-accent-dark" : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                  )}
                >
                  {brand.name}
                </Link>
              ))}
            </div>
            <div className="flex gap-2">
              {sortOptions.map((option) => (
                <Link
                  key={option.id}
                  href={option.href}
                  className={cn(
                    "rounded-control border-2 px-3 py-2 text-sm font-semibold transition",
                    activeSort === option.id ? "border-accent bg-accent-tint text-accent-dark" : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                  )}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>
          {products.length ? (
            <LoadMoreProductGrid products={products} />
          ) : (
            <div className="rounded-card border border-neutral-200 bg-white p-10 text-center">
              <h2 className="text-3xl">Belum ada produk yang cocok</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-500">Coba reset filter atau lihat kategori lain yang masih berdekatan dengan kebutuhanmu.</p>
              <Link href={`/kategori/${slug}`} className="btn-primary mt-5">Reset filter</Link>
            </div>
          )}
        </section>

        <section className="bg-white py-10">
          <div className="container-page grid gap-6 lg:grid-cols-2">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-accent-dark" />
                <h2 className="text-3xl">Artikel terkait</h2>
              </div>
              <div className="grid gap-3">
                {articles.length ? articles.map((article) => (
                  <Link key={article.slug} href={`/artikel/${article.slug}`} className="card flex items-center justify-between gap-4 p-4">
                    <span className="font-semibold">{article.title}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-accent-dark" />
                  </Link>
                )) : <p className="rounded-card border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">Belum ada artikel terkait untuk kategori ini.</p>}
              </div>
            </div>
            <div>
              <div className="mb-4 flex items-center gap-2">
                <GitCompare className="h-5 w-5 text-accent-dark" />
                <h2 className="text-3xl">Best Pick terkait</h2>
              </div>
              <div className="grid gap-3">
                {bestPicks.length ? bestPicks.map((article) => (
                  <Link key={article.slug} href={`/best/${article.slug}`} className="card flex items-center justify-between gap-4 p-4">
                    <span className="font-semibold">{article.title}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-accent-dark" />
                  </Link>
                )) : <Link href="/best" className="card flex items-center justify-between gap-4 p-4 font-semibold">Lihat semua Best Pick <ArrowRight className="h-4 w-4 text-accent-dark" /></Link>}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
