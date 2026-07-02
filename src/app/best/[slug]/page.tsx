import Link from "next/link";
import { notFound } from "next/navigation";
import { Crown } from "lucide-react";
import { getDb } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { QuickPicksTable } from "@/components/public/QuickPicksTable";
import { ProsConsList } from "@/components/public/ProsConsList";
import { AffiliateButtonGroup } from "@/components/public/AffiliateButtonGroup";
import { PriceEstimate } from "@/components/public/PriceEstimate";
import { MarkdownText } from "@/components/public/MarkdownText";
import type { RankedProduct } from "@/types/domain";

export const dynamic = "force-dynamic";

async function getBest(slug: string) {
  return getDb().article.findFirst({
    where: { slug, articleType: "BEST_PICKS" },
    include: {
      products: {
        orderBy: { sortOrder: "asc" },
        include: {
          product: { include: { brand: true, category: true, prosCons: { orderBy: { sortOrder: "asc" } }, affiliateLinks: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } } }
        }
      }
    }
  });
}

function softenAffiliateLabels(product: RankedProduct) {
  return product.affiliateLinks.map((link, index) => ({
    ...link,
    buttonLabel: index === 0 ? "Cek harga terbaru" : index === 1 ? "Lihat toko terpercaya" : "Cek di marketplace"
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getBest(slug);
  if (!article) return {};
  return buildMetadata({ title: article.title, description: article.excerpt, path: `/best/${slug}`, image: article.coverImageUrl });
}

export default async function BestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getBest(slug);
  if (!article?.isPublished) notFound();
  const products = (article.products as { product: RankedProduct }[]).map((item) => item.product);
  return (
    <>
      <Header />
      <main>
        <section className="border-b border-neutral-100 bg-gradient-wash">
          <div className="container-page grid gap-3 py-8">
            <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Best Picks", href: "/best" }, { label: article.title, href: `/best/${article.slug}` }]} />
            <span className="badge w-fit bg-accent-tint text-accent-dark">Best Pick editorial</span>
            <h1 className="max-w-4xl text-4xl leading-tight sm:text-5xl">{article.title}</h1>
            <MarkdownText content={article.excerpt} className="max-w-2xl text-lg leading-8 text-neutral-600 prose-p:m-0" />
          </div>
        </section>
        <div className="container-page grid gap-8 py-10">
          <p className="text-sm leading-6 text-neutral-500">
            Sebagian tautan pembelian pada halaman ini dapat memberikan komisi tanpa biaya tambahan untuk kamu. Rekomendasi tetap disusun secara editorial.
          </p>
          <section>
            <h2 className="mb-4 text-3xl">Quick picks</h2>
            <QuickPicksTable products={products} />
          </section>
          <section className="grid gap-5">
            {products.map((product, index) => (
              <article key={product.slug} className="card grid gap-5 p-5 lg:grid-cols-[1fr_280px]">
                <div>
                  <p className="eyebrow flex items-center gap-1.5">
                    {index === 0 ? <Crown className="h-3.5 w-3.5" /> : null}
                    Peringkat #{index + 1} / {product.brand.name}
                  </p>
                  <h2 className="mt-2 text-3xl"><Link href={`/produk/${product.slug}`}>{product.name}</Link></h2>
                  <MarkdownText content={product.editorialSummary} className="mt-3 leading-7 text-neutral-600 prose-p:m-0" />
                  <div className="mt-4 flex flex-wrap gap-2 text-sm">
                    <span className="badge bg-accent-tint text-accent-dark">Paling cocok: {product.bestFor}</span>
                    <span className="badge bg-neutral-100 text-neutral-600">Estimasi <PriceEstimate value={product.priceEstimate} /></span>
                  </div>
                  <div className="mt-5"><ProsConsList items={product.prosCons} /></div>
                </div>
                <aside className="grid content-start gap-3">
                  <div className="rounded-control bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">
                    Pertimbangkan produk ini kalau kebutuhanmu dekat dengan: <strong className="text-primary">{product.bestFor}</strong>.
                  </div>
                  <AffiliateButtonGroup links={softenAffiliateLabels(product)} sourcePageType="best" sourcePageSlug={article.slug} />
                </aside>
              </article>
            ))}
          </section>
          <section className="card p-6">
            <h2 className="text-3xl">FAQ singkat</h2>
            <div className="mt-4 grid gap-4 text-sm leading-6 text-neutral-700">
              <p><strong className="text-primary">Apakah urutan selalu mengikuti harga?</strong> Tidak. Kami menimbang kecocokan, kompromi, dan value.</p>
              <p><strong className="text-primary">Apakah harga selalu sama?</strong> Tidak. Harga dan promo bisa berubah di marketplace.</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
