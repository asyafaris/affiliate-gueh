import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GitCompare,
  Grid3X3,
  Search,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { getDb } from "@/lib/db";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { ProductGrid } from "@/components/public/ProductGrid";
import { EmailSignupForm } from "@/components/public/EmailSignupForm";
import { PriceEstimate } from "@/components/public/PriceEstimate";
import { MarkdownText } from "@/components/public/MarkdownText";
import type { ArticleSummary, ProductCardData } from "@/types/domain";

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

const intentCards = [
  {
    title: "Saya mau cari rekomendasi",
    copy: "Mulai dari daftar pilihan yang sudah dikurasi berdasarkan kebutuhan.",
    cta: "Lihat Best Pick",
    href: "/best",
    icon: Sparkles
  },
  {
    title: "Saya bingung pilih antara beberapa produk",
    copy: "Bandingkan produk sejenis supaya komprominya lebih kelihatan.",
    cta: "Bandingkan Produk",
    href: "/bandingkan",
    icon: GitCompare
  },
  {
    title: "Saya mau browse berdasarkan kategori",
    copy: "Telusuri produk dari kategori setup kerja, gadget, dan aksesori.",
    cta: "Lihat Kategori",
    href: "/kategori",
    icon: Grid3X3
  },
  {
    title: "Saya mau belajar sebelum beli",
    copy: "Baca panduan singkat sebelum memutuskan barang yang paling pas.",
    cta: "Baca Buying Guide",
    href: "#panduan",
    icon: BookOpen
  }
];

