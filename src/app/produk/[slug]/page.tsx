import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { getDb } from "@/lib/db";
import { buildMetadata, productJsonLd } from "@/lib/seo";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { ProductImageGallery } from "@/components/public/ProductImageGallery";
import { BestForBadge } from "@/components/public/BestForBadge";
import { PriceEstimate } from "@/components/public/PriceEstimate";
import { AffiliateButtonGroup } from "@/components/public/AffiliateButtonGroup";
import { ProsConsList } from "@/components/public/ProsConsList";
import { SpecsTable } from "@/components/public/SpecsTable";
import { DisclosureBox } from "@/components/public/DisclosureBox";
import { ProductGrid } from "@/components/public/ProductGrid";
import { ExpertSourcesList } from "@/components/public/ExpertSourcesList";
import { MarkdownText } from "@/components/public/MarkdownText";
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

function softenAffiliateLabels(links: AffiliateLink[]) {
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
    getDb().product.findMany({ where: { categoryId: product.categoryId, isPublished: true, NOT: { id: product.id } }, include: { brand: true, category: true, images: { where: { isPrimary: true }, take: 1 } }, take: 3 }),
    getDb().article.findMany({ where: { isPublished: true, products: { some: { productId: product.id } } }, take: 4 })
  ]);
  const trustLabels = inferTrustLabels(product.affiliateLinks);
  const affiliateLinks = softenAffiliateLabels(product.affiliateLinks);
  const topPros = product.prosCons.filter((item) => item.type === "PRO").slice(0, 3);
  const topSpecs = product.specs.slice(0, 3);
  return (
    <>
      <Header />
      <main className="container-page grid gap-10 py-10">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }} />
        <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: product.category.name, href: `/kategori/${product.category.slug}` }, { label: product.name, href: `/produk/${product.slug}` }]} />
        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <ProductImageGallery images={product.images} title={product.name} />
          <div>
            <p className="eyebrow">{product.brand.name} / {product.category.name}</p>
            <h1 className="mt-2 font-serif text-4xl font-bold leading-tight">{product.name}</h1>
            <MarkdownText content={product.shortDescription} className="mt-4 text-lg leading-8 text-ink/70 prose-p:m-0" />
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <BestForBadge>{product.bestFor}</BestForBadge>
              <span className="text-sm text-ink/60">Estimasi <PriceEstimate value={product.priceEstimate} /></span>
            </div>
            <div className="mt-6 rounded-lg border border-line bg-white p-5">
              <p className="eyebrow">Quick verdict</p>
              <MarkdownText content={product.editorialSummary} className="mt-2 leading-7 text-ink/75 prose-p:m-0" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {trustLabels.map((label) => (
                <span key={label} className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink/70">
                  <ShieldCheck className="h-3.5 w-3.5 text-moss" />
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-5">
              <AffiliateButtonGroup links={affiliateLinks} sourcePageType="product" sourcePageSlug={product.slug} />
            </div>
          </div>
        </section>
        <section className="grid gap-6 rounded-lg border border-line bg-white p-6 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="eyebrow">Alasan rekomendasi</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Kenapa produk ini masuk rekomendasi?</h2>
            <MarkdownText content={product.editorialSummary} className="mt-4 leading-7 text-ink/72 prose-p:m-0" />
            <p className="mt-3 leading-7 text-ink/72">
              Produk ini kami tempatkan untuk kebutuhan {product.bestFor.toLowerCase()} dalam kategori {product.category.name.toLowerCase()}, dengan mempertimbangkan brand {product.brand.name}, catatan pros/cons, spesifikasi dasar, dan sumber pembelian yang tersedia.
            </p>
          </div>
          <div className="grid gap-3">
            {topPros.map((item) => (
              <p key={item.content} className="flex gap-2 rounded-md bg-leaf/10 p-3 text-sm leading-6 text-ink/75">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
                {item.content}
              </p>
            ))}
            {topSpecs.map((spec) => (
              <p key={`${spec.label}-${spec.value}`} className="rounded-md border border-line bg-paper p-3 text-sm leading-6 text-ink/70">
                <strong>{spec.label}:</strong> {spec.value}
              </p>
            ))}
          </div>
        </section>
        {product.expertSources.length > 0 && (
          <section className="rounded-lg border border-line bg-paper p-6">
            <ExpertSourcesList sources={product.expertSources} />
          </section>
        )}
        <section className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
          <div className="grid gap-8">
            <div>
              <h2 className="font-serif text-3xl font-bold">Kelebihan dan kekurangan</h2>
              <div className="mt-4"><ProsConsList items={product.prosCons} /></div>
            </div>
            <div>
              <h2 className="font-serif text-3xl font-bold">Spesifikasi penting</h2>
              <div className="mt-4"><SpecsTable specs={product.specs} /></div>
            </div>
          </div>
          <aside className="grid content-start gap-4">
            <DisclosureBox />
            <div className="card p-5 text-sm text-ink/65">Terakhir diperbarui: {product.updatedAt.toLocaleDateString("id-ID")}</div>
          </aside>
        </section>
        <section className="grid gap-4">
          <h2 className="font-serif text-3xl font-bold">Produk terkait</h2>
          <ProductGrid products={relatedProducts} />
        </section>
        {relatedArticles.length ? (
        <section className="grid gap-3">
          <h2 className="font-serif text-2xl font-bold">Artikel terkait</h2>
          {relatedArticles.map((article) => <Link key={article.slug} href={`/artikel/${article.slug}`} className="card p-4 font-semibold hover:text-moss">{article.title}</Link>)}
        </section>
        ) : null}
      </main>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white p-3 md:hidden">
        <AffiliateButtonGroup links={affiliateLinks.slice(0, 1)} sourcePageType="product_sticky" sourcePageSlug={product.slug} />
      </div>
      <Footer />
    </>
  );
}
