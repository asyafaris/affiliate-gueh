import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, GitCompare, SlidersHorizontal } from "lucide-react";
import { getDb } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { ProductGrid } from "@/components/public/ProductGrid";
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
  const category = await db.category.findUnique({ where: { slug } }) as CategorySummary | null;
  if (!category) notFound();
  const orderBy = search.sort === "price" ? { priceEstimate: "asc" as const } : search.sort === "newest" ? { createdAt: "desc" as const } : { isFeatured: "desc" as const };
  const products: ProductCardData[] = await db.product.findMany({
    where: { categoryId: category.id, isPublished: true, brand: search.brand ? { slug: search.brand } : undefined },
    include: { brand: true, category: true, images: { where: { isPrimary: true }, take: 1 } },
    orderBy
  });
  const [brands, articles, bestPicks]: [BrandSummary[], ArticleSummary[], ArticleSummary[]] = await Promise.all([
    db.brand.findMany({ where: { products: { some: { categoryId: category.id } } }, orderBy: { name: "asc" } }),
    db.article.findMany({ where: { isPublished: true, articleType: { not: "BEST_PICKS" }, categories: { some: { categoryId: category.id } } }, take: 4 }),
    db.article.findMany({ where: { isPublished: true, articleType: "BEST_PICKS", categories: { some: { categoryId: category.id } } }, take: 3 })
  ]);
  return (
    <>
      <Header />
      <main>
        <section className="border-b border-line bg-[linear-gradient(180deg,#fbfaf5,#edf4eb)]">
          <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_0.78fr]">
            <div>
              <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Kategori", href: "/kategori" }, { label: category.name, href: `/kategori/${category.slug}` }]} />
              <p className="eyebrow mt-8">Kategori pilihan</p>
              <h1 className="mt-3 max-w-3xl font-serif text-4xl font-bold leading-tight sm:text-5xl">{category.name}</h1>
              <MarkdownText content={category.description} className="mt-4 max-w-2xl text-lg leading-8 text-ink/70 prose-p:m-0" />
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="#produk" className="btn-primary">Lihat rekomendasi</Link>
                <Link href={`/bandingkan?category=${category.slug}`} className="btn-secondary">
                  <GitCompare className="h-4 w-4" />
                  Bandingkan kategori ini
                </Link>
              </div>
            </div>
            <aside className="overflow-hidden rounded-lg border border-line bg-white shadow-soft">
              {category.imageUrl ? (
                <div className="relative aspect-[16/9] bg-line">
                  <Image src={category.imageUrl} alt={category.name} fill priority className="object-cover" sizes="(min-width: 1024px) 40vw, 100vw" />
                </div>
              ) : null}
              <div className="grid content-start gap-3 p-5">
                <p className="eyebrow">Cara pakai halaman ini</p>
                <p className="text-sm leading-6 text-ink/70">
                  Mulai dari kebutuhan utama, gunakan filter brand atau harga, lalu buka detail produk untuk melihat alasan rekomendasi dan sumber pembelian.
                </p>
                <div className="grid gap-2 text-sm text-ink/65">
                  <p>{products.length} produk ditemukan</p>
                  <p>{brands.length} brand tersedia</p>
                  <p>{articles.length + bestPicks.length} konten terkait</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section id="produk" className="container-page grid gap-8 py-10">
          <div className="flex flex-col gap-4 rounded-lg border border-line bg-white p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-moss" />
              <p className="text-sm font-semibold">Filter dan urutkan</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className="btn-secondary py-2" href={`/kategori/${slug}`}>Semua brand</Link>
              {brands.map((brand) => <Link key={brand.slug} className="btn-secondary py-2" href={`/kategori/${slug}?brand=${brand.slug}`}>{brand.name}</Link>)}
              <Link className="btn-secondary py-2" href={`/kategori/${slug}?sort=price`}>Harga termurah</Link>
              <Link className="btn-secondary py-2" href={`/kategori/${slug}?sort=newest`}>Terbaru</Link>
            </div>
          </div>
          {products.length ? (
            <ProductGrid products={products} />
          ) : (
            <div className="rounded-lg border border-line bg-white p-10 text-center">
              <h2 className="font-serif text-3xl font-bold">Belum ada produk yang cocok</h2>
              <p className="mt-3 text-sm leading-6 text-ink/65">Coba reset filter atau lihat kategori lain yang masih berdekatan dengan kebutuhanmu.</p>
              <Link href={`/kategori/${slug}`} className="btn-primary mt-5">Reset filter</Link>
            </div>
          )}
        </section>

        <section className="bg-white py-10">
          <div className="container-page grid gap-6 lg:grid-cols-2">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-moss" />
                <h2 className="font-serif text-3xl font-bold">Artikel terkait</h2>
              </div>
              <div className="grid gap-3">
                {articles.length ? articles.map((article) => (
                  <Link key={article.slug} href={`/artikel/${article.slug}`} className="card flex items-center justify-between gap-4 p-4 hover:border-moss">
                    <span className="font-semibold">{article.title}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-moss" />
                  </Link>
                )) : <p className="rounded-lg border border-line bg-paper p-4 text-sm text-ink/60">Belum ada artikel terkait untuk kategori ini.</p>}
              </div>
            </div>
            <div>
              <div className="mb-4 flex items-center gap-2">
                <GitCompare className="h-5 w-5 text-moss" />
                <h2 className="font-serif text-3xl font-bold">Best Pick terkait</h2>
              </div>
              <div className="grid gap-3">
                {bestPicks.length ? bestPicks.map((article) => (
                  <Link key={article.slug} href={`/best/${article.slug}`} className="card flex items-center justify-between gap-4 p-4 hover:border-moss">
                    <span className="font-semibold">{article.title}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-moss" />
                  </Link>
                )) : <Link href="/best" className="card flex items-center justify-between gap-4 p-4 font-semibold hover:border-moss">Lihat semua Best Pick <ArrowRight className="h-4 w-4 text-moss" /></Link>}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
