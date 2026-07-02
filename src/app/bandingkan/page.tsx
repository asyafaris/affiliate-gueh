import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { getDb } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { InteractiveComparison } from "@/components/public/InteractiveComparison";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Bandingkan produk sebelum beli",
  description: "Pusat perbandingan produk sejenis untuk melihat harga, spesifikasi, pros, cons, dan rekomendasi berdasarkan kebutuhan.",
  path: "/bandingkan"
});

type ComparisonArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  products: { product: { name: string; bestFor: string; category: { name: string; slug: string } } }[];
};

export default async function CompareIndexPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const search = await searchParams;
  const [categoriesRaw, products, comparisons]: [
    {
      id: string;
      name: string;
      slug: string;
      description: string;
      _count: { products: number };
    }[],
    {
      id: string;
      name: string;
      slug: string;
      shortDescription: string;
      editorialSummary: string;
      bestFor: string;
      priceEstimate: number;
      category: { id: string; name: string; slug: string };
      brand: { name: string };
      specs: { id: string; specGroup: string; label: string; value: string }[];
      prosCons: { type: "PRO" | "CON"; content: string }[];
      affiliateLinks: {
        id: string;
        redirectCode: string;
        buttonLabel: string;
        merchantName: string;
        isPrimary: boolean;
        price: number | null;
      }[];
    }[],
    ComparisonArticle[]
  ] = await Promise.all([
    getDb().category.findMany({
      where: { products: { some: { isPublished: true } } },
      include: { _count: { select: { products: true } } },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }]
    }),
    getDb().product.findMany({
      where: { isPublished: true },
      include: {
        category: true,
        brand: true,
        specs: { orderBy: { sortOrder: "asc" } },
        prosCons: { orderBy: { sortOrder: "asc" } },
        affiliateLinks: { where: { isActive: true }, orderBy: { sortOrder: "asc" } }
      },
      orderBy: [{ category: { sortOrder: "asc" } }, { isFeatured: "desc" }, { priceEstimate: "asc" }]
    }),
    getDb().article.findMany({
      where: { isPublished: true, articleType: "COMPARISON" },
      include: {
        products: {
          orderBy: { sortOrder: "asc" },
          take: 2,
          include: { product: { include: { category: true } } }
        }
      },
      orderBy: { publishedAt: "desc" },
      take: 4
    })
  ]);

  const categories = categoriesRaw.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    productCount: category._count.products
  }));

  const normalizedProducts = products.map((product) => ({
    ...product,
    prosCons: product.prosCons.map((item) => ({ type: item.type, content: item.content }))
  }));

  return (
    <>
      <Header />
      <main>
        <section className="border-b border-neutral-100 bg-gradient-wash">
          <div className="container-page grid gap-8 py-14 lg:grid-cols-[1fr_0.85fr]">
            <div>
              <p className="eyebrow">Bandingkan produk</p>
              <h1 className="mt-3 max-w-3xl text-4xl leading-tight sm:text-5xl">
                Bingung pilih produk yang mana?
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-neutral-600">
                Pilih kategori, pilih 2 sampai 4 produk sejenis, lalu lihat perbedaan harga, spesifikasi, kelebihan, kekurangan, dan verdict berdasarkan data produk.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="#kategori" className="btn-primary">Pilih kategori</Link>
                <Link href="#hasil" className="btn-secondary">Lihat hasil</Link>
              </div>
            </div>
            <div className="rounded-panel bg-primary p-5 text-white shadow-soft">
              <p className="text-xs font-bold uppercase tracking-wide text-white/65">Verdict pintar berdasarkan data produk</p>
              <h2 className="mt-3 text-3xl text-white">Tanpa klaim AI, tanpa API eksternal.</h2>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Verdict dibuat dari aturan sederhana berbasis estimasi harga, best-for, ringkasan editorial, serta jumlah pros dan cons yang tersedia.
              </p>
            </div>
          </div>
        </section>

        <div className="py-12">
          <InteractiveComparison categories={categories} products={normalizedProducts} initialCategorySlug={search.category} />
        </div>

        <section id="editorial" className="bg-white py-12">
          <div className="container-page">
            <div className="mb-6">
              <p className="eyebrow">Perbandingan editorial</p>
              <h2 className="text-3xl">Baca perbandingan yang sudah dikurasi</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {comparisons.map((article) => (
                <Link key={article.slug} href={`/bandingkan/${article.slug}`} className="card block p-5">
                  <p className="eyebrow">{article.products[0]?.product.category.name ?? "Comparison"}</p>
                  <h3 className="mt-2 text-2xl">{article.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600">{article.excerpt}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent-dark">
                    Buka perbandingan <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="container-page py-12">
          <div className="rounded-panel border border-accent-border bg-gradient-wash p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="eyebrow">Aturan perbandingan</p>
                <h2 className="mt-2 text-3xl">Bandingkan produk sejenis agar keputusannya lebih jelas.</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
                  Kami menghindari perbandingan lintas kategori yang terlalu jauh karena hasilnya mudah bias. Kursi lebih pas dibanding kursi, keyboard dengan keyboard, dan aksesori dengan aksesori.
                </p>
              </div>
              <ShieldCheck className="h-10 w-10 shrink-0 text-accent-dark" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