const methodology = [
  "Ada pros dan cons",
  "Ada catatan paling cocok untuk siapa",
  "Ada perbandingan produk sejenis",
  "Prioritas official store atau seller terpercaya jika tersedia",
  "Dikurasi untuk mengurangi risiko salah beli"
];

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
  const [categories, products, articles, bestPicks, comparisons]: [
    CategoryCard[],
    ProductCardData[],
    ArticleSummary[],
    BestPickCard[],
    ArticleSummary[]
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
      include: { brand: true, category: true, images: { where: { isPrimary: true }, take: 1 } },
      take: 6
    }),
    db.article.findMany({
      where: { isPublished: true, articleType: { in: ["GUIDE", "TIPS", "REVIEW"] } },
      orderBy: { publishedAt: "desc" },
      take: 4
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
    }),
    db.article.findMany({ where: { isPublished: true, articleType: "COMPARISON" }, orderBy: { publishedAt: "desc" }, take: 3 })
  ]);

  const featuredProduct = products[0];

  return (
    <>
      <Header />
      <main>
        <section className="border-b border-line bg-[linear-gradient(180deg,#fbfaf5,#edf4eb)]">
          <div className="container-page grid min-h-[620px] items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="eyebrow">Platform kurasi produk Indonesia</p>
              <h1 className="mt-4 max-w-4xl font-serif text-4xl font-bold leading-[1.05] text-ink sm:text-6xl">
                Temukan produk original yang paling worth it untuk kebutuhanmu.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/72">
                Kurasi produk setup kerja, gadget produktivitas, home office, dan barang fungsional yang dipilih berdasarkan kebutuhan, kualitas, review pengguna, dan reputasi sumber pembelian.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#produk" className="btn-primary">Cari rekomendasi produk</Link>
                <Link href="/bandingkan" className="btn-secondary">Bandingkan produk</Link>
              </div>
              <p className="mt-5 text-sm font-medium text-ink/60">
                Kurasi produk / Pros & cons / Perbandingan / Sumber pembelian terpercaya
              </p>
              <div id="cari" className="mt-8 flex max-w-xl items-center gap-3 rounded-lg border border-line bg-white p-2 shadow-soft">
                <Search className="ml-3 h-5 w-5 text-ink/40" />
                <input className="h-11 flex-1 bg-transparent text-sm outline-none" placeholder="Cari kursi, keyboard, lampu meja, tas kerja..." />
                <Link href="/kategori" className="btn-primary h-11">Jelajahi</Link>
              </div>
            </div>
            <aside className="grid gap-4">
              <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
                <p className="eyebrow">Quick pick</p>
                {featuredProduct ? (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-moss">{featuredProduct.category?.name}</p>
                    <h2 className="mt-2 font-serif text-3xl font-bold">{featuredProduct.name}</h2>
                    <MarkdownText content={featuredProduct.shortDescription} className="mt-3 text-sm leading-6 text-ink/70 prose-p:m-0" />
                    <p className="mt-3 text-sm text-ink/60">Cocok untuk: {featuredProduct.bestFor}</p>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <PriceEstimate value={featuredProduct.priceEstimate} />
                      <Link href={`/produk/${featuredProduct.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-moss">
                        Lihat alasan <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-ink/60">Produk pilihan akan tampil setelah data tersedia.</p>
                )}
              </div>
              <div className="grid gap-3 rounded-lg border border-line bg-ink p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-wide text-white/65">Kenapa bisa dipercaya?</p>
                {["Kami mulai dari kebutuhan, bukan hype.", "Kami mencatat kompromi produk.", "Kami mengutamakan sumber pembelian yang lebih aman."].map((item) => (
                  <p key={item} className="flex gap-2 text-sm leading-6 text-white/80">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-white" />
                    {item}
                  </p>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="border-y border-line bg-clay/5 py-8">
          <div className="container-page">
            <div className="mx-auto max-w-md">
              <EmailSignupForm location="homepage" />
            </div>
          </div>
        </section>

        <section className="container-page py-12">
          <div className="mb-6">
            <p className="eyebrow">Mulai cepat</p>
            <h2 className="font-serif text-3xl font-bold">Mau mulai dari mana?</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {intentCards.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href} className="card grid min-h-56 content-between p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
                  <div>
                    <Icon className="h-6 w-6 text-moss" />
                    <h3 className="mt-4 font-serif text-2xl font-bold leading-tight">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-ink/65">{item.copy}</p>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-moss">
                    {item.cta} <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="container-page grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="eyebrow">Bandingkan produk</p>
              <h2 className="mt-2 font-serif text-4xl font-bold">Bingung pilih barang yang mirip?</h2>
              <p className="mt-4 text-lg leading-8 text-ink/70">
                Pilih beberapa produk sejenis, lalu lihat perbedaan harga, spesifikasi, kelebihan, kekurangan, dan verdict berdasarkan kebutuhanmu.
              </p>
              <Link href="/bandingkan" className="btn-primary mt-6">Bandingkan sekarang</Link>
            </div>
            <div className="grid gap-3">
              {comparisons.length ? comparisons.map((article) => (
                <Link key={article.slug} href={`/bandingkan/${article.slug}`} className="card flex items-center justify-between gap-4 p-4 hover:border-moss">
                  <div>
                    <p className="text-xs font-semibold text-moss">Perbandingan editorial</p>
                    <h3 className="mt-1 font-serif text-xl font-bold">{article.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-ink/60">{article.excerpt}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-moss" />
                </Link>
              )) : (
                <div className="card p-6 text-sm text-ink/60">Halaman perbandingan akan tampil setelah artikel comparison tersedia.</div>
              )}
            </div>
          </div>
        </section>

        <section className="container-page py-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Best Pick</p>
              <h2 className="font-serif text-3xl font-bold">Pilihan produk berdasarkan kebutuhan</h2>
            </div>
            <Link href="/best" className="btn-secondary">Lihat semua Best Pick</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {bestPicks.map((article) => (
              <Link key={article.slug} href={`/best/${article.slug}`} className="card overflow-hidden transition hover:-translate-y-0.5 hover:border-moss hover:shadow-soft">
                <div className="relative aspect-[16/9] bg-[linear-gradient(135deg,#d9e7d0,#fbfaf5)]">
                  {article.coverImageUrl ? (
                    <Image src={article.coverImageUrl} alt={article.title} fill className="object-cover" sizes="(min-width: 1024px) 25vw, 50vw" />
                  ) : (
                    <div className="grid h-full place-items-center px-5 text-center text-sm font-semibold text-ink/60">Best Pick</div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-moss">{article.products[0]?.product.category.name ?? "Best Pick"}</p>
                  <h3 className="mt-3 line-clamp-2 font-serif text-2xl font-bold leading-tight">{article.title}</h3>
                  <MarkdownText content={article.excerpt} className="mt-3 line-clamp-3 text-sm leading-6 text-ink/65 prose-p:m-0" />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {article.products.slice(0, 2).map((item) => (
                      <span key={item.product.bestFor} className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">
                        {item.product.bestFor}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-xs font-semibold text-ink/55">{article._count.products} produk dalam koleksi</p>
                </div>
              </Link>
            ))}
            {!bestPicks.length ? (
              <div className="rounded-lg border border-line bg-white p-6 text-sm leading-6 text-ink/60">
                Belum ada Best Pick yang dipublish dari admin.
              </div>
            ) : null}
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="container-page">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Kategori</p>
                <h2 className="font-serif text-3xl font-bold">Jelajahi berdasarkan kategori</h2>
              </div>
              <Link href="/kategori" className="btn-secondary">Semua kategori</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const image = category.imageUrl;
                return (
                  <article key={category.slug} className="card overflow-hidden">
                    <Link href={`/kategori/${category.slug}`} className="block">
                      <div className="relative grid aspect-[16/7] place-items-center bg-[linear-gradient(135deg,#d9e7d0,#fbfaf5)] px-5 text-center">
                        {image ? (
                          <Image src={image} alt={category.name} fill className="object-cover" sizes="(min-width: 1024px) 33vw, 50vw" />
                        ) : (
                          <span className="text-sm font-semibold text-ink/70">Kategori pilihan</span>
                        )}
                      </div>
                    </Link>
                    <div className="p-5">
                      <h3 className="font-serif text-2xl font-bold">{category.name}</h3>
                      <MarkdownText content={category.description} className="mt-3 line-clamp-3 text-sm leading-6 text-ink/65 prose-p:m-0" />
                      <p className="mt-3 text-xs font-semibold text-moss">{category._count.products} produk tersedia</p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Link href={`/kategori/${category.slug}`} className="btn-secondary py-2">Lihat rekomendasi</Link>
                        <Link href={`/bandingkan?category=${category.slug}`} className="btn-secondary py-2">Bandingkan kategori ini</Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="produk" className="container-page py-12">
          <div className="mb-6">
            <p className="eyebrow">Produk pilihan</p>
            <h2 className="font-serif text-3xl font-bold">Produk yang lagi kami kurasi</h2>
          </div>
          <ProductGrid products={products} />
        </section>

        <section id="panduan" className="bg-white py-12">
          <div className="container-page">
            <div className="mb-6">
              <p className="eyebrow">Buying guide</p>
              <h2 className="font-serif text-3xl font-bold">Baca dulu sebelum beli</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {articles.map((article) => (
                <Link key={article.slug} href={`/artikel/${article.slug}`} className="card block p-5 hover:border-moss">
                  <p className="text-xs font-semibold text-moss">{article.articleType.replace("_", " ")}</p>
                  <h3 className="mt-2 font-serif text-2xl font-bold">{article.title}</h3>
                  <MarkdownText content={article.excerpt} className="mt-2 text-sm leading-6 text-ink/65 prose-p:m-0" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="container-page grid gap-8 py-12 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <p className="eyebrow">Metodologi</p>
            <h2 className="mt-2 font-serif text-4xl font-bold">Cara kami memilih produk</h2>
            <p className="mt-4 text-lg leading-8 text-ink/70">
              Kami tidak hanya menampilkan produk. Setiap rekomendasi disusun berdasarkan fungsi, kebutuhan pengguna, estimasi harga, kelebihan, kekurangan, reputasi brand, dan kecocokan untuk use case tertentu.
            </p>
          </div>
          <div className="grid gap-3">
            {methodology.map((item) => (
              <p key={item} className="flex gap-3 rounded-lg border border-line bg-white p-4 text-sm leading-6 text-ink/75">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
                {item}
              </p>
            ))}
          </div>
        </section>

        <section className="border-y border-line bg-clay/10 py-5">
          <div className="container-page text-sm leading-6 text-ink/75">
            Sebagian tautan pembelian di website ini dapat memberikan komisi kepada kami tanpa biaya tambahan untuk kamu. Rekomendasi tetap disusun secara editorial.
          </div>
        </section>

        <section className="container-page py-14 text-center">
          <h2 className="mx-auto max-w-2xl font-serif text-4xl font-bold">Mulai cari produk yang paling cocok buat kamu.</h2>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/bandingkan" className="btn-primary">Bandingkan produk</Link>
            <Link href="/best" className="btn-secondary">Lihat Best Pick</Link>
            <Link href="/kategori" className="btn-secondary">Jelajahi kategori</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
