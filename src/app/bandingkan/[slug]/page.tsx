import { notFound } from "next/navigation";
import Image from "next/image";
import { getDb } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { formatRupiah } from "@/lib/utils";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { AffiliateButtonGroup } from "@/components/public/AffiliateButtonGroup";
import { ProsConsList } from "@/components/public/ProsConsList";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { VerdictPanel } from "@/components/shared/VerdictPanel";
import { FeatureMatrix } from "@/components/shared/FeatureMatrix";
import { Tabs } from "@/components/shared/Tabs";
import type { ComparisonProduct } from "@/types/domain";

export const dynamic = "force-dynamic";

async function getComparison(slug: string) {
  return getDb().article.findFirst({
    where: { slug, articleType: "COMPARISON" },
    include: {
      products: {
        orderBy: { sortOrder: "asc" },
        take: 4,
        include: {
          product: {
            include: {
              brand: true,
              category: true,
              images: { where: { isPrimary: true }, take: 1 },
              specs: { orderBy: { sortOrder: "asc" } },
              prosCons: { orderBy: { sortOrder: "asc" } },
              affiliateLinks: { where: { isActive: true }, orderBy: { sortOrder: "asc" } }
            }
          }
        }
      }
    }
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getComparison(slug);
  if (!article) return {};
  return buildMetadata({ title: article.title, description: article.excerpt, path: `/bandingkan/${slug}`, image: article.coverImageUrl });
}

export default async function ComparisonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getComparison(slug);
  if (!article?.isPublished || article.products.length < 2) notFound();
  const products = (article.products as { product: ComparisonProduct & { images: { imageUrl: string; altText: string }[] } }[]).map((item) => item.product);
  const winner = [...products].sort(
    (a, b) =>
      b.prosCons.filter((i) => i.type === "PRO").length - b.prosCons.filter((i) => i.type === "CON").length -
      (a.prosCons.filter((i) => i.type === "PRO").length - a.prosCons.filter((i) => i.type === "CON").length) ||
      a.priceEstimate - b.priceEstimate
  )[0];

  return (
    <>
      <Header />
      <main className="container-page grid gap-8 py-10">
        <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Bandingkan", href: "/" }, { label: article.title, href: `/bandingkan/${article.slug}` }]} />
        <header className="max-w-4xl">
          <p className="eyebrow">Perbandingan</p>
          <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">{products.map((p) => p.name).join(" vs ")}</h1>
          <p className="mt-4 text-lg leading-8 text-neutral-600">{article.excerpt}</p>
        </header>

        {/* Read-only product selector row (curated editorial comparison, not a live picker) */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {products.map((product) => (
            <div key={product.slug} className="card flex items-center gap-3 p-3">
              <div className="relative h-12 w-12 flex-none overflow-hidden rounded-control">
                {product.images?.[0] ? (
                  <Image src={product.images[0].imageUrl} alt={product.images[0].altText} fill className="object-cover" />
                ) : (
                  <ImagePlaceholder label="" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-primary">{product.name}</p>
                <p className="text-xs text-neutral-500">{formatRupiah(product.priceEstimate)}</p>
              </div>
            </div>
          ))}
        </div>

        <Tabs
          panels={[
            {
              id: "ringkasan",
              label: "Ringkasan",
              content: (
                <div className="grid gap-4 lg:grid-cols-2">
                  {products.map((product) => (
                    <article key={product.slug} className="card p-5">
                      <p className="eyebrow">{product.brand.name}</p>
                      <h2 className="mt-2 text-2xl">{product.name}</h2>
                      <p className="mt-3 text-sm leading-6 text-neutral-600">{product.editorialSummary}</p>
                      <p className="mt-3 text-sm font-semibold text-accent-dark">Menang untuk: {product.bestFor}</p>
                      <div className="mt-5"><ProsConsList items={product.prosCons} /></div>
                    </article>
                  ))}
                </div>
              )
            },
            { id: "spesifikasi", label: "Spesifikasi", content: <FeatureMatrix products={products} /> },
            {
              id: "harga",
              label: "Harga",
              content: (
                <div className="grid gap-4 lg:grid-cols-2">
                  {products.map((product) => (
                    <div key={product.slug} className="card p-5">
                      <h3 className="text-lg">{product.name}</h3>
                      <p className="mt-1 text-xl font-bold text-primary">{formatRupiah(product.priceEstimate)}</p>
                      <div className="mt-4"><AffiliateButtonGroup links={product.affiliateLinks} sourcePageType="comparison" sourcePageSlug={article.slug} /></div>
                    </div>
                  ))}
                </div>
              )
            }
          ]}
        />

        <VerdictPanel
          eyebrow="Verdict"
          headline={`${winner.name} jadi pilihan kami`}
          cta={<AffiliateButtonGroup links={winner.affiliateLinks.slice(0, 1)} sourcePageType="comparison_verdict" sourcePageSlug={article.slug} />}
        >
          Pilih {winner.name} jika prioritas kamu {winner.bestFor.toLowerCase()}. Produk lain di perbandingan ini tetap layak dipertimbangkan tergantung kebutuhan dan budget kamu — keputusan terbaik mengikuti masalah utama yang ingin diselesaikan.
        </VerdictPanel>
      </main>
      <Footer />
    </>
  );
}
