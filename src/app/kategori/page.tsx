import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, GitCompare, Grid3X3 } from "lucide-react";
import { getDb } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import type { ArticleSummary } from "@/types/domain";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Kategori rekomendasi produk",
  description: "Jelajahi kategori produk setup kerja, gadget produktivitas, home office, dan aksesori kerja yang dikurasi untuk kebutuhan harian.",
  path: "/kategori"
});

type CategoryIndexItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  featured: boolean;
  sortOrder: number;
  _count: { products: number };
};

const needCards = [
  { title: "Setup kerja lebih nyaman", copy: "Mulai dari kursi, meja, dan aksesori yang terasa dampaknya setiap hari." },
  { title: "Meja kecil tetap rapi", copy: "Cari produk ringkas yang membantu tanpa membuat area kerja makin penuh." },
  { title: "Meeting dan kerja hybrid", copy: "Temukan gadget ringan untuk panggilan, mengetik, dan kerja berpindah tempat." }
];

export default async function CategoriesIndexPage() {
  const [categories, articles]: [CategoryIndexItem[], ArticleSummary[]] = await Promise.all([
    getDb().category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { name: "asc" }]
    }),
    getDb().article.findMany({
      where: { isPublished: true, articleType: { in: ["GUIDE", "TIPS"] } },
      orderBy: { publishedAt: "desc" },
      take: 3
    })
  ]);

  const popular = categories.filter((category) => category.featured).slice(0, 4);

  return (
    <>
      <Header />
      <main>
        <section className="border-b border-line bg-[linear-gradient(180deg,#fbfaf5,#edf4eb)]">
          <div className="container-page grid gap-8 py-14 lg:grid-cols-[1fr_0.85fr]">
            <div>
              <p className="eyebrow">Kategori produk</p>
              <h1 className="mt-3 max-w-3xl font-serif text-4xl font-bold leading-tight sm:text-5xl">
                Browse rekomendasi berdasarkan kebutuhan belanja kamu.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-ink/70">
                Setiap kategori membantu kamu melihat produk sejenis, catatan kecocokan, estimasi harga, dan link pembelian yang lebih aman untuk dicek.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="#grid" className="btn-primary">Lihat kategori</Link>
                <Link href="/bandingkan" className="btn-secondary">Bandingkan produk</Link>
              </div>
            </div>
            <div className="grid gap-3 rounded-lg border border-line bg-white p-5 shadow-soft">
              <p className="eyebrow">Kategori populer</p>
              {popular.map((category) => (
                <Link key={category.slug} href={`/kategori/${category.slug}`} className="flex items-center justify-between rounded-md border border-line p-3 hover:border-moss">
                  <span className="font-semibold">{category.name}</span>
                  <span className="text-xs text-ink/55">{category._count.products} produk</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="grid" className="container-page py-12">
          <div className="mb-6">
            <p className="eyebrow">Semua kategori</p>
            <h2 className="font-serif text-3xl font-bold">Jelajahi berdasarkan kategori</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <article key={category.slug} className="card overflow-hidden">
                <div className="relative grid aspect-[16/7] place-items-center bg-[linear-gradient(135deg,#d9e7d0,#ffffff)] px-5 text-center">
                  {category.imageUrl ? (
                    <Image src={category.imageUrl} alt={category.name} fill className="object-cover" sizes="(min-width: 1024px) 33vw, 50vw" />
                  ) : (
                    <Grid3X3 className="h-7 w-7 text-moss" />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-2xl font-bold">{category.name}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/65">{category.description}</p>
                  <p className="mt-3 text-xs font-semibold text-moss">{category._count.products} produk tersedia</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link href={`/kategori/${category.slug}`} className="btn-secondary py-2">Lihat rekomendasi</Link>
                    <Link href={`/bandingkan?category=${category.slug}`} className="btn-secondary py-2">Bandingkan kategori ini</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="container-page">
            <div className="mb-6">
              <p className="eyebrow">Mulai dari kebutuhanmu</p>
              <h2 className="font-serif text-3xl font-bold">Tidak harus tahu nama produknya dulu</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {needCards.map((item) => (
                <div key={item.title} className="card p-5">
                  <h3 className="font-serif text-2xl font-bold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-ink/65">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container-page grid gap-5 py-12 lg:grid-cols-2">
          <Link href="/best" className="card flex items-center justify-between gap-4 p-6 hover:border-moss">
            <div>
              <p className="eyebrow">Best Pick</p>
              <h2 className="mt-2 font-serif text-3xl font-bold">Lihat pilihan produk berdasarkan tema</h2>
            </div>
            <ArrowRight className="h-5 w-5 text-moss" />
          </Link>
          <Link href="/bandingkan" className="card flex items-center justify-between gap-4 p-6 hover:border-moss">
            <div>
              <p className="eyebrow">Bandingkan</p>
              <h2 className="mt-2 font-serif text-3xl font-bold">Bandingkan produk sejenis sebelum beli</h2>
            </div>
            <GitCompare className="h-5 w-5 text-moss" />
          </Link>
        </section>

        {articles.length ? (
          <section className="bg-white py-12">
            <div className="container-page">
              <div className="mb-6 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-moss" />
                <h2 className="font-serif text-3xl font-bold">Panduan terkait</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {articles.map((article) => (
                  <Link key={article.slug} href={`/artikel/${article.slug}`} className="card block p-5 hover:border-moss">
                    <p className="text-xs font-semibold text-moss">{article.articleType.replace("_", " ")}</p>
                    <h3 className="mt-2 font-serif text-xl font-bold">{article.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink/65">{article.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
