import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getDb } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { QuickPicksTable } from "@/components/public/QuickPicksTable";
import { ProsConsList } from "@/components/public/ProsConsList";
import { AffiliateButtonGroup } from "@/components/public/AffiliateButtonGroup";
import { DisclosureBox } from "@/components/public/DisclosureBox";
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
        <section className="border-b border-line bg-[linear-gradient(180deg,#fbfaf5,#edf4eb)]">
          <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_0.82fr]">
            <div>
              <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Best Picks", href: "/best" }, { label: article.title, href: `/best/${article.slug}` }]} />
              <p className="eyebrow mt-8">Best Pick editorial</p>
              <h1 className="mt-3 max-w-4xl font-serif text-4xl font-bold leading-tight sm:text-5xl">{article.title}</h1>
              <MarkdownText content={article.excerpt} className="mt-4 text-lg leading-8 text-ink/70 prose-p:m-0" />
            </div>
            <aside className="grid content-start gap-4 rounded-lg border border-line bg-white p-5 shadow-soft">
              <p className="eyebrow">Metodologi singkat</p>
              <p className="text-sm leading-6 text-ink/70">
                Kami susun berdasarkan fungsi, kenyamanan, estimasi harga, reputasi sumber pembelian, pros/cons, dan kecocokan untuk kebutuhan harian.
              </p>
              {["Fungsi utama jelas", "Kompromi dicatat", "Value dan konteks pemakaian dipertimbangkan"].map((item) => (
                <p key={item} className="flex gap-2 text-sm text-ink/70">
                  <CheckCircle2 className="h-4 w-4 text-moss" />
                  {item}
                </p>
              ))}
            </aside>
          </div>
        </section>
        <div className="container-page grid gap-8 py-10">
          <DisclosureBox />
          <section>
            <h2 className="mb-4 font-serif text-3xl font-bold">Quick picks</h2>
            <QuickPicksTable products={products} />
          </section>
        <section className="grid gap-5">
          {products.map((product, index) => (
            <article key={product.slug} className="card grid gap-5 p-5 lg:grid-cols-[1fr_280px]">
              <div>
                <p className="eyebrow">Peringkat #{index + 1} / {product.brand.name}</p>
                <h2 className="mt-2 font-serif text-3xl font-bold"><Link href={`/produk/${product.slug}`}>{product.name}</Link></h2>
                <MarkdownText content={product.editorialSummary} className="mt-3 leading-7 text-ink/72 prose-p:m-0" />
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full bg-moss/10 px-3 py-1 font-semibold text-moss">Paling cocok: {product.bestFor}</span>
                  <span className="rounded-full bg-paper px-3 py-1 text-ink/70">Estimasi <PriceEstimate value={product.priceEstimate} /></span>
                </div>
                <div className="mt-5"><ProsConsList items={product.prosCons} /></div>
              </div>
              <aside className="grid content-start gap-3">
                <div className="rounded-lg border border-line bg-paper p-4 text-sm leading-6 text-ink/70">
                  Pertimbangkan produk ini kalau kebutuhanmu dekat dengan: <strong>{product.bestFor}</strong>.
                </div>
                <AffiliateButtonGroup links={softenAffiliateLabels(product)} sourcePageType="best" sourcePageSlug={article.slug} />
              </aside>
            </article>
          ))}
        </section>
        <section className="card p-6">
          <h2 className="font-serif text-3xl font-bold">FAQ singkat</h2>
          <div className="mt-4 grid gap-4 text-sm leading-6 text-ink/75">
            <p><strong>Apakah urutan selalu mengikuti harga?</strong> Tidak. Kami menimbang kecocokan, kompromi, dan value.</p>
            <p><strong>Apakah harga selalu sama?</strong> Tidak. Harga dan promo bisa berubah di marketplace.</p>
          </div>
        </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
