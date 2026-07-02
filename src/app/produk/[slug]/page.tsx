import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getDb } from "@/lib/db";
import { buildMetadata, productJsonLd } from "@/lib/seo";
import { formatRupiah, parseEvidenceStats } from "@/lib/utils";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { ProductImageGallery } from "@/components/public/ProductImageGallery";
import { BestForBadge } from "@/components/public/BestForBadge";
import { AffiliateButtonGroup } from "@/components/public/AffiliateButtonGroup";
import { ProsConsList } from "@/components/public/ProsConsList";
import { ProductGrid } from "@/components/public/ProductGrid";
import { MarkdownText } from "@/components/public/MarkdownText";
import { VerdictPanel } from "@/components/shared/VerdictPanel";
import { FeatureMatrix } from "@/components/shared/FeatureMatrix";
import type { ArticleSummary, ProductCardData } from "@/types/domain";

export const dynamic = "force-dynamic";

type AffiliateLink = {
  redirectCode: string;
  buttonLabel: string;
  merchantName: string;
  isPrimary: boolean;
};

function inferTrustLabels(links: AffiliateLink[]) {
  const merchantText = links.map((link) => `${link.merchantName} ${link.buttonLabel}`).join(" ").toLowerCase();
  const labels = ["Riset Editorial"];
  if (merchantText.includes("official") || merchantText.includes("resmi")) labels.unshift("Official Store");
  if (merchantText.includes("authorized")) labels.unshift("Authorized Seller");
  if (merchantText.includes("shopee") || merchantText.includes("tokopedia") || merchantText.includes("lazada") || merchantText.includes("blibli")) labels.push("Marketplace Terverifikasi");
  if (links.length) labels.push("Seller Terpercaya");
  return [...new Set(labels)].slice(0, 4);
}

function softenAffiliateLabels<T extends { buttonLabel: string }>(links: T[]) {
  return links.map((link, index) => ({
    ...link,
    buttonLabel: index === 0 ? "Cek harga terbaru" : index === 1 ? "Lihat toko terpercaya" : "Cek di marketplace"
  }));
}

async function getProduct(slug: string) {
  return getDb().product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      affiliateLinks: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      specs: { orderBy: { sortOrder: "asc" } },
      prosCons: { orderBy: { sortOrder: "asc" } },
      expertSources: { orderBy: { addedAt: "desc" } }
    }
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  const seoMeta = await getDb().seoMetadata.findUnique({
    where: { subjectType_subjectId: { subjectType: "product", subjectId: product.id } }
  });

  return buildMetadata({
    title: seoMeta?.seoTitle || `${product.name}: review, pros cons, dan link pembelian`,
    description: seoMeta?.metaDescription || product.shortDescription,
    path: `/produk/${slug}`,
    image: seoMeta?.ogImageUrl || product.images[0]?.imageUrl,
    ogTitle: seoMeta?.ogTitle,
    ogDescription: seoMeta?.ogDescription
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product?.isPublished) notFound();
  const [relatedProducts, relatedArticles]: [ProductCardData[], ArticleSummary[]] = await Promise.all([
    getDb().product.findMany({
      where: { categoryId: product.categoryId, isPublished: true, NOT: { id: product.id } },
      include: {
        brand: true,
        category: true,
        images: { where: { isPrimary: true }, take: 1 },
        affiliateLinks: { where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 1 }
      },
      take: 4
    }),
    getDb().article.findMany({ where: { isPublished: true, products: { some: { productId: product.id } } }, take: 4 })
  ]);
  const trustLabels = inferTrustLabels(product.affiliateLinks);
  const affiliateLinks = softenAffiliateLabels(product.affiliateLinks);
  const evidenceStats = parseEvidenceStats(product.evidenceStats);

  return (
    <>
      <Header />
      <main className="container-page grid gap-10 py-10">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }} />
        <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: product.category.name, href: `/kategori/${product.category.slug}` }, { label: product.name, href: `/produk/${product.slug}` }]} />

        <section className="grid gap-8 lg:grid-cols-[400px_1fr] lg:items-start">
          {/* Sticky left: gallery + buy box */}
          <div className="grid gap-4 lg:sticky lg:top-[76px] lg:self-start">
            <ProductImageGallery images={product.images} title={product.name} />
            <div className="card grid gap-3 p-5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">{formatRupiah(product.priceEstimate)}</span>
                {product.compareAtPrice && product.compareAtPrice > product.priceEstimate ? (
                  <span className="text-sm text-neutral-400 line-through">{formatRupiah(product.compareAtPrice)}</span>
                ) : null}
              </div>
              <AffiliateButtonGroup links={affiliateLinks} sourcePageType="product" sourcePageSlug={product.slug} />
            </div>
          </div>

          {/* Scrolling right: verdict + content */}
          <div className="grid gap-6">
            <div>
              <p className="eyebrow">{product.brand.name} / {product.category.name}</p>
              <h1 className="mt-2 text-4xl leading-tight">{product.name}</h1>
              <MarkdownText content={product.shortDescription} className="mt-4 text-lg leading-8 text-neutral-600 prose-p:m-0" />
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <BestForBadge>{product.bestFor}</BestForBadge>
                {trustLabels.map((label) => (
                  <span key={label} className="badge border border-neutral-200 bg-white text-neutral-600">
                    <ShieldCheck className="h-3.5 w-3.5 text-accent-dark" />
                    {label}
                  </span>
                ))}
                {product.expertSources.slice(0, 3).map((source) => (
                  <a
                    key={source.id}
                    href={source.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="badge bg-accent-tint text-accent-dark hover:bg-accent/20"
                  >
                    {source.sourceType === "YOUTUBE" ? "🎬" : source.sourceType === "BLOG" ? "📝" : "💬"} {source.sourceName}
                  </a>
                ))}
              </div>
            </div>

            <VerdictPanel eyebrow="Rekomendasi singkat" score={product.score} headline="Kenapa produk ini masuk rekomendasi?">
              <MarkdownText content={product.editorialSummary} className="prose-p:m-0" />
            </VerdictPanel>

            {evidenceStats.length || product.hoursTested ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {product.hoursTested ? (
                  <div className="card p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{product.hoursTested} jam</p>
                    <p className="mt-1 text-xs text-neutral-500">Waktu pengujian</p>
                  </div>
                ) : null}
                {evidenceStats.map((stat) => (
                  <div key={stat.label} className="card p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="mt-1 text-xs text-neutral-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            ) : null}

            <div>
              <h2 className="text-2xl">Kelebihan dan kekurangan</h2>
              <div className="mt-4"><ProsConsList items={product.prosCons} /></div>
            </div>

            <div>
              <h2 className="text-2xl">Spesifikasi penting</h2>
              <div className="mt-4">
                <FeatureMatrix
                  products={[{ id: product.id, name: product.name, priceEstimate: product.priceEstimate, specs: product.specs }]}
                />
              </div>
            </div>

            <p className="text-xs text-neutral-400">Terakhir diperbarui: {product.updatedAt.toLocaleDateString("id-ID")}</p>
          </div>
        </section>

        <section className="grid gap-4">
          <h2 className="text-3xl">Produk terkait</h2>
          <ProductGrid products={relatedProducts} />
        </section>

        {relatedArticles.length ? (
          <section className="grid gap-3">
            <h2 className="text-2xl">Artikel terkait</h2>
            {relatedArticles.map((article) => (
              <Link key={article.slug} href={`/artikel/${article.slug}`} className="card p-4 font-semibold hover:text-accent-dark">
                {article.title}
              </Link>
            ))}
          </section>
        ) : null}
      </main>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white p-3 md:hidden">
        <AffiliateButtonGroup links={affiliateLinks.slice(0, 1)} sourcePageType="product_sticky" sourcePageSlug={product.slug} />
      </div>
      <Footer />
    </>
  );
}
